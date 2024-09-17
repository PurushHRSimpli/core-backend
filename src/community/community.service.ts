import * as mongoose from "mongoose";
import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { Community } from "src/interface/community.interface";
import { CommunityDto } from "src/dto/communityDto";
import { constants } from "src/helper/constants";
import { LoggerService } from "src/logger/logger.service";
import { JwtService } from "@nestjs/jwt";
import { CommunityFollowers } from "src/interface/communityFollowers.interface";
import { CommunityFollowersDto } from "src/dto/communityFollwerDto";
import { UserService } from "src/user/user.service";

@Injectable()
export class CommunityService {
  private readonly AppName: string = "CommunityService";

  constructor(
    @Inject(constants.COMMUNITY_MODEL)
    private communityModel: mongoose.Model<Community>,
    private logger: LoggerService,
    private jwtService: JwtService,
    private userService: UserService,
    @Inject(constants.COMMUNITYFOLOWERS_MODEL)
    private communityFollowersModel: mongoose.Model<CommunityFollowers>
  ) {}

  async communitySignUp(signUpCommunity: CommunityDto): Promise<Community> {
    this.logger.log(
      `communitySignUp started with name - ${signUpCommunity?.name}`,
      `${this.AppName}`
    );

    try {
      const existingCommunity = await this.communityModel
        .findOne({ name: signUpCommunity.name })
        .lean()
        .exec();

      if (existingCommunity) {
        this.logger.error(
          `Community already exists for this name - ${signUpCommunity.name}`,
          `${this.AppName}`
        );
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "Community already exists for this name",
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const createCommunity = new this.communityModel(signUpCommunity);
      await this.userService.markUserAsCommunityOwner(
        signUpCommunity.community_owner
      );
      this.logger.log(
        `Community creation in progress - ${JSON.stringify(createCommunity)}`,
        `${this.AppName}`
      );

      return await createCommunity.save();
    } catch (err) {
      this.logger.error(
        `communitySignUp failed with name - ${signUpCommunity?.name}, error: ${err.message}`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: err?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: err?.message ?? "Something went wrong",
        },
        err?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async addOrUpdateFollower(
    followerData: CommunityFollowersDto
  ): Promise<CommunityFollowers> {
    this.logger.log(
      `addOrUpdateFollower started for follower - ${followerData.follower_id}`,
      `${this.AppName}`
    );

    try {
      const existingFollower = await this.communityFollowersModel
        .findOne({
          community_id: followerData.community_id,
          follower_id: followerData.follower_id,
        })
        .lean()
        .exec();

      if (existingFollower) {
        this.logger.log(
          `Follower already exists for community ${followerData.community_id}`,
          `${this.AppName}`
        );
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            message: "Follower already exists for this community",
          },
          HttpStatus.CONFLICT
        );
      }

      const newFollower = new this.communityFollowersModel(followerData);
      this.logger.log(
        `Creating new follower: ${JSON.stringify(newFollower)}`,
        `${this.AppName}`
      );
      return await newFollower.save();
    } catch (err) {
      this.logger.error(
        `addOrUpdateFollower failed for follower - ${followerData.follower_id}, error: ${err.message}`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: err?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: err?.message ?? "Something went wrong",
        },
        err?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async viewAllCommunities(limit: number, offset: number): Promise<Community[]> {
    this.logger.log(`viewAllCommunities started`, `${this.AppName}`);

    try {
      // populate
      const communities = await this.communityModel.find().skip(offset).limit(limit).lean().exec();

      if (!communities.length) {
        this.logger.warn(`No communities found`, `${this.AppName}`);
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: "No communities found",
          },
          HttpStatus.NOT_FOUND
        );
      }

      this.logger.log(
        `Communities fetched successfully: ${communities.length} records found`,
        `${this.AppName}`
      );
      return communities;
    } catch (err) {
      this.logger.error(
        `viewAllCommunities failed, error: ${err.message}`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: err?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: err?.message ?? "Something went wrong",
        },
        err?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllFollowers(
    communityId: string, followerId: string, limit: number, offset: number  ): Promise<CommunityFollowers[]> {
    this.logger.log(
      `getAllFollowers started for community - ${communityId}`,
      `${this.AppName}`
    );
  
    try {
      // Populate the followers field (assuming it's an array of followers)
      const followers = await this.communityFollowersModel
        .find({ community_id: communityId })
        .skip(offset)
        .limit(limit)
        .populate('followers') 
        .lean()
        .exec();
  
      if (!followers.length) {
        this.logger.warn(
          `No followers found for community - ${communityId}`,
          `${this.AppName}`
        );
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: "No followers found for this community",
          },
          HttpStatus.NOT_FOUND
        );
      }
  
      // Assuming community has a communityOwnerId, check if followerId is part of community followers or is the owner
      const isFollowerOrOwner = followers.some(
        (follower) =>
          follower.follower_id.toString() === followerId ||
          follower.community_owner_id.toString() === followerId
      );
  
      if (!isFollowerOrOwner) {
        this.logger.warn(
          `Follower with ID ${followerId} is neither a follower nor the owner of community - ${communityId}`,
          `${this.AppName}`
        );
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            message: "You are not authorized to view this community's followers",
          },
          HttpStatus.FORBIDDEN
        );
      }
  
      this.logger.log(
        `Followers fetched successfully for community ${communityId}: ${followers.length} records found`,
        `${this.AppName}`
      );
      return followers;
    } catch (err) {
      this.logger.error(
        `getAllFollowers failed for community - ${communityId}, error: ${err.message}`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: err?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: err?.message ?? "Something went wrong",
        },
        err?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  async findCommunityById(communityId: string): Promise<Community> {
    this.logger.log(
      `findCommunityById initiated for community - ${communityId}`,
      `${this.AppName}`
    );

    try {
      const community = await this.communityModel
        .findById(communityId)
        .lean()
        .exec();

      if (!community) {
        this.logger.warn(
          `Community not found for community_id - ${communityId}`,
          `${this.AppName}`
        );
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: "Community not found",
          },
          HttpStatus.NOT_FOUND
        );
      }

      this.logger.log(
        `Community found for community_id - ${communityId}`,
        `${this.AppName}`
      );
      return community;
    } catch (err) {
      this.logger.error(
        `findCommunityById failed for community_id - ${communityId}, error: ${err.message}`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: err?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: err?.message ?? "Something went wrong",
        },
        err?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCommunityById(communityId: string): Promise<Community> {
    this.logger.log(
      `getCommunityById initiated for communityId - ${communityId}`,
      `${this.AppName}`
    );

    try {
      if (!mongoose.Types.ObjectId.isValid(communityId)) {
        this.logger.error(
          `Invalid communityId format: ${communityId}`,
          `${this.AppName}`
        );
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "Invalid community ID format",
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const community = await this.communityModel
        .findById(communityId)
        .lean() 
        .exec();

      if (!community) {
        this.logger.warn(
          `Community not found for communityId - ${communityId}`,
          `${this.AppName}`
        );
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: "Community not found",
          },
          HttpStatus.NOT_FOUND
        );
      }

      this.logger.log(
        `Community found for communityId - ${communityId}`,
        `${this.AppName}`
      );
      return community;
    } catch (err) {
      this.logger.error(
        `getCommunityById failed for communityId - ${communityId}, error: ${err.message}`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: err?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: err?.message ?? "Something went wrong",
        },
        err?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


}
