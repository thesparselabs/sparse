-- Ideas board. Works on any Postgres, including Neon and Supabase.
-- Run once with `npm run db:setup`, or paste into the Neon / Supabase SQL editor.
-- Safe to run again: everything is "if not exists".

create table if not exists ideas (
  id           bigint generated always as identity primary key,
  title        text not null check (char_length(title) between 3 and 120),
  details      text not null check (char_length(details) between 10 and 1000),
  author_name  text check (char_length(author_name) <= 60),
  author_email text check (char_length(author_email) <= 254),
  -- Set to true to take an idea off the public page without deleting it:
  --   update ideas set hidden = true where id = 42;
  hidden       boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists ideas_public_recent_idx
  on ideas (created_at desc)
  where not hidden;

-- The app connects straight to Postgres as the table owner, which bypasses row
-- level security. Turning it on with no policies means Supabase's auto-generated
-- REST API (anon key) can't read this table, so author_email stays private.
alter table ideas enable row level security;

-- Contact form (/contact). Private: nothing here is ever rendered on a page.
-- Limits mirror src/lib/contact-limits.ts; change both together.
create table if not exists contact_messages (
  id          bigint generated always as identity primary key,
  problem     text not null check (char_length(problem) between 10 and 2000),
  workaround  text not null check (char_length(workaround) between 2 and 2000),
  email       text not null check (char_length(email) <= 254),
  -- Flip once someone has answered, so the inbox view can skip it:
  --   update contact_messages set replied = true where id = 7;
  replied     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists contact_messages_recent_idx
  on contact_messages (created_at desc);

-- Same reasoning as ideas: no policies means the Supabase anon REST API can't
-- read the table, so submitters' emails stay private.
alter table contact_messages enable row level security;
