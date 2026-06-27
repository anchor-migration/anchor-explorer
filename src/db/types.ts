export type EdgeColor = "green" | "yellow" | "orange" | "red";

export interface CrosswalkRun {
  id: number;
  dbSchema: string;
  codeExportRunId: number;
  schemaExportRunId: number;
  linkedAt: string;
  toolVersion?: string;
}

export interface CodeSchemaLink {
  id: number;
  edgeKind: string;
  sourceStableId: string;
  targetStableId: string;
  mappingRole: string;
  profileId: string;
  nameDriftClass: string;
  typeRelationForward: string;
  typeRelationBackward: string;
  colorForward: EdgeColor;
  colorBackward: EdgeColor;
  roundTripClass: string;
}

export interface LinkedSnapshot {
  fileName: string;
  run: CrosswalkRun;
  links: CodeSchemaLink[];
  issues: CrosswalkIssue[];
}

export interface CrosswalkIssue {
  severity: string;
  issueCode: string;
  message: string;
  contextRef: string | null;
}

export interface LinkStats {
  total: number;
  forwardGreen: number;
  backwardYellow: number;
  asymmetric: number;
  red: number;
}
