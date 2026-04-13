export async function POST() {
  // Clear the JWT cookie by setting it with Max-Age=0
  const headers = new Headers();
  headers.set(
    "Set-Cookie",
    "token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0"
  );
  headers.set("Content-Type", "application/json");

  return new Response(JSON.stringify({ message: "Logged out successfully" }), {
    status: 200,
    headers,
  });
}
