import { Module } from "@nestjs/common";
import { Connection } from "mongoose";
import { userSchema } from "../schemas/user.schema";
import { constants } from "../helper/constants";
import { MongodbModule } from "../mongodb/mongodb.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { User } from "../interface/user.interface";
import { LoggerModule } from "src/logger/logger.module";
import { JwtModule } from "@nestjs/jwt";
import { PasswordService } from "src/services/password.service";
import { Preference } from "src/interface/preference.interface";
import { preferenceSchema } from "src/schemas/preference.schema";
import { Culture } from "src/interface/culture.interface";
import { CultureSchema } from "src/schemas/culture.schema";
import { Followers } from "src/interface/followers.interface";
import { Bookmarks } from "src/interface/bookmark.interface";
import { bookmarkSchema } from "src/schemas/bookmark.schema";
import { followersSchema } from "src/schemas/followers.schema";

@Module({
  imports: [
    MongodbModule,
    LoggerModule,
    JwtModule.register({
      global: true,
      secret: constants.jwt_secret_key,
    }),
  ],
  controllers: [UserController],
  providers: [
    {
      provide: constants.USER_MODEL,
      useFactory: async (connection: Connection) => {
        return await connection.model<User>("user", userSchema);
      },
      inject: [constants.DATABASE_CONNECTION],
    },
    {
      provide: constants.PREFERENCE_MODEL,
      useFactory: async (connection: Connection) => {
        return await connection.model<Preference>(
          "preference",
          preferenceSchema
        );
      },
      inject: [constants.DATABASE_CONNECTION],
    },
    {
      provide: constants.CULTURE_MODEL,
      useFactory: async (connection: Connection) => {
        return await connection.model<Culture>("culture", CultureSchema);
      },
      inject: [constants.DATABASE_CONNECTION],
    },
    {
      provide: constants.FOLLOWERS_MODEL,
      useFactory: async (connection: Connection) => {
        return await connection.model<Followers>("followers", followersSchema);
      },
      inject: [constants.DATABASE_CONNECTION],
    },
    {
      provide: constants.BOOKMARKS_MODEL,
      useFactory: async (connection: Connection) => {
        return await connection.model<Bookmarks>("bookmarks", bookmarkSchema);
      },
      inject: [constants.DATABASE_CONNECTION],
    },
    UserService,
    PasswordService,
  ],
  exports: [UserService],
})
export class UserModule {}
