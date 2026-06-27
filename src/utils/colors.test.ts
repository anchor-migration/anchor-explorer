import { describe, expect, it } from "vitest";
import { parseEdgeColor, worstColor } from "./colors";

describe("colors", () => {
  it("parses edge colors", () => {
    expect(parseEdgeColor("yellow")).toBe("yellow");
    expect(parseEdgeColor(null)).toBe("green");
  });

  it("picks worst color", () => {
    expect(worstColor("green", "yellow")).toBe("yellow");
    expect(worstColor("orange", "red")).toBe("red");
  });
});
