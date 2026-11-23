# Contributing

- `npm install`, then `npm run dev` (http://localhost:3311) and `npm run check` (types, lint, tests) before a pull request.
- Keep it local-first: no servers, no accounts, no telemetry. Anything sent off the computer must be the user's own choice (Claude Code, an ElevenLabs key).
- The script contract is `lib/schema/video-script.schema.json`; every Claude answer is validated against it.
- Session rules live in `session/CLAUDE.md` (a template; genreel fills in the folders). The renderer is `renderer/` (Remotion); `prepare.mjs` records the voice and writes `props.json`.
- User text is data: it goes into delimited tags or `input/brief.json`, never into instructions.
- Tests use a fake `claude` (`test/fake-claude.mjs`), so they never use your plan.
