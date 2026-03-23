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
const Wishlist = require('../controller/WishlistController');
const Contact = require('../controller/ContactController');

router.post('/toggle-wishlist', Wishlist.toggleWishlist);
router.get('/get-wishlist', Wishlist.getWishlist);
router.delete('/remove-wishlist-item/:id', Wishlist.removeFromWishlist);

router.post('/admin-login', admin.adminLogin);
router.get('/admin/users', admin.getAllUsers);
router.get('/admin/orders', admin.getAllOrders);
router.post('/admin-logout', admin.adminLogout);

router.post('/register', user.Register);
router.post('/login', user.Login);
router.post('/logout', user.Logout);
router.get('/profile', user.getProfile);
router.post('/verify-otp', user.VerifyOTP);              // login OTP verification
router.post('/resend-otp', user.ResendOTP);            // resend login OTP
router.post('/forget-password', user.ForgetPassword);  // request password reset
router.post('/verifyforgetotp', user.VerifyForgetOTP); // verify forget password OTP
router.post('/reset-password', user.Resetpassword);    // reset password


/* CART ROUTES */
router.post('/add-to-cart', Cart.addToCart);
router.get('/get-cart', Cart.getCart);
router.put('/update-cart-quantity/:id', Cart.updateQuantity);
router.delete('/remove-cart-item/:id', Cart.removeFromCart);
router.delete('/clear-cart', Cart.clearCart);

/* ORDER ROUTES */
router.post('/place-order', Order.placeOrder);
router.get('/get-orders/:userId', Order.getUserOrders);
router.get('/get-order/:id', Order.getOrderById);
router.post('/update-order-status/:id', Order.updateOrderStatus);
router.post('/delete-order/:id', Order.deleteOrder);


router.post('/add-product', Product.addProduct);
router.get('/products', Product.getAllProducts);
router.get("/filter-products", Product.filterProducts);
router.get('/get-product/:id', Product.getProductById);
router.put('/update-product/:id', Product.updateProduct);
router.delete('/delete-product/:id', Product.deleteProduct);

/* CONTACT INQUIRY ROUTES */
router.post('/submit-inquiry', Contact.submitInquiry);
router.get('/admin/inquiries', Contact.getInquiries);
router.delete('/admin/delete-inquiry/:id', Contact.deleteInquiry);

module.exports = router;
