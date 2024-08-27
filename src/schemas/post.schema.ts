import * as mongoose from "mongoose";
import { attachmentsType } from "src/enums/community.enum";
import { Posts } from "src/interface/post.interface";
import { CommunityModel } from "./community.schema";
import { UserModel } from "./user.schema";

export const postSchema = new mongoose.Schema<Posts>(
  {
    community_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: CommunityModel,
      required: true,
    },
    content: { type: String, required: true },
    posted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: UserModel,
      required: true,
    },
    attachments: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: attachmentsType,
          required: true,
        },
        filename: String,
        size: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

export const PostModel: mongoose.Model<Posts> = mongoose.model<Posts>(
  "posts",
  postSchema,
  "posts"
);
