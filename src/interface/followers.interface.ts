import mongoose, { Document } from "mongoose";

export interface Followers extends Document {
  readonly parent_user_id: mongoose.Schema.Types.ObjectId;
  readonly follower_id: mongoose.Schema.Types.ObjectId;
}
