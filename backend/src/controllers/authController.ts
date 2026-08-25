// import { Request, Response, NextFunction } from "express";
// import * as authService from '../services/authService.js';

// import { serializeBigInt } from "../utils/serializeBigInt.js";

// export const register = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { firstName, lastName, email, password } = req.body;

//         if (!firstName || !email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing required fields'
//             });
//         }

//         const result = await authService.registerUser({
//             firstName,
//             lastName,
//             email,
//             password
//         });
//         res.status(200).json({
//             success: true,
//             ...result
//         });
//     } catch (error: any) {
//         res.status(400).json({
//             success: false,
//             message: error.message,
//         });
//     }
// }

// export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { tempId, otp } = req.body;

//         if (!tempId || !otp) {
//             res.status(400).json({
//                 success: false,
//                 message: 'Missing tempId or OTP'
//             });
//         }

//         const result = await authService.verifyOtpAndCreateUser(tempId, otp);
//         const serializedResult = serializeBigInt(result);
//         res.status(201).json({
//             success: true,
//             ...serializedResult
//         });

//     } catch (error: any) {
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// export const login = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const {
//             email,
//             password
//         } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Email and password is required.',
//             });
//         }
//         const result = await authService.loginUser(email, password);
//         res.status(200).json({
//             success: true,
//             ...result
//         });
//     } catch (error: any) {
//         res.status(401).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
//     try {

//         const {email} = req.body; ; 

//         if(!email){
//             return res.status(400).json({
//                 success: false, 
//                 message: 'Email is required.'
//             }); 
//         }

//         const result = await authService.resendOtp(email); 
//         res.status(200).json({
//             success: true, 
//             ...result
//         }); 

//     } catch (error: any) {
//         res.status(401).json({
//             success: false,
//             message: error.message,
//         });
//     }
// }


import { Request, Response, NextFunction } from "express";
import * as authService from '../services/authService.js';
import { serializeBigInt } from "../utils/serializeBigInt.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const result = await authService.registerUser({
            firstName,
            lastName,
            email,
            password
        });
        // Serialize in case of any BigInt
        const serialized = serializeBigInt(result);
        res.status(200).json({
            success: true,
            ...serialized
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Accept either tempToken or tempId (client may send either)
        const { tempToken, tempId, otp } = req.body;
        const token = tempToken || tempId; // fallback

        if (!token || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Missing tempToken/tempId or OTP'
            });
        }

        const result = await authService.verifyOtpAndCreateUser(token, otp);
        const serializedResult = serializeBigInt(result);
        res.status(201).json({
            success: true,
            ...serializedResult
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.',
            });
        }

        const result = await authService.loginUser(email, password);
        // Serialize the result to convert BigInt (e.g., user.id) to string
        const serializedResult = serializeBigInt(result);
        res.status(200).json({
            success: true,
            ...serializedResult
        });
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required.'
            });
        }

        const result = await authService.resendOtp(email);
        const serialized = serializeBigInt(result);
        res.status(200).json({
            success: true,
            ...serialized
        });
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};