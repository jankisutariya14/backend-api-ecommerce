const Cart = require('../model/CartModel');

/* ADD TO CART */

exports.addToCart = async (req, res) => {
    try {

        const { userId, productId, quantity } = req.body;

        const existing = await Cart.findOne({ userId, productId });

        if (existing) {
            existing.quantity += parseInt(quantity) || 1;
            await existing.save();

            return res.status(200).json({
                message: "Quantity updated",
                data: existing
            })
        }

        const cart = await Cart.create({
            userId,
            productId,
            quantity: parseInt(quantity) || 1
        });

        res.status(200).json({
            message: "Product added to cart",
            data: cart
        })

    } catch (error) {
        res.status(500).json({
            message: "Error adding to cart",
            error: error.message
        })
    }
}


/* GET CART */

exports.getCart = async (req, res) => {
    try {

        const { userId } = req.params;

        const cartItems = await Cart.find({ userId })
            .populate("productId");

        res.status(200).json({
            count: cartItems.length,
            data: cartItems
        })

    } catch (error) {
        res.status(500).json({
            message: "Error fetching cart",
            error: error.message
        })
    }
}


/* REMOVE CART ITEM */

exports.removeCartItem = async (req, res) => {
    try {

        const { id } = req.params;

        const deleted = await Cart.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                message: "Cart item not found"
            })
        }

        res.status(200).json({
            message: "Cart item removed"
        })

    } catch (error) {
        res.status(500).json({
            message: "Error removing item",
            error: error.message
        })
    }
}

/* UPDATE CART ITEM QUANTITY */

exports.updateQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        const updated = await Cart.findByIdAndUpdate(id, { quantity: parseInt(quantity) }, { new: true });

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
}

/* CLEAR CART */

exports.clearCart = async (req, res) => {
    try {
        const { userId } = req.params;

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
}