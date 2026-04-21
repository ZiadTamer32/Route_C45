import type { ISignupDto, ILoginDto } from "./auth.dto.js";
import userRepo from "../../DB/repositories/user.repo.js";
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "../../Common/exceptions/domain.exception.js";
import type { IUser } from "../../Common/interface/index.js";
import { compareOperation, hashOperation } from "../../Common/security/hash.js";
import { JWT_EXPIRES_IN, JWT_SECRET_USER } from "../../config/app.config.js";
import jwt from "jsonwebtoken";
import { decryption, encryption } from "../../Common/security/crypto.js";

function generateToken(id: string): string {
  const userToken = jwt.sign({ id }, JWT_SECRET_USER, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
  return userToken;
}

export async function signup(bodyData: ISignupDto): Promise<IUser> {
  const { email, password, phone } = bodyData;
  const isEmailExist = await userRepo.findOne({ filter: { email } });

  if (isEmailExist) {
    throw new ConflictException("Email already exists");
  }

  const hashedPassword = await hashOperation({ plainText: password });

  const phoneEncrypted = encryption(phone);

  const user = await userRepo.create({
    ...bodyData,
    password: hashedPassword,
    phone: phoneEncrypted,
  });

  return user;
}

export async function login(
  bodyData: ILoginDto,
): Promise<{ user: IUser; token: string }> {
  const { email, password } = bodyData;
  const isEmailExist = await userRepo.findOne({ filter: { email } });

  if (!isEmailExist) {
    throw new NotFoundException("Email not found");
  }
  const user = await userRepo.findOne({ filter: { email } });

  const isPasswordValid = await compareOperation({
    plainText: password,
    hashedValue: user!.password,
  });

  if (!isPasswordValid) {
    throw new UnauthorizedException("Invalid credentials");
  }

  const token = generateToken(user!._id.toString());

  return { user: user!, token };
}

export async function getUser(id: string) {
  const user = await userRepo.findById({
    id,
    projection: {
      password: 0,
      otp: 0,
      __v: 0,
      role: 0,
      provider: 0,
      otpExpiresAt: 0,
      isVerified: 0,
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
}
