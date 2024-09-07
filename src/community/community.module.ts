import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { LoggerModule } from "src/logger/logger.module";
import { MongodbModule } from "src/mongodb/mongodb.module";
import { CommunityController } from "./community.controller";
import { CommunityService } from "./community.service";
import { constants } from "../helper/constants";
import { Connection } from "mongoose";
import { Community } from "src/interface/community.interface";
import { communitySchema } from "src/schemas/community.schema";
import { CommunityFollowersModel, communityFollowersSchema } from "src/schemas/communityFollowers.schema";
import { CommunityFollowers } from "src/interface/communityFollowers.interface";

@Module({
  imports: [
    MongodbModule,
    LoggerModule,
    JwtModule.register({
      global: true,
      secret: constants.jwt_secret_key,
    }),
  ],
  controllers: [CommunityController],
  providers: [
    {
      provide: constants.COMMUNITY_MODEL,
      useFactory: (connection: Connection) =>
        connection.model<Community>('Community', communitySchema),
      inject: [constants.DATABASE_CONNECTION],
    },
    {
      provide: constants.COMMUNITYFOLOWERS_MODEL, 
      useFactory: (connection: Connection) =>
        connection.model<CommunityFollowers>('CommunityFollowers', communityFollowersSchema),
      inject: [constants.DATABASE_CONNECTION],
    },
    CommunityService,
  ],
  exports: [CommunityService],
})
export class CommunityModule {}
