const Product = require('../model/ProductModel');
const multer = require('multer');
const path = require('path');

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

/* ========= MULTER CONFIG ========= */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files allowed'), false);
        }
    }
});

/* ========= ADD PRODUCT ========= */

exports.addProduct = [
    upload.array('images', 3),
    async (req, res) => {
         if (!req.session.isAdmin) {
            return res.status(403).json({
                message: "Only admin can add product"
            });
        }
        try {
            const { name, price, rating, category, color } = req.body;

            if (!name || !price || !rating || !category || !color || !req.files || req.files.length == 0) {
                return res.status(400).json({
                    message: "All fields including 3 images are required"
                });
            }

            const imageNames = req.files.map(file => file.filename);
            const newProduct = new Product({
                name,
                images: imageNames,
                price,
                rating,
                category,
                color
            });

            await newProduct.save();

            res.status(201).json({
                message: "Product added successfully",
                data: newProduct
            });

        } catch (error) {
            res.status(500).json({
                message: "Error creating product",
                error: error.message
            });
        }
    }
];

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json({
            success: true,


            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching products",
            error: error.message
        });
    }
};

/* ========= GET PRODUCT BY ID ========= */

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching product",
            error: error.message
        });
    }
};

/* ========= UPDATE PRODUCT ========= */

exports.updateProduct = [
    upload.array('images', 3),
    async (req, res) => {
         if (!req.session.isAdmin) {
            return res.status(403).json({
                message: "Only admin can update product"
            });
        }
        try {
            const { id } = req.params;
            const updates = { ...req.body };

            if (req.files && req.files.length > 0) {
                updates.images = req.files.map(file => file.filename);
            }

            const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });

            if (!updatedProduct) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            res.status(200).json({
                message: "Product updated successfully",
                data: updatedProduct
            });

        } catch (error) {
            res.status(500).json({
                message: "Error updating product",
                error: error.message
            });
        }
    }
];

/* ========= DELETE PRODUCT ========= */

exports.deleteProduct = async (req, res) => {
     if (!req.session.isAdmin) {
            return res.status(403).json({
                message: "Only admin can delete product"
            });
        }
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Error deleting product",
            error: error.message
        });
    }
};
