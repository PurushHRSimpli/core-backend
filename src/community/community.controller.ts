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
    const userId = req?.user?.userId;
    followerData.follower_id = userId;
    return await this.communityService.addOrUpdateFollower(followerData);
  }


  @HttpCode(200)
  @Get("/all")
  @ResponseMessage("Communities fetched successfully")
  async viewAllCommunities(
    @Query('limit') limit: number = 10, 
    @Query('offset') offset: number = 0  
  ): Promise<Community[]> {
    this.logger.log(`viewAllCommunities initiated`, `${this.AppName}`);
    
    return await this.communityService.viewAllCommunities(limit, offset);
  }
  

  @HttpCode(200)
  @Get("/followers")
  @ResponseMessage("Followers fetched successfully")
  async viewAllFollowers(
    @Query("communityId") communityId: string,
    @Query("limit") limit: number = 10, // default limit for pagination
    @Query("offset") offset: number = 0, // default offset for pagination
    @Req() req
  ): Promise<CommunityFollowers[]> {
    this.logger.log(
      `viewAllFollowers initiated for community_id - ${communityId}`,
      `${this.AppName}`
    );
    const followerId = req.user.userId;
  
    if (!communityId) {
      this.logger.error(
        `viewAllFollowers failed due to missing parameters - communityId: ${communityId}`,
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
  
    // Call the service with pagination parameters
    return await this.communityService.getAllFollowers(communityId, followerId, limit, offset);
  }
  

  // get community by communityid

  @HttpCode(200)
  @Get("/communityById")
  @ResponseMessage("Community fetched successfully")
  async viewCommunityById(@Req() req): Promise<Community> {
    const communityId = req.query.communityId; 
    this.logger.log(
      `viewCommunityById initiated with communityId - ${communityId}`,
      `CommunityController`
    );

    if (!communityId) {
      this.logger.error(
        `viewCommunityById failed due to missing communityId`,
        `CommunityController`
      );
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Missing communityId in request",
        },
        HttpStatus.BAD_REQUEST
      );
    }

    return await this.communityService.getCommunityById(communityId);
  }

}
