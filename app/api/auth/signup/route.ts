import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { withSpan } from "@/lib/telemetry";
import UserModel from "@/models/User";

export async function POST(request: NextRequest) {
  return withSpan("auth.signup", async () => {
    const body = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      return Response.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await UserModel.create({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Create JWT
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Set HTTP-only secure cookie
    const response = Response.json(
      { message: "Account created successfully", email: user.email },
      { status: 201 }
    );

    const cookieOptions = [
      `token=${token}`,
      "HttpOnly",
      "Path=/",
      "SameSite=Strict",
      "Max-Age=604800", // 7 days
      process.env.NODE_ENV === "production" ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    const headers = new Headers(response.headers);
    headers.set("Set-Cookie", cookieOptions);

    return new Response(response.body, { status: 201, headers });
  });
}
