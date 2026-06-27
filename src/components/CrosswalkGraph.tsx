import { useEffect, useRef } from "react";
import cytoscape, { Core } from "cytoscape";
import type { CodeSchemaLink } from "../db/types";
import { nodeSide } from "../db/loadLinkedDb";
import { colorHex } from "../utils/colors";

interface Props {
  links: CodeSchemaLink[];
  filter: string;
}

export function CrosswalkGraph({ links, filter }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const filtered = filter === "all" ? links : links.filter((l) => l.edgeKind === filter);
    const nodeIds = [...new Set(filtered.flatMap((l) => [l.sourceStableId, l.targetStableId]))].sort();
    const codeNodes = nodeIds.filter((id) => nodeSide(id) === "code");
    const schemaNodes = nodeIds.filter((id) => nodeSide(id) === "schema");
    const otherNodes = nodeIds.filter((id) => nodeSide(id) === "other");

    const elements: cytoscape.ElementDefinition[] = [];
    let y = 40;
    const place = (id: string, x: number) => {
      elements.push({
        data: { id, label: shortLabel(id), side: nodeSide(id) },
        position: { x, y },
      });
      y += 56;
    };
    codeNodes.forEach((id) => place(id, 140));
    y = 40;
    schemaNodes.forEach((id) => place(id, 560));
    y = 40;
    otherNodes.forEach((id) => place(id, 350));

    filtered.forEach((link, i) => {
      elements.push({
        data: {
          id: `e-${link.id}-${i}`,
          source: link.sourceStableId,
          target: link.targetStableId,
          label: `→${link.colorForward} ←${link.colorBackward}`,
          forwardColor: link.colorForward,
          backwardColor: link.colorBackward,
        },
      });
    });

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      layout: { name: "preset" },
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "font-size": "10px",
            "text-wrap": "wrap",
            "text-max-width": "120px",
            "background-color": "#e2e8f0",
            "border-width": "2px",
            "border-color": "#64748b",
            width: "28px",
            height: "28px",
          },
        },
        {
          selector: 'node[side = "code"]',
          style: { "background-color": "#dbeafe", "border-color": "#2563eb" },
        },
        {
          selector: 'node[side = "schema"]',
          style: { "background-color": "#dcfce7", "border-color": "#16a34a" },
        },
        {
          selector: "edge",
          style: {
            width: "3px",
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
            "target-arrow-color": colorHex("green"),
            "line-color": colorHex("green"),
            label: "data(label)",
            "font-size": "8px",
            color: "#334155",
            "text-background-color": "#fff",
            "text-background-opacity": 0.9,
            "text-background-padding": "2px",
          },
        },
      ],
    });

    cy.edges().forEach((edge) => {
      edge.style({
        "target-arrow-color": colorHex(edge.data("forwardColor")),
        "line-color": colorHex(edge.data("backwardColor")),
      });
    });

    cyRef.current = cy;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [links, filter]);

  return (
    <section className="panel graph-panel">
      <h2>Crosswalk graph</h2>
      <p className="muted">
        Arrow head = <strong>forward</strong> (→). Line = <strong>backward</strong> (←). Left: code; right:
        schema.
      </p>
      <div ref={containerRef} className="cy-container" role="img" aria-label="Crosswalk graph" />
    </section>
  );
}

function shortLabel(stableId: string): string {
  if (stableId.includes("#")) {
    const [type, field] = stableId.split("#");
    const simple = type.split(".").pop() ?? type;
    return `${simple}#${field.split("(")[0]}`;
  }
  if (stableId.startsWith("ejb:")) {
    return stableId;
  }
  const parts = stableId.split(".");
  if (parts.length >= 3) {
    return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  }
  return parts[parts.length - 1] ?? stableId;
}
