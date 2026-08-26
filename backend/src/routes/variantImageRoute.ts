import { Router } from "express";

import { upload } from "../middleware/uploadMiddleware.js";

import {
    uploadVariantImage,
    getVariantImages,
    deleteVariantImage,
} from "../controllers/variantImageController.js";

const router = Router();

router.post(
    "/",
    upload.single("image"),
    uploadVariantImage
);

router.get(
    "/variant/:variantId",
    getVariantImages
);

router.delete(
    "/:id",
    deleteVariantImage
);

export default router;