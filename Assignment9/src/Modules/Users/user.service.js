import userModel from "../../DB/Models/userModel.js";
import bcrypt from "bcrypt";
import { encrypt } from "../../utils/encryption.js";
import generateToken from "../../utils/generateToken.js";

export async function signup(bodyData) {
  const { email, password, phone } = bodyData;

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    throw new Error("Email already exists", { cause: { statusCode: 409 } });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const encryptedPhone = encrypt(phone);

  const newUser = await userModel.create({
    ...bodyData,
    password: hashedPassword,
    phone: encryptedPhone.content,
  });

  return newUser;
}

export async function login(bodyData, res) {
  const { email, password } = bodyData;

  const existingUser = await userModel.findOne({ email });
  if (!existingUser) {
    throw new Error("Email not found", { cause: { statusCode: 404 } });
  }

  const isCorrectPassword = await bcrypt.compare(
    password,
    existingUser.password,
  );

  if (!isCorrectPassword) {
    throw new Error("Invalid credentials", { cause: { statusCode: 401 } });
  }

  const token = generateToken(existingUser._id, res);

  return { user: existingUser, token };
}

export async function getUser(userId) {
  const existingUser = await userModel.findById(userId);

  if (!existingUser) {
    throw new Error("User not found.", { cause: { statusCode: 404 } });
  }

  const user = await userModel.findOne({ _id: userId });

  return user;
}
export async function deleteUser(userId) {
  const existingUser = await userModel.findById(userId);

  if (!existingUser) {
    throw new Error("User not found.", { cause: { statusCode: 404 } });
  }

  await userModel.deleteOne({ _id: userId });

  return true;
}

export async function updateUser(userId, bodyData) {
  const { password, ...otherData } = bodyData;
  const email = otherData.email;
  const existingUser = await userModel.findById(userId);

  if (!existingUser) {
    throw new Error("User not found.", { cause: { statusCode: 404 } });
  }

  if ((email && email !== existingUser.email) || email === existingUser.email) {
    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      throw new Error("Email already exists.", { cause: { statusCode: 409 } });
    }
  }

  await userModel.updateOne({ _id: userId }, { $set: otherData });

  const updatedUser = await userModel.findById(userId).select("-password");

  return updatedUser;
}
