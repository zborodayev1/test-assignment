import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  dateOfBirth: Date;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  isActive: boolean;
  provider: string;
}

const userSchema = new Schema<IUser>(
  {
    id: Types.ObjectId,
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
    provider: {
      type: String,
      enum: ['local', 'github', 'google'],
      default: 'local',
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
