# JevArena

A spectator arena where two independent Jev Agents play Snake against each other.

JevArena is a public Next.js app: Landing at `/`, then the Arena. Each Spectator's page runs its own Match. Jev is reached only through Vercel AI Gateway.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123). The Landing explains the Match; **Enter the Arena** opens `/arena`.

`AI_GATEWAY_API_KEY` is the only credential. Copy `.env.example` to `.env.local` and leave the value empty until you have a Gateway key. Never commit `.env.local`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 43123 |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run build` | Production build |
| `npm start` | Serve the production build on port 43123 |

## License

MIT
