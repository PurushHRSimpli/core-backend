import {
    IsNotEmpty,
    IsMongoId,
  } from "class-validator";
  
  export class CommunityFollowersDto {
    @IsNotEmpty()
    @IsMongoId()
    community_id: string; 
  
    @IsNotEmpty()
    @IsMongoId()
    community_owner_id: string; 
  
    @IsNotEmpty()
    @IsMongoId()
    follower_id: string; 
  }
  