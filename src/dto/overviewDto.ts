import {IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import { jobType, whereInJobSearch } from "src/enums/user.enum";
import { MotivationDto, CareerTrackDto, WorkingEnvironmentDto, ImportanceDto } from "./cultureDto"; 



export class OverviewDto{
    @IsString()
    @IsNotEmpty()
    user_id:string


    @IsString()
    @IsOptional()
    description?: string;

    motivation: MotivationDto;
    career_track_next_five_years: CareerTrackDto;
    working_environment: WorkingEnvironmentDto;
    remote_working_policy: ImportanceDto;
    quiet_office: ImportanceDto;
  
    @IsArray()
    @IsString({ each: true })
    interested_markets: string[];
  
    @IsArray()
    @IsString({ each: true })
    not_interested_markets: string[];
  
    @IsArray()
    @IsString({ each: true })
    interested_technologies: string[];
  
    @IsArray()
    @IsString({ each: true })
    not_interested_technologies: string[];

    @IsString()
    @IsNotEmpty()
    // @IsEnum(whereInJobSearch)
    where_in_job_search: string;
  
    @IsBoolean()
    @IsNotEmpty()
    sponsorship_requirement_to_work_in_us: boolean;
  
    @IsBoolean()
    @IsNotEmpty()
    legally_to_work_in_us: boolean;
  
    @IsString()
    @IsNotEmpty()
    job_type: string;
  
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    preferred_locations: string[];
  
    @IsBoolean()
    @IsOptional()
    open_to_work_remotely: boolean;
  
    @IsString()
    @IsNotEmpty()
    desired_salary_currency: string;
  
    @IsNumber()
    @IsNotEmpty()
    desired_salary_amount: number;
  
    company_size_preferences: {
      seed: { ideal: boolean; yes: boolean; no: boolean };
      early: { ideal: boolean; yes: boolean; no: boolean };
      mid_size: { ideal: boolean; yes: boolean; no: boolean };
      large: { ideal: boolean; yes: boolean; no: boolean };
      very_large: { ideal: boolean; yes: boolean; no: boolean };
      massive: { ideal: boolean; yes: boolean; no: boolean };
    };
}