import { Router } from "express";
import authRouter from "./authRoute.js";
import roleRoute from "./roleRoute.js";
import permissionRoute from "../routes/permissionRouter.js"; 
import vendorRoute from "./vendorRoute.js";
import vendorStaffRoute from "./vendorStaffRoute.js";
import vendorWalletRoute from "./vendorWalletRoute.js";
import vendorWithdrawalRoute from "./vendorWithdrawalRoute.js";
import categoryRoute from "./categoryRoute.js";
import brandRoute from "./brandRoute.js";
import attributeRoute from "./attributeRoute.js";
import productRoute from "./productRoute.js";
import productVariantRoute from "./productVariantRoute.js";
import productImageRoute from "./productImageRoute.js";
import variantImageRoute from "./variantImageRoute.js";

const router = Router(); 


router.use("/auth", authRouter); 

router.use("/roles", roleRoute); 

router.use("/permissions", permissionRoute); 

router.use("/vendors", vendorRoute);

router.use("/vendors", vendorStaffRoute);

router.use("/vendors", vendorWalletRoute);

router.use("/vendors", vendorWithdrawalRoute);

router.use("/categories", categoryRoute);

router.use("/brands", brandRoute);

router.use("/attributes", attributeRoute);

router.use("/products", productRoute);

router.use("/product-variants", productVariantRoute);

router.use("/product-images", productImageRoute);

router.use("/variant-images",variantImageRoute);


export default router ; 