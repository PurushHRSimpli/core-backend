import * as mongoose from "mongoose";
import { Followers } from "src/interface/followers.interface";
import { UserModel } from "./user.schema";

export const followersSchema = new mongoose.Schema<Followers>(
  {
    parent_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: UserModel,
    },
    follower_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: UserModel,
    },
  },
  { timestamps: true }
);

followersSchema.index({ parent_user_id: 1, follower_id: 1 }, { unique: true });

export const FolloweraModel: mongoose.Model<Followers> =
  mongoose.model<Followers>("followers", followersSchema, "followers");
