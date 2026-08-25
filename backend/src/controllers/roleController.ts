
import { Request , Response , NextFunction } from "express";
import * as roleService from "../services/roleService.js"
import prisma from "../config/db.js";
import { serializeBigInt } from "../utils/serializeBigInt.js";


export const createRole = async(
    req: Request ,
    res: Response,
    next: NextFunction 
)=>{

    try {
        
        const result = await roleService.createRole(req.body); 

        return res.status(201).json({
            success: true , 
            message: "Role created successfully",
            data: serializeBigInt(result), 
        }); 
    } catch (error) {
        next(error); 
    };
}; 


export const getRoles = async(
    req: Request, 
    res: Response , 
    next: NextFunction,
) =>{
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

export const getRoleById = async(
    req: Request, 
    res: Response, 
    next: NextFunction, 
)=>{

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

export const updateRole = async(
    req: Request, 
    res: Response, 
    next: NextFunction, 
)=>{
    try {
        const result = await roleService.updateRole(
            String(req.params.id), 
            req.body
        ); 

        return res.status(200).json({
            success: true, 
            message : "Role update successfully", 
            data: serializeBigInt(result)
        }); 
    } catch (error) {
        next(error); 
    }
}; 


export const deleteRole = async (
    req: Request,
    res: Response, 
    next:NextFunction,
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






