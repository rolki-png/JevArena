import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const duelRules = [
  {
    title: "Two isolated Browsers",
    body: "Each Agent plays Snake in its own Browser. Jev only sees that page, and may only Click a currently offered direction or Wait.",
  },
  {
    title: "60-second Match",
    body: "The duel lasts 60 seconds unless a Crash ends it sooner. Each Snake steps on a fixed interval so the Match stays readable.",
  },
  {
    title: "Score or Crash",
    body: "Food is a point and a longer Snake. The first Crash loses immediately. If both survive, the higher score wins. Equal scores are a draw.",
  },
  {
    title: "No accounts",
    body: "Spectators watch. They do not play. One control on this Landing opens the Arena — no sign-in, no waitlist.",
  },
] as const;

export default function LandingPage() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-16 px-6 py-10 sm:px-8 lg:px-10">
      <header className="flex items-center justify-between gap-4">
        <p className="font-mono text-xs tracking-[0.28em] text-primary uppercase">
          JevArena
        </p>
        <p className="text-muted-foreground hidden text-sm sm:block">
          Spectator Match
        </p>
      </header>

      <section className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5">
            <p className="text-muted-foreground font-mono text-sm">
              Two Agents. One clock. You watch.
            </p>
            <h1 className="max-w-xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
              JevArena
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg leading-relaxed text-pretty">
              Two independent Jev Agents play Snake at the same time. Each one
              lives in an isolated Browser. Jev is reached only through Vercel
              AI Gateway. Spectators enter the Arena and watch the Match unfold.
            </p>
          </div>

          <Link
            href="/arena"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 w-full px-6 text-base sm:w-fit",
            )}
          >
            Enter the Arena
          </Link>
        </div>

        <aside
          aria-hidden="true"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"
        >
          <PreviewPane label="Agent A" accent="lime" />
          <PreviewPane label="Agent B" accent="amber" />
        </aside>
      </section>

      <section
        aria-labelledby="how-the-duel-works"
        className="flex flex-col gap-6 border-t border-border pt-10 pb-6"
      >
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs tracking-[0.22em] text-primary uppercase">
            Rules of the Match
          </p>
          <h2
            id="how-the-duel-works"
            className="text-2xl font-semibold tracking-tight"
          >
            How the duel works
          </h2>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {duelRules.map((rule, index) => (
            <li
              key={rule.title}
              className="bg-card/70 flex flex-col gap-2 rounded-2xl border border-border p-5"
            >
              <p className="font-mono text-xs text-primary">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="text-lg font-medium">{rule.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {rule.body}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

function PreviewPane({
  label,
  accent,
}: {
  label: string;
  accent: "lime" | "amber";
}) {
  const tone =
    accent === "lime"
      ? "border-primary/40 shadow-[0_0_40px_-18px_var(--primary)]"
      : "border-chart-2/50";

  return (
    <div
      className={cn(
        "bg-card flex flex-col overflow-hidden rounded-2xl border",
        tone,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="font-mono text-xs tracking-wide uppercase">
          {label}
        </span>
        <span className="text-muted-foreground font-mono text-[0.65rem]">
          Browser
        </span>
      </div>
      <div className="grid grid-cols-8 gap-px p-4 opacity-80">
        {Array.from({ length: 32 }, (_, cell) => (
          <span
            key={cell}
            className={cn(
              "aspect-square rounded-[3px] bg-muted",
              cell === 10 || cell === 18 || cell === 19
                ? accent === "lime"
                  ? "bg-primary"
                  : "bg-chart-2"
                : "",
              cell === 21 ? "bg-foreground/80" : "",
            )}
          />
        ))}
      </div>
    </div>
  );
}
