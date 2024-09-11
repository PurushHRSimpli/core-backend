import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Headers,
  HttpException,
  HttpStatus,
  Query,
  Req,
} from "@nestjs/common";
import { ResponseMessage } from "src/decorators/responseMessageDecator";
import { CommunityDto } from "src/dto/communityDto";
import { LoggerService } from "src/logger/logger.service";
import { CommunityService } from "./community.service";
import { constants } from "src/helper/constants";
import { Community } from "src/interface/community.interface";
import { CommunityFollowers } from "src/interface/communityFollowers.interface";
import { CommunityFollowersDto } from "src/dto/communityFollwerDto";

@Controller("community")
export class CommunityController {
  private readonly AppName: string = "CommunityController";

  constructor(
    private readonly communityService: CommunityService,
    private logger: LoggerService
  ) {}

  @HttpCode(201)
  @Post("/create")
  @ResponseMessage("Community Created Successfully")
  async communitySignUp(
    @Body() signUpCommunity: CommunityDto,
    @Req() req
  ): Promise<Community> {
    const userId = req?.user?.userId;  
    this.logger.log(
      `communitySignUp initiated for community name - ${signUpCommunity?.name}, by user - ${userId}`,
      `${this.AppName}`
    );
  
    signUpCommunity.community_owner = userId;
  
    return await this.communityService.communitySignUp(signUpCommunity);
  }
  

  @HttpCode(200)
  @Post("/followers/add")
  @ResponseMessage("Follower added or updated successfully")
  async addOrUpdateFollower(
    @Body() followerData: CommunityFollowersDto,
    @Req() req
  ): Promise<CommunityFollowers> {
    this.logger.log(
      `addOrUpdateFollower initiated for community_id - ${followerData?.community_id}`,
      `${this.AppName}`
    );

    return await this.communityService.addOrUpdateFollower(followerData);
  }

  @HttpCode(200)
  @Get("/all")
  @ResponseMessage("Communities fetched successfully")
  async viewAllCommunities(): Promise<Community[]> {
    this.logger.log(`viewAllCommunities initiated`, `${this.AppName}`);
  
    return await this.communityService.viewAllCommunities();
  }
  

  @HttpCode(200)
  @Get("/followers")
  @ResponseMessage("Followers fetched successfully")
  async viewAllFollowers(
    @Query("communityId") communityId: string,
    @Query("followerId") followerId: string,
    @Query("communityOwnerId") communityOwnerId: string
  ): Promise<CommunityFollowers[]> {
    this.logger.log(
      `viewAllFollowers initiated for community_id - ${communityId}`,
      `${this.AppName}`
    );
  
    if (!communityId || !followerId || !communityOwnerId) {
      this.logger.error(
        `viewAllFollowers failed due to missing parameters - communityId: ${communityId}, followerId: ${followerId}, communityOwnerId: ${communityOwnerId}`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Missing required parameters",
        },
        HttpStatus.BAD_REQUEST
      );
    }
  
    return await this.communityService.getAllFollowers(communityId, followerId, communityOwnerId);
  }
  
  
}
