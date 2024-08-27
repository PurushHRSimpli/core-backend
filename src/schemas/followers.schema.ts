import * as mongoose from "mongoose";
import { Followers } from "src/interface/followers.interface";
import { CommunityModel } from "./community.schema";
import { UserModel } from "./user.schema";

export const followersSchema = new mongoose.Schema<Followers>(
  {
    community_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: CommunityModel,
      required: true,
    },
    community_owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: UserModel,
      required: true,
    },
    follower_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: UserModel,
      required: true,
    },
  },
  { timestamps: true }
);

export const FollowersModel: mongoose.Model<Followers> =
  mongoose.model<Followers>("followers", followersSchema, "followers");
