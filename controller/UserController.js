const UserModel = require('../model/UserModel');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "mysecretkey"; // keep same for all JWT

/* MAIL SETUP */
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jankisutariya14@gmail.com',
        pass: 'xjwp aqym gwzb lsle' // your Gmail App Password
    }
});

/* REGISTER */
exports.Register = async (req, res) => {
    try {
        let { name, email, password, phone, city, address } = req.body;
        email = email.toLowerCase();

        const userExists = await UserModel.findOne({ email });
        if (userExists) return res.status(409).json({ status: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.create({ name, email, password: hashedPassword, phone, city, address });
        return res.status(201).json({ status: "User Created Successfully", data: user });
    } catch (error) {
        return res.status(500).json({ status: "Registration Error", error: error.message });
    }
};

/* LOGIN – Send OTP */
exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ status: "Email and password required" });

        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ status: "User not registered" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ status: "Invalid email or password" });

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpToken = jwt.sign({ id: user._id, email: user.email, otp }, JWT_SECRET, { expiresIn: "5m" });

        const mailOptions = {
            from: 'jankisutariya14@gmail.com',
            to: user.email,
            subject: 'Login OTP',
            text: `Your Login OTP is ${otp}`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.log("Mail Error:", error);
                return res.status(500).json({ status: "Error sending OTP", error: error.message });
            }
            console.log("OTP sent:", otp); // log OTP for testing
            return res.status(200).json({ status: "OTP sent", otpToken });
        });

    } catch (error) {
        return res.status(500).json({ status: "Login error", error: error.message });
    }
};

/* VERIFY LOGIN OTP */
exports.VerifyOTP = async (req, res) => {
    try {
        const { otp, otpToken } = req.body;
        if (!otpToken) return res.status(400).json({ status: "OTP session expired" });

        let decoded;
        try {
            decoded = jwt.verify(otpToken, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ status: "Invalid or expired OTP session" });
        }

        if (String(otp) !== String(decoded.otp)) {
            return res.status(400).json({ status: "Invalid OTP" });
        }

        const user = await UserModel.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ status: "User not found" });

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
        return res.status(200).json({ status: "OTP verified successfully", token, user });
    } catch (error) {
        return res.status(500).json({ status: "OTP verification error", error: error.message });
    }
};

/* RESEND LOGIN OTP */

exports.ResendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ status: "User not registered" });

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpToken = jwt.sign({ id: user._id, email: user.email, otp }, JWT_SECRET, { expiresIn: "5m" });

        const mailOptions = {
            from: 'jankisutariya14@gmail.com',
            to: user.email,
            subject: 'Resent Login OTP',
            text: `Your new OTP is ${otp}`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.log("Mail Error:", error);
                return res.status(500).json({ status: "Error resending OTP", error: error.message });
            }
            console.log("Resent OTP:", otp);
            return res.status(200).json({ status: "New OTP sent", otpToken });
        });
    } catch (error) {
        return res.status(500).json({ status: "Resend OTP error", error: error.message });
    }
};

/* FORGOT PASSWORD – Send OTP */
exports.ForgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ status: "User not registered" });

        const otp = Math.floor(100000 + Math.random() * 900000);
        const forgetToken = jwt.sign({ id: user._id, email: user.email, otp }, JWT_SECRET, { expiresIn: "5m" });

        const mailOptions = {
            from: 'jankisutariya14@gmail.com',
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your password reset OTP is ${otp}`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.log("Mail Error:", error);
                return res.status(500).json({ status: "Error sending OTP", error: error.message });
            }
            console.log("Forgot OTP sent:", otp);
            return res.status(200).json({ status: "Forget OTP sent", forgetToken });
        });
    } catch (error) {
        return res.status(500).json({ status: "Forget password error", error: error.message });
    }
};

/* VERIFY FORGOT PASSWORD OTP */
exports.VerifyForgetOTP = async (req, res) => {
    try {
        const { otp, forgetToken } = req.body;
        if (!forgetToken) return res.status(400).json({ status: "OTP session expired" });

        let decoded;
        try {
            decoded = jwt.verify(forgetToken, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ status: "Invalid or expired OTP session" });
        }

        if (String(otp) !== String(decoded.otp)) {
            return res.status(400).json({ status: "Invalid OTP" });
        }

        return res.status(200).json({ status: "OTP verified successfully", verifiedToken: forgetToken });
    } catch (error) {
        return res.status(500).json({ status: "Forget OTP verification error", error: error.message });
    }
};

/* RESET PASSWORD */
exports.Resetpassword = async (req, res) => {
    try {
        const { newPassword, verifiedToken } = req.body;
        if (!verifiedToken) return res.status(400).json({ status: "Token missing or expired" });

        let decoded;
        try {
            decoded = jwt.verify(verifiedToken, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ status: "Invalid or expired session" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await UserModel.findByIdAndUpdate(decoded.id, { password: hashedPassword });

        return res.status(200).json({ status: "Password reset successfully" });
    } catch (error) {
        return res.status(500).json({ status: "Reset password error", error: error.message });
    }
};

/* LOGOUT */
exports.Logout = async (req, res) => {
    try {
        return res.status(200).json({ status: "Logout successful" });
    } catch (error) {
        return res.status(500).json({ status: "Logout error", error: error.message });
    }
};

/* GET PROFILE */
exports.getProfile = async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ status: "Unauthorized" });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await UserModel.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ status: "User not found" });

        return res.status(200).json({ status: "Profile fetched", user });
    } catch (error) {
        return res.status(500).json({ status: "Profile fetch error", error: error.message });
    }
};