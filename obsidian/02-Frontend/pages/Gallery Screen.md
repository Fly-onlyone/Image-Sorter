---
tags: [frontend, pages]
---

# Gallery Screen

> Manager for the enrolled character/artist gallery, listing each entry with its prototype count and a delete action.

## Source

- `frontend/src/pages/Gallery.tsx` (`GalleryScreen`) — primary implementation

## How it works

`GalleryScreen` loads `api.getGallery` ([[API Client]]) on mount and renders the characters under a **Characters** tab — each as a card showing name, optional series, and a `${prototypes} prototypes` chip. The chip count is the number of enrolled [[Prototype]] embeddings backing that identity ([[CCIP]] gallery match). A delete `IconButton` calls `api.deleteCharacter` and optimistically drops the row.

The **Artists** tab is currently an informational `Alert` — artists ([[Facet]]) are enrolled automatically from download-metadata sidecars during artist-layout runs. Rename/merge are noted in the header comment as follow-ups (delete + enroll are wired). This is a sidebar destination, not part of the run stepper.

## Depends on

- [[API Client]] — `getGallery`, `deleteCharacter`
- [[Prototype]] — the per-character count
- [[CCIP]] — prototypes drive identity matching

## Used by

- [[App Entry and Router]] — rendered when `view === "gallery"`

## See also

- [[_index]]
- [[Identity Resolution Flow]]
