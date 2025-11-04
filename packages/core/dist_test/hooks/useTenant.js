"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTenant = useTenant;
exports.getTenantFromHostname = getTenantFromHostname;
var react_1 = require("react");
var tenantConfigs = {
    klorad: {
        id: "klorad",
        name: "Klorad Studio",
        domain: "klorad.com",
        logo: "/images/logo/klorad-logo.svg",
        logoAlt: "Klorad Studio",
        logoWidth: 130,
        logoHeight: 21,
    },
    psmdt: {
        id: "psmdt",
        name: "PSMDT",
        domain: "psm.klorad.com",
        logo: "/images/logo/psm-logo-new.png",
        logoAlt: "PSMDT",
        logoWidth: 130,
        logoHeight: 21,
        poweredBy: "Powered by Klorad",
    },
};
function detectTenant(hostname) {
    if (!hostname)
        return "klorad";
    // Check for PSMDT domain
    if (hostname.includes("psm.klorad.com") || hostname.startsWith("psm.")) {
        return "psmdt";
    }
    // Default to Klorad
    return "klorad";
}
function useTenant() {
    var _a = (0, react_1.useState)(tenantConfigs.klorad), tenant = _a[0], setTenant = _a[1];
    (0, react_1.useEffect)(function () {
        if (typeof window !== "undefined") {
            var tenantId = detectTenant(window.location.hostname);
            setTenant(tenantConfigs[tenantId]);
        }
    }, []);
    return tenant;
}
// Server-side detection helper
function getTenantFromHostname(hostname) {
    var tenantId = detectTenant(hostname);
    return tenantConfigs[tenantId];
}
