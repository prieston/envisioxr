// packages/dev-audits/src/profiles/klorad/index.ts
/**
 * Klorad project profile
 */

import type { ProjectProfile, AuditDefinition } from "../../core/types.js";
import { kloradManifest } from "./klorad.manifest.js";
import { structureAudit } from "./audits/structure.audit.js";
import { ssrRscAudit } from "./audits/ssr-rsc.audit.js";
import { envAudit } from "./audits/env.audit.js";
import { cesiumAudit } from "./audits/cesium.audit.js";
import { apiOrgAudit } from "./audits/api-org.audit.js";
import { uiBoundariesAudit } from "./audits/ui-boundaries.audit.js";
import { cesiumEngineBoundariesAudit } from "./audits/cesium-engine-boundaries.audit.js";
import { threejsEngineBoundariesAudit } from "./audits/threejs-engine-boundaries.audit.js";

// Import advisory audits
import { sizeComplexityAudit } from "./advisory/size-complexity.audit.js";

export const kloradProfile: ProjectProfile = {
  name: "klorad",
  async loadManifest(_rootDir: string): Promise<unknown> {
    return kloradManifest;
  },
  async getCoreAudits(_rootDir: string): Promise<AuditDefinition[]> {
    return [
      structureAudit,
      ssrRscAudit,
      envAudit,
      cesiumAudit,
      apiOrgAudit,
      uiBoundariesAudit,
      cesiumEngineBoundariesAudit,
      threejsEngineBoundariesAudit,
    ];
  },
  async getAdvisoryAudits(_rootDir: string): Promise<AuditDefinition[]> {
    return [
      sizeComplexityAudit,
      // Add more advisory audits here as needed
    ];
  },
};
