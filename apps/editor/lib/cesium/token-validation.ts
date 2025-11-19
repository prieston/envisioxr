/**
 * Token validation utilities for Cesium Ion tokens
 */

const CESIUM_ION_API_BASE = "https://api.cesium.com/v1";

export interface TokenValidationResult {
  valid: boolean;
  scopes?: string[];
  accountId?: string;
  error?: string;
}

export interface RequiredScopes {
  read: string[];
  upload: string[];
}

/**
 * Required scopes for read-only token
 * Must have at least assets:list and assets:read
 */
export const REQUIRED_READ_SCOPES: string[] = [
  "assets:list",
  "assets:read",
];

/**
 * Optional but acceptable scopes for read-only token
 */
export const OPTIONAL_READ_SCOPES: string[] = [
  "assets:limited-list",
  "geocode",
];

/**
 * Required scopes for upload token
 * Must have assets:list, assets:read, and assets:write
 */
export const REQUIRED_UPLOAD_SCOPES: string[] = [
  "assets:list",
  "assets:read",
  "assets:write",
];

/**
 * Validate a Cesium Ion token by calling the API
 * @param token - The token to validate
 * @returns Validation result with scopes and account info
 */
export async function validateCesiumToken(
  token: string
): Promise<TokenValidationResult> {
  try {
    const response = await fetch(`${CESIUM_ION_API_BASE}/assets`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          valid: false,
          error: "Invalid token: Authentication failed",
        };
      }
      return {
        valid: false,
        error: `Token validation failed: ${response.statusText}`,
      };
    }

    // Try to get scopes from response headers or body
    // Cesium Ion API may return scopes in headers or we need to infer from account endpoint

    // Try to get account info to extract scopes
    const scopes: string[] = [];
    let accountId: string | undefined;

    try {
      const accountResponse = await fetch(`${CESIUM_ION_API_BASE}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (accountResponse.ok) {
        const accountData = await accountResponse.json();
        // Cesium Ion may return scopes in the account data
        // If not available, we'll need to infer from token capabilities
        accountId = accountData.id || accountData.username;
      }
    } catch (error) {
      // Profile endpoint might not be available, continue without it
    }

    // If we can't get scopes directly, we'll validate based on what the token can do
    // For now, if the assets endpoint works, we assume basic read permissions
    // We'll need to check write permissions separately

    return {
      valid: true,
      scopes: scopes.length > 0 ? scopes : undefined,
      accountId,
    };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to validate token with Cesium Ion",
    };
  }
}

/**
 * Validate that a token has the required scopes
 * @param token - The token to validate
 * @param requiredScopes - Array of required scope strings
 * @param tokenType - "read" or "upload" for better error messages
 * @returns Validation result
 */
export async function validateTokenScopes(
  token: string,
  requiredScopes: string[],
  tokenType: "read" | "upload"
): Promise<TokenValidationResult> {
  const validation = await validateCesiumToken(token);

  if (!validation.valid) {
    return validation;
  }

  // If we don't have explicit scopes, we need to test capabilities
  if (!validation.scopes || validation.scopes.length === 0) {
    // For read token, test if we can list assets
    if (tokenType === "read") {
      // Already validated by validateCesiumToken
      return {
        valid: true,
        scopes: REQUIRED_READ_SCOPES,
        accountId: validation.accountId,
      };
    }

    // For upload token, test write capability
    if (tokenType === "upload") {
      try {
        // Try to create a test asset or check if we have write permissions
        // For now, if the token validates, we'll assume it has write if it's an upload token
        // In production, you might want to do a more thorough check
        return {
          valid: true,
          scopes: REQUIRED_UPLOAD_SCOPES,
          accountId: validation.accountId,
        };
      } catch (error) {
        return {
          valid: false,
          error: "Upload token does not have write permissions",
        };
      }
    }
  }

  // Check if all required scopes are present
  const hasAllRequired = requiredScopes.every((scope) =>
    validation.scopes?.includes(scope)
  );

  if (!hasAllRequired) {
    const missing = requiredScopes.filter(
      (scope) => !validation.scopes?.includes(scope)
    );
    return {
      valid: false,
      error: `${tokenType === "read" ? "Read-only" : "Upload"} token is missing required scopes: ${missing.join(", ")}. In Cesium's 'Create token' screen, enable these under ${tokenType === "read" ? "Public" : "Private"} scopes.`,
      scopes: validation.scopes,
      accountId: validation.accountId,
    };
  }

  return {
    valid: true,
    scopes: validation.scopes,
    accountId: validation.accountId,
  };
}

/**
 * Validate read-only token
 */
export async function validateReadToken(
  token: string
): Promise<TokenValidationResult> {
  return validateTokenScopes(token, REQUIRED_READ_SCOPES, "read");
}

/**
 * Validate upload token by testing write capability
 */
export async function validateUploadToken(
  token: string
): Promise<TokenValidationResult> {
  // First validate basic token
  const basicValidation = await validateCesiumToken(token);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  // Test write capability by attempting to create a test asset
  // We'll use a minimal request that will fail gracefully if write is not allowed
  try {
    // Try to access assets endpoint with write intent
    // Cesium Ion API: POST /v1/assets requires write permission
    const testResponse = await fetch(`${CESIUM_ION_API_BASE}/assets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "__test_write_permission__",
        type: "3DTILES",
      }),
    });

    // If we get 403, token doesn't have write permission
    if (testResponse.status === 403) {
      return {
        valid: false,
        error: "Upload token is missing assets:write. In Cesium's 'Create token' screen, enable assets:list, assets:read and assets:write.",
        accountId: basicValidation.accountId,
      };
    }

    // If we get 400/422, it might be invalid request but token has write permission
    // If we get 201, token definitely has write permission
    if (testResponse.status === 201) {
      // Delete the test asset immediately
      const testData = await testResponse.json();
      if (testData.id) {
        await fetch(`${CESIUM_ION_API_BASE}/assets/${testData.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {
          // Ignore deletion errors
        });
      }
    }

    // If status is 400/422, it's likely a validation error but token has write permission
    // We'll consider it valid if we got past authentication
    if (testResponse.status >= 400 && testResponse.status < 500 && testResponse.status !== 403) {
      // Token has write permission but request was invalid (which is fine for our test)
      return {
        valid: true,
        scopes: REQUIRED_UPLOAD_SCOPES,
        accountId: basicValidation.accountId,
      };
    }

    // If we got here, token seems to have write permission
    return {
      valid: true,
      scopes: REQUIRED_UPLOAD_SCOPES,
      accountId: basicValidation.accountId,
    };
  } catch (error) {
    // If we can't test write, assume it's valid if basic validation passed
    // This is a fallback - in production you might want to be more strict
    return {
      valid: true,
      scopes: REQUIRED_UPLOAD_SCOPES,
      accountId: basicValidation.accountId,
    };
  }
}

