
import { Request, Response, NextFunction } from "express";
import * as roleService from "../services/roleService.js"
import prisma from "../config/db.js";
import { serializeBigInt } from "../utils/serializeBigInt.js";


export const createRole = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const result = await roleService.createRole(req.body);

        return res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: serializeBigInt(result),
        });
    } catch (error) {
        next(error);
    };
};


export const getRoles = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {

        const result = await roleService.getRoles();

        return res.status(200).json({
            success: true,
            data: serializeBigInt(result),
        })

    } catch (error) {
        next(error);
    };
};

export const getRoleById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {

    try {

        const result = await roleService.getRoleById(String(req.params.id));

        return res.status(200).json({
            success: true,
            data: serializeBigInt(result)
        });
    } catch (error) {
        next(error);
    }
};

export const updateRole = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await roleService.updateRole(
            String(req.params.id),
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Role update successfully",
            data: serializeBigInt(result)
        });
    } catch (error) {
        next(error);
    }
};


export const deleteRole = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await roleService.deleteRole(String(req.params.id));

        return res.status(200).json({
            success: true,
            message: "Role deleted successfully",
            data: serializeBigInt(result),
        });

    } catch (error) {
        next(error);
    }
}


export const assignPermissions = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {

        const roleId = BigInt(String(req.params.id));
        const { permissionIds } = req.body;

        if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "PermissionIds must be a non-empty array",
            });
        }

        const role = await prisma.role.findUnique({
            where: {
                id: roleId
            },
        });

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found",
            });
        }

        const data = permissionIds.map((permissionId: string) => ({
            roleId,
            permissionId: BigInt(permissionId),
        }));

        await prisma.permissionRole.createMany({
            data,
            skipDuplicates: true,
        });

        const result = await prisma.role.findUnique({
            where: {
                id: roleId
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: "Permissions assigned successfully",
            data: serializeBigInt(result),
        });
    } catch (error) {
        next(error);
    }
};


export const removePermission = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {

        const roleId = BigInt(String(req.params.id));
        const permissionId = BigInt(String(req.params.permissionId));

        await prisma.permissionRole.delete({
            where: {
                roleId_permissionId: {
                    roleId,
                    permissionId,
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: "Permission removed from role.",
        });

    } catch (error) {
        next(error)
    }
}



// export const assignRoleToUser = async(
//     req: Request, 
//     res:Response, 
//     next: NextFunction, 
// )=>{
//     try {

//         const userId = BigInt(String(req.params.userId)); 
//         const { roleId } = req.body; 

//         if(!roleId){
//             return res.status(400).json({
//                 success: false, 
//                 message: "roleId is required.", 
//             });
//         }

//         const user = await prisma.user.findUnique({
//             where: {
//                 id: userId,
//             },
//         }); 

//         if(!user){
//             return res.status(400).json({
//                 success: false, 
//                 message: "User not found", 
//             });
//         }; 

//         const role = await prisma.role.findUnique({
//             where: {
//                 id: BigInt(roleId)
//             }
//         }); 

//         if(!role){
//             return res.status(404).json({
//                 success: false, 
//                 message: "Role not found", 
//             }); 
//         }; 

//         const result = await prisma.roleUser.create({
//             data: {
//                 userId, 
//                 roleId: BigInt(roleId),
//             }, include: {
//                 role: true, 
//                 user: true,
//             },
//         }); 

//         return res.status(201).json({
//             success: false, 
//             message: "Role assigned to user successfully",
//             data: serializeBigInt(result),
//         }); 

//     } catch (error: any) {
//         if(error.code === "P2002"){
//             return res.status(409).json({
//                 success: false,
//                 message: "Role already assigned to this user",
//             });
//         }
//         next(error);
//     }
// }; 


// export const assignRoleToUser = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const userId = BigInt(String(req.params.userId));
//         const { roleId } = req.body;

//         if (!roleId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "roleId is required.",
//             });
//         }

//         const roleIdBigInt = BigInt(String(roleId));

//         // Check User
//         const user = await prisma.user.findUnique({
//             where: {
//                 id: userId,
//             },
//         });

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found",
//             });
//         }

//         // Check Role
//         const role = await prisma.role.findUnique({
//             where: {
//                 id: roleIdBigInt,
//             },
//         });

//         if (!role) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Role not found",
//             });
//         }

//         const users = await prisma.user.findMany({
//     select: {
//         id: true,
//         firstName: true,
//         lastName: true,
//         email: true,
//     },
// });

// console.log("ALL USERS:", users);

//         // Assign Role
//         const result = await prisma.roleUser.create({
//             data: {
//                 userId,
//                 roleId: roleIdBigInt,
//             },
//             include: {
//                 role: true,
//                 user: true,
//             },
//         });

//         return res.status(201).json({
//             success: true,
//             message: "Role assigned to user successfully",
//             data: serializeBigInt(result),
//         });

//     } catch (error: any) {

//         console.error("Assign Role Error:", error);

//         if (error.code === "P2002") {
//             return res.status(409).json({
//                 success: false,
//                 message: "Role already assigned to this user",
//             });
//         }

//         if (
//             error instanceof SyntaxError ||
//             error?.message?.includes("Cannot convert")
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid userId or roleId",
//             });
//         }

//         next(error);
//     }
// };



export const assignRoleToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = BigInt(String(req.params.userId));
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "roleId is required.",
      });
    }

    const roleIdBigInt = BigInt(String(roleId));

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleIdBigInt },
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // (Optional) Log all users – you can remove this in production
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    console.log("ALL USERS:", users);

    // Assign the role to the user
    const result = await prisma.roleUser.create({
      data: {
        userId,
        roleId: roleIdBigInt,
      },
      include: {
        role: true,
        user: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Role assigned to user successfully",
      data: serializeBigInt(result),
    });
  } catch (error: any) {
    console.error("Assign Role Error:", error);

    // Prisma unique constraint violation (role already assigned)
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Role already assigned to this user",
      });
    }

    // Handle invalid BigInt conversion
    if (
      error instanceof SyntaxError ||
      error?.message?.includes("Cannot convert")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or roleId",
      });
    }

    // Pass other errors to Express error handler
    next(error);
  }
};



export const removeRoleFromUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = BigInt(String(req.params.userId));
        const roleId = BigInt(String(req.params.roleId));

        await prisma.roleUser.delete({
            where: {
                userId_roleId: {
                    userId,
                    roleId,
                },
            },
        });

        return res.status(200).json({
            success: true,
            message: "Role removed from user successfully."
        });
    } catch (error) {
        next(error);
    }
}









