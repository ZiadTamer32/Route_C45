import { JwtPayload } from "jsonwebtoken";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../../Common/exceptions/domain.exception.js";
import { decryption } from "../../Common/security/crypto.js";
import { HUser } from "../../DB/Models/user.model.js";
import UserRepo from "../../DB/repositories/user.repo.js";
import RedisRepo from "../../DB/repositories/redis.repo.js";
import { compareOperation, hashOperation } from "../../Common/security/hash.js";

class UserService {
  private userRepo: typeof UserRepo;
  private redisMethods: typeof RedisRepo;
  constructor() {
    this.userRepo = UserRepo;
    this.redisMethods = RedisRepo;
  }

  getUser = async (id: string) => {
    const user = await this.userRepo.findById({
      id,
      projection: {
        password: 0,
        otp: 0,
        __v: 0,
        role: 0,
        provider: 0,
        otpExpiresAt: 0,
        visitCount: 0,
        storedOTP: 0,
        createdAt: 0,
        updatedAt: 0,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.phone) {
      user.phone = decryption(user.phone);
    }

    return user;
  };

  enableTwoStepVerification = async (userId: string): Promise<void> => {
    const user = (await this.userRepo.findById({ id: userId })) as HUser;

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.twoStepVerification) {
      throw new BadRequestException("2-step-verification is already enabled");
    }

    user.twoStepVerification = true;
    await user.save();
  };

  disableTwoStepVerification = async (userId: string): Promise<void> => {
    const user = (await this.userRepo.findById({ id: userId })) as HUser;

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.twoStepVerification) {
      throw new BadRequestException("2-step-verification is already disabled");
    }

    user.twoStepVerification = false;
    await user.save();
  };

  logout = async (
    tokenData: JwtPayload,
    options: "all" | "one",
  ): Promise<void> => {
    const { jti, id } = tokenData;

    if (options === "all") {
      await this.userRepo.updateOne({
        filter: { _id: id },
        update: { changeCreditTime: new Date() },
      });
    } else {
      // const days = Math.floor(expDuration / 86400);
      // const hours = Math.floor((expDuration % 86400) / 3600);
      // const minutes = Math.floor((expDuration % 3600) / 60);
      // console.log(days, "days", hours, "hours", minutes, "minutes");

      await this.redisMethods.setString({
        key: `blackListToken::${id}::${jti}`,
        value: jti!,
        expValue: 60 * 60 * 24 * 365, // MUST blacklist this jti for the max lifetime of the Refresh Token (1 year)
      });
    }
  };

  updatePassword = async (
    id: string,
    bodyData: { currentPassword: string; newPassword: string },
  ): Promise<void> => {
    const { currentPassword, newPassword } = bodyData;

    const user = await this.userRepo.findById({
      id,
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // 1. Verify that the current password provided is correct
    const isMatchPassword = await compareOperation({
      plainText: currentPassword,
      hashedValue: user.password!,
    });

    if (!isMatchPassword) {
      throw new UnauthorizedException("Invalid current password");
    }

    // 2. Ensure the new password is not the same as the current one
    const isSamePassword = await compareOperation({
      plainText: newPassword,
      hashedValue: user.password!,
    });

    if (isSamePassword) {
      throw new BadRequestException(
        "New password cannot be the same as current password",
      );
    }

    // 3. Hash the new password and update the user record
    const hashedPassword = await hashOperation({ plainText: newPassword });

    user.password = hashedPassword;
    user.changeCreditTime = new Date();
    await user.save();
  };
}

export default UserService;
