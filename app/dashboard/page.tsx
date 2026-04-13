import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import FileModel from "@/models/File";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // Read JWT from HTTP-only cookie on server
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login");
  }

  await connectDB();

  const files = await FileModel.find({ userId: payload.userId })
    .sort({ createdAt: -1 })
    .lean();

  // Serialize for client component
  const serializedFiles = files.map((f) => ({
    id: f._id.toString(),
    originalName: f.originalName,
    mimeType: f.mimeType,
    size: f.size,
    expiresAt: f.expiresAt.toISOString(),
    downloadCount: f.downloadCount,
    oneTimeOnly: f.oneTimeOnly,
    createdAt: (f.createdAt as Date).toISOString(),
    isExpired: f.expiresAt < new Date(),
  }));

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  return (
    <DashboardClient
      files={serializedFiles}
      userEmail={payload.email}
      baseUrl={baseUrl}
    />
  );
}
