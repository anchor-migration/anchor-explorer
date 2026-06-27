import type { LinkedSnapshot, LinkStats } from "../db/types";

interface Props {
  snapshot: LinkedSnapshot;
  stats: LinkStats;
}

export function SnapshotHeader({ snapshot, stats }: Props) {
  const { run, fileName, issues } = snapshot;
  return (
    <header className="snapshot-header">
      <div>
        <h1>Anchor Explorer</h1>
        <p className="muted">
          Read-only view of <strong>{fileName}</strong> — Anchor Migration crosswalk (ADR-005)
        </p>
      </div>
      <dl className="meta-grid">
        <div>
          <dt>DB schema</dt>
          <dd>{run.dbSchema}</dd>
        </div>
        <div>
          <dt>Crosswalk run</dt>
          <dd>{run.id}</dd>
        </div>
        <div>
          <dt>Code export run</dt>
          <dd>{run.codeExportRunId}</dd>
        </div>
        <div>
          <dt>Schema export run</dt>
          <dd>{run.schemaExportRunId}</dd>
        </div>
        <div>
          <dt>Links</dt>
          <dd>{stats.total}</dd>
        </div>
        <div>
          <dt>Issues</dt>
          <dd className={issues.length ? "warn" : ""}>{issues.length}</dd>
        </div>
        <div>
          <dt>Forward green</dt>
          <dd>{stats.forwardGreen}</dd>
        </div>
        <div>
          <dt>Backward yellow</dt>
          <dd>{stats.backwardYellow}</dd>
        </div>
        <div>
          <dt>Asymmetric</dt>
          <dd>{stats.asymmetric}</dd>
        </div>
      </dl>
    </header>
  );
}
