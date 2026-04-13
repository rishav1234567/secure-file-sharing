import FileAccessClient from "./FileAccessClient";

export default async function FilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FileAccessClient fileId={id} />;
}
