import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class MotivationDto {
  @IsBoolean()
  solving_technical_problems: boolean;
  @IsBoolean()
  building_products: boolean;
}

export class CareerTrackDto {
  @IsBoolean()
  individual_contributor: boolean;
  @IsBoolean()
  manager: boolean;
}

export class WorkingEnvironmentDto {
  @IsBoolean()
  clear_roles_responsibilites: boolean;

  @IsBoolean()
  employees_carry_out_multiple_tasks: boolean;
}

export class ImportanceDto {
  @IsBoolean()
  very_important: boolean;

  @IsBoolean()
  important: boolean;

  @IsBoolean()
  not_important: boolean;
}

export class CultureDto {
  @IsString()
  description: string;
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
}
