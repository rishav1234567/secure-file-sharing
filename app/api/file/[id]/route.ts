import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { generateNonce } from "@/lib/nonce";
import { withSpan } from "@/lib/telemetry";
import FileModel from "@/models/File";

export const runtime = "nodejs";

/**
 * GET /api/file/[id]
 * Returns file metadata and generates a fresh nonce for downloading.
 * Public endpoint (no auth required) — anyone with the link can view metadata.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSpan("file.getMetadata", async () => {
    const { id } = await params;

    if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
      return Response.json({ error: "Invalid file ID" }, { status: 400 });
    }

    await connectDB();

    const file = await FileModel.findById(id);
    if (!file) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    // Check if file link has expired
    if (file.expiresAt < new Date()) {
      return Response.json(
        { error: "This file link has expired" },
        { status: 410 }
      );
    }

    // Generate a fresh nonce for this download session
    const nonce = await generateNonce(id);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    return Response.json({
      fileId: id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      expiresAt: file.expiresAt,
      downloadCount: file.downloadCount,
      oneTimeOnly: file.oneTimeOnly,
      // Embed nonce in the download URL for replay-attack protection
      downloadUrl: `${baseUrl}/api/file/download?fileId=${id}&nonce=${nonce}`,
    });
  });
}

/**
 * DELETE /api/file/[id]
 * Allows an authenticated file owner to delete their file.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSpan("file.delete", async () => {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const file = await FileModel.findById(id);
    if (!file) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    if (file.userId.toString() !== userId) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    const { deleteFile } = await import("@/lib/storage");
    await deleteFile(file.filePath);
    await FileModel.findByIdAndDelete(id);

    return Response.json({ message: "File deleted successfully" });
  });
}
