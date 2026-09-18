# Call Jev through Vercel AI Gateway

JevArena needs typed decisions from Jev, not generated text. The TypeSafe SDK is the native client; we still route through Vercel AI Gateway (`typesafe-ai/jev` via the AI SDK `evaluate` API) so one `AI_GATEWAY_API_KEY` covers the model and the rest of the Vercel stack. The adapter stays server-only. Do not add `@typesafe-ai/sdk` or `TYPESAFE_API_KEY`.
