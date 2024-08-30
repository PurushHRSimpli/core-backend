import mongoose, { Document } from "mongoose";

export interface Followers extends Document {
  readonly community_id: mongoose.Schema.Types.ObjectId;
  readonly community_owner_id: mongoose.Schema.Types.ObjectId;
  readonly follower_id: mongoose.Schema.Types.ObjectId;
}