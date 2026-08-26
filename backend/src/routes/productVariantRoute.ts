import { Router } from "express";

import {
    createVariant,
    getVariants,
    getVariantById,
    updateVariant,
    deleteVariant,
} from "../controllers/productVariantController.js";

const router = Router();

router.post(
    "/",
    createVariant
);

router.get(
    "/",
    getVariants
);

router.get(
    "/:id",
    getVariantById
);

router.put(
    "/:id",
    updateVariant
);

router.delete(
    "/:id",
    deleteVariant
);

export default router;