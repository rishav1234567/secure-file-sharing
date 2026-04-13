import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFile extends Document {
  userId: Types.ObjectId;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;           // bytes
  filePath: string;       // absolute path on disk
  expiresAt: Date;
  downloadCount: number;
  oneTimeOnly: boolean;   // if true, link is single-use
  createdAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    filePath: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    downloadCount: { type: Number, default: 0 },
    oneTimeOnly: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const FileModel: Model<IFile> =
  mongoose.models.File ?? mongoose.model<IFile>("File", FileSchema);

export default FileModel;
