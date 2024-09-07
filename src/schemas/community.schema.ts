import * as mongoose from "mongoose";
import { Community } from "src/interface/community.interface";
import { UserModel } from "./user.schema";

export const communitySchema = new mongoose.Schema<Community>(
  {
    community_owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: UserModel,
    },
    name: { type: String, required: true },
    is_paid_community: { type: Boolean, default: true },
    community_price: Number,
    description: { type: String, required: true },
    followers_can_post: { type: Boolean, default: true },
  },
  { timestamps: true }
);

communitySchema.index({ community_owner: 1 }, { unique: true });

export const CommunityModel: mongoose.Model<Community> =
  mongoose.model<Community>("community", communitySchema, "community");
