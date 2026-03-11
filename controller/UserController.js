const UserModel = require('../model/UserModel');
let nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

/* MAIL SETUP */

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jankisutariya14@gmail.com',
        pass: 'xjwp aqym gwzb lsle'
    }
});


/* REGISTER */

exports.Register = async (req, res) => {

    try {

        const { email, password } = req.body;

        const userExists = await UserModel.findOne({ email });

        if (userExists) {
            return res.json({
                status: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        req.body.password = hashedPassword;

        const data = await UserModel.create(req.body);

        res.json({
            status: "User Created Successfully",
            data
        });

    } catch (error) {

        res.status(500).json({
            status: "Registration Error",
            error: error.message
        });

    }

};



/* LOGIN */

exports.Login = async (req, res) => {

    try {

        // Already logged in check
        if (req.session.user && req.session.user.isLoggedIn) {

            return res.json({
                status: "User already logged in, please logout first",
                UserId: req.session.user.id
            });

        }

        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {

            return res.json({
                status: "User not registered"
            });

        }

        const match = await bcrypt.compare(req.body.password, user.password);

        if (!match) {

            return res.json({
                status: "Invalid email or password"
            });

        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        // store OTP in session
        req.session.otpData = {
            id: user._id,
            email: user.email,
            otp: otp
        };

        let mailOptions = {
            from: 'jankisutariya14@gmail.com',
            to: user.email,
            subject: 'Login OTP',
            text: 'Your Login OTP is ' + otp
        };

        transporter.sendMail(mailOptions, function (error) {

            if (error) {

                return res.json({
                    status: "Error sending OTP"
                });

            }

            res.json({
                status: "Login Success. OTP sent to your email"
            });

        });

    } catch (error) {

        res.status(500).json({
            status: "Login error",
            error: error.message
        });

    }

};



/* VERIFY OTP */

exports.VerifyOTP = async (req, res) => {

    try {

        if (!req.session.otpData) {

            return res.json({
                status: "Session expired. Please login again"
            });

        }

        if (parseInt(req.body.otp) === req.session.otpData.otp) {

            req.session.user = {
                id: req.session.otpData.id,
                email: req.session.otpData.email,
                isLoggedIn: true
            };

            return res.json({
                status: "OTP verified successfully",
                UserId: req.session.user.id
            });

        }

        res.json({
            status: "Invalid OTP"
        });

    } catch (error) {

        res.status(500).json({
            status: "OTP verification error",
            error: error.message
        });

    }

};



/* FORGOT PASSWORD */

exports.ForgetPassword = async (req, res) => {

    try {

        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {

            return res.json({
                status: "User not registered"
            });

        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        req.session.forget = {
            email: user.email,
            otp: otp
        };

        let mailOptions = {
            from: 'jankisutariya14@gmail.com',
            to: user.email,
            subject: 'Forgot Password OTP',
            text: 'Your OTP is ' + otp
        };

        transporter.sendMail(mailOptions, function (error) {

            if (error) {

                return res.json({
                    status: "Error sending OTP"
                });

            }

            res.json({
                status: "OTP sent to your email"
            });

        });

    } catch (error) {

        res.status(500).json({
            status: "Error",
            error: error.message
        });

    }

};



/* VERIFY FORGOT OTP */

exports.VerifyForgetOTP = async (req, res) => {

    try {

        if (!req.session.forget) {

            return res.json({
                status: "OTP not generated"
            });

        }

        if (parseInt(req.body.otp) === req.session.forget.otp) {

            req.session.forget.verified = true;

            return res.json({
                status: "OTP verified successfully"
            });

        }

        res.json({
            status: "Invalid OTP"
        });

    } catch (error) {

        res.status(500).json({
            status: "OTP verification error",
            error: error.message
        });

    }

};



/* RESET PASSWORD */

exports.Resetpassword = async (req, res) => {

    try {

        if (!req.session.forget || !req.session.forget.verified) {

            return res.json({
                status: "OTP not verified"
            });

        }

        if (req.body.password !== req.body.cpassword) {

            return res.json({
                status: "Password mismatch"
            });

        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        await UserModel.updateOne(
            { email: req.session.forget.email },
            { password: hashedPassword }
        );

        req.session.forget = null;

        res.json({
            status: "Password reset successfully"
        });

    } catch (error) {

        res.status(500).json({
            status: "Error",
            error: error.message
        });

    }

};



/* LOGOUT */

exports.Logout = (req, res) => {

    req.session.destroy();

    res.json({
        status: "Logout Success"
    });

};