import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import UploadClient from "./UploadClient";

export default async function UploadPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  try {
    const payload = verifyToken(token);
    return <UploadClient userEmail={payload.email} />;
  } catch {
    redirect("/login");
  }
}
