import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export interface AuthRequest extends Request{
    user?: {
        userId: string; 
        email: string; 
    }; 
}; 


export const authMiddleware = (
    req: AuthRequest, 
    res: Response, 
    next: NextFunction
) =>{
    try {
        
        const authHeader = req.headers.authorization; 

        if(!authHeader || !authHeader.startsWith("Bearer")){
            return res.status(401).json({
                success: false, 
                message : "Authentication token is required", 
            }); 
        }

        const token = authHeader.split(" ")[1]; 

        if(!token){
            return res.status(401).json({
                success: false, 
                message: "Invalid authentication token", 
            }) ; 
        }; 

        const payload = verifyToken(token) as {
            userId: string; 
            email: string
        }; 

        req.user = {
            userId: payload.userId.toString(),
            email: payload.email, 
        }; 

        next(); 
    } catch (error) {
        return res.status(401).json({
            success: false, 
            message: "Invalid or expire token", 
        }); 
    }
} ; 


