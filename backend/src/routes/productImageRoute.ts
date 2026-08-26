import { Router } from "express";

import { upload } from "../middleware/uploadMiddleware.js";

import {
    uploadProductImage,
    getProductImages,
    getProductImageById,
    updateProductImage,
    deleteProductImage,
} from "../controllers/productImageController.js";

const router = Router();

router.post(
    "/",
    upload.single("image"),
    uploadProductImage
);

router.get(
    "/product/:productId",
    getProductImages
);

router.get(
    "/:id",
    getProductImageById
);

router.put(
    "/:id",
    upload.single("image"),
    updateProductImage
);

router.delete(
    "/:id",
    deleteProductImage
);

export default router;