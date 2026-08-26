import { Request, Response, NextFunction } from "express";
import * as permissionService from "../services/permissionService.js";
import { serializeBigInt } from "../utils/serializeBigInt.js";


export const createPermission = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {

        const result = await permissionService.createPermission(req.body);

        return res.status(201).json({
            success: true,
            message: "Permission created successfully.",
            data: serializeBigInt(result),
        });
    } catch (error) {
        next(error);
    }
};

export const getPermission = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const result = await permissionService.getPermission();

        return res.status(200).json({
            success: true,
            data: serializeBigInt(result),
        });

    } catch (error) {
        next(error);
    }
};


export const getPermissionById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {

        const result = await permissionService.getPermissionById(
            String(req.params.id)
        )

        return res.status(200).json({
            success: true,
            data: serializeBigInt(result),
        });

    } catch (error) {
        next(error);
    };
};


export const updatePermission = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {

        const result = await permissionService.updatePermission(
            String(req.params.id),
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Permission updated successfully.",
            data: serializeBigInt(result),
        });
    } catch (error) {
        next(error);
    }
};


export const deletePermission = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await permissionService.deletePermission(
            String(req.params.id)
        )

        return res.status(200).json({
            success: true,
            message: "Permission deleted successfully",
            data: serializeBigInt(result),
        });
    } catch (error) {
        next(error);
    };
};


