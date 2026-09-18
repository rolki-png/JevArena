import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ArenaPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-6 py-10 sm:px-8">
      <p className="font-mono text-xs tracking-[0.28em] text-primary uppercase">
        JevArena
      </p>
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">Arena</h1>
        <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
          This is the Spectator view of a live Match. Two isolated Browsers,
          scores, and a 60-second clock will sit here. The Match is not wired
          yet — use this route as the door from the Landing.
        </p>
      </div>
      <Link
        href="/"
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-fit")}
      >
        Back to Landing
      </Link>
    </main>
  );
}
