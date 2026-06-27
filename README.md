# SSOT Explorer

Part of **[Anchor Migration](https://github.com/anchor-migration/migration-hub)** — read-only **human interface** for SSOT snapshots.

> [ADR-005 — multi-tier alignment & edge coloring](https://github.com/anchor-migration/migration-hub/blob/main/docs/ADR-005-multi-tier-alignment-and-ssot-explorer.md)

Loads the **linked SQLite** produced by `java-ast-ssot crosswalk` and visualizes `code_schema_link` edges with **bidirectional colors** (traffic-map model: forward → / backward ←).

## Quick start

```bash
# 1. Produce linked SSOT (see java-ast-ssot / demo-dukesbank)
java-ast-ssot crosswalk \
  --code-db metadata/dukesbank-code.db \
  --schema-db metadata/dukesbank.db \
  --db-schema dukesbank \
  -o metadata/dukesbank-linked.db

# 2. Run explorer
npm install
npm run dev
```

Open http://localhost:5173 and load `dukesbank-linked.db`.

## Stack

| Layer | Choice |
|-------|--------|
| UI | React 18 + TypeScript |
| Build | Vite |
| SQLite (browser) | sql.js |
| Graph | Cytoscape.js |

Architecture: **read-only** — never mutates SSOT. Same `.db` → same graph metrics.

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production static site (dist/)
npm run test     # unit tests (color utils)
npm run lint     # typecheck
```

## Scope (v0.1 alpha)

- [x] Load linked crosswalk SQLite
- [x] Crosswalk graph with bidirectional edge colors
- [x] Link table + filters by `edge_kind`
- [x] Color legend (ADR-005)
- [x] Crosswalk issues panel
- [ ] Schema ER view
- [ ] Code package tree
- [ ] Pin sample snapshot bundle for GitHub Pages demo

## License

MIT
