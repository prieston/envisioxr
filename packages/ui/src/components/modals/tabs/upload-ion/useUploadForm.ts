import { useState, useCallback } from "react";

export interface UploadFormData {
  file: File | null;
  name: string;
  description: string;
  sourceType: string;
  accessToken: string;
  longitude: string;
  latitude: string;
  height: string;
  dracoCompression: boolean;
  ktx2Compression: boolean;
  webpImages: boolean;
  geometricCompression: string;
  epsgCode: string;
  makeDownloadable: boolean;
  tilesetJson: string;
}

const defaultFormData: UploadFormData = {
  file: null,
  name: "",
  description: "",
  sourceType: "3DTILES",
  accessToken: "",
  longitude: "",
  latitude: "",
  height: "0",
  dracoCompression: true,
  ktx2Compression: true,
  webpImages: false,
  geometricCompression: "Draco",
  epsgCode: "",
  makeDownloadable: false,
  tilesetJson: "tileset.json",
};

export const useUploadForm = () => {
  const [formData, setFormData] = useState<UploadFormData>(defaultFormData);

  const setFile = useCallback((file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      file,
      name: file ? file.name.replace(/\.[^/.]+$/, "") : "",
    }));
  }, []);

  const updateField = useCallback(
    <K extends keyof UploadFormData>(field: K, value: UploadFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const reset = useCallback(() => {
    setFormData(defaultFormData);
  }, []);

  return {
    formData,
    setFile,
    updateField,
    reset,
  };
};

