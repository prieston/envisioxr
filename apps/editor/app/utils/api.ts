/**
 * Centralized API Client
 *
 * All API requests should go through this file.
 * Use SWR hooks for data fetching in components.
 */

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | null | undefined>;
};

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Base fetch wrapper with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Default options
  const defaultOptions: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...fetchOptions,
    headers: {
      ...defaultOptions.headers,
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new ApiError(
      `API request failed: ${response.statusText}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

// ============================================================================
// User API
// ============================================================================

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    isPersonal: boolean;
    userRole: string | null;
  } | null;
  accounts: Array<{
    provider: string;
    type: string;
  }>;
}

export async function getUser(): Promise<{ user: User }> {
  return apiRequest<{ user: User }>("/api/user");
}

// ============================================================================
// Organizations API
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  isPersonal: boolean;
  userRole: string | null;
}

export async function getOrganization(): Promise<{
  organization: Organization;
}> {
  return apiRequest<{ organization: Organization }>("/api/organizations");
}

export async function updateOrganization(data: {
  name?: string;
  slug?: string;
}): Promise<{ organization: Organization }> {
  return apiRequest<{ organization: Organization }>("/api/organizations", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// Projects API
// ============================================================================

export interface Project {
  id: string;
  title: string;
  description: string | null;
  engine: "three" | "cesium";
  organizationId: string;
  sceneData: unknown;
  isPublished: boolean;
  publishedUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getProjects(): Promise<{ projects: Project[] }> {
  return apiRequest<{ projects: Project[] }>("/api/projects");
}

export async function getProject(
  projectId: string
): Promise<{ project: Project }> {
  return apiRequest<{ project: Project }>(`/api/projects/${projectId}`);
}

export async function createProject(data: {
  title?: string;
  description?: string;
  engine?: "three" | "cesium";
  organizationId?: string;
}): Promise<{ project: Project }> {
  return apiRequest<{ project: Project }>("/api/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProject(
  projectId: string,
  data: {
    title?: string;
    description?: string;
    engine?: "three" | "cesium";
  }
): Promise<{ project: Project }> {
  return apiRequest<{ project: Project }>(`/api/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateProjectScene(
  projectId: string,
  sceneData: unknown
): Promise<{ project: Project }> {
  return apiRequest<{ project: Project }>(`/api/projects/${projectId}`, {
    method: "POST",
    body: JSON.stringify({ sceneData }),
  });
}

export async function publishProject(
  projectId: string
): Promise<{ project: Project }> {
  return apiRequest<{ project: Project }>(`/api/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify({ publish: true }),
  });
}

export async function deleteProject(
  projectId: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/projects/${projectId}`, {
    method: "DELETE",
  });
}

// ============================================================================
// Models/Assets API
// ============================================================================

export interface Asset {
  id: string;
  name?: string | null;
  originalFilename: string;
  fileUrl: string;
  fileType: string;
  organizationId: string;
  projectId?: string | null;
  assetType?: "model" | "cesiumIonAsset" | null;
  description?: string | null;
  thumbnail?: string | null;
  metadata?: Record<string, unknown> | null;
  cesiumAssetId?: string | null;
  cesiumApiKey?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockModel {
  name: string;
  url: string;
  type: string;
}

export interface ModelsResponse {
  assets: Asset[];
  stockModels: StockModel[];
}

export async function getModels(params?: {
  assetType?: "model" | "cesiumIonAsset";
}): Promise<ModelsResponse> {
  return apiRequest<ModelsResponse>("/api/models", { params });
}

export async function getModel(assetId: string): Promise<{ asset: Asset }> {
  return apiRequest<{ asset: Asset }>(`/api/models/${assetId}`);
}

export async function getModelMetadata(
  assetId: string
): Promise<{ metadata: Asset["metadata"] }> {
  return apiRequest<{ metadata: Asset["metadata"] }>(`/api/models/metadata`, {
    params: { assetId },
  });
}

export async function updateModelMetadata(
  assetId: string,
  data: {
    name?: string;
    description?: string;
    metadata?: Asset["metadata"];
    thumbnail?: string;
  }
): Promise<{ asset: Asset }> {
  return apiRequest<{ asset: Asset }>(`/api/models/metadata`, {
    method: "PATCH",
    body: JSON.stringify({ assetId, ...data }),
  });
}

export async function deleteModel(assetId: string): Promise<void> {
  return apiRequest<void>(`/api/models`, {
    method: "DELETE",
    body: JSON.stringify({ assetId }),
  });
}

// Get signed URL for model upload (PATCH endpoint)
export async function getModelUploadUrl(data: {
  fileName: string;
  fileType: string;
}): Promise<{ signedUrl: string; key: string; acl: string }> {
  return apiRequest<{ signedUrl: string; key: string; acl: string }>(
    "/api/models",
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

// Get signed URL for thumbnail upload (PATCH endpoint)
export async function getThumbnailUploadUrl(data: {
  fileName: string;
  fileType: string;
}): Promise<{ signedUrl: string; key: string; acl: string }> {
  return apiRequest<{ signedUrl: string; key: string; acl: string }>(
    "/api/models",
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

// Upload file to signed URL (external fetch - but wrapped here for consistency)
export async function uploadToSignedUrl(
  signedUrl: string,
  file: File | Blob,
  options?: {
    onProgress?: (progress: number) => void;
    contentType?: string;
    acl?: string;
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (options?.onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          options.onProgress!(progress);
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new ApiError(`Upload failed: ${xhr.statusText}`, xhr.status));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new ApiError("Upload failed: network error", 0));
    });

    xhr.addEventListener("abort", () => {
      reject(new ApiError("Upload aborted", 0));
    });

    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader(
      "Content-Type",
      options?.contentType || file.type || "application/octet-stream"
    );
    if (options?.acl) {
      xhr.setRequestHeader("x-amz-acl", options.acl);
    }
    xhr.send(file);
  });
}

// Create asset record after upload
export async function createModelAsset(data: {
  key: string;
  originalFilename: string;
  name?: string;
  fileType: string;
  thumbnail?: string | null;
  metadata?: Record<string, unknown>;
  description?: string;
  organizationId?: string;
}): Promise<{ asset: Asset }> {
  return apiRequest<{ asset: Asset }>("/api/models", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Create Cesium Ion asset record
export async function createCesiumIonAsset(data: {
  assetType: "cesiumIonAsset";
  cesiumAssetId: string;
  name: string;
  cesiumApiKey?: string;
  description?: string;
  thumbnail?: string | null;
  metadata?: Record<string, unknown>;
  organizationId?: string;
}): Promise<{ asset: Asset }> {
  return apiRequest<{ asset: Asset }>("/api/models", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// Ion Upload API
// ============================================================================

export interface IonUploadResponse {
  assetId: string;
  onComplete: {
    url: string;
    method: string;
  };
}

export async function createIonAsset(data: {
  name: string;
  description?: string;
  type: string;
  accessToken: string;
  options?: Record<string, unknown>;
}): Promise<
  IonUploadResponse & { assetMetadata?: unknown; uploadLocation?: unknown }
> {
  return apiRequest<
    IonUploadResponse & { assetMetadata?: unknown; uploadLocation?: unknown }
  >("/api/ion-upload", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function completeIonUpload(data: {
  onComplete: {
    url: string;
    method: string;
  };
  accessToken: string;
}): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("/api/ion-upload", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// SWR Fetchers (for use with useSWR hook)
// ============================================================================

/**
 * Generic fetcher for SWR
 * Use specific fetchers below for type safety
 */
export const swrFetcher = <T>(url: string): Promise<T> => {
  return apiRequest<T>(url);
};

/**
 * Fetcher for projects list
 */
export const projectsFetcher = (): Promise<Project[]> => {
  return apiRequest<{ projects: Project[] }>("/api/projects").then(
    (res) => res.projects
  );
};

/**
 * Fetcher for single project
 */
export const projectFetcher = (url: string): Promise<Project> => {
  return apiRequest<{ project: Project }>(url).then((res) => res.project);
};

/**
 * Fetcher for models/assets
 * Supports assetType as query parameter in URL or as second argument
 */
export const modelsFetcher = (
  url: string,
  assetType?: "model" | "cesiumIonAsset"
): Promise<ModelsResponse> => {
  // Extract assetType from URL if present, otherwise use parameter
  const urlObj = new URL(url, "http://localhost");
  const urlAssetType = urlObj.searchParams.get("assetType") as
    | "model"
    | "cesiumIonAsset"
    | null;
  const finalAssetType = urlAssetType || assetType;
  const params = finalAssetType ? { assetType: finalAssetType } : undefined;
  return apiRequest<ModelsResponse>(url, { params });
};

/**
 * Fetcher for single model/asset
 */
export const modelFetcher = (url: string): Promise<Asset> => {
  return apiRequest<{ asset: Asset }>(url).then((res) => res.asset);
};

/**
 * Fetcher for user
 */
export const userFetcher = (url: string): Promise<User> => {
  return apiRequest<{ user: User }>(url).then((res) => res.user);
};

/**
 * Fetcher for organization
 */
export const organizationFetcher = (url: string): Promise<Organization> => {
  return apiRequest<{ organization: Organization }>(url).then(
    (res) => res.organization
  );
};

// Export ApiError for error handling
export { ApiError };
