import { Request, Response, NextFunction } from "express";
import * as attributeService from "../services/attributeService.js";
import { serializeBigInt } from "../utils/serializeBigInt.js";

// ============================================================
// CREATE ATTRIBUTE
// ============================================================

export const createAttribute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, slug, type, isGlobal } = req.body;

    if (!name || !slug || !type) {
      return res.status(400).json({
        success: false,
        message: "name, slug and type are required.",
      });
    }

    const attribute = await attributeService.createAttribute({
      name,
      slug,
      type,
      isGlobal,
    });

    return res.status(201).json({
      success: true,
      message: "Attribute created successfully.",
      data: serializeBigInt(attribute),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL ATTRIBUTES
// ============================================================

export const getAllAttributes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const attributes = await attributeService.getAllAttributes();

    return res.status(200).json({
      success: true,
      message: "Attributes fetched successfully.",
      data: serializeBigInt(attributes),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET SINGLE ATTRIBUTE
// ============================================================

export const getAttributeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = BigInt(String(req.params.id));

    const attribute = await attributeService.getAttributeById(id);

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Attribute fetched successfully.",
      data: serializeBigInt(attribute),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE ATTRIBUTE
// ============================================================

export const updateAttribute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = BigInt(String(req.params.id));

    const { name, slug, type, isGlobal } = req.body;

    const existingAttribute =
      await attributeService.getAttributeById(id);

    if (!existingAttribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found.",
      });
    }

    const attribute = await attributeService.updateAttribute(id, {
      name,
      slug,
      type,
      isGlobal,
    });

    return res.status(200).json({
      success: true,
      message: "Attribute updated successfully.",
      data: serializeBigInt(attribute),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE ATTRIBUTE
// ============================================================

export const deleteAttribute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = BigInt(String(req.params.id));

    const existingAttribute =
      await attributeService.getAttributeById(id);

    if (!existingAttribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found.",
      });
    }

    await attributeService.deleteAttribute(id);

    return res.status(200).json({
      success: true,
      message: "Attribute deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// CREATE ATTRIBUTE VALUE
// ============================================================

export const createAttributeValue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { attributeId, value, slug, sortOrder } = req.body;

    if (!attributeId || !value) {
      return res.status(400).json({
        success: false,
        message: "attributeId and value are required.",
      });
    }

    const attribute = await attributeService.getAttributeById(
      BigInt(String(attributeId))
    );

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found.",
      });
    }

    const attributeValue =
      await attributeService.createAttributeValue({
        attributeId: BigInt(String(attributeId)),
        value,
        slug,
        sortOrder:
          sortOrder !== undefined ? Number(sortOrder) : 0,
      });

    return res.status(201).json({
      success: true,
      message: "Attribute value created successfully.",
      data: serializeBigInt(attributeValue),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL ATTRIBUTE VALUES
// ============================================================

export const getAllAttributeValues = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const attributeId = req.query.attributeId
      ? BigInt(String(req.query.attributeId))
      : undefined;

    const values =
      await attributeService.getAllAttributeValues(attributeId);

    return res.status(200).json({
      success: true,
      message: "Attribute values fetched successfully.",
      data: serializeBigInt(values),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET SINGLE ATTRIBUTE VALUE
// ============================================================

export const getAttributeValueById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = BigInt(String(req.params.id));

    const attributeValue =
      await attributeService.getAttributeValueById(id);

    if (!attributeValue) {
      return res.status(404).json({
        success: false,
        message: "Attribute value not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Attribute value fetched successfully.",
      data: serializeBigInt(attributeValue),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE ATTRIBUTE VALUE
// ============================================================

export const updateAttributeValue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = BigInt(String(req.params.id));

    const { value, slug, sortOrder } = req.body;

    const existing =
      await attributeService.getAttributeValueById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Attribute value not found.",
      });
    }

    const attributeValue =
      await attributeService.updateAttributeValue(id, {
        value,
        slug,
        sortOrder:
          sortOrder !== undefined ? Number(sortOrder) : undefined,
      });

    return res.status(200).json({
      success: true,
      message: "Attribute value updated successfully.",
      data: serializeBigInt(attributeValue),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE ATTRIBUTE VALUE
// ============================================================

export const deleteAttributeValue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = BigInt(String(req.params.id));

    const existing =
      await attributeService.getAttributeValueById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Attribute value not found.",
      });
    }

    await attributeService.deleteAttributeValue(id);

    return res.status(200).json({
      success: true,
      message: "Attribute value deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};