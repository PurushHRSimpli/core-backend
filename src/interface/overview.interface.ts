export interface Overview {
    readonly user_id: string;
    readonly phone_number: string;
    readonly email: string;
    readonly full_name: string;
    readonly current_company: string;
    readonly cv: string;
    readonly is_community_owner: boolean;
    readonly city: string;
    readonly current_role: string;
    readonly years_of_experience: number;
    readonly student_or_new_graduate: boolean;
    readonly currently_employed: boolean;
    readonly linkedin_profile: string;
    readonly term_and_conditions: boolean;
    readonly privacy_mode: string;
    readonly user_name: string;
    readonly profile_pic: string;
    readonly description: string;
    readonly motivation: {
      solving_technical_problems: boolean;
      building_products: boolean;
    };
    readonly career_track_next_five_years: {
      individual_contributor: boolean;
      manager: boolean;
    };
    readonly working_environment: {
      clear_roles_responsibilites: boolean;
      employees_carry_out_multiple_tasks: boolean;
    };
    readonly remote_working_policy: {
      very_important: boolean;
      important: boolean;
      not_important: boolean;
    };
    readonly quiet_office: {
      very_important: boolean;
      important: boolean;
      not_important: boolean;
    };
    readonly interested_markets: string[];
    readonly not_interested_markets: string[];
    readonly interested_technologies: string[];
    readonly not_interested_technologies: string[];
    readonly where_in_job_search: string;
    readonly sponsorship_requirement_to_work_in_us: boolean;
    readonly legally_to_work_in_us: boolean;
    readonly job_type: string;
    readonly preferred_locations: string[];
    readonly open_to_work_remotely: boolean;
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
  }
  