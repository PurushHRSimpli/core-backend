import * as mongoose from "mongoose";
import { currentRole, privacyMode } from "src/enums/user.enum";
import { User } from "../interface/user.interface";

export const userSchema = new mongoose.Schema<User>(
  {
    phone_number: String,
    user_name: String,
    email: String,
    full_name: String,
    is_community_owner: {
      type: Boolean,
      default: false,
    },
    password: String,
    current_company: String,
    cv: String,
    city: String,
    current_role: {
      type: String,
      enum: currentRole,
    },
    years_of_experience: Number,
    student_or_new_graduate: Boolean,
    currently_employed: Boolean,
    linkedin_profile: String,
    term_and_conditions: {
      type: Boolean,
      default: true,
    },
    privacy_mode: {
      type: String,
      default: "public",
      enum: privacyMode,
    },
    profile_pic: String,
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ user_name: 1 }, { unique: true });

export const UserModel: mongoose.Model<User> = mongoose.model<User>(
  "user",
  userSchema,
  "user"
);
