import { Router } from "express";
import * as authController from '../controllers/authController.js'

const router = Router(); 

router.post('/register', authController.register); 
router.post('/verify-otp', authController.verifyOtp); 
router.post('/login', authController.login);
router.post('/resend-otp', authController.resendOtp); 


export default router ; 