import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsMongoId,
} from "class-validator";
import { attachmentsType } from "src/enums/community.enum";

export class CommunityDto {
  @IsNotEmpty()
  @IsMongoId() 
  community_owner: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  is_paid_community?: boolean = true;

  @IsOptional()
  @IsNumber()
  community_price?: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  followers_can_post?: boolean = true;

  @IsOptional()
  @IsArray()
  @IsEnum(attachmentsType, { each: true })
  attachments?: attachmentsType[];
}
