export type AffectedBlock = "frontmatter" | "templater";
export type InsertMethod = "before" | "after" | "overwrite";

export interface MethodSelection {
  targets: AffectedBlock[];
  method: InsertMethod;
}
