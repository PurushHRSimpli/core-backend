import mongoose, { Document } from "mongoose";

export interface Like extends Document {
  readonly community_id: mongoose.Schema.Types.ObjectId;
  readonly post_id: mongoose.Schema.Types.ObjectId;
  readonly liked_by: mongoose.Schema.Types.ObjectId;
}
