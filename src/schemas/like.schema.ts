import mongoose from "mongoose";
import { Like } from "src/interface/like.interface";
import { CommunityModel } from "./community.schema";
import { PostModel } from "./post.schema";
import { UserModel } from "./user.schema";

export const likeSchema = new mongoose.Schema<Like>(
  {
    community_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: CommunityModel,
    },
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: PostModel,
    },
    liked_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: UserModel,
    },
  },
  { timestamps: true }
);

likeSchema.index({ post_id: 1 });

export const LikeModel: mongoose.Model<Like> = mongoose.model<Like>(
  "likes",
  likeSchema,
  "likes"
);
