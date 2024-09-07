import { Document } from "mongoose";

export interface Preference extends Document {
  interested_technologies: string[];
  interested_markets: string[];
  readonly user_id: string;
  readonly where_in_job_search: string;
  readonly sponsorship_requirement_to_work_in_us: boolean;
  readonly legally_to_work_in_us: boolean;
  readonly job_type: string;
  readonly preferred_locations: string[];
  readonly desired_salary_currency: string;
  readonly desired_salary_amount: number;
  readonly company_size_preferences: {
    seed: { ideal: boolean; yes: boolean; no: boolean };
    early: { ideal: boolean; yes: boolean; no: boolean };
    mid_size: { ideal: boolean; yes: boolean; no: boolean };
    large: { ideal: boolean; yes: boolean; no: boolean };
    very_large: { ideal: boolean; yes: boolean; no: boolean };
    massive: { ideal: boolean; yes: boolean; no: boolean };
  };
  readonly open_to_work_remotely: boolean;
}
