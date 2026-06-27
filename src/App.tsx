import { useMemo, useState } from "react";
import type { LinkedSnapshot } from "./db/types";
import { computeLinkStats } from "./db/loadLinkedDb";
import { ColorLegend } from "./components/ColorLegend";
import { CrosswalkGraph } from "./components/CrosswalkGraph";
import { FileLoader } from "./components/FileLoader";
import { LinkTable } from "./components/LinkTable";
import { SnapshotHeader } from "./components/SnapshotHeader";

export default function App() {
  const [snapshot, setSnapshot] = useState<LinkedSnapshot | null>(null);
  const [filter, setFilter] = useState("all");

  const stats = useMemo(
    () => (snapshot ? computeLinkStats(snapshot.links) : null),
    [snapshot],
  );

  return (
    <div className="app">
      {!snapshot || !stats ? (
        <div className="landing">
          <FileLoader onLoaded={setSnapshot} />
          <ColorLegend />
        </div>
      ) : (
        <>
          <SnapshotHeader snapshot={snapshot} stats={stats} />
          <div className="toolbar">
            <button type="button" onClick={() => setSnapshot(null)}>
              Open another file
            </button>
          </div>
          <div className="layout">
            <aside>
              <ColorLegend />
              {snapshot.issues.length > 0 && (
                <section className="panel issues">
                  <h2>Issues ({snapshot.issues.length})</h2>
                  <ul>
                    {snapshot.issues.map((issue, i) => (
                      <li key={i} className={issue.severity}>
                        <strong>{issue.issueCode}</strong>: {issue.message}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </aside>
            <main>
              <CrosswalkGraph links={snapshot.links} filter={filter} />
              <LinkTable links={snapshot.links} filter={filter} onFilter={setFilter} />
            </main>
          </div>
        </>
      )}
    </div>
  );
}
