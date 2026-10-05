import { Godraw } from "@/components/sections/godraw";
import { Hero } from "@/components/sections/hero";
import { Ledger } from "@/components/sections/ledger";
import { Loop } from "@/components/sections/loop";
import { Products } from "@/components/sections/products";
import { Villain } from "@/components/sections/villain";

export default function Home() {
  return (
    <>
      <Hero />
      <Villain />
      <Loop />
      <Products />
      <Ledger />
      <Godraw />
    </>
  );
}
