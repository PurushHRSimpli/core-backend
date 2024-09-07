import * as mongoose from "mongoose";
import { UserModel } from "./user.schema";
import { Bookmarks } from "src/interface/bookmark.interface";

export const bookmarkSchema = new mongoose.Schema<Bookmarks>(
  {
    parent_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: UserModel,
    },
    bookmarked_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: UserModel,
    },
  },
  { timestamps: true }
);

bookmarkSchema.index({ parent_user_id: 1, bookmarked_by: 1 }, { unique: true });

export const FolloweraModel: mongoose.Model<Bookmarks> =
  mongoose.model<Bookmarks>("bookmarks", bookmarkSchema, "bookmarks");
