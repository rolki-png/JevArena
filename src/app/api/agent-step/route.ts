import { NextResponse } from "next/server";
import { runAgentStep } from "@/lib/agent/jev-adapter";
import type { BoardSnapshot } from "@/lib/agent/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { snapshot?: BoardSnapshot };
  if (!body.snapshot || !Array.isArray(body.snapshot.body)) {
    return NextResponse.json({ error: "Invalid snapshot" }, { status: 400 });
  }

  const decision = await runAgentStep(body.snapshot, {
    apiKey: process.env.AI_GATEWAY_API_KEY,
  });

  return NextResponse.json(decision);
}
