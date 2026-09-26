/**
 * Block-based editor model.
 * editor_json is the source of truth. HTML is a cached render.
 */

export type BlockType =
  | "header"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "divider"
  | "spacer"
  | "columns"
  | "footer"
  | "variable";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeaderBlock extends BaseBlock {
  type: "header";
  logoText: string;
  backgroundColor: string;
  textColor: string;
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  content: string; // can contain {{variables}}
  level: 1 | 2 | 3;
  align: "left" | "center" | "right";
}

export interface TextBlock extends BaseBlock {
  type: "text";
  content: string;
  align: "left" | "center" | "right";
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  label: string;
  href: string;
  backgroundColor: string;
  textColor: string;
  align: "left" | "center" | "right";
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  alt: string;
  width?: number;
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  color: string;
}

export interface SpacerBlock extends BaseBlock {
  type: "spacer";
  height: number;
}

export interface ColumnsBlock extends BaseBlock {
  type: "columns";
  columns: Array<{ blocks: EditorBlock[] }>;
}

export interface FooterBlock extends BaseBlock {
  type: "footer";
  content: string;
}

export interface VariableBlock extends BaseBlock {
  type: "variable";
  variableKey: string; // e.g. "name"
  label: string;
}

export type EditorBlock =
  | HeaderBlock
  | HeadingBlock
  | TextBlock
  | ButtonBlock
  | ImageBlock
  | DividerBlock
  | SpacerBlock
  | ColumnsBlock
  | FooterBlock
  | VariableBlock;

export interface EditorDocument {
  version: 1;
  blocks: EditorBlock[];
  variables: string[]; // e.g. ["name", "amount", "crypto_type", ...]
}

export interface TemplateRecord {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  editorJson: EditorDocument;
  html: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Default variables supported by the example Transaction Confirmation template */
export const DEFAULT_VARIABLES = [
  "name",
  "amount",
  "crypto_type",
  "network",
  "receiver_email",
  "message",
  "reference_id",
] as const;

export type DefaultVariable = (typeof DEFAULT_VARIABLES)[number];
