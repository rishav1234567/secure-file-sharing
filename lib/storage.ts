import { put, del } from "@vercel/blob";

/**
 * Saves a file to Vercel Blob storage.
 * Returns the public blob URL.
 */
export async function saveFile(
  file: File | Blob | Buffer,
  originalName: string,
  uniqueId: string
): Promise<string> {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${uniqueId}-${safeName}`;
  
  const blob = await put(fileName, file, {
    access: "public",
    addRandomSuffix: false, // We already use a UUID
  });

  return blob.url;
}

/**
 * Deletes a file from Vercel Blob.
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    await del(fileUrl);
  } catch {
    // Ignore if already deleted
  }
}

