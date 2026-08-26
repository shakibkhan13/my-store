import { Router } from "express";
import authRouter from "./authRoute.js";
import roleRoute from "./roleRoute.js";
import permissionRoute from "../routes/permissionRouter.js"; 

const router = Router(); 


router.use("/auth", authRouter); 
router.use("/roles", roleRoute); 
router.use("/permissions", permissionRoute); 




export default router ; 