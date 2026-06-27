import type { EdgeColor } from "../db/types";

const HEX: Record<EdgeColor, string> = {
  green: "#16a34a",
  yellow: "#ca8a04",
  orange: "#ea580c",
  red: "#dc2626",
};

const LABEL: Record<EdgeColor, string> = {
  green: "Green",
  yellow: "Yellow",
  orange: "Orange",
  red: "Red",
};

export function colorHex(color: EdgeColor): string {
  return HEX[color];
}

export function colorLabel(color: EdgeColor): string {
  return LABEL[color];
}

export function parseEdgeColor(value: string | null | undefined): EdgeColor {
  if (value === "yellow" || value === "orange" || value === "red") {
    return value;
  }
  return "green";
}

export function worstColor(a: EdgeColor, b: EdgeColor): EdgeColor {
  const rank: Record<EdgeColor, number> = { green: 0, yellow: 1, orange: 2, red: 3 };
  return rank[a] >= rank[b] ? a : b;
}
