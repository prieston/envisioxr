# Email System Documentation

This directory contains the email system for Klorad, built on Resend with React Email templates.

## Overview

The email system provides:
- Type-safe email sending with Resend
- React Email templates for consistent styling
- Helper functions for common email types
- Easy extensibility for new email types

## Architecture

```
lib/email/
├── resendClient.ts    # Low-level Resend client wrapper
├── helpers.ts         # Typed helper functions for each email type
├── tokens.ts          # Token generation utilities
├── templates/         # React Email components
│   ├── EmailLayout.tsx
│   ├── VerificationEmail.tsx
│   ├── OrgInviteEmail.tsx
│   ├── PasswordResetEmail.tsx
│   └── WelcomeEmail.tsx
└── index.ts           # Main exports
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM="Klorad <no-reply@klorad.app>"
NEXT_PUBLIC_APP_URL=https://app.klorad.app
```

These are validated via `lib/env/server.ts` and exported as `emailConfig`.

## Usage

### Sending Emails

Import the helper functions from `@/lib/email`:

```typescript
import {
  sendVerificationEmail,
  sendOrgInviteEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "@/lib/email";

// Email verification
await sendVerificationEmail(userEmail, token, userName);

// Organization invitation
await sendOrgInviteEmail(inviteeEmail, orgName, inviterName, token);

// Password reset
await sendPasswordResetEmail(userEmail, token, userName);

// Welcome email
await sendWelcomeEmail(userEmail, orgName, userName, orgId);
```

### Low-Level API

For custom emails, use the low-level `sendEmail` function:

```typescript
import { sendEmail, buildAppUrl } from "@/lib/email";
import { CustomEmailTemplate } from "./templates/CustomEmail";

await sendEmail({
  to: "user@example.com",
  subject: "Custom Email",
  react: CustomEmailTemplate({ ...props }),
});
```

## Supported Email Types

### 1. Email Verification (`sendVerificationEmail`)

**Trigger**: When a user signs up with email/password

**Template**: `VerificationEmail`

**URL Pattern**: `/auth/verify-email?token=...`

**Token Expiration**: 24 hours

### 2. Organization Invitation (`sendOrgInviteEmail`)

**Trigger**: When an org admin invites a member by email

**Template**: `OrgInviteEmail`

**URL Pattern**: `/orgs/invites/accept?token=...`

**Token Expiration**: 7 days

**Features**:
- Works for both existing and new users
- Preserves token for sign-up flow if user doesn't exist

### 3. Password Reset (`sendPasswordResetEmail`)

**Trigger**: When a user requests password reset

**Template**: `PasswordResetEmail`

**URL Pattern**: `/auth/reset-password?token=...`

**Token Expiration**: 1 hour

### 4. Welcome Email (`sendWelcomeEmail`)

**Trigger**: First time a user successfully joins their FIRST organization

**Template**: `WelcomeEmail`

**Features**:
- Only sent once (first org join)
- Includes links to dashboard, docs, and support

## Adding a New Email Type

### Step 1: Create the Template Component

Create a new React Email component in `templates/`:

```typescript
// templates/NewEmailType.tsx
import { EmailLayout } from "./EmailLayout";
import { Button, Text } from "@react-email/components";

interface NewEmailTypeProps {
  // Define props
  userName?: string;
  actionUrl: string;
}

export function NewEmailType({ userName, actionUrl }: NewEmailTypeProps) {
  return (
    <EmailLayout preview="Preview text for email clients">
      <Text>Hi {userName || "there"},</Text>
      {/* Your email content */}
      <Button href={actionUrl}>Take Action</Button>
    </EmailLayout>
  );
}
```

### Step 2: Export from Templates Index

Add to `templates/index.ts`:

```typescript
export { NewEmailType } from "./NewEmailType";
```

### Step 3: Create Helper Function

Add to `helpers.ts`:

```typescript
import { NewEmailType } from "./templates";

export async function sendNewEmailType(
  userEmail: string,
  // ... other params
): Promise<void> {
  const actionUrl = buildAppUrl(`/path/to/action?token=${token}`);

  await sendEmail({
    to: userEmail,
    subject: "Your Subject",
    react: NewEmailType({
      // ... props
    }),
  });
}
```

### Step 4: Export from Main Index

Add to `index.ts`:

```typescript
export { sendNewEmailType } from "./helpers";
```

### Step 5: Use in Your Code

```typescript
import { sendNewEmailType } from "@/lib/email";

// In your API route or server action
await sendNewEmailType(userEmail, ...);
```

## Testing Locally

### Using Resend Test Keys

1. Sign up for a Resend account at https://resend.com
2. Get your API key from the dashboard
3. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_test_xxxxxxxxxxxxx
   EMAIL_FROM="Test <onboarding@resend.dev>"
   ```
4. Resend test keys will send emails to your verified domain or use their test domain

### Email Preview

You can preview React Email templates using the React Email CLI:

```bash
npx react-email dev
```

This starts a local server where you can preview and test templates.

## Error Handling

The email system is designed to fail gracefully:

- Email sending errors are logged but don't break the user flow
- All email functions return `Promise<void>` and catch errors internally
- TODO comments mark places where centralized logging (e.g., Sentry) should be integrated

## Token Management

Token generation and expiration utilities are in `tokens.ts`:

```typescript
import { generateToken, getTokenExpiration } from "@/lib/email/tokens";

const token = generateToken(); // 32-byte hex token
const expires = getTokenExpiration(24); // 24 hours from now
```

## API Routes

The following API routes integrate with the email system:

- `POST /api/auth/signup` - Sends verification email
- `GET /api/auth/verify-email` - Verifies email token
- `POST /api/auth/reset-password/request` - Sends password reset email
- `POST /api/auth/reset-password/confirm` - Confirms password reset
- `POST /api/organizations/[orgId]/invites` - Sends org invitation email
- `POST /api/organizations/invites/accept` - Accepts invitation (may send welcome email)

## Database Schema

Email-related models:

- `VerificationToken` - Email verification tokens
- `OrganizationInvite` - Organization invitation tokens
- `User.passwordResetToken` - Password reset tokens (stored on user)

## Security Considerations

1. **Token Expiration**: All tokens have expiration times
2. **Email Enumeration**: Password reset doesn't reveal if email exists
3. **Token Uniqueness**: All tokens are unique and cryptographically secure
4. **HTTPS Only**: Email links should only work over HTTPS in production

## Future Enhancements

- [ ] Email queue system for high-volume sending
- [ ] Email templates with dynamic branding
- [ ] Email analytics and tracking
- [ ] A/B testing for email content
- [ ] Integration with Sentry for error tracking
- [ ] Email preferences/unsubscribe management

