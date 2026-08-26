import { Router } from "express";
import * as roleController from "../controllers/roleController.js"; 

const router = Router(); 

router.post("/", roleController.createRole); 

router.get("/", roleController.getRoles); 

router.get("/:id", roleController.getRoleById);

router.put("/:id", roleController.updateRole); 

router.delete("/:id", roleController.deleteRole); 

router.post(
    "/:id/permissions", roleController.assignPermissions
); 

router.delete(
    "/:id/permissions/:permissionId", 
    roleController.removePermission
)

router.post(
    "/users/:userId",
    roleController.assignRoleToUser
); 

router.delete(
    "/users/:userId/:roleId", 
    roleController.removeRoleFromUser
); 

export default router; 

