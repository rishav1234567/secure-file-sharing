import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { validateNonce } from "@/lib/nonce";
import { withSpan } from "@/lib/telemetry";
import FileModel from "@/models/File";

export const runtime = "nodejs";

/**
 * GET /api/file/download?fileId=...&nonce=...
 *
 * Secure file download endpoint. Validates all of the following before serving:
 *  1. Required query parameters are present
 *  2. File exists in the database
 *  3. File link has not expired
 *  4. Nonce is valid and has not been used (replay-attack protection)
 *  5. If oneTimeOnly, blocks if already downloaded
 *
 * On success:
 *  - Marks the nonce as used (atomic)
 *  - Increments downloadCount
 *  - Streams file content with correct Content-Disposition header
 */
export async function GET(request: NextRequest) {
  return withSpan("file.download", async () => {
    const { searchParams } = request.nextUrl;
    const fileId = searchParams.get("fileId");
    const nonce = searchParams.get("nonce");

    // 1. Validate query params
    if (!fileId || !nonce) {
      return Response.json(
        { error: "Missing fileId or nonce parameter" },
        { status: 400 }
      );
    }

    if (!/^[a-fA-F0-9]{24}$/.test(fileId)) {
      return Response.json({ error: "Invalid file ID format" }, { status: 400 });
    }

    await connectDB();

    // 2. Check file exists
    const file = await FileModel.findById(fileId);
    if (!file) {
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    // 3. Check expiry
    if (file.expiresAt < new Date()) {
      return Response.json(
        { error: "This file link has expired" },
        { status: 410 }
      );
    }

    // 4. Check one-time-only restriction
    if (file.oneTimeOnly && file.downloadCount >= 1) {
      return Response.json(
        { error: "This is a one-time download link and has already been used" },
        { status: 403 }
      );
    }

    // 5. Validate nonce (replay-attack protection)
    const nonceResult = await validateNonce(nonce, fileId);
    if (!nonceResult.valid) {
      return Response.json(
        { error: `Download denied: ${nonceResult.reason}` },
        { status: 403 }
      );
    }

    // Increment download count atomically
    await FileModel.findByIdAndUpdate(fileId, { $inc: { downloadCount: 1 } });

    // Fetch the file securely from Vercel Blob and proxy the stream back
    let webStream: ReadableStream;
    try {
      const blobRes = await fetch(file.filePath);
      if (!blobRes.ok || !blobRes.body) {
        throw new Error("Unable to read remote blob stream");
      }
      webStream = blobRes.body;
    } catch {
      return Response.json(
        { error: "File could not be read from storage" },
        { status: 500 }
      );
    }

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.originalName)}"`,
        "Content-Length": file.size.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  });
}
