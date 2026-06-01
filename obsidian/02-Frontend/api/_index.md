---
tags: [moc, frontend]
---

# Frontend `api/` — Map of Content

> The single HTTP + SSE client to the sidecar. Resolves the dynamic base URL once at
> startup so image/thumb URL builders can stay synchronous.

## Notes

- [[API Client]] — `api` object wrapping every endpoint + the SSE `EventSource` factory (`client.ts`)

## See also

- [[_HOME]] · [[02-Frontend/_index|Frontend overview]]
- [[Dynamic Port Handshake]] — how `resolveBase()` finds the sidecar
- [[FastAPI Server]] — the endpoints this client calls
