import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { saveFile } from "@/lib/storage";
import { withSpan } from "@/lib/telemetry";
import FileModel from "@/models/File";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

// 24-hour file expiry
const FILE_EXPIRY_MS = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  return withSpan("file.upload", async () => {
    // Get authenticated user from middleware-set header
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    // Parse multipart form data using native Web API
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return Response.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    const oneTimeOnly = formData.get("oneTimeOnly") === "true";

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: "File too large. Maximum size is 50MB" },
        { status: 413 }
      );
    }

    // Validate file name
    const originalName = file.name;
    if (!originalName || originalName.length > 255) {
      return Response.json({ error: "Invalid file name" }, { status: 400 });
    }

    try {
      await connectDB();

      const uniqueId = uuidv4();
      
      // Convert File to Buffer to avoid Next.js File object serialization issues with Vercel Blob
      let fileData: File | Buffer = file;
      if (typeof file.arrayBuffer === "function") {
        fileData = Buffer.from(await file.arrayBuffer());
      }

      const filePath = await saveFile(fileData, originalName, uniqueId);

      // Save metadata to MongoDB
      const fileDoc = await FileModel.create({
        userId,
        fileName: uniqueId + "-" + originalName.replace(/[^a-zA-Z0-9._-]/g, "_"),
        originalName,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        filePath,
        expiresAt: new Date(Date.now() + FILE_EXPIRY_MS),
        downloadCount: 0,
        oneTimeOnly,
      });

      const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
      const protocol = request.headers.get("x-forwarded-proto") || "https";
      let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      // If deployed on Vercel, ignore NEXT_PUBLIC_BASE_URL if it's accidentally set to localhost
      if (process.env.VERCEL || (!baseUrl || baseUrl.includes("localhost"))) {
        baseUrl = host ? `${protocol}://${host}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
      }
      const shareLink = `${baseUrl}/file/${fileDoc._id.toString()}`;

      return Response.json(
        {
          message: "File uploaded successfully",
          fileId: fileDoc._id.toString(),
          shareLink,
          expiresAt: fileDoc.expiresAt,
          oneTimeOnly,
        },
        { status: 201 }
      );
    } catch (err: any) {
      console.error("Upload Error:", err);
      return Response.json(
        { error: "Internal Server Error: " + (err?.message || String(err)) },
        { status: 500 }
      );
    }
  });
}
