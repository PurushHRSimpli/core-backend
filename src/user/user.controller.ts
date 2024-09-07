import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Put,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { User, loginUser } from "../interface/user.interface";
import {
  LoginUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
  SignUpDto,
  UpdatePasswordThroughSettingsDto,
  UpdatePrivacyMode,
  UpdateGeneralSettings,
  FollowersAndBookmarksDto,
} from "src/dto/userDto";
import { constants } from "../helper/constants";
import { LoggerService } from "../logger/logger.service";
import { AuthGuard } from "../guards/auth.guard";
import { ResponseMessage } from "../decorators/responseMessageDecator";
import { Preference } from "src/interface/preference.interface";
import { PreferenceDto } from "src/dto/preferenceDto";
import { Followers } from "src/interface/followers.interface";
import { Bookmarks } from "src/interface/bookmark.interface";

@Controller("user")
export class UserController {
  private readonly AppName: string = "UserController";
  constructor(
    private readonly userService: UserService,
    private logger: LoggerService
  ) {}

  @HttpCode(201)
  @Post("/signup")
  @ResponseMessage("User Created Successfully")
  async signupUser(
    @Body() signUpUser: SignUpDto,
    @Headers("secret") headers
  ): Promise<User> {
    this.logger.log(
      `signupUser started with email - ${signUpUser?.email}`,
      `${this.AppName}`
    );
    if (headers !== constants?.secret) {
      this.logger.error(
        `signupUser authentication failed with secret passed - ${headers}`,
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
    return await this.userService.userSignUp(signUpUser);
  }

  @HttpCode(200)
  @Post("/login")
  @ResponseMessage("Login successfull")
  async loginUser(@Body() loginuserDto: LoginUserDto): Promise<loginUser> {
    this.logger.log(
      `loginUser started with email - ${loginuserDto?.email}`,
      `${this.AppName}`
    );
    return await this.userService.userLogin(loginuserDto);
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Get("profile")
  @ResponseMessage("Fetched profile successfully")
  async getProfile(@Req() req): Promise<User> {
    const userId = req?.user?.userId;
    this.logger.log(
      `getProfile started with userId - ${userId}`,
      `${this.AppName}`
    );
    return await this.userService.getUserDetails(userId);
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Put("update")
  @ResponseMessage("Profile Updated Successfully")
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req
  ): Promise<User> {
    const userId = req?.user?.userId;
    this.logger.log(
      `updateProfile started with userId - ${userId}`,
      `${this.AppName}`
    );

    return await this.userService.updateUser(userId, updateUserDto);
  }

  @HttpCode(200)
  @Post("/forget-password")
  @ResponseMessage("Passsword updated successfully")
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Headers("secret") headers
  ): Promise<User> {
    this.logger.log(
      `updatePassword started with email - ${updatePasswordDto.email}`,
      `${this.AppName}`
    );
    if (headers !== constants?.secret) {
      this.logger.error(
        `updatePassword authentication failed with secret passed - ${headers}`,
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
    return await this.userService.updatePassword(updatePasswordDto);
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Put("/prefernces")
  @ResponseMessage("Preferences updated successfully")
  async addOrUpdatePreference(
    @Body() preferenceDto: PreferenceDto,
    @Req() req
  ): Promise<Preference> {
    const userId = req?.user?.userId;
    this.logger.log(
      `addOrUpdatePreference started with userid - ${userId}`,
      `${this.AppName}`
    );
    return await this.userService.addOrUpdatePreferenceByUser(
      userId,
      preferenceDto
    );
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Put("/settings/password")
  @ResponseMessage("Password updated successfully")
  async updatePasswordThroughSettings(
    @Body() updatePasswordSettingsDto: UpdatePasswordThroughSettingsDto,
    @Req() req
  ): Promise<User> {
    const userId = req?.user?.userId;
    this.logger.log(
      `updatePasswordThroughSettings started for userid - ${userId}`,
      `${this.AppName}`
    );
    if (
      updatePasswordSettingsDto.confirm_new_password !==
      updatePasswordSettingsDto.new_password
    ) {
      this.logger.error(
        `updatePasswordThroughSettings failed for userid - ${userId} as new and confirm password doesn't matches`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: "Please provide same confirm and new password",
        },
        HttpStatus.BAD_REQUEST
      );
    }
    return await this.userService.updatePasswordThroughSettings(
      updatePasswordSettingsDto,
      userId
    );
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Put("/settings/privacy")
  @ResponseMessage("Privacy updated successfully")
  async changePrivacyMode(
    @Body() updatePrivacy: UpdatePrivacyMode,
    @Req() req
  ): Promise<User> {
    const userId = req?.user?.userId;
    this.logger.log(
      `changePrivacyMode started for userid - ${userId}`,
      `${this.AppName}`
    );
    return await this.userService.updateProfilePrivacy(updatePrivacy, userId);
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Put("/settings/general")
  @ResponseMessage("General updated successfully")
  async changeGeneralSettings(
    @Body() updateGeneral: UpdateGeneralSettings,
    @Req() req
  ): Promise<User> {
    const userId = req?.user?.userId;
    this.logger.log(
      `changeGeneralSettings started for userid - ${userId}`,
      `${this.AppName}`
    );
    return this.userService.updateGeneralSettings(updateGeneral, userId);
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Put("/follow")
  @ResponseMessage("User followed successfully")
  async followUser(
    @Body() uploadDto: FollowersAndBookmarksDto,
    @Req() req
  ): Promise<Followers> {
    const userId = req?.user?.userId;
    this.logger.log(
      `followUser started by userid - ${userId}`,
      `${this.AppName}`
    );
    return await this.userService.followUser(uploadDto, userId);
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Put("/bookmark")
  @ResponseMessage("User bookmarked successfully")
  async bookmarkUser(
    @Body() uploadDto: FollowersAndBookmarksDto,
    @Req() req
  ): Promise<Bookmarks> {
    const userId = req?.user?.userId;
    this.logger.log(
      `bookmarkUser started by userid - ${userId}`,
      `${this.AppName}`
    );
    return await this.userService.bookmarkUser(uploadDto, userId);
  }
}
