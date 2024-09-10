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
    this.logger.log(
      `communitySignUp initiated for community name - ${signUpCommunity?.name}`,
      `${this.AppName}`
    );

    if (headers !== constants?.secret) {
      this.logger.error(
        `communitySignUp failed due to invalid secret - ${headers}`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: "Authorization Failed",
        },
        HttpStatus.UNAUTHORIZED
      );
    }

    return await this.communityService.communitySignUp(signUpCommunity);
  }

  @HttpCode(200)
  @Post("/followers/add")
  @ResponseMessage("Follower added or updated successfully")
  async addOrUpdateFollower(
    @Body() followerData: CommunityFollowersDto
  ): Promise<CommunityFollowers> {
    this.logger.log(
      `addOrUpdateFollower initiated for community_id - ${followerData?.community_id}`,
      `${this.AppName}`
    );

    if (headers !== constants?.secret) {
      this.logger.error(
        `addOrUpdateFollower failed due to invalid secret - ${headers}`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: "Authorization Failed",
        },
        HttpStatus.UNAUTHORIZED
      );
    }

    return await this.communityService.addOrUpdateFollower(followerData);
  }

  @HttpCode(200)
  @Get("/all")
  @ResponseMessage("Communities fetched successfully")
  async viewAllCommunities(
    @Headers("secret") headers: string
  ): Promise<Community[]> {
    this.logger.log(`viewAllCommunities initiated`, `${this.AppName}`);

    if (headers !== constants?.secret) {
      this.logger.error(
        `viewAllCommunities failed due to invalid secret - ${headers}`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: "Authorization Failed",
        },
        HttpStatus.UNAUTHORIZED
      );
    }

    return await this.communityService.viewAllCommunities();
  }

  @HttpCode(200)
  @Get("/followers")
  @ResponseMessage("Followers fetched successfully")
  async viewAllFollowers(
    @Query("communityId") communityId: string,
    @Headers("secret") headers: string
  ): Promise<CommunityFollowers[]> {
    this.logger.log(
      `viewAllFollowers initiated for community_id - ${communityId}`,
      `${this.AppName}`
    );

    if (headers !== constants?.secret) {
      this.logger.error(
        `viewAllFollowers failed due to invalid secret - ${headers}`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: "Authorization Failed",
        },
        HttpStatus.UNAUTHORIZED
      );
    }

    return await this.communityService.viewAllFollowers(communityId);
  }
}
