/**
 * Core types for the audit system
 */

export type AuditSeverity = "error" | "warning" | "info";

export interface AuditResultItem {
  message: string;
  file?: string;
  line?: number;
  column?: number;
  severity?: AuditSeverity;
  code?: string;
}

export interface AuditResult {
  id: string;
  title: string;
  ok: boolean;
  items: AuditResultItem[];
}

export interface AuditContext {
  rootDir: string;
  manifest: unknown;
  workspace: Workspace;
}

export interface AuditDefinition {
  id: string;
  title: string;
  run(ctx: AuditContext): Promise<AuditResult>;
}

export interface ProjectProfile {
  name: string;
  loadManifest(rootDir: string): Promise<unknown>;
  getCoreAudits(rootDir: string): Promise<AuditDefinition[]>;
  getAdvisoryAudits(rootDir: string): Promise<AuditDefinition[]>;
}

export interface PackageInfo {
  name: string;
  path: string;
  packageJson: {
    name: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    exports?: unknown;
    main?: string;
    module?: string;
    types?: string;
  };
}

export interface Workspace {
  rootDir: string;
  getPackages(): Promise<PackageInfo[]>;
  findFiles(pattern: string, options?: { cwd?: string; ignore?: string[] }): Promise<string[]>;
  readFile(filePath: string): Promise<string>;
  fileExists(filePath: string): boolean;
}

