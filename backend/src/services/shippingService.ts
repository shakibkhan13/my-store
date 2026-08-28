import prisma from "../config/db.js";
import { OrderStatus, Prisma } from "@prisma/client";

// ============================================================
// TYPES
// ============================================================

export interface UpdateShippingInput {
    status?: OrderStatus;
    trackingNumber?: string | null;
    courierName?: string | null;
}

// ============================================================
// HELPERS
// ============================================================

const toBigInt = (
    value: string | number | bigint
): bigint => {
    try {
        return BigInt(value);
    } catch {
        throw new Error("Invalid ID.");
    }
};

// ============================================================
// CHECK VENDOR ACCESS
// ============================================================

const checkVendorAccess = async (
    vendorId: bigint,
    userId: bigint
) => {
    // --------------------------------------------------------
    // Find vendor
    // --------------------------------------------------------

    const vendor = await prisma.vendor.findUnique({
        where: {
            id: vendorId,
        },

        include: {
            staff: {
                where: {
                    userId,
                    isActive: true,
                },
            },
        },
    });

    // --------------------------------------------------------
    // Vendor not found
    // --------------------------------------------------------

    if (!vendor) {
        throw new Error(
            `Vendor ${vendorId.toString()} not found.`
        );
    }

    // --------------------------------------------------------
    // Check owner
    // --------------------------------------------------------

    const isOwner =
        vendor.ownerId === userId;

    // --------------------------------------------------------
    // Check staff
    // --------------------------------------------------------

    const isStaff =
        vendor.staff.length > 0;

    // --------------------------------------------------------
    // Permission
    // --------------------------------------------------------

    if (!isOwner && !isStaff) {
        throw new Error(
            "You do not have permission to manage shipping for this vendor."
        );
    }

    // --------------------------------------------------------
    // Soft deleted vendor
    //
    // Owner/staff access is valid only for active vendor.
    // --------------------------------------------------------

    if (vendor.deletedAt !== null) {
        throw new Error(
            `Vendor ${vendorId.toString()} has been deleted.`
        );
    }

    return vendor;
};

// ============================================================
// GET ORDER SHIPPING DETAILS
// CUSTOMER
// ============================================================

export const getOrderShippingDetails = async (
    orderIdInput: string | number | bigint,
    userIdInput?: string | number | bigint
) => {
    const orderId =
        toBigInt(orderIdInput);

    const userId =
        userIdInput !== undefined
            ? toBigInt(userIdInput)
            : undefined;

    const order =
        await prisma.order.findFirst({
            where: {
                id: orderId,

                ...(userId !== undefined
                    ? {
                          userId,
                      }
                    : {}),
            },

            select: {
                id: true,
                orderNumber: true,
                status: true,

                subtotal: true,
                discount: true,
                tax: true,
                shippingFee: true,
                grandTotal: true,
                currency: true,

                createdAt: true,
                updatedAt: true,

                // ------------------------------------------------
                // ADDRESSES
                // ------------------------------------------------

                addresses: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },

                // ------------------------------------------------
                // VENDOR ORDERS
                // ------------------------------------------------

                vendorOrders: {
                    orderBy: {
                        createdAt: "asc",
                    },

                    select: {
                        id: true,
                        orderId: true,
                        vendorId: true,

                        status: true,

                        subtotal: true,
                        discount: true,
                        shippingFee: true,
                        total: true,

                        commission: true,
                        vendorAmount: true,

                        trackingNumber: true,
                        courierName: true,

                        shippedAt: true,
                        deliveredAt: true,
                        cancelledAt: true,

                        createdAt: true,
                        updatedAt: true,

                        // ----------------------------------------
                        // VENDOR
                        // ----------------------------------------

                        vendor: {
                            select: {
                                id: true,
                                uuid: true,
                                name: true,
                                slug: true,
                                logoUrl: true,
                                phone: true,
                                email: true,
                            },
                        },

                        // ----------------------------------------
                        // ITEMS
                        // ----------------------------------------

                        items: {
                            orderBy: {
                                createdAt: "asc",
                            },

                            select: {
                                id: true,

                                productId: true,
                                variantId: true,

                                productName: true,
                                sku: true,

                                unitPrice: true,
                                quantity: true,
                                total: true,

                                product: {
                                    select: {
                                        id: true,
                                        uuid: true,
                                        name: true,
                                        slug: true,

                                        images: {
                                            where: {
                                                isPrimary: true,
                                            },

                                            take: 1,

                                            select: {
                                                id: true,
                                                imageUrl: true,
                                                altText: true,
                                            },
                                        },
                                    },
                                },

                                variant: {
                                    select: {
                                        id: true,
                                        sku: true,
                                        barcode: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

    if (!order) {
        throw new Error(
            "Order not found."
        );
    }

    return order;
};

// ============================================================
// GET VENDOR SHIPPING DETAILS
// VENDOR DASHBOARD
// ============================================================

export const getVendorShippingDetails = async (
    vendorIdInput: string | number | bigint,
    userIdInput: string | number | bigint
) => {
    const vendorId =
        toBigInt(vendorIdInput);

    const userId =
        toBigInt(userIdInput);

    // --------------------------------------------------------
    // Verify owner/staff access
    // --------------------------------------------------------

    await checkVendorAccess(
        vendorId,
        userId
    );

    // --------------------------------------------------------
    // Get vendor orders
    // --------------------------------------------------------

    const vendorOrders =
        await prisma.vendorOrder.findMany({
            where: {
                vendorId,

                order: {
                    status: {
                        not: OrderStatus.CANCELLED,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },

            select: {
                id: true,
                orderId: true,
                vendorId: true,

                status: true,

                subtotal: true,
                discount: true,
                shippingFee: true,
                total: true,

                commission: true,
                vendorAmount: true,

                trackingNumber: true,
                courierName: true,

                shippedAt: true,
                deliveredAt: true,
                cancelledAt: true,

                createdAt: true,
                updatedAt: true,

                // ------------------------------------------------
                // PARENT ORDER
                // ------------------------------------------------

                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true,
                        createdAt: true,

                        addresses: {
                            where: {
                                type: "shipping",
                            },

                            orderBy: {
                                createdAt: "asc",
                            },

                            take: 1,
                        },
                    },
                },

                // ------------------------------------------------
                // ITEMS
                // ------------------------------------------------

                items: {
                    orderBy: {
                        createdAt: "asc",
                    },

                    select: {
                        id: true,

                        productId: true,
                        variantId: true,

                        productName: true,
                        sku: true,

                        unitPrice: true,
                        quantity: true,
                        total: true,
                    },
                },
            },
        });

    return vendorOrders;
};

// ============================================================
// GET SINGLE VENDOR ORDER SHIPPING
// ============================================================

export const getVendorOrderShipping = async (
    vendorOrderIdInput: string | number | bigint,
    userIdInput: string | number | bigint
) => {
    const vendorOrderId =
        toBigInt(vendorOrderIdInput);

    const userId =
        toBigInt(userIdInput);

    // --------------------------------------------------------
    // Find vendor order
    // --------------------------------------------------------

    const vendorOrder =
        await prisma.vendorOrder.findUnique({
            where: {
                id: vendorOrderId,
            },

            include: {
                vendor: true,

                order: {
                    include: {
                        addresses: true,
                    },
                },

                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: {
                                        isPrimary: true,
                                    },

                                    take: 1,
                                },
                            },
                        },

                        variant: true,
                    },
                },
            },
        });

    if (!vendorOrder) {
        throw new Error(
            "Vendor order not found."
        );
    }

    // --------------------------------------------------------
    // Verify vendor access
    // --------------------------------------------------------

    await checkVendorAccess(
        vendorOrder.vendorId,
        userId
    );

    return vendorOrder;
};

// ============================================================
// VALIDATE SHIPPING STATUS TRANSITION
// ============================================================

const validateStatusTransition = (
    currentStatus: OrderStatus,
    nextStatus: OrderStatus
) => {
    // --------------------------------------------------------
    // Same status
    // --------------------------------------------------------

    if (currentStatus === nextStatus) {
        return;
    }

    // --------------------------------------------------------
    // Cancelled
    // --------------------------------------------------------

    if (
        currentStatus ===
        OrderStatus.CANCELLED
    ) {
        throw new Error(
            "A cancelled vendor order cannot be moved to another status."
        );
    }

    // --------------------------------------------------------
    // Delivered
    // --------------------------------------------------------

    if (
        currentStatus ===
        OrderStatus.DELIVERED
    ) {
        throw new Error(
            "A delivered vendor order cannot be moved to another shipping status."
        );
    }

    // --------------------------------------------------------
    // Allowed transitions
    // --------------------------------------------------------

    const allowedTransitions:
        Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.PENDING]: [
                OrderStatus.CONFIRMED,
                OrderStatus.PROCESSING,
                OrderStatus.SHIPPED,
                OrderStatus.CANCELLED,
            ],

            [OrderStatus.CONFIRMED]: [
                OrderStatus.PROCESSING,
                OrderStatus.SHIPPED,
                OrderStatus.CANCELLED,
            ],

            [OrderStatus.PROCESSING]: [
                OrderStatus.SHIPPED,
                OrderStatus.CANCELLED,
            ],

            [OrderStatus.SHIPPED]: [
                OrderStatus.DELIVERED,
                OrderStatus.CANCELLED,
            ],

            [OrderStatus.DELIVERED]: [],

            [OrderStatus.CANCELLED]: [],

            [OrderStatus.REFUNDED]: [],
        };

    const allowed =
        allowedTransitions[currentStatus] ?? [];

    if (!allowed.includes(nextStatus)) {
        throw new Error(
            `Invalid shipping status transition: ${currentStatus} -> ${nextStatus}.`
        );
    }
};

// ============================================================
// CALCULATE PARENT ORDER STATUS
// ============================================================

const calculateOrderStatus = (
    statuses: OrderStatus[]
): OrderStatus => {
    if (!statuses.length) {
        return OrderStatus.PENDING;
    }

    // --------------------------------------------------------
    // Remove cancelled vendor orders
    // --------------------------------------------------------

    const activeStatuses =
        statuses.filter(
            (status) =>
                status !==
                OrderStatus.CANCELLED
        );

    // --------------------------------------------------------
    // All cancelled
    // --------------------------------------------------------

    if (!activeStatuses.length) {
        return OrderStatus.CANCELLED;
    }

    // --------------------------------------------------------
    // All delivered
    // --------------------------------------------------------

    if (
        activeStatuses.every(
            (status) =>
                status ===
                OrderStatus.DELIVERED
        )
    ) {
        return OrderStatus.DELIVERED;
    }

    // --------------------------------------------------------
    // Any shipped/delivered
    // --------------------------------------------------------

    if (
        activeStatuses.some(
            (status) =>
                status ===
                OrderStatus.SHIPPED
        ) ||
        activeStatuses.some(
            (status) =>
                status ===
                OrderStatus.DELIVERED
        )
    ) {
        return OrderStatus.SHIPPED;
    }

    // --------------------------------------------------------
    // Any processing
    // --------------------------------------------------------

    if (
        activeStatuses.some(
            (status) =>
                status ===
                OrderStatus.PROCESSING
        )
    ) {
        return OrderStatus.PROCESSING;
    }

    // --------------------------------------------------------
    // Any confirmed
    // --------------------------------------------------------

    if (
        activeStatuses.some(
            (status) =>
                status ===
                OrderStatus.CONFIRMED
        )
    ) {
        return OrderStatus.CONFIRMED;
    }

    // --------------------------------------------------------
    // Default
    // --------------------------------------------------------

    return OrderStatus.PENDING;
};

// ============================================================
// UPDATE VENDOR SHIPPING
// ============================================================

export const updateVendorShipping = async (
    vendorOrderIdInput:
        string | number | bigint,

    userIdInput:
        string | number | bigint,

    data: UpdateShippingInput
) => {
    const vendorOrderId =
        toBigInt(vendorOrderIdInput);

    const userId =
        toBigInt(userIdInput);

    // --------------------------------------------------------
    // Validate update data
    // --------------------------------------------------------

    if (
        data.status === undefined &&
        data.trackingNumber === undefined &&
        data.courierName === undefined
    ) {
        throw new Error(
            "At least one shipping field is required."
        );
    }

    // --------------------------------------------------------
    // Find vendor order
    // --------------------------------------------------------

    const vendorOrder =
        await prisma.vendorOrder.findUnique({
            where: {
                id: vendorOrderId,
            },

            select: {
                id: true,
                orderId: true,
                vendorId: true,
                status: true,

                trackingNumber: true,
                courierName: true,

                shippedAt: true,
                deliveredAt: true,
                cancelledAt: true,
            },
        });

    if (!vendorOrder) {
        throw new Error(
            "Vendor order not found."
        );
    }

    // --------------------------------------------------------
    // Verify vendor access
    // --------------------------------------------------------

    await checkVendorAccess(
        vendorOrder.vendorId,
        userId
    );

    // --------------------------------------------------------
    // Validate status transition
    // --------------------------------------------------------

    if (data.status !== undefined) {
        validateStatusTransition(
            vendorOrder.status,
            data.status
        );
    }

    const now = new Date();

    const updateData:
        Prisma.VendorOrderUpdateInput = {};

    // ========================================================
    // TRACKING NUMBER
    // ========================================================

    if (
        data.trackingNumber !== undefined
    ) {
        updateData.trackingNumber =
            data.trackingNumber
                ?.trim() || null;
    }

    // ========================================================
    // COURIER NAME
    // ========================================================

    if (
        data.courierName !== undefined
    ) {
        updateData.courierName =
            data.courierName
                ?.trim() || null;
    }

    // ========================================================
    // STATUS
    // ========================================================

    if (data.status !== undefined) {
        updateData.status =
            data.status;

        // ----------------------------------------------------
        // SHIPPED
        // ----------------------------------------------------

        if (
            data.status ===
            OrderStatus.SHIPPED
        ) {
            updateData.shippedAt =
                vendorOrder.shippedAt ??
                now;
        }

        // ----------------------------------------------------
        // DELIVERED
        // ----------------------------------------------------

        if (
            data.status ===
            OrderStatus.DELIVERED
        ) {
            updateData.deliveredAt =
                vendorOrder.deliveredAt ??
                now;

            if (
                !vendorOrder.shippedAt
            ) {
                updateData.shippedAt =
                    now;
            }
        }

        // ----------------------------------------------------
        // CANCELLED
        // ----------------------------------------------------

        if (
            data.status ===
            OrderStatus.CANCELLED
        ) {
            updateData.cancelledAt =
                vendorOrder.cancelledAt ??
                now;
        }
    }

    // ========================================================
    // TRANSACTION
    // ========================================================

    const result =
        await prisma.$transaction(
            async (tx) => {
                // --------------------------------------------
                // Update vendor order
                // --------------------------------------------

                const updatedVendorOrder =
                    await tx.vendorOrder.update({
                        where: {
                            id: vendorOrderId,
                        },

                        data: updateData,

                        include: {
                            vendor: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                },
                            },

                            items: {
                                select: {
                                    id: true,
                                    productId: true,
                                    variantId: true,
                                    productName: true,
                                    sku: true,
                                    quantity: true,
                                    unitPrice: true,
                                    total: true,
                                },
                            },
                        },
                    });

                // --------------------------------------------
                // Get all vendor orders
                // --------------------------------------------

                const allVendorOrders =
                    await tx.vendorOrder.findMany({
                        where: {
                            orderId:
                                vendorOrder.orderId,
                        },

                        select: {
                            status: true,
                        },
                    });

                // --------------------------------------------
                // Calculate parent order status
                // --------------------------------------------

                const orderStatus =
                    calculateOrderStatus(
                        allVendorOrders.map(
                            (item) =>
                                item.status
                        )
                    );

                // --------------------------------------------
                // Update parent order
                // --------------------------------------------

                await tx.order.update({
                    where: {
                        id: vendorOrder.orderId,
                    },

                    data: {
                        status:
                            orderStatus,
                    },
                });

                return updatedVendorOrder;
            }
        );

    return result;
};

// ============================================================
// UPDATE SHIPPING STATUS ONLY
// ============================================================

export const updateVendorShippingStatus =
    async (
        vendorOrderIdInput:
            string | number | bigint,

        userIdInput:
            string | number | bigint,

        status: OrderStatus
    ) => {
        return updateVendorShipping(
            vendorOrderIdInput,
            userIdInput,
            {
                status,
            }
        );
    };

// ============================================================
// UPDATE TRACKING INFORMATION
// ============================================================

export const updateTrackingInformation =
    async (
        vendorOrderIdInput:
            string | number | bigint,

        userIdInput:
            string | number | bigint,

        trackingNumber: string,

        courierName?: string
    ) => {
        const cleanTrackingNumber =
            trackingNumber?.trim();

        if (!cleanTrackingNumber) {
            throw new Error(
                "Tracking number is required."
            );
        }

        return updateVendorShipping(
            vendorOrderIdInput,
            userIdInput,
            {
                trackingNumber:
                    cleanTrackingNumber,

                ...(courierName !==
                undefined
                    ? {
                          courierName:
                              courierName.trim() ||
                              null,
                      }
                    : {}),
            }
        );
    };