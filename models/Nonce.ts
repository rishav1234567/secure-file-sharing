import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface INonce extends Document {
  value: string;          // unique hex nonce
  fileId: Types.ObjectId; // associated file
  expiresAt: Date;
  used: boolean;          // true after first successful validation
}

const NonceSchema = new Schema<INonce>({
  value: { type: String, required: true, unique: true, index: true },
  fileId: {
    type: Schema.Types.ObjectId,
    ref: "File",
    required: true,
  },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

// TTL index: MongoDB automatically removes expired nonce documents
NonceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const NonceModel: Model<INonce> =
  mongoose.models.Nonce ?? mongoose.model<INonce>("Nonce", NonceSchema);

export default NonceModel;
