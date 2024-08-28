import * as mongoose from "mongoose";
import { Culture } from "src/interface/culture.interface";

export const CultureSchema = new mongoose.Schema<Culture>({
  user_id: {
    type: String,
    required: true,
  },
  description: {
<<<<<<< HEAD
    type:String, 
    // required:true
=======
    type: String,
    required: true,
>>>>>>> 41c96d07bd735ca5209bc3ba03ddd3f896cb66d3
  },
  motivation: {
    solving_technical_problems: {
      type: Boolean,
      required: true,
    },
    building_products: {
      type: Boolean,
      required: true,
    },
  },
  career_track_next_five_years: {
    individual_contributor: {
      type: Boolean,
      required: true,
    },
    manager: {
      type: Boolean,
      required: true,
    },
  },
  working_environment: {
    clear_roles_responsibilites: {
      type: Boolean,
      required: true,
    },
    employees_carry_out_multiple_tasks: {
      type: Boolean,
      required: true,
    },
  },
  remote_working_policy: {
    very_important: {
      type: Boolean,
      required: true,
    },
    important: {
      type: Boolean,
      required: true,
    },
    not_important: {
      type: Boolean,
      required: true,
    },
  },
  quiet_office: {
    very_important: {
      type: Boolean,
      required: true,
    },
    important: {
      type: Boolean,
      required: true,
    },
    not_important: {
      type: Boolean,
      required: true,
    },
  },
  interested_markets: [String],
  not_interested_markets: [String],
  interested_technologies: [String],
  not_interested_technologies: [String],
});

CultureSchema.index({ user_id: 1 }, { unique: true });

<<<<<<< HEAD

=======
>>>>>>> 41c96d07bd735ca5209bc3ba03ddd3f896cb66d3
export const CultureModel: mongoose.Model<Culture> = mongoose.model<Culture>(
  "culture",
  CultureSchema,
  "culture"
);
