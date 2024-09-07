import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Length,
} from "class-validator";
import mongoose from "mongoose";
import { currentRole, privacyMode } from "src/enums/user.enum";

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  full_name: string;
}

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UpdateUserDto {
  @IsNotEmpty()
  @IsEnum(currentRole)
  current_role: string;

  @IsNotEmpty()
  @IsString()
  current_company: string;

  @IsNotEmpty()
  @IsString()
  cv: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  linkedin_profile: string;

  @IsNumber()
  @IsNotEmpty()
  years_of_experience: number;

  @IsBoolean()
  @IsNotEmpty()
  student_or_new_graduate: boolean;

  @IsBoolean()
  @IsNotEmpty()
  currently_employed: boolean;
}

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class UpdatePasswordThroughSettingsDto {
  @IsString()
  @IsNotEmpty()
  current_password: string;

  @IsString()
  @IsNotEmpty()
  new_password: string;

  @IsString()
  @IsNotEmpty()
  confirm_new_password: string;
}

export class UpdatePrivacyMode {
  @IsString()
  @IsNotEmpty()
  @IsEnum(privacyMode)
  privacy_mode: privacyMode;
}

export class UpdateGeneralSettings {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  profile_pic: string;
}

export class FollowersAndBookmarksDto {
  @IsMongoId()
  parent_user_id: mongoose.Schema.Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  bookmarked_by: mongoose.Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  follower_id: mongoose.Types.ObjectId;
}
