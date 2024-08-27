import mongoose, { Document } from "mongoose";
import { attachmentsType } from "src/enums/community.enum";

export interface Posts extends Document {
  readonly community_id: mongoose.Schema.Types.ObjectId;
  readonly content: String;
  readonly posted_by: mongoose.Schema.Types.ObjectId;
  readonly attachments: Attachments[];
}

interface Attachments {
  readonly url: string;
  readonly type: attachmentsType;
  readonly filename?: string;
  readonly size?: number;
}
