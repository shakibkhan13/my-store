import { Router } from "express";
import * as permissionController from "../controllers/permissionController.js";


const router = Router();

router.post("/", permissionController.createPermission);

router.get("/", permissionController.getPermission);

router.get("/:id", permissionController.getPermissionById);

router.put("/:id", permissionController.updatePermission);

router.delete("/:id", permissionController.deletePermission);


export default router;


