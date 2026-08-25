import { Response , Request , NextFunction } from "express";
import prisma from "../config/db.js";
import { AuthRequest } from "./authMiddleware.js";


export const requireRole = (...allowedRoles: string[]) =>{
    return async (
        req: AuthRequest,
        res: Response, 
        next: NextFunction
    ) =>{
        try {
            if(!req.user?.userId){
                return res.status(401).json({
                    success: false, 
                    message:"Unauthorized", 
                }); 
            }

            const userId = BigInt(req.user.userId); 

            const userRoles = await prisma.roleUser.findMany({
                where: {
                    userId, 
                }, 
                include: {
                    role: true, 
                }, 
            }); 

            const hasRole = userRoles.some((item)=>{
                allowedRoles.includes(item.role.slug); 
            }); 

            if(!hasRole){
                return res.status(403).json({
                    success: false, 
                    message: "You do not have permission to access this resource", 
                }) ; 
            }

            next(); 
            
        } catch (error) {
            next(error)
        }
    } ; 
}; 


