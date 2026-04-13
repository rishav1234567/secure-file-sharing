import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";
import { withSpan } from "@/lib/telemetry";
import UserModel from "@/models/User";

export async function POST(request: NextRequest) {
  return withSpan("auth.login", async () => {
    const body = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user — use generic error to prevent user enumeration attacks
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare password with stored bcrypt hash
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Set HTTP-only cookie
    const cookieOptions = [
      `token=${token}`,
      "HttpOnly",
      "Path=/",
      "SameSite=Strict",
      "Max-Age=604800",
      process.env.NODE_ENV === "production" ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Set-Cookie", cookieOptions);

    return new Response(
      JSON.stringify({ message: "Login successful", email: user.email }),
      { status: 200, headers }
    );
  });
}
