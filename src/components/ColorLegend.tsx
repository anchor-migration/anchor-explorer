import type { EdgeColor } from "../db/types";
import { colorHex, colorLabel } from "../utils/colors";

const ITEMS: { color: EdgeColor; drift: string }[] = [
  { color: "green", drift: "No drift / safe direction" },
  { color: "yellow", drift: "Explainable drift or narrowing on write-back" },
  { color: "orange", drift: "Questionable — needs review" },
  { color: "red", drift: "Unexplainable or incompatible" },
];

export function ColorLegend() {
  return (
    <section className="legend" aria-label="Edge color legend">
      <h2>Edge colors (bidirectional)</h2>
      <p className="muted">
        Each link has <strong>→ forward</strong> (read / precision up) and{" "}
        <strong>← backward</strong> (write / persist). Like traffic: one direction can be clear while
        the other is not.
      </p>
      <ul>
        {ITEMS.map(({ color, drift }) => (
          <li key={color}>
            <span className="swatch" style={{ background: colorHex(color) }} aria-hidden />
            <span>
              <strong>{colorLabel(color)}</strong> — {drift}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
