import bcrypt from "bcrypt";
import OTP from "../models/otpModel.js";

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const saveOtp = async (email, otp) => {
    await OTP.deleteMany({ email });
    return await OTP.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
};

export const verifyOtpService = async (email, otp) => {
    const record = await OTP.findOne({ email });
    if (!record) throw new Error("OTP not found");

    if (record.expiresAt < Date.now()) {
        await OTP.deleteOne({ email });
        throw new Error("OTP expired");
    }

    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) throw new Error("Invalid OTP");

    await OTP.deleteOne({ email });
    return true;
};