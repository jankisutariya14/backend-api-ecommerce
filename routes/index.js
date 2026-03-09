var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({
        message: "Ecommerce API is Live and Running!",
        status: "Success"
    });
});

const admin = require('../controller/AdminController');
const Product = require('../controller/ProductController');
const user = require('../controller/UserController');
const Cart = require('../controller/CartController');
const Order = require('../controller/OrderController');

router.post('/admin-login', admin.adminLogin);
router.get('/admin/users', admin.getAllUsers);
router.get('/admin/orders', admin.getAllOrders);
router.post('/admin-logout', admin.adminLogout);

router.post('/register', user.Register);
router.post('/login', user.Login);
router.post('/logout', user.Logout);
router.post('/verify', user.VerifyOTP);
router.post('/forget-password', user.ForgetPassword);
router.post('/verify-forget-otp', user.VerifyForgetOTP);
router.post('/reset-password', user.Resetpassword);

/* CART ROUTES */
router.post('/add-to-cart', Cart.addToCart);
router.get('/get-cart/:userId', Cart.getCart);
router.post('/remove-cart-item/:id', Cart.removeCartItem);
router.post('/update-cart-quantity/:id', Cart.updateQuantity);
router.post('/clear-cart/:userId', Cart.clearCart);

/* ORDER ROUTES */
router.post('/place-order', Order.placeOrder);
router.get('/get-orders/:userId', Order.getUserOrders);
router.get('/get-order/:id', Order.getOrderById);
router.post('/update-order-status/:id', Order.updateOrderStatus);
router.post('/delete-order/:id', Order.deleteOrder);


router.post('/add-product', Product.addProduct);
router.get('/products', Product.getAllProducts);
router.get('/get-product/:id', Product.getProductById);
router.put('/update-product/:id', Product.updateProduct);
router.delete('/delete-product/:id', Product.deleteProduct);

module.exports = router;
