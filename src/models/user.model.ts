import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  dateOfBirth: Date;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  isActive: boolean;
  provider: string;
  blocked?: {
    by: 'self' | 'admin';
    reason?: string;
    at: Date;
  } | null;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    blocked: {
      by: { type: String, enum: ['self', 'admin'] },
      reason: { type: String },
      at: { type: Date },
    },
    provider: {
      type: String,
      enum: ['local', 'github', 'google'],
      default: 'local',
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
