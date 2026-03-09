const UserModel = require('../model/UserModel');
const storage = require('node-persist');
let nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

storage.initSync();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jankisutariya14@gmail.com',
        pass: 'xjwp aqym gwzb lsle'
    }
});

exports.Register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            return res.status(200).json({
                status: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        req.body.password = hashedPassword;

        const data = await UserModel.create(req.body);

        res.status(200).json({
            status: "User Created Successfully",
            data
        });
    } catch (error) {
        res.status(500).json({
            status: "Error in registration",
            error: error.message
        });
    }
};

exports.Login = async (req, res) => {
    const data = await UserModel.find({ email: req.body.email });
    const UserId = await storage.getItem('UserId');
    const otp = Math.floor(100000 + Math.random() * 900000);
    if (data.length !== 1) {
        return res.status(200).json({
            status: "User not registered, please register first"
        });
    }
    else if (UserId) {
        res.status(200).json({
            status: "User already logged in,please logout first",
            UserId

        });
    }
    else if (await bcrypt.compare(req.body.password, data[0].password) === false) {
        res.status(200).json({
            status: "Check your email and password"
        });
    }
    else {
        await storage.setItem('UserId', { id: data[0].id, otp });

        let mailOptions = {
            from: 'jankisutariya14@gmail.com',
            to: req.body.email,
            subject: 'Your Login OTP',
            text: 'Your Login OTP is ' + otp
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                res.status(200).json({
                    status: error
                });
            } else {
                res.status(200).json({
                    status: "Login Success. OTP sent to your email",
                    data
                });
            }
        });
    }


}

exports.VerifyOTP = async (req, res) => {
    const UserData = await storage.getItem('UserId');

    if (!UserData) {
        res.status(200).json({
            status: "No user logged in. Please login first."
        });
    }
    else if (parseInt(req.body.otp) === UserData.otp) {
        res.status(200).json({
            status: "OTP verified successfully",
            UserId: UserData.id
        });
    }
    else {
        res.status(200).json({
            status: "Invalid OTP"
        });
    }
}

exports.ForgetPassword = async (req, res) => {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
        return res.status(200).json({
            status: "User not registered, please register first"
        });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    await storage.setItem('ForgetOTP', { email: req.body.email, otp: otp });
    let mailOptions = {
        from: 'jankisutariya14@gmail.com',
        to: user.email,
        subject: 'Forgot Password OTP',
        text: 'Your OTP is ' + otp
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            res.status(200).json({
                status: error
            });
        } else {
            res.status(200).json({
                status: "OTP sent to your email",
            });
        }
    });
}

exports.VerifyForgetOTP = async (req, res) => {
    const data = await storage.getItem('ForgetOTP');

    if (!data) {
        res.status(200).json({
            status: "OTP not generated"
        });
    }
    else if (parseInt(req.body.otp) === data.otp) {
        await storage.setItem('ForgetOTP', { ...data, verified: true });
        res.status(200).json({
            status: "OTP verified successfully"
        });
    }
    else {
        res.status(200).json({
            status: "Invalid OTP"
        });
    }
}

exports.Resetpassword = async (req, res) => {
    const data = await storage.getItem('ForgetOTP');
    if (!data || !data.verified) {
        return res.status(200).json({
            status: "OTP not verified, First verify OTP"
        });
    }

    if (req.body.password !== req.body.cpassword) {
        return res.status(200).json({
            status: "Password and confirm password do not match"
        });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await UserModel.updateOne(
        { email: data.email },
        { password: hashedPassword }
    );

    await storage.removeItem('ForgetOTP');
    res.status(200).json({
        status: "Password reset successfully"
    });
}

exports.Logout = async (req, res) => {
    await storage.removeItem('UserId');
    res.status(200).json({
        status: "Logout Success"
    })
}
