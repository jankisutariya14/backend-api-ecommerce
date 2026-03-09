const Order = require('../model/OrderModel');
const Cart = require('../model/CartModel');

/* PLACE ORDER */

exports.placeOrder = async (req, res) => {
    try {

        const { userId, items, totalAmount } = req.body;

        const order = await Order.create({
            userId,
            items,
            totalAmount
        });

        // cart clear after order
        await Cart.deleteMany({ userId });

        res.status(200).json({
            message: "Order placed successfully",
            data: order
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
    try {

        const { userId } = req.params;

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
    try {

        const { id } = req.params;

        const order = await Order.findById(id)
            .populate("items.productId");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            data: order
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching order",
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

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order status updated",
            data: order
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating order",
            error: error.message
        });
    }
};


/* DELETE ORDER */

exports.deleteOrder = async (req, res) => {
    try {

        const { id } = req.params;

        await Order.findByIdAndDelete(id);

        res.status(200).json({
            message: "Order deleted"
        });

    } catch (error) {
        res.status(500).json({
            message: "Error deleting order",
            error: error.message
        });
    }
};