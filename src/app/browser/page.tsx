import { SnakeBrowser } from "@/app/browser/snake-browser";

type Search = {
  seed?: string;
  agent?: string;
  accent?: string;
  generation?: string;
};

export default async function SnakeBrowserPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const seed = Number.parseInt(params.seed ?? "", 10);
  const generation = Number.parseInt(params.generation ?? "0", 10);
  const agent = params.agent === "b" ? "b" : "a";
  const accent = params.accent === "amber" ? "amber" : "lime";

  return (
    <SnakeBrowser
      seed={Number.isFinite(seed) ? seed : 1}
      agent={agent}
      accent={accent}
      generation={Number.isFinite(generation) ? generation : 0}
    />
  );
}
