import mongoose, { Document } from "mongoose";

export interface Bookmarks extends Document {
  readonly parent_user_id: mongoose.Schema.Types.ObjectId;
  readonly bookmarked_by: mongoose.Schema.Types.ObjectId;
}
