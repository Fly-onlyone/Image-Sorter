---
tags: [glossary]
---

# CCIP

> Contrastive Character Image Pre-training — the embedding model behind character identity matching.

CCIP turns a cropped character image into a feature vector whose distance encodes "same
character or not". The codebase pins `model='ccip-caformer_b36-24'` and loads its own
threshold. These embeddings power the [[Identify Phase]] (gallery match), [[Gallery Prototypes]]
(stored reference vectors), and the [[Cluster Phase]] (grouping the residual). When no ONNX
weights are installed, the [[ML Facade]] substitutes a deterministic weak 16×16 colour
embedding so the pipeline still runs.

## See also

- [[_index]]
- [[Prototype]]
- [[Identify Phase]]
- [[Gallery Prototypes]]
