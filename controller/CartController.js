const jwt = require("jsonwebtoken");
const JWT_SECRET = "mysecretkey";

const verifyUser = (req) => {
    const token = req.headers.authorization;

    if (!token) return null;

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
};

const Cart = require('../model/CartModel');

/* ADD TO CART */
exports.addToCart = async (req, res) => {

    const user = verifyUser(req);

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {

        const userId = user.id;
        const { productId, quantity } = req.body;

        let cartItem = await Cart.findOne({ userId, productId });

        if (cartItem) {
            cartItem.quantity += quantity || 1;
            await cartItem.save();
        } else {
            cartItem = await Cart.create({
                userId,
                productId,
                quantity: quantity || 1
            });
        }

        res.status(200).json({
            message: "Item added to cart",
            data: cartItem
        });

    } catch (error) {
        res.status(500).json({
            message: "Error adding to cart",
            error: error.message
        });
    }
};


/* GET CART */
exports.getCart = async (req, res) => {

    const user = verifyUser(req);

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {

        const userId = user.id;

        const cart = await Cart.find({ userId })
            .populate("productId");

        res.status(200).json({
            count: cart.length,
            data: cart
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching cart",
            error: error.message
        });
    }
};


/* REMOVE ITEM */
exports.removeFromCart = async (req, res) => {

    const user = verifyUser(req);

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {

        const { id } = req.params;

        await Cart.findByIdAndDelete(id);

        res.status(200).json({
            message: "Item removed"
        });

    } catch (error) {
        res.status(500).json({
            message: "Error removing item",
            error: error.message
        });
    }
};


/* CLEAR CART */
exports.clearCart = async (req, res) => {

    const user = verifyUser(req);

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {

        const userId = user.id;

        await Cart.deleteMany({ userId });

        res.status(200).json({
            message: "Cart cleared"
        });

    } catch (error) {
        res.status(500).json({
            message: "Error clearing cart",
            error: error.message
        });
    }
};

/* UPDATE CART ITEM QUANTITY */

exports.updateQuantity = async (req, res) => {

    const user = verifyUser(req);

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    try {

        const { id } = req.params;
        const { quantity } = req.body;

        const updated = await Cart.findByIdAndUpdate(
            id,
            { quantity: parseInt(quantity) },
            { new: true }
        );

        if (!updated) {

            return res.status(404).json({
                message: "Cart item not found"
            });

        }

        res.status(200).json({
            message: "Cart updated",
            data: updated
        });

    } catch (error) {

        res.status(500).json({
            message: "Error updating cart",
            error: error.message
        });

    }

};

