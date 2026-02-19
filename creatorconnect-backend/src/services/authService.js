import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP, saveOtp, verifyOtpService } from "./otpServices.js";
import { sendEmail } from "../sendEmail.js";

export const initiateSignupService = async (email) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    const otp = generateOTP();
    await saveOtp(email, otp);
    await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}. Expires in 5 minutes.`);

    return { message: "OTP sent to email" };
};

export const verifySignupOtpService = async ({ email, otp, name, password, role }) => {
    await verifyOtpService(email, otp);

    const user = await User.create({ name, email, password, role });

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
};

export const loginService = async (email, password) => {
    if (!email || !password) throw new Error("All fields are required");

    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new Error("Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });

    return {
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    };
};