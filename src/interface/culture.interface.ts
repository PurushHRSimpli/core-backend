import { Document } from "mongoose";

export interface Culture extends Document{
    readonly description: string;
    readonly motivation:{solving_technical_problems: boolean, building_products: boolean};
    readonly career_track_next_five_years:{individual_contributor: boolean, manager: boolean};
    readonly working_environment:{clear_roles_responsibilites: boolean, employees_carry_out_multiple_tasks: boolean};
    readonly remote_working_policy:{very_important: boolean, important: boolean, not_important:boolean};
    readonly quiet_office:{very_important: boolean, important: boolean, not_important:boolean};
    readonly interested_markets:string[]
    readonly not_interested_markets:string[]
    readonly interested_technologies:string[]
    readonly not_interested_technologies:string[]
}