import * as mongoose from "mongoose";
import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
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
} from "../dto/userDto";
import { constants } from "../helper/constants";
import { LoggerService } from "../logger/logger.service";
import { JwtService } from "@nestjs/jwt";
import { PasswordService } from "../services/password.service";
import { UserModel } from "src/schemas/user.schema";
import { Preference } from "src/interface/preference.interface";
import { PreferenceDto } from "src/dto/preferenceDto";
import { Culture } from "src/interface/culture.interface";
import { CultureDto } from "src/dto/cultureDto";
import { Overview } from "../interface/overview.interface";
import { OverviewDto } from "../dto/overviewDto";
import { CultureModel } from "src/schemas/culture.schema";
import { PreferenceModel } from "src/schemas/preference.schema";
import { Followers } from "src/interface/followers.interface";
import { Bookmarks } from "src/interface/bookmark.interface";
import { ObjectUnsubscribedError } from "rxjs";

@Injectable()
export class UserService {
  private readonly AppName: string = "UserService";
  constructor(
    @Inject(constants.USER_MODEL)
    private userModel: mongoose.Model<User>,
    @Inject(constants.PREFERENCE_MODEL)
    private preferenceModel: mongoose.Model<Preference>,
    @Inject(constants.CULTURE_MODEL)
    private cultureModel: mongoose.Model<Culture>,
    @Inject(constants.FOLLOWERS_MODEL)
    private followersModel: mongoose.Model<Followers>,
    @Inject(constants.BOOKMARKS_MODEL)
    private bookmarksModel: mongoose.Model<Bookmarks>,
    private logger: LoggerService,
    private jwtService: JwtService,
    private passwordService: PasswordService
  ) {}

  async userSignUp(signUpUser: SignUpDto): Promise<User> {
    this.logger.log(
      `userSignUp started with email - ${signUpUser?.email}`,
      `${this.AppName}`
    );
    try {
      const user = await this.userModel
        .findOne({
          email: signUpUser.email,
        })
        .lean()
        .exec();
      if (user) {
        this.logger.error(
          `User allready found for this email - ${signUpUser.email}`,
          `${this.AppName}`
        );
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "User found for this email",
          },
          HttpStatus.BAD_REQUEST
        );
      }
      const hashedPassword = await this.passwordService.hashPassword(
        signUpUser.password
      );
      signUpUser.password = hashedPassword;
      const createUser = new this.userModel(signUpUser);
      return await createUser.save();
    } catch (err) {
      this.logger.error(
        `userSignUp failed with email - ${signUpUser?.email} with error ${err}`,
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

  async userLogin(loginUserDto: LoginUserDto): Promise<loginUser> {
    this.logger.log(
      `userLogin started with email - ${loginUserDto?.email}`,
      `${this.AppName}`
    );
    try {
      const user: User = await this.userModel
        .findOne({
          email: loginUserDto?.email,
        })
        .lean()
        .exec();
      if (user) {
        const passwordMatched = await this.passwordService.comparePassword(
          loginUserDto.password,
          user?.password
        );
        if (passwordMatched) {
          this.logger.log(
            `userLogin success with email - ${loginUserDto?.email}`,
            `${this.AppName}`
          );
          const payload = {
            userId: user?._id?.toString(),
          };
          const access_token = await this.jwtService.signAsync(payload);
          const response: loginUser = {
            ...JSON.parse(JSON.stringify(user)),
            access_token: access_token,
          };
          return response;
        } else {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              message: "Please provide valid password",
            },
            HttpStatus.BAD_REQUEST
          );
        }
      } else {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "The number you have provided has not been registered",
          },
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (err) {
      this.logger.error(
        `loginUser failed with email - ${loginUserDto?.email} with error ${err}`,
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

  async getUserDetails(userId: string): Promise<User> {
    this.logger.log(
      `getUserDetails started with userId - ${userId}`,
      `${this.AppName}`
    );
    try {
      const user = await this.userModel
        .findOne({
          _id: userId,
        })
        .lean()
        .exec();
      this.logger.log(
        `getUserDetails ended with UserId - ${userId}`,
        `${this.AppName}`
      );
      return user;
    } catch (error) {
      this.logger.error(
        `getUserDetails failed with userId - ${userId} with error ${error}`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: error?.message ?? "Something went wrong",
        },
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateUser(userId: string, updateDto: UpdateUserDto): Promise<User> {
    this.logger.log(
      `updateUser started with userId - ${userId}`,
      `${this.AppName}`
    );
    try {
      const user = await this.userModel
        .findByIdAndUpdate(userId, updateDto, {
          new: true,
        })
        .lean()
        .exec();
      this.logger.log(
        `updateUser ended with UserId - ${userId}`,
        `${this.AppName}`
      );
      return user;
    } catch (err) {
      this.logger.error(
        `updateUser failed with userId - ${userId} with error ${err}`,
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

  async updatePassword(updatePassword: UpdatePasswordDto): Promise<User> {
    this.logger.log(
      `updatePassword started with email - ${updatePassword.email}`,
      `${this.AppName}`
    );
    try {
      const hashedPassword: string = await this.passwordService.hashPassword(
        updatePassword.password
      );
      const user: User = await this.userModel
        .findOneAndUpdate(
          { email: updatePassword.email },
          { password: hashedPassword },
          { new: true, upsert: false }
        )
        .lean()
        .exec();
      if (!user) {
        this.logger.warn(
          `updatePassword started with email - ${updatePassword.email}`,
          `${this.AppName}`
        );
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "Please provide a valid email",
          },
          HttpStatus.BAD_REQUEST
        );
      }
      this.logger.log(
        `updatePassword ended with UserId - ${updatePassword.email}`,
        `${this.AppName}`
      );
      return user;
    } catch (err) {
      this.logger.error(
        `updatePassword failed with userId - ${updatePassword.email} with error ${err}`,
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

  async addOrUpdatePreferenceByUser(
    userId: string,
    preferenceDto: PreferenceDto
  ): Promise<Preference> {
    this.logger.log(
      `addOrUpdatePreferenceByUser started for userid - ${userId}`,
      `${this.AppName}`
    );
    try {
      const pref = await this.preferenceModel
        .findOneAndUpdate({ user_id: userId }, preferenceDto, {
          upsert: true,
          new: true,
        })
        .lean()
        .exec();
      this.logger.log(
        `addOrUpdatePreferenceByUser ended for userid - ${userId}`,
        `${this.AppName}`
      );
      return pref;
    } catch (err) {
      this.logger.error(
        `addOrUpdatePreferenceByUser failed with userId - ${userId} with error ${err}`,
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

  async addOrUpdateCultureByUser(
    userId: string,
    cultureDto: CultureDto
  ): Promise<Culture> {
    this.logger.log(
      `addOrUpdateCultureByUser started for userid - ${userId}`,
      `${this.AppName}`
    );
    try {
      const culture: Culture = await this.cultureModel
        .findOneAndUpdate({ user_id: userId }, cultureDto, {
          upsert: true,
          new: true,
        })
        .lean()
        .exec();
      this.logger.log(
        `addOrUpdateCultureByUser ended for userid - ${userId}`,
        `${this.AppName}`
      );
      return culture;
    } catch (err) {
      this.logger.error(
        `addOrUpdateCultureByUser failed with userId - ${userId} with error ${err}`,
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

  async getOverviewByUser(userId: string): Promise<Overview> {
    this.logger.log(
      `getOverviewByUser started for userId - ${userId}`,
      `${this.AppName}`
    );

    try {
      const overviewData = await this.userModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(userId) },
        },
        {
          $lookup: {
            from: "preference",
            localField: "_id",
            foreignField: "user_id",
            as: "preferences",
          },
        },
        {
          $lookup: {
            from: "culture",
            localField: "_id",
            foreignField: "user_id",
            as: "cultures",
          },
        },
        {
          $unwind: { path: "$preferences", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$cultures", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            user_id: "$_id",
            phone_number: { $ifNull: ["$phone_number", ""] },
            email: { $ifNull: ["$email", ""] },
            full_name: { $ifNull: ["$full_name", ""] },
            current_company: { $ifNull: ["$current_company", ""] },
            cv: { $ifNull: ["$cv", ""] },
            is_community_owner: { $ifNull: ["$is_community_owner", false] },
            city: { $ifNull: ["$city", ""] },
            current_role: { $ifNull: ["$current_role", ""] },
            years_of_experience: { $ifNull: ["$years_of_experience", 0] },
            student_or_new_graduate: {
              $ifNull: ["$student_or_new_graduate", false],
            },
            currently_employed: { $ifNull: ["$currently_employed", false] },
            linkedin_profile: { $ifNull: ["$linkedin_profile", ""] },
            term_and_conditions: { $ifNull: ["$term_and_conditions", false] },
            privacy_mode: { $ifNull: ["$privacy_mode", "public"] },
            user_name: { $ifNull: ["$user_name", ""] },
            profile_pic: { $ifNull: ["$profile_pic", ""] },
            description: { $ifNull: ["$cultures.description", ""] },
            motivation: {
              $ifNull: [
                "$cultures.motivation",
                { solving_technical_problems: false, building_products: false },
              ],
            },
            career_track_next_five_years: {
              $ifNull: [
                "$cultures.career_track_next_five_years",
                { individual_contributor: false, manager: false },
              ],
            },
            working_environment: {
              $ifNull: [
                "$cultures.working_environment",
                {
                  clear_roles_responsibilites: false,
                  employees_carry_out_multiple_tasks: false,
                },
              ],
            },
            remote_working_policy: {
              $ifNull: [
                "$cultures.remote_working_policy",
                {
                  very_important: false,
                  important: false,
                  not_important: false,
                },
              ],
            },
            quiet_office: {
              $ifNull: [
                "$cultures.quiet_office",
                {
                  very_important: false,
                  important: false,
                  not_important: false,
                },
              ],
            },
            interested_markets: {
              $ifNull: ["$preferences.interested_markets", []],
            },
            not_interested_markets: {
              $ifNull: ["$cultures.not_interested_markets", []],
            },
            interested_technologies: {
              $ifNull: ["$cultures.interested_technologies", []],
            },
            not_interested_technologies: {
              $ifNull: ["$cultures.not_interested_technologies", []],
            },
            where_in_job_search: {
              $ifNull: ["$preferences.where_in_job_search", ""],
            },
            sponsorship_requirement_to_work_in_us: {
              $ifNull: [
                "$preferences.sponsorship_requirement_to_work_in_us",
                false,
              ],
            },
            legally_to_work_in_us: {
              $ifNull: ["$preferences.legally_to_work_in_us", false],
            },
            job_type: { $ifNull: ["$preferences.job_type", ""] },
            preferred_locations: {
              $ifNull: ["$preferences.preferred_locations", []],
            },
            open_to_work_remotely: {
              $ifNull: ["$preferences.open_to_work_remotely", false],
            },
            desired_salary_currency: {
              $ifNull: ["$preferences.desired_salary_currency", ""],
            },
            desired_salary_amount: {
              $ifNull: ["$preferences.desired_salary_amount", 0],
            },
            company_size_preferences: {
              $ifNull: [
                "$preferences.company_size_preferences",
                {
                  seed: { ideal: false, yes: false, no: false },
                  early: { ideal: false, yes: false, no: false },
                  mid_size: { ideal: false, yes: false, no: false },
                  large: { ideal: false, yes: false, no: false },
                  very_large: { ideal: false, yes: false, no: false },
                  massive: { ideal: false, yes: false, no: false },
                },
              ],
            },
          },
        },
      ]);

      const overview: Overview = overviewData[0];

      this.logger.log(
        `getOverviewByUser ended for userId - ${userId}`,
        `${this.AppName}`
      );
      return overview;
    } catch (error) {
      this.logger.error(
        `getOverviewByUser failed for userId - ${userId} with error ${error}`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: error?.message ?? "Something went wrong",
        },
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllUsersOverview(
    sortField: string,
    sortOrder: "asc" | "desc",
    offset: number,
    limit: number
  ): Promise<OverviewDto[]> {
    this.logger.log(`getAllUsersOverview started`, `${this.AppName}`);

    try {
      const sortOrderValue = sortOrder === "asc" ? 1 : -1;

      const overviews = await this.userModel.aggregate([
        {
          $lookup: {
            from: "preferences",
            localField: "_id",
            foreignField: "user_id",
            as: "preferences",
          },
        },
        {
          $lookup: {
            from: "cultures",
            localField: "_id",
            foreignField: "user_id",
            as: "cultures",
          },
        },
        { $unwind: { path: "$preferences", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$cultures", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            user_id: "$_id",
            phone_number: "$phone_number",
            email: "$email",
            full_name: "$full_name",
            current_company: "$current_company",
            cv: "$cv",
            is_community_owner: "$is_community_owner",
            city: "$city",
            current_role: "$current_role",
            years_of_experience: "$years_of_experience",
            student_or_new_graduate: "$student_or_new_graduate",
            currently_employed: "$currently_employed",
            linkedin_profile: "$linkedin_profile",
            term_and_conditions: "$term_and_conditions",
            privacy_mode: "$privacy_mode",
            user_name: "$user_name",
            profile_pic: "$profile_pic",
            description: "$cultures.description",
            motivation: "$cultures.motivation",
            career_track_next_five_years:
              "$cultures.career_track_next_five_years",
            working_environment: "$cultures.working_environment",
            remote_working_policy: "$cultures.remote_working_policy",
            quiet_office: "$cultures.quiet_office",
            interested_markets: "$preferences.interested_markets",
            not_interested_markets: "$preferences.not_interested_markets",
            interested_technologies: "$preferences.interested_technologies",
            not_interested_technologies:
              "$preferences.not_interested_technologies",
            where_in_job_search: "$preferences.where_in_job_search",
            sponsorship_requirement_to_work_in_us:
              "$preferences.sponsorship_requirement_to_work_in_us",
            legally_to_work_in_us: "$preferences.legally_to_work_in_us",
            job_type: "$preferences.job_type",
            preferred_locations: "$preferences.preferred_locations",
            open_to_work_remotely: "$preferences.open_to_work_remotely",
            desired_salary_currency: "$preferences.desired_salary_currency",
            desired_salary_amount: "$preferences.desired_salary_amount",
            company_size_preferences: "$preferences.company_size_preferences",
          },
        },
        { $sort: { [sortField]: sortOrderValue } },
        { $skip: offset },
        { $limit: limit },

        {
          $project: {
            _id: 0,
            user_id: 1,
            phone_number: 1,
            email: 1,
            full_name: 1,
            current_company: 1,
            cv: 1,
            is_community_owner: 1,
            city: 1,
            current_role: 1,
            years_of_experience: 1,
            student_or_new_graduate: 1,
            currently_employed: 1,
            linkedin_profile: 1,
            term_and_conditions: 1,
            privacy_mode: 1,
            user_name: 1,
            profile_pic: 1,
            description: 1,
            motivation: 1,
            career_track_next_five_years: 1,
            working_environment: 1,
            remote_working_policy: 1,
            quiet_office: 1,
            interested_markets: 1,
            not_interested_markets: 1,
            interested_technologies: 1,
            not_interested_technologies: 1,
            where_in_job_search: 1,
            sponsorship_requirement_to_work_in_us: 1,
            legally_to_work_in_us: 1,
            job_type: 1,
            preferred_locations: 1,
            open_to_work_remotely: 1,
            desired_salary_currency: 1,
            desired_salary_amount: 1,
            company_size_preferences: 1,
          },
        },
      ]);

      this.logger.log(`getAllUsersOverview ended`, `${this.AppName}`);
      return overviews;
    } catch (error) {
      this.logger.error(
        `getAllUsersOverview failed with error ${error}`,
        `${this.AppName}`
      );
      throw new HttpException(
        {
          status: error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
          message: error?.message ?? "Something went wrong",
        },
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updatePasswordThroughSettings(
    updateDto: UpdatePasswordThroughSettingsDto,
    userId: string
  ): Promise<User> {
    this.logger.log(
      `updatePasswordThroughSettings started for userid - ${userId}`,
      `${this.AppName}`
    );
    try {
      const user: User = await this.userModel.findById(userId).lean().exec();
      const passwordMatched = await this.passwordService.comparePassword(
        updateDto.current_password,
        user.password
      );
      let updatedUser: User;
      if (passwordMatched) {
        const updatePasswordDto: UpdatePasswordDto = {
          password: updateDto.new_password,
          email: user.email,
        };
        updatedUser = await this.updatePassword(updatePasswordDto);
      } else {
        this.logger.error(
          `updatePasswordThroughSettings failed for userid - ${userId} as current password is wrong`,
          `${this.AppName}`
        );
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "Please provide correct current password",
          },
          HttpStatus.BAD_REQUEST
        );
      }
      this.logger.log(
        `updatePasswordThroughSettings ended for userid - ${userId}`,
        `${this.AppName}`
      );
      return updatedUser;
    } catch (err) {
      this.logger.error(
        `updatePasswordThroughSettings failed with userId - ${userId} with error ${err}`,
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

  async updateProfilePrivacy(
    updatePrivacy: UpdatePrivacyMode,
    userId: string
  ): Promise<User> {
    this.logger.log(
      `updateProfilePrivacy started for userid - ${userId}`,
      `${this.AppName}`
    );
    try {
      const user: User = await this.userModel
        .findByIdAndUpdate(
          userId,
          { privacy_mode: updatePrivacy.privacy_mode },
          { new: true, upsert: false }
        )
        .lean()
        .exec();
      this.logger.log(
        `updateProfilePrivacy ended for userid - ${userId}`,
        `${this.AppName}`
      );
      return user;
    } catch (err) {
      this.logger.error(
        `updateProfilePrivacy failed with userId - ${userId} with error ${err}`,
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

  async updateGeneralSettings(
    updateGeneral: UpdateGeneralSettings,
    userId: string
  ): Promise<User> {
    this.logger.log(
      `updateGeneralSettings started for userid - ${userId}`,
      `${this.AppName}`
    );
    try {
      const user: User = await this.userModel
        .findOne({ user_name: updateGeneral.user_name })
        .lean()
        .exec();
      if (user && user._id.toString() !== userId) {
        this.logger.error(
          `updateGeneralSettings failed for userid - ${userId} as this username is allready taken`,
          `${this.AppName}`
        );
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "This username is allready taken, please provide another",
          },
          HttpStatus.BAD_REQUEST
        );
      }
      const updatedUser: User = await this.userModel
        .findByIdAndUpdate(userId, updateGeneral, { new: true })
        .lean()
        .exec();
      this.logger.log(
        `updateGeneralSettings ended for userid - ${userId}`,
        `${this.AppName}`
      );
      return updatedUser;
    } catch (err) {
      this.logger.error(
        `updateGeneralSettings failed with userId - ${userId} with error ${err}`,
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

  async followUser(
    updateDto: FollowersAndBookmarksDto,
    userId: string
  ): Promise<Followers> {
    this.logger.log(
      `followUser started by userId - ${userId}`,
      `${this.AppName}`
    );

    try {
      updateDto.follower_id = new mongoose.Types.ObjectId(userId);

      const existingFollow: Followers = await this.followersModel.findOne({
        parent_user_id: updateDto.parent_user_id,
        follower_id: updateDto.follower_id,
      });

      if (existingFollow) {
        this.logger.warn(
          `followUser failed - UserId ${userId} is already following parentUserId ${updateDto.parent_user_id}`,
          `${this.AppName}`
        );
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "User is already following this user",
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const follower: Followers = new this.followersModel(updateDto);
      this.logger.log(
        `followUser ended successfully for userId - ${userId}`,
        `${this.AppName}`
      );
      return await follower.save();
    } catch (err) {
      this.logger.error(
        `followUser failed by userId - ${userId} with error: ${err.message}`,
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

  async bookmarkUser(
    updateDto: FollowersAndBookmarksDto,
    userId: string
  ): Promise<Bookmarks> {
    this.logger.log(
      `bookmarkUser started by userId - ${userId}`,
      `${this.AppName}`
    );

    try {
      updateDto.bookmarked_by = new mongoose.Types.ObjectId(userId);

      const existingBookmark: Bookmarks = await this.bookmarksModel.findOne({
        parent_user_id: updateDto.parent_user_id,
        bookmarked_by: updateDto.bookmarked_by,
      });

      if (existingBookmark) {
        this.logger.warn(
          `bookmarkUser failed - Bookmark already exists for userId: ${userId} and parentUserId: ${updateDto.parent_user_id}`,
          `${this.AppName}`
        );
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: "Bookmark already exists",
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const bookmark: Bookmarks = new this.bookmarksModel(updateDto);
      return await bookmark.save();
    } catch (err) {
      this.logger.error(
        `bookmarkUser failed by userId - ${userId} with error: ${err.message}`,
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

  async markUserAsCommunityOwner(userId: string): Promise<User> {
    const user: User = await this.userModel
      .findByIdAndUpdate(
        userId,
        { is_community_owner: true },
        { new: true, upsert: false }
      )
      .lean()
      .exec();
    // try catch
    return user;
  }
}
