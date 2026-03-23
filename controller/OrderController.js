const jwt = require("jsonwebtoken");
const JWT_SECRET = "mysecretkey";
const nodemailer = require('nodemailer');

/* MAIL SETUP */
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jankisutariya14@gmail.com',
        pass: 'xjwp aqym gwzb lsle'
    }
});

const verifyUser = (req) => {
    const token = req.headers.authorization;

    if (!token) return null;

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
};

const Order = require('../model/OrderModel');
const Cart = require('../model/CartModel');

/* PLACE ORDER */
exports.placeOrder = async (req, res) => {

    const user = verifyUser(req);

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {

        const userId = user.id;
        const { items, totalAmount, shippingDetails, paymentMethod } = req.body;

        const order = await Order.create({
            userId,
            items,
            totalAmount,
            shippingDetails,
            paymentMethod
        });

        await Cart.deleteMany({ userId });

        // ✅ Send confirmation email (FIXED)
        const mailOptions = {
            from: 'jankisutariya14@gmail.com',
            to: shippingDetails.email,
            subject: 'Order Confirmation - Coza Store',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px;">
                    <h2 style="color: #ff3f6c;">Order Placed Successfully!</h2>
                    <p>Dear ${shippingDetails.name},</p>
                    <p>Thank you for shopping with us. Your order ID is <strong>${order._id}</strong>.</p>
                    <hr />
                    <h4>Order Summary</h4>
                    <p>Total Amount: <strong>₹${totalAmount}</strong></p>
                    <p>Payment Method: <strong>${paymentMethod}</strong></p>
                    <p>Delivery Address: ${shippingDetails.address}, ${shippingDetails.city}</p>
                    <hr />
                    <p>We will notify you once your order is shipped.</p>
                    <p>Best regards,<br/><strong>Coza Store Team</strong></p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions); // ✅ CORRECT
            console.log("✅ Email sent");
        } catch (error) {
            console.error("❌ Mail Error:", error);
        }

        res.status(200).json({
            message: "Order placed successfully",
            orderId: order._id
        });

    } catch (error) {
        res.status(500).json({
            message: "Error placing order",
            error: error.message
        });
    }
};


/* GET USER ORDERS */
exports.getUserOrders = async (req, res) => {

    const user = verifyUser(req);

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {

        const userId = user.id;

        const orders = await Order.find({ userId })
            .populate("items.productId");

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


/* GET SINGLE ORDER */
exports.getOrderById = async (req, res) => {

    const user = verifyUser(req);

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const { id } = req.params;

        if (!id || id.length !== 24) {
            return res.status(400).json({ message: "Invalid Order ID format" });
        }

        const order = await Order.findById(id)
            .populate("userId")
            .populate("items.productId");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            data: order
        });

    } catch (error) {
        console.error("Fetch order by ID error:", error);
        res.status(500).json({
            message: "Internal server error while fetching order",
            error: error.message
        });
    }
};


/* UPDATE ORDER STATUS */
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        res.json({ message: "Order updated", data: order });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/* DELETE ORDER */
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        await Order.findByIdAndDelete(id);

        res.json({ message: "Order deleted" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};