# Multi-Tenant Branding Setup

Your application now supports multi-tenant branding that automatically detects the domain and shows the appropriate logo!

## ✅ How It Works

The `useTenant()` hook automatically detects the hostname and returns the appropriate tenant configuration:

### Tenants

**1. Klorad Studio** (Default)
- **Domains**: `klorad.com`, `studio.klorad.com`, `localhost`, etc.
- **Logo**: `/images/logo/klorad-logo.svg`
- **Name**: "Klorad Studio"
- **No "Powered by" text**

**2. PSMDT**
- **Domains**: `psm.klorad.com`, `psm.*`
- **Logo**: `/images/logo/psmdt-logo.svg`
- **Name**: "PSMDT"
- **Shows**: "Powered by Klorad" underneath the logo

## 🎨 Where It's Applied

The tenant-aware logo is automatically shown in:

✅ **Sign-in Page** (`/auth/signin`)
✅ **Dashboard** (`/dashboard`)
✅ **Builder** (`/projects/[id]/builder`)
✅ **Publish Screens** (`/publish/[id]`)
✅ **All panels and headers** (via `LogoHeader` component)

## 🔧 Implementation

### Using the Tenant Hook

```typescript
import { useTenant } from "@envisio/core";

function MyComponent() {
  const tenant = useTenant();

  return (
    <div>
      <img src={tenant.logo} alt={tenant.logoAlt} />
      {tenant.poweredBy && <p>{tenant.poweredBy}</p>}
    </div>
  );
}
```

### Tenant Configuration

The tenant config is defined in `/packages/core/src/hooks/useTenant.ts`:

```typescript
const tenantConfigs = {
  klorad: {
    id: "klorad",
    name: "Klorad Studio",
    domain: "klorad.com",
    logo: "/images/logo/klorad-logo.svg",
    logoAlt: "Klorad Studio",
  },
  psmdt: {
    id: "psmdt",
    name: "PSMDT",
    domain: "psm.klorad.com",
    logo: "/images/logo/psmdt-logo.svg",
    logoAlt: "PSMDT",
    poweredBy: "Powered by Klorad",
  },
};
```

## 📝 Adding New Tenants

To add a new tenant:

1. **Add logo file** to `/apps/editor/public/images/logo/[tenant]-logo.svg`

2. **Update tenant config** in `/packages/core/src/hooks/useTenant.ts`:
   ```typescript
   const tenantConfigs = {
     // ... existing tenants
     newclient: {
       id: "newclient",
       name: "New Client Name",
       domain: "client.klorad.com",
       logo: "/images/logo/newclient-logo.svg",
       logoAlt: "New Client",
       poweredBy: "Powered by Klorad", // Optional
     },
   };
   ```

3. **Update detection logic**:
   ```typescript
   function detectTenant(hostname?: string): TenantId {
     if (!hostname) return "klorad";

     if (hostname.includes("client.klorad.com")) {
       return "newclient";
     }

     if (hostname.includes("psm.klorad.com")) {
       return "psmdt";
     }

     return "klorad";
   }
   ```

4. **Rebuild core package**:
   ```bash
   cd packages/core && pnpm build
   ```

## 🖼️ Logo Requirements

- **Format**: SVG preferred (or PNG)
- **Klorad dimensions**: 120px × 32px
- **PSMDT dimensions**: 99px × 40px
- **Colors**: Use `currentColor` in SVG for theme-aware coloring
- **Location**: `/apps/editor/public/images/logo/`

## 🌐 Testing Locally

### Test PSMDT branding:
1. Add to `/etc/hosts`:
   ```
   127.0.0.1 psm.klorad.local
   ```

2. Access at: `http://psm.klorad.local:3001`

### Test Klorad branding:
- Access at: `http://localhost:3001` (default)

## 🚀 Production Deployment

### DNS Setup

**Klorad Studio:**
- `studio.klorad.com` → Vercel deployment

**PSMDT:**
- `psm.klorad.com` → Same Vercel deployment (just different domain)

### Vercel Configuration

No special configuration needed! The same deployment handles all tenants automatically based on the hostname.

Just add multiple domains in Vercel:
1. Go to Project Settings → Domains
2. Add both domains:
   - `studio.klorad.com`
   - `psm.klorad.com`

The app will automatically detect which one is being accessed and show the appropriate branding.

## 🎯 Benefits

✅ **Single Codebase** - One deployment handles all tenants
✅ **Automatic Detection** - No manual configuration needed
✅ **Consistent Branding** - Logo appears everywhere automatically
✅ **Easy to Extend** - Add new tenants in minutes
✅ **Theme Aware** - Logos adapt to dark/light mode

---

**Note**: Replace the placeholder PSMDT logo at `/apps/editor/public/images/logo/psmdt-logo.svg` with the actual PSMDT logo file.

