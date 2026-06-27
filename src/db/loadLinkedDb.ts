import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import type { CodeSchemaLink, CrosswalkIssue, CrosswalkRun, LinkedSnapshot, LinkStats } from "./types";
import { parseEdgeColor } from "../utils/colors";

let sqlInit: Promise<SqlJsStatic> | null = null;

async function getSql(): Promise<SqlJsStatic> {
  if (!sqlInit) {
    sqlInit = initSqlJs({ locateFile: () => wasmUrl });
  }
  return sqlInit;
}

export async function loadLinkedSnapshot(file: File): Promise<LinkedSnapshot> {
  const SQL = await getSql();
  const buffer = await file.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(buffer));
  try {
    return parseLinkedDb(db, file.name);
  } finally {
    db.close();
  }
}

function parseLinkedDb(db: Database, fileName: string): LinkedSnapshot {
  const run = readRun(db);
  const links = readLinks(db, run.id);
  const issues = readIssues(db, run.id);
  return { fileName, run, links, issues };
}

function readRun(db: Database): CrosswalkRun {
  const stmt = db.prepare(`
    SELECT id, db_schema, code_export_run_id, schema_export_run_id, linked_at, tool_version
    FROM crosswalk_run ORDER BY id DESC LIMIT 1
  `);
  try {
    if (!stmt.step()) {
      throw new Error("No crosswalk_run found — is this a linked SSOT file from java-ast-ssot crosswalk?");
    }
    const row = stmt.getAsObject();
    return {
      id: row.id as number,
      dbSchema: row.db_schema as string,
      codeExportRunId: row.code_export_run_id as number,
      schemaExportRunId: row.schema_export_run_id as number,
      linkedAt: row.linked_at as string,
      toolVersion: (row.tool_version as string) ?? undefined,
    };
  } finally {
    stmt.free();
  }
}

function readLinks(db: Database, runId: number): CodeSchemaLink[] {
  const hasAlignment = tableHasColumn(db, "code_schema_link", "color_forward");
  const sql = hasAlignment
    ? `
      SELECT id, edge_kind, source_stable_id, target_stable_id, mapping_role, profile_id,
             name_drift_class, type_relation_forward, type_relation_backward,
             color_forward, color_backward, round_trip_class
      FROM code_schema_link WHERE crosswalk_run_id = ?
      ORDER BY edge_kind, source_stable_id
    `
    : `
      SELECT id, edge_kind, source_stable_id, target_stable_id, mapping_role, profile_id
      FROM code_schema_link WHERE crosswalk_run_id = ?
      ORDER BY edge_kind, source_stable_id
    `;
  const stmt = db.prepare(sql);
  const links: CodeSchemaLink[] = [];
  try {
    stmt.bind([runId]);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      if (hasAlignment) {
        links.push({
          id: row.id as number,
          edgeKind: row.edge_kind as string,
          sourceStableId: row.source_stable_id as string,
          targetStableId: row.target_stable_id as string,
          mappingRole: row.mapping_role as string,
          profileId: row.profile_id as string,
          nameDriftClass: row.name_drift_class as string,
          typeRelationForward: row.type_relation_forward as string,
          typeRelationBackward: row.type_relation_backward as string,
          colorForward: parseEdgeColor(row.color_forward as string),
          colorBackward: parseEdgeColor(row.color_backward as string),
          roundTripClass: row.round_trip_class as string,
        });
      } else {
        links.push({
          id: row.id as number,
          edgeKind: row.edge_kind as string,
          sourceStableId: row.source_stable_id as string,
          targetStableId: row.target_stable_id as string,
          mappingRole: row.mapping_role as string,
          profileId: row.profile_id as string,
          nameDriftClass: "none",
          typeRelationForward: "unknown",
          typeRelationBackward: "unknown",
          colorForward: "green",
          colorBackward: "green",
          roundTripClass: "safe",
        });
      }
    }
  } finally {
    stmt.free();
  }
  return links;
}

function readIssues(db: Database, runId: number): CrosswalkIssue[] {
  if (!tableExists(db, "crosswalk_issue")) {
    return [];
  }
  const stmt = db.prepare(
    `SELECT severity, issue_code, message, context_ref FROM crosswalk_issue WHERE crosswalk_run_id = ?`,
  );
  const issues: CrosswalkIssue[] = [];
  try {
    stmt.bind([runId]);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      issues.push({
        severity: row.severity as string,
        issueCode: row.issue_code as string,
        message: row.message as string,
        contextRef: (row.context_ref as string) ?? null,
      });
    }
  } finally {
    stmt.free();
  }
  return issues;
}

function tableExists(db: Database, name: string): boolean {
  const stmt = db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`);
  try {
    stmt.bind([name]);
    return stmt.step();
  } finally {
    stmt.free();
  }
}

function tableHasColumn(db: Database, table: string, column: string): boolean {
  const stmt = db.prepare(`PRAGMA table_info(${table})`);
  try {
    while (stmt.step()) {
      const row = stmt.getAsObject();
      if (row.name === column) {
        return true;
      }
    }
    return false;
  } finally {
    stmt.free();
  }
}

export function computeLinkStats(links: CodeSchemaLink[]): LinkStats {
  let forwardGreen = 0;
  let backwardYellow = 0;
  let asymmetric = 0;
  let red = 0;
  for (const link of links) {
    if (link.colorForward === "green") forwardGreen++;
    if (link.colorBackward === "yellow") backwardYellow++;
    if (link.roundTripClass === "asymmetric") asymmetric++;
    if (link.colorForward === "red" || link.colorBackward === "red") red++;
  }
  return { total: links.length, forwardGreen, backwardYellow, asymmetric, red };
}

export function nodeSide(stableId: string): "code" | "schema" | "other" {
  if (stableId.startsWith("ejb:") || stableId.includes("#")) {
    return "code";
  }
  if (/^com\./.test(stableId)) {
    return "code";
  }
  if (/^[a-z][a-z0-9_]*\.[A-Z0-9_]+(\.[A-Z0-9_]+)*$/.test(stableId)) {
    return "schema";
  }
  return "other";
}
