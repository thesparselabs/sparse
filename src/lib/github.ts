import type { ActivityDay } from "@/components/wensity/github-activity-grid";

/**
 * Live repo data for /open-source, straight from the GitHub API.
 *
 * docs/Idea.md: no number on the site that isn't sourced. Everything this
 * module returns is read from GitHub at most an hour ago, so the dates and
 * counts on the page are receipts rather than claims — and they keep
 * themselves current without anyone maintaining them.
 *
 * Every function returns null on any failure. The page treats missing data as
 * "don't show that detail", never as an error state.
 */

export const GITHUB_ORG = "thesparselabs";
export const GITHUB_ORG_URL = `https://github.com/${GITHUB_ORG}`;

/** Re-read hourly. Two repos cost a handful of requests per revalidation. */
const REVALIDATE_SECONDS = 3600;

/** 53 full weeks, so the activity grid ends on today with no ragged column. */
export const ACTIVITY_WINDOW_DAYS = 371;

/** A year of commits on a busy repo is more than this; ours aren't yet. */
const MAX_COMMIT_PAGES = 10;

export type RepoSummary = {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  pushedAt: Date;
  /** SPDX id, e.g. "MIT". Null until the repo has a LICENSE file. */
  license: string | null;
  issuesUrl: string;
};

function headers(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`https://api.github.com${path}`, {
      headers: headers(),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error(`GitHub request failed: ${path}`, error);
    return null;
  }
}

export async function getRepo(name: string): Promise<RepoSummary | null> {
  const data = await getJson<{
    name: string;
    html_url: string;
    description: string | null;
    language: string | null;
    pushed_at: string;
    license: { spdx_id: string | null } | null;
  }>(`/repos/${GITHUB_ORG}/${name}`);

  if (!data) return null;

  const spdx = data.license?.spdx_id;

  return {
    name: data.name,
    url: data.html_url,
    description: data.description,
    language: data.language,
    pushedAt: new Date(data.pushed_at),
    // GitHub reports an unrecognised licence file as "NOASSERTION".
    license: spdx && spdx !== "NOASSERTION" ? spdx : null,
    issuesUrl: `${data.html_url}/issues`,
  };
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Commits per UTC day across `repos`, oldest first, exactly
 * ACTIVITY_WINDOW_DAYS long and ending today.
 *
 * This walks the commits list rather than /stats/commit_activity: the stats
 * endpoint answers 202 with no body until GitHub has computed it, which on a
 * cold cache is most of the time.
 */
export async function getCommitActivity(
  repos: readonly string[],
): Promise<ActivityDay[] | null> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setUTCDate(today.getUTCDate() - (ACTIVITY_WINDOW_DAYS - 1));

  const counts = new Map<string, number>();
  let anyRepoLoaded = false;

  for (const repo of repos) {
    for (let page = 1; page <= MAX_COMMIT_PAGES; page++) {
      const commits = await getJson<{ commit: { author: { date: string } | null } }[]>(
        `/repos/${GITHUB_ORG}/${repo}/commits?since=${start.toISOString()}&per_page=100&page=${page}`,
      );
      if (!commits) break;
      anyRepoLoaded = true;

      for (const { commit } of commits) {
        if (!commit.author) continue;
        const day = commit.author.date.slice(0, 10);
        counts.set(day, (counts.get(day) ?? 0) + 1);
      }

      if (commits.length < 100) break;
    }
  }

  if (!anyRepoLoaded) return null;

  // Author dates can predate `since` (it filters on commit date), so the
  // window is applied here rather than trusted from the query.
  return Array.from({ length: ACTIVITY_WINDOW_DAYS }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const key = isoDay(date);
    return { date: key, count: counts.get(key) ?? 0 };
  });
}
