/**
 * Upload a file with progress tracking using XMLHttpRequest
 * @param file - The file blob to upload
 * @param fileName - Name for the uploaded file
 * @param fileType - MIME type of the file
 * @param uploadUrl - The endpoint URL to upload to
 * @param additionalData - Additional form data fields to include
 * @param onProgress - Optional callback for progress updates (0-100)
 * @returns Promise with upload response data
 */
export const uploadFileWithProgress = async (
  file: Blob,
  fileName: string,
  fileType: string,
  uploadUrl: string,
  additionalData: Record<string, string> = {},
  onProgress: ((progress: number) => void) | null = null
): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", fileName);
  formData.append("fileType", fileType);

  // Add any additional data fields
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return new Promise<any>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          onProgress(percentComplete);
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(
            new Error(`Upload failed: ${errorResponse.error || xhr.statusText}`)
          );
        } catch {
          reject(
            new Error(
              `Upload failed with status ${xhr.status}: ${xhr.statusText}`
            )
          );
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("POST", uploadUrl);
    xhr.send(formData);
  });
};

