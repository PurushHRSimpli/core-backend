import mongoose, { Document } from "mongoose";

export interface Community extends Document {
  readonly community_owner: mongoose.Schema.Types.ObjectId;
  readonly name: string;
  readonly is_paid_community: boolean;
  readonly community_price: Number;
  readonly description: string;
  readonly followers_can_post: boolean;
}
