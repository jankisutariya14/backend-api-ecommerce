const UserModel = require('../model/UserModel');
const OrderModel = require('../model/OrderModel');
const jwt = require("jsonwebtoken");

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const JWT_SECRET = "mysecretkey";


/* ADMIN LOGIN */

exports.adminLogin = (req, res) => {

    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {

        const token = jwt.sign(
            { role: "admin", username: username },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Admin login successful",
            token: token
        });

    } else {

        res.status(401).json({
            message: "Invalid admin credentials"
        });
    }
};


/* ADMIN LOGOUT */

exports.adminLogout = (req, res) => {

    res.json({
        message: "Admin logout successful (delete token from frontend)"
    });

};


/* GET ALL USERS (ADMIN) */

exports.getAllUsers = async (req, res) => {

    try {

        const users = await UserModel.find();

        res.status(200).json({
            count: users.length,
            data: users
        });

    } catch (error) {

        res.status(500).json({
            message: "Error fetching users",
            error: error.message
        });

    }

};


/* GET ALL ORDERS (ADMIN) */

exports.getAllOrders = async (req, res) => {

    try {

        const orders = await OrderModel.find()
            .populate('userId', 'name email address city')
            .populate('items.productId');

        res.status(200).json({
            count: orders.length,
            data: orders
        });

    } catch (error) {

        res.status(500).json({
            message: "Error fetching orders",
            error: error.message
        });

    }

};