---
tags: [glossary]
---

# Residual

> Images that remain unidentified after the gallery match — the leftover fed to clustering.

During the [[Identify Phase]], each detected character crop is matched against
[[Gallery Prototypes]] via [[CCIP]]. Images with no confident match become the residual. They
are handed to the [[Cluster Phase]], which runs OPTICS over their embeddings to surface
unnamed groups; naming a cluster auto-enrolls it as new [[Prototype]] vectors, so future runs
identify those characters directly.

## See also

- [[_index]]
- [[Cluster Phase]]
- [[Identify Phase]]
- [[Prototype]]
