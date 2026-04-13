import crypto from "crypto";
import { connectDB } from "./db";
import NonceModel from "@/models/Nonce";

/** Nonce TTL in milliseconds (10 minutes) */
const NONCE_TTL_MS = 10 * 60 * 1000;

/**
 * Generates a unique cryptographic nonce for a given file ID.
 * - Creates a 32-byte random hex string as the nonce value
 * - Persists it to the database with a 10-minute expiry
 * - Returns the nonce value to embed in the download URL
 */
export async function generateNonce(fileId: string): Promise<string> {
  await connectDB();

  // Generate a cryptographically secure random 32-byte nonce
  const nonceValue = crypto.randomBytes(32).toString("hex");

  await NonceModel.create({
    value: nonceValue,
    fileId,
    expiresAt: new Date(Date.now() + NONCE_TTL_MS),
    used: false,
  });

  return nonceValue;
}

/**
 * Validates a nonce for a given file ID.
 * Enforces the following rules:
 *  1. Nonce must exist in the database
 *  2. Nonce must be associated with the correct file
 *  3. Nonce must not be expired
 *  4. Nonce must not have been previously used (replay-attack protection)
 *
 * On success, marks the nonce as `used: true` atomically.
 * Returns true if valid, false otherwise.
 */
export async function validateNonce(
  nonceValue: string,
  fileId: string
): Promise<{ valid: boolean; reason?: string }> {
  await connectDB();

  // Find the nonce by value
  const nonce = await NonceModel.findOne({ value: nonceValue });

  if (!nonce) {
    return { valid: false, reason: "Nonce not found" };
  }

  // Check it belongs to this file
  if (nonce.fileId.toString() !== fileId) {
    return { valid: false, reason: "Nonce file mismatch" };
  }

  // Check expiry
  if (nonce.expiresAt < new Date()) {
    return { valid: false, reason: "Nonce has expired" };
  }

  // Check if already used (replay-attack protection)
  if (nonce.used) {
    return { valid: false, reason: "Nonce already used" };
  }

  // Mark nonce as used atomically to prevent race conditions
  const result = await NonceModel.findOneAndUpdate(
    { _id: nonce._id, used: false }, // atomic check
    { $set: { used: true } },
    { new: true }
  );

  if (!result) {
    // Another request consumed the nonce between our check and update
    return { valid: false, reason: "Nonce already used" };
  }

  return { valid: true };
}
