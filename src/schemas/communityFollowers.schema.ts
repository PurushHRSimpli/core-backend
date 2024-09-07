import * as mongoose from "mongoose";
import { CommunityFollowers } from "src/interface/communityFollowers.interface";
import { CommunityModel } from "./community.schema";
import { UserModel } from "./user.schema";

export const communityFollowersSchema = new mongoose.Schema<CommunityFollowers>(
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

export const FollowersModel: mongoose.Model<CommunityFollowers> =
  mongoose.model<CommunityFollowers>(
    "followers",
    communityFollowersSchema,
    "followers"
  );
