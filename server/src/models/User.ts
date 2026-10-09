import { Schema, model, Document } from 'mongoose';

// TypeScript interface for the User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      // never send the password field in API responses
      select: false,
    },
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt
  }
);

// Index: unique email (also enforced by unique: true above, but explicit for clarity)
userSchema.index({ email: 1 }, { unique: true });

const User = model<IUser>('User', userSchema);

export default User;
