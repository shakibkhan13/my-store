import { Router } from "express";

import {
  createAttribute,
  getAllAttributes,
  getAttributeById,
  updateAttribute,
  deleteAttribute,
  createAttributeValue,
  getAllAttributeValues,
  getAttributeValueById,
  updateAttributeValue,
  deleteAttributeValue,
} from "../controllers/attributeController.js";

const router = Router();


router.post("/values", createAttributeValue);

router.get("/values/all", getAllAttributeValues);

router.get("/values/:id", getAttributeValueById);

router.put("/values/:id", updateAttributeValue);

router.delete("/values/:id", deleteAttributeValue);


router.post("/", createAttribute);

router.get("/", getAllAttributes);

router.get("/:id", getAttributeById);

router.put("/:id", updateAttribute);

router.delete("/:id", deleteAttribute);

export default router;