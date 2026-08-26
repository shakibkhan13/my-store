import { Router } from "express";
import authRouter from "./authRoute.js";
import roleRoute from "./roleRoute.js";
import permissionRoute from "../routes/permissionRouter.js"; 
import vendorRoute from "./vendorRoute.js";
import vendorStaffRoute from "./vendorStaffRoute.js";
import vendorWalletRoute from "./vendorWalletRoute.js";
import vendorWithdrawalRoute from "./vendorWithdrawalRoute.js";

const router = Router(); 


router.use("/auth", authRouter); 

router.use("/roles", roleRoute); 

router.use("/permissions", permissionRoute); 

router.use("/vendors", vendorRoute);

router.use("/vendors", vendorStaffRoute);

router.use("/vendors", vendorWalletRoute);

router.use("/vendors", vendorWithdrawalRoute);




export default router ; 