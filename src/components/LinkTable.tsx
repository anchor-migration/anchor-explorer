import type { CodeSchemaLink } from "../db/types";
import { colorHex } from "../utils/colors";

interface Props {
  links: CodeSchemaLink[];
  filter: string;
  onFilter: (edgeKind: string) => void;
}

export function LinkTable({ links, filter, onFilter }: Props) {
  const kinds = [...new Set(links.map((l) => l.edgeKind))].sort();
  const visible = filter === "all" ? links : links.filter((l) => l.edgeKind === filter);

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Links</h2>
        <label>
          Edge kind{" "}
          <select value={filter} onChange={(e) => onFilter(e.target.value)}>
            <option value="all">All ({links.length})</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k} ({links.filter((l) => l.edgeKind === k).length})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kind</th>
              <th>Source</th>
              <th>Target</th>
              <th>→ Fwd</th>
              <th>← Back</th>
              <th>Round trip</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((link) => (
              <tr key={link.id}>
                <td className="mono">{link.edgeKind}</td>
                <td className="mono small">{link.sourceStableId}</td>
                <td className="mono small">{link.targetStableId}</td>
                <td>
                  <ColorBadge color={link.colorForward} />
                </td>
                <td>
                  <ColorBadge color={link.colorBackward} />
                </td>
                <td className="mono">{link.roundTripClass}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ColorBadge({ color }: { color: CodeSchemaLink["colorForward"] }) {
  return (
    <span
      className="badge"
      style={{ background: colorHex(color), color: color === "yellow" ? "#422006" : "#fff" }}
      title={color}
    >
      {color}
    </span>
  );
}
