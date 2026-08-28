// import {
//     Request,
//     Response,
//     NextFunction,
// } from "express";

// import * as cartService
//     from "../services/cartService.js";

// import {
//     serializeBigInt,
// } from "../utils/serializeBigInt.js";


// const getUserId = (req: Request): bigint => {
//     const user = (req as any).user;

//     if (!user?.id) {
//         throw new Error("Unauthorized.");
//     }

//     return BigInt(String(user.id));
// };


// // ============================================================
// // GET CART
// // ============================================================

// export const getCart = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const userId = getUserId(req);

//         const cart =
//             await cartService.getCart(userId);

//         return res.status(200).json({
//             success: true,
//             message: "Cart fetched successfully.",
//             data: serializeBigInt(cart),
//         });
//     } catch (error) {
//         next(error);
//     }
// };


// // ============================================================
// // ADD TO CART
// // ============================================================

// export const addToCart = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const userId = getUserId(req);

//         const {
//             variantId,
//             quantity = 1,
//         } = req.body;

//         if (!variantId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "variantId is required.",
//             });
//         }

//         const parsedQuantity =
//             Number(quantity);

//         if (
//             !Number.isInteger(
//                 parsedQuantity
//             ) ||
//             parsedQuantity <= 0
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message:
//                     "quantity must be a positive integer.",
//             });
//         }

//         const cartItem =
//             await cartService.addToCart({
//                 userId,
//                 variantId:
//                     BigInt(String(variantId)),
//                 quantity: parsedQuantity,
//             });

//         return res.status(201).json({
//             success: true,
//             message:
//                 "Product added to cart successfully.",
//             data: serializeBigInt(cartItem),
//         });
//     } catch (error) {
//         next(error);
//     }
// };


// // ============================================================
// // UPDATE CART ITEM
// // ============================================================

// export const updateCartItem = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const userId = getUserId(req);

//         const itemId = BigInt(
//             String(req.params.itemId)
//         );

//         const {
//             quantity,
//         } = req.body;

//         if (quantity === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: "quantity is required.",
//             });
//         }

//         const parsedQuantity =
//             Number(quantity);

//         if (
//             !Number.isInteger(
//                 parsedQuantity
//             ) ||
//             parsedQuantity <= 0
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message:
//                     "quantity must be a positive integer.",
//             });
//         }

//         const cartItem =
//             await cartService.updateCartItem({
//                 userId,
//                 itemId,
//                 quantity: parsedQuantity,
//             });

//         return res.status(200).json({
//             success: true,
//             message:
//                 "Cart item updated successfully.",
//             data: serializeBigInt(cartItem),
//         });
//     } catch (error) {
//         next(error);
//     }
// };


// // ============================================================
// // REMOVE CART ITEM
// // ============================================================

// export const removeCartItem = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const userId = getUserId(req);

//         const itemId = BigInt(
//             String(req.params.itemId)
//         );

//         await cartService.removeCartItem(
//             userId,
//             itemId
//         );

//         return res.status(200).json({
//             success: true,
//             message:
//                 "Cart item removed successfully.",
//         });
//     } catch (error) {
//         next(error);
//     }
// };


// // ============================================================
// // CLEAR CART
// // ============================================================

// export const clearCart = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const userId = getUserId(req);

//         await cartService.clearCart(userId);

//         return res.status(200).json({
//             success: true,
//             message:
//                 "Cart cleared successfully.",
//         });
//     } catch (error) {
//         next(error);
//     }
// };


import {
    Request,
    Response,
    NextFunction,
} from "express";

import * as cartService
    from "../services/cartService.js";

import {
    serializeBigInt,
} from "../utils/serializeBigInt.js";

import {
    AuthRequest,
} from "../middleware/authMiddleware.js";


// ============================================================
// GET USER ID FROM AUTHENTICATED USER
// ============================================================

const getUserId = (req: AuthRequest): bigint => {

    const user = req.user;

    if (!user?.userId) {
        throw new Error("Unauthorized.");
    }

    return BigInt(user.userId);
};


// ============================================================
// GET CART
// ============================================================

export const getCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const userId = getUserId(req);

        const cart =
            await cartService.getCart(userId);

        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully.",
            data: serializeBigInt(cart),
        });

    } catch (error) {
        next(error);
    }
};


// ============================================================
// ADD TO CART
// ============================================================

export const addToCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const userId = getUserId(req);

        const {
            variantId,
            quantity = 1,
        } = req.body;

        if (!variantId) {
            return res.status(400).json({
                success: false,
                message: "variantId is required.",
            });
        }

        const parsedQuantity =
            Number(quantity);

        if (
            !Number.isInteger(parsedQuantity) ||
            parsedQuantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "quantity must be a positive integer.",
            });
        }

        const cartItem =
            await cartService.addToCart({
                userId,
                variantId:
                    BigInt(String(variantId)),
                quantity: parsedQuantity,
            });

        return res.status(201).json({
            success: true,
            message:
                "Product added to cart successfully.",
            data: serializeBigInt(cartItem),
        });

    } catch (error) {
        next(error);
    }
};


// ============================================================
// UPDATE CART ITEM
// ============================================================

export const updateCartItem = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const userId = getUserId(req);

        const itemId =
            BigInt(String(req.params.itemId));

        const {
            quantity,
        } = req.body;

        if (quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "quantity is required.",
            });
        }

        const parsedQuantity =
            Number(quantity);

        if (
            !Number.isInteger(parsedQuantity) ||
            parsedQuantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "quantity must be a positive integer.",
            });
        }

        const cartItem =
            await cartService.updateCartItem({
                userId,
                itemId,
                quantity: parsedQuantity,
            });

        return res.status(200).json({
            success: true,
            message:
                "Cart item updated successfully.",
            data: serializeBigInt(cartItem),
        });

    } catch (error) {
        next(error);
    }
};


// ============================================================
// REMOVE CART ITEM
// ============================================================

export const removeCartItem = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const userId = getUserId(req);

        const itemId =
            BigInt(String(req.params.itemId));

        await cartService.removeCartItem(
            userId,
            itemId
        );

        return res.status(200).json({
            success: true,
            message:
                "Cart item removed successfully.",
        });

    } catch (error) {
        next(error);
    }
};


// ============================================================
// CLEAR CART
// ============================================================

export const clearCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const userId = getUserId(req);

        await cartService.clearCart(userId);

        return res.status(200).json({
            success: true,
            message:
                "Cart cleared successfully.",
        });

    } catch (error) {
        next(error);
    }
};