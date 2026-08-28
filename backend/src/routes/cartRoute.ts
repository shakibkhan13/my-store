import {
    Router,
} from "express";

import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
} from "../controllers/cartController.js";

import {
    authMiddleware,
} from "../middleware/authMiddleware.js";

const router = Router();


// Get current customer cart
router.get(
    "/",
    authMiddleware,
    getCart
);

  
// Add product variant to cart
router.post(
    "/add",
    authMiddleware,
    addToCart
);


// Update cart item quantity
router.patch(
    "/item/:itemId",
    authMiddleware,
    updateCartItem
);


// Remove cart item
router.delete(
    "/item/:itemId",
    authMiddleware,
    removeCartItem
);


// Clear complete cart
router.delete(
    "/clear",
    authMiddleware,
    clearCart
);

export default router;