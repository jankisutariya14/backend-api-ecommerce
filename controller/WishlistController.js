const jwt = require("jsonwebtoken");
const JWT_SECRET = "mysecretkey";
const mongoose = require('mongoose');
const Wishlist = require('../model/WishlistModel');

const verifyUser = (req) => {
    const token = req.headers.authorization;
    if (!token) return null;
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
};

/* TOGGLE WISHLIST (ADD/REMOVE) */
exports.toggleWishlist = async (req, res) => {
    const user = verifyUser(req);
    if (!user) {
        console.log("Toggle Wishlist: Unauthorized access");
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const userId = user.id;
        const { productId } = req.body;

        console.log("Toggle Wishlist Attempt:", { userId, productId });

        if (!productId) {
            return res.status(400).json({ message: "Product ID is missing" });
        }

        const existing = await Wishlist.findOne({ userId, productId });

        if (existing) {
            await Wishlist.findByIdAndDelete(existing._id);
            console.log("Product removed from wishlist");
            return res.status(200).json({
                message: "Removed from wishlist",
                added: false
            });
        } else {
            const newItem = await Wishlist.create({ userId, productId });
            console.log("Product added to wishlist");
            return res.status(200).json({
                message: "Added to wishlist",
                added: true,
                data: newItem
            });
        }
    } catch (error) {
        console.error("Toggle Wishlist Catch Error:", error);
        res.status(500).json({
            message: "Error toggling wishlist",
            error: error.message
        });
    }
};

/* GET WISHLIST */
exports.getWishlist = async (req, res) => {
    const user = verifyUser(req);
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const userId = user.id;
        const wishlist = await Wishlist.find({ userId }).populate("productId");

        res.status(200).json({
            success: true,
            count: wishlist.length,
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching wishlist",
            error: error.message
        });
    }
};

/* REMOVE SINGLE ITEM BY ID (Directly from wishlist page) */
exports.removeFromWishlist = async (req, res) => {
    const user = verifyUser(req);
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const { id } = req.params;
        await Wishlist.findByIdAndDelete(id);
        res.status(200).json({
            message: "Removed from wishlist"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error removing item",
            error: error.message
        });
    }
};
