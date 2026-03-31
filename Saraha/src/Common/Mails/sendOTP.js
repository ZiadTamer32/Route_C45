import { generateOTP } from "../Security/generateOTP.js";
import { hashOperation } from "../Security/hash.js";
import sendEmail from "./sendEmail.js";
import * as redisMethods from "../../DB/redis.repository.js";

const sendOTP = async ({ email, subject, template }) => {
  const OTP = generateOTP();
  const hashedOTP = await hashOperation({ plainText: OTP });

  await sendEmail({
    to: email,
    subject,
    html: template.replace("{verificationCode}", OTP),
  });

  await redisMethods.setString({
    key: `OTP::${email}::${subject.replaceAll(" ", "_")}`,
    value: hashedOTP,
    expValue: 60 * 5,
  });
};

export default sendOTP;
