import * as mongoose from 'mongoose';
import { Culture } from 'src/interface/culture.interface';

export const CultureSchema = new mongoose.Schema<Culture>({
  description: String,
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

export const CultureModel: mongoose.Model<Culture> = mongoose.model<Culture>(
  'culture',
  CultureSchema,
  'culture'
);
