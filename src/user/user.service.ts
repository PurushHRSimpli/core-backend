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
    this.logger.log(`getOverviewByUser started for userId - ${userId}`, `${this.AppName}`);
  
    try {
        const culture: Culture = await this.cultureModel.findOne({ user_id: userId }).lean().exec();
        const preference: Preference = await this.preferenceModel.findOne({ user_id: userId }).lean().exec();
        const user: User = await this.userModel.findOne({ user_id: userId }).lean().exec();

        const overview: Overview = {
            user_id: userId,
            phone_number: user.phone_number || '',
            email: user.email || '',
            full_name: user.full_name || '',
            current_company: user.current_company || '',
            cv: user.cv || '',
            is_community_owner: user.is_community_owner || false,
            city: user.city || '',
            current_role: user.current_role || '',
            years_of_experience: user.years_of_experience || 0,
            student_or_new_graduate: user.student_or_new_graduate || false,
            currently_employed: user.currently_employed || false,
            linkedin_profile: user.linkedin_profile || '',
            term_and_conditions: user.term_and_conditions || false,
            privacy_mode: user.privacy_mode || 'public',
            user_name: user.user_name || '',
            profile_pic: user.profile_pic || '',
            description: culture.description || '',
            motivation: culture.motivation || { solving_technical_problems: false, building_products: false },
            career_track_next_five_years: culture.career_track_next_five_years || { individual_contributor: false, manager: false },
            working_environment: culture.working_environment || { clear_roles_responsibilites: false, employees_carry_out_multiple_tasks: false },
            remote_working_policy: culture.remote_working_policy || { very_important: false, important: false, not_important: false },
            quiet_office: culture.quiet_office || { very_important: false, important: false, not_important: false },
            interested_markets: preference.interested_markets || [],
            not_interested_markets: culture.not_interested_markets || [],
            interested_technologies: culture.interested_technologies || [],
            not_interested_technologies: culture.not_interested_technologies || [],
            where_in_job_search: preference.where_in_job_search || '',
            sponsorship_requirement_to_work_in_us: preference.sponsorship_requirement_to_work_in_us || false,
            legally_to_work_in_us: preference.legally_to_work_in_us || false,
            job_type: preference.job_type || '',
            preferred_locations: preference.preferred_locations || [],
            open_to_work_remotely: preference.open_to_work_remotely || false,
            desired_salary_currency: preference.desired_salary_currency || '',
            desired_salary_amount: preference.desired_salary_amount || 0,
            company_size_preferences: preference.company_size_preferences || {
                seed: { ideal: false, yes: false, no: false },
                early: { ideal: false, yes: false, no: false },
                mid_size: { ideal: false, yes: false, no: false },
                large: { ideal: false, yes: false, no: false },
                very_large: { ideal: false, yes: false, no: false },
                massive: { ideal: false, yes: false, no: false },
            },
        };

        this.logger.log(`getOverviewByUser ended for userId - ${userId}`, `${this.AppName}`);
        return overview;
    } catch (error) {
        this.logger.error(`getOverviewByUser failed for userId - ${userId} with error ${error}`, `${this.AppName}`);
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
}
