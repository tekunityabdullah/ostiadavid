export interface UploadedFile {
  path: string;
  publicUrl: string;
}

// Uploads a single file to the given storage bucket via /api/admin/upload,
// outside of any Server Action — see that route for why.
export async function uploadAdminFile(bucket: string, file: File): Promise<UploadedFile> {
  const formData = new FormData();
  formData.set("bucket", bucket);
  formData.set("file", file);

  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Upload failed");
  }

  return data as UploadedFile;
}
