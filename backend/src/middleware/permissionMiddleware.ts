import { Request, Response , NextFunction } from "express";
import prisma from "../config/db.js";
import { AuthRequest } from "./authMiddleware.js";


export const requirePermission = (...permissions: string[]) => {
    return async(
        req: AuthRequest, 
        res: Response, 
        next: NextFunction
    ) => {
        try {
            if(!req.user?.userId){
                return res.status(401).json({
                    success: false, 
                    message: "Unauthorized", 
                }); 
            }

            const userId = BigInt(req.user.userId); 

            const userRoles = await prisma.roleUser.findMany({
                where:{
                    userId, 
                }, 
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            }); 

            const userPermissions = userRoles.flatMap((roleUser) =>
                roleUser.role.permissions.map(
                    (rolePermission) => rolePermission.permission.slug
                )
            );

            const hasPermission = permissions.some((permission) =>
                userPermissions.includes(permission)
            );

            if(!hasPermission){
                return res.status(403).json({
                    success: false, 
                    message: "You do not have permission to perform this action", 
                }) ; 
            }

            next(); 
        } catch (error) {
            next(error); 
        }
    }; 
}; 




