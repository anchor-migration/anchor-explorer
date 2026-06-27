import { useCallback, useState } from "react";
import type { LinkedSnapshot } from "../db/types";
import { loadLinkedSnapshot } from "../db/loadLinkedDb";

export function FileLoader({ onLoaded }: { onLoaded: (s: LinkedSnapshot) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const snapshot = await loadLinkedSnapshot(file);
        onLoaded(snapshot);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [onLoaded],
  );

  return (
    <section className="loader panel">
      <h2>Open linked SSOT</h2>
      <p className="muted">
        Load the SQLite file from{" "}
        <code>java-ast-ssot crosswalk -o metadata/dukesbank-linked.db</code>
      </p>
      <input
        type="file"
        accept=".db,.sqlite,.sqlite3"
        disabled={loading}
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {loading && <p>Loading…</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
