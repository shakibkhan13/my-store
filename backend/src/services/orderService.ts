import {
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    Prisma,
} from "@prisma/client";

import prisma from "../config/db.js";

import { generateOrderNumber } from "../utils/orderNumber.js";

import {
    orderConfirmationEmail,
} from "../Templates/orderConfirmationEmail.js";

import {
    sendEmail,
} from "./emailService.js";


// ============================================================
// TYPES
// ============================================================

interface CreateOrderInput {

    userId: bigint;

    shippingAddress: {

        fullName: string;

        phone: string;

        addressLine1: string;

        addressLine2?: string;

        city?: string;

        state?: string;

        postalCode?: string;

        country?: string;

    };

    billingAddress?: {

        fullName: string;

        phone: string;

        addressLine1: string;

        addressLine2?: string;

        city?: string;

        state?: string;

        postalCode?: string;

        country?: string;

    };

    paymentMethod: PaymentMethod;

    shippingFee?: number;

    discount?: number;

    tax?: number;

    customerNote?: string;

}


// ============================================================
// CREATE ORDER
// ============================================================

export const createOrder = async (
    input: CreateOrderInput,
) => {

    const {
        userId,
        shippingAddress,
        billingAddress,
        paymentMethod,
        shippingFee = 0,
        discount = 0,
        tax = 0,
        customerNote,
    } = input;


    return prisma.$transaction(
        async (tx) => {

            // --------------------------------------------------------
            // Find active cart
            // --------------------------------------------------------

            const cart =
                await tx.cart.findFirst({

                    where: {

                        userId,

                        status: "active",

                    },

                    include: {

                        items: {

                            include: {

                                variant: {

                                    include: {

                                        product: {

                                            include: {

                                                vendor: true,

                                            },

                                        },

                                        attributes: {

                                            include: {

                                                attribute: true,

                                                attributeValue:
                                                    true,

                                            },

                                        },

                                    },

                                },

                            },

                        },

                    },

                });


            if (!cart) {

                throw new Error(
                    "Active cart not found.",
                );

            }


            if (cart.items.length === 0) {

                throw new Error(
                    "Your cart is empty.",
                );

            }


            // --------------------------------------------------------
            // Validate products & stock
            // --------------------------------------------------------

            for (const item of cart.items) {

                const variant =
                    item.variant;


                if (!variant.isActive) {

                    throw new Error(
                        `Product variant ${variant.sku} is not available.`,
                    );

                }


                const availableStock =
                    variant.stockQuantity -
                    variant.reservedQuantity;


                if (
                    availableStock <
                    item.quantity
                ) {

                    throw new Error(
                        `Insufficient stock for ${variant.product.name}. Available stock: ${availableStock}.`,
                    );

                }

            }


            // --------------------------------------------------------
            // Calculate subtotal
            // --------------------------------------------------------

            let subtotal =
                new Prisma.Decimal(0);


            for (const item of cart.items) {

                const lineTotal =
                    item.variant.price.mul(
                        item.quantity,
                    );

                subtotal =
                    subtotal.add(lineTotal);

            }


            const discountDecimal =
                new Prisma.Decimal(discount);


            const taxDecimal =
                new Prisma.Decimal(tax);


            const shippingDecimal =
                new Prisma.Decimal(shippingFee);


            const grandTotal =
                subtotal
                    .sub(discountDecimal)
                    .add(taxDecimal)
                    .add(shippingDecimal);


            if (grandTotal.lessThan(0)) {

                throw new Error(
                    "Grand total cannot be negative.",
                );

            }


            // --------------------------------------------------------
            // Generate unique order number
            // --------------------------------------------------------

            let orderNumber =
                generateOrderNumber();


            let existingOrder =
                await tx.order.findUnique({

                    where: {

                        orderNumber,

                    },

                });


            while (existingOrder) {

                orderNumber =
                    generateOrderNumber();


                existingOrder =
                    await tx.order.findUnique({

                        where: {

                            orderNumber,

                        },

                    });

            }


            // --------------------------------------------------------
            // Create Order
            // --------------------------------------------------------

            const order =
                await tx.order.create({

                    data: {

                        orderNumber,

                        userId,

                        status:
                            OrderStatus.PENDING,

                        subtotal,

                        discount:
                            discountDecimal,

                        tax:
                            taxDecimal,

                        shippingFee:
                            shippingDecimal,

                        grandTotal,

                        currency: "BDT",

                        customerNote,

                    },

                });


            // --------------------------------------------------------
            // Addresses
            // --------------------------------------------------------

            await tx.orderAddress.create({

                data: {

                    orderId:
                        order.id,

                    type:
                        "shipping",

                    fullName:
                        shippingAddress.fullName,

                    phone:
                        shippingAddress.phone,

                    addressLine1:
                        shippingAddress.addressLine1,

                    addressLine2:
                        shippingAddress.addressLine2,

                    city:
                        shippingAddress.city,

                    state:
                        shippingAddress.state,

                    postalCode:
                        shippingAddress.postalCode,

                    country:
                        shippingAddress.country ??
                        "Bangladesh",

                },

            });


            const billing =
                billingAddress ??
                shippingAddress;


            await tx.orderAddress.create({

                data: {

                    orderId:
                        order.id,

                    type:
                        "billing",

                    fullName:
                        billing.fullName,

                    phone:
                        billing.phone,

                    addressLine1:
                        billing.addressLine1,

                    addressLine2:
                        billing.addressLine2,

                    city:
                        billing.city,

                    state:
                        billing.state,

                    postalCode:
                        billing.postalCode,

                    country:
                        billing.country ??
                        "Bangladesh",

                },

            });


            // --------------------------------------------------------
            // Group cart items by vendor
            // --------------------------------------------------------

            const vendorGroups =
                new Map<
                    string,
                    typeof cart.items
                >();


            for (const item of cart.items) {

                const vendorId =
                    item.variant.product.vendorId
                        .toString();


                if (!vendorGroups.has(vendorId)) {

                    vendorGroups.set(
                        vendorId,
                        [],
                    );

                }


                vendorGroups
                    .get(vendorId)!
                    .push(item);

            }


            // --------------------------------------------------------
            // Create Vendor Orders + Items
            // --------------------------------------------------------

            for (
                const [
                    vendorIdString,
                    vendorItems,
                ]
                of vendorGroups
            ) {

                const vendorId =
                    BigInt(vendorIdString);


                const vendorSubtotal =
                    vendorItems.reduce(

                        (
                            sum,
                            item,
                        ) => {

                            const total =
                                item.variant.price.mul(
                                    item.quantity,
                                );

                            return sum.add(total);

                        },

                        new Prisma.Decimal(0),

                    );


                const vendor =
                    vendorItems[0]
                        .variant
                        .product
                        .vendor;


                const commissionRate =
                    vendor.commissionRate;


                const vendorCommission =
                    vendorSubtotal
                        .mul(commissionRate)
                        .div(100);


                const vendorAmount =
                    vendorSubtotal.sub(
                        vendorCommission,
                    );


                // ------------------------------------------------------
                // Vendor Order
                // ------------------------------------------------------

                const vendorOrder =
                    await tx.vendorOrder.create({

                        data: {

                            orderId:
                                order.id,

                            vendorId,

                            status:
                                OrderStatus.PENDING,

                            subtotal:
                                vendorSubtotal,

                            discount:
                                0,

                            shippingFee:
                                0,

                            total:
                                vendorSubtotal,

                            commission:
                                vendorCommission,

                            vendorAmount,

                        },

                    });


                // ------------------------------------------------------
                // Order Items
                // ------------------------------------------------------

                for (
                    const cartItem
                    of vendorItems
                ) {

                    const variant =
                        cartItem.variant;


                    const product =
                        variant.product;


                    const itemTotal =
                        variant.price.mul(
                            cartItem.quantity,
                        );


                    const commissionAmount =
                        itemTotal
                            .mul(
                                commissionRate,
                            )
                            .div(100);


                    await tx.orderItem.create({

                        data: {

                            orderId:
                                order.id,

                            vendorOrderId:
                                vendorOrder.id,

                            vendorId,

                            productId:
                                product.id,

                            variantId:
                                variant.id,

                            productName:
                                product.name,

                            sku:
                                variant.sku,

                            unitPrice:
                                variant.price,

                            quantity:
                                cartItem.quantity,

                            total:
                                itemTotal,

                            commissionRate,

                            commissionAmount,

                        },

                    });


                    // ----------------------------------------------------
                    // Reserve stock
                    // ----------------------------------------------------

                    await tx.productVariant.update({

                        where: {

                            id:
                                variant.id,

                        },

                        data: {

                            reservedQuantity: {

                                increment:
                                    cartItem.quantity,

                            },

                        },

                    });

                }

            }


            // --------------------------------------------------------
            // Create payment
            // --------------------------------------------------------

            await tx.orderPayment.create({

                data: {

                    orderId:
                        order.id,

                    paymentMethod,

                    status:
                        paymentMethod ===
                            PaymentMethod.COD
                            ? PaymentStatus.PENDING
                            : PaymentStatus.PENDING,

                    amount:
                        grandTotal,

                },

            });


            // --------------------------------------------------------
            // Clear cart
            // --------------------------------------------------------

            await tx.cartItem.deleteMany({

                where: {

                    cartId:
                        cart.id,

                },

            });


            // --------------------------------------------------------
            // Return complete order
            // --------------------------------------------------------

            return tx.order.findUnique({

                where: {

                    id:
                        order.id,

                },

                include: {

                    items: true,

                    vendorOrders: {

                        include: {

                            vendor: true,

                            items: true,

                        },

                    },

                    addresses: true,

                    payments: true,

                },

            });

        },
    );

};


// ============================================================
// GET ORDER BY ID
// ============================================================

export const getOrderById = async (
    orderId: bigint,
    userId: bigint,
) => {

    const order =
        await prisma.order.findFirst({

            where: {

                id:
                    orderId,

                userId:
                    userId,

            },

            include: {

                items: {

                    include: {

                        product: true,

                        variant: true,

                        vendor: true,

                    },

                },

                vendorOrders: {

                    include: {

                        vendor: true,

                        items: true,

                    },

                },

                addresses: true,

                payments: true,

            },

        });


    if (!order) {

        throw new Error(
            "Order not found.",
        );

    }


    return order;

};


// ============================================================
// GET CUSTOMER ORDERS
// ============================================================

export const getMyOrders = async (
    userId: bigint,
) => {

    return prisma.order.findMany({

        where: {

            userId,

        },

        orderBy: {

            createdAt:
                "desc",

        },

        include: {

            items: {

                include: {

                    product: true,

                    variant: true,

                },

            },

            vendorOrders: {

                include: {

                    vendor: true,

                },

            },

            payments: true,

        },

    });

};


// ============================================================
// CANCEL ORDER
// ============================================================

export const cancelOrder = async (
    orderId: bigint,
    userId: bigint,
    reason?: string,
) => {

    return prisma.$transaction(

        async (tx) => {

            const order =
                await tx.order.findFirst({

                    where: {

                        id:
                            orderId,

                        userId:
                            userId,

                    },

                    include: {

                        items: true,

                    },

                });


            if (!order) {

                throw new Error(
                    "Order not found.",
                );

            }


            // Fixed: replaced includes check with direct comparisons
            if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
                throw new Error(
                    "This order cannot be cancelled.",
                );
            }


            // --------------------------------------------------------
            // Release reserved stock
            // --------------------------------------------------------

            for (
                const item
                of order.items
            ) {

                await tx.productVariant.update({

                    where: {

                        id:
                            item.variantId,

                    },

                    data: {

                        reservedQuantity: {

                            decrement:
                                item.quantity,

                        },

                    },

                });

            }


            // --------------------------------------------------------
            // Update order
            // --------------------------------------------------------

            const updatedOrder =
                await tx.order.update({

                    where: {

                        id:
                            orderId,

                    },

                    data: {

                        status:
                            OrderStatus.CANCELLED,

                        cancelledAt:
                            new Date(),

                        cancelledReason:
                            reason ??
                            "Cancelled by customer",

                    },

                });


            // --------------------------------------------------------
            // Cancel vendor orders
            // --------------------------------------------------------

            await tx.vendorOrder.updateMany({

                where: {

                    orderId,

                },

                data: {

                    status:
                        OrderStatus.CANCELLED,

                    cancelledAt:
                        new Date(),

                },

            });


            return updatedOrder;

        },

    );

};


// ============================================================
// CONFIRM ORDER
// ============================================================

export const confirmOrder = async (
    orderId: bigint,
) => {

    // ----------------------------------------------------------
    // Transaction
    // ----------------------------------------------------------

    const result =
        await prisma.$transaction(

            async (tx) => {

                const order =
                    await tx.order.findUnique({

                        where: {

                            id:
                                orderId,

                        },

                        include: {

                            user: true,

                            items: true,

                        },

                    });


                if (!order) {

                    throw new Error(
                        "Order not found.",
                    );

                }


                if (
                    order.status !==
                    OrderStatus.PENDING
                ) {

                    throw new Error(
                        `Order cannot be confirmed from ${order.status} status.`,
                    );

                }


                // --------------------------------------------------------
                // Convert reserved stock to sold stock
                // --------------------------------------------------------

                for (
                    const item
                    of order.items
                ) {

                    const variant =
                        await tx.productVariant.findUnique({

                            where: {

                                id:
                                    item.variantId,

                            },

                        });


                    if (!variant) {

                        throw new Error(
                            `Variant not found for SKU ${item.sku}.`,
                        );

                    }


                    if (
                        variant.reservedQuantity <
                        item.quantity
                    ) {

                        throw new Error(
                            `Invalid reserved stock for SKU ${item.sku}.`,
                        );

                    }


                    await tx.productVariant.update({

                        where: {

                            id:
                                item.variantId,

                        },

                        data: {

                            stockQuantity: {

                                decrement:
                                    item.quantity,

                            },

                            reservedQuantity: {

                                decrement:
                                    item.quantity,

                            },

                        },

                    });

                }


                // --------------------------------------------------------
                // Confirm main order
                // --------------------------------------------------------

                const updatedOrder =
                    await tx.order.update({

                        where: {

                            id:
                                orderId,

                        },

                        data: {

                            status:
                                OrderStatus.CONFIRMED,

                        },

                        include: {

                            user: true,

                            items: true,

                            vendorOrders: true,

                            addresses: true,

                            payments: true,

                        },

                    });


                // --------------------------------------------------------
                // Confirm vendor orders
                // --------------------------------------------------------

                await tx.vendorOrder.updateMany({

                    where: {

                        orderId,

                    },

                    data: {

                        status:
                            OrderStatus.CONFIRMED,

                    },

                });


                return updatedOrder;

            },

        );


    // ----------------------------------------------------------
    // Send confirmation email AFTER transaction succeeds
    // ----------------------------------------------------------

    try {

        const emailHtml =
            orderConfirmationEmail({

                customerName:
                    `${result.user.firstName} ${result.user.lastName ?? ""
                        }`.trim(),

                orderNumber:
                    result.orderNumber,

                subtotal:
                    result.subtotal.toString(),

                discount:
                    result.discount.toString(),

                tax:
                    result.tax.toString(),

                shippingFee:
                    result.shippingFee.toString(),

                grandTotal:
                    result.grandTotal.toString(),

                currency:
                    result.currency,

                items:
                    result.items.map(
                        (item) => ({

                            productName:
                                item.productName,

                            sku:
                                item.sku,

                            quantity:
                                item.quantity,

                            unitPrice:
                                item.unitPrice.toString(),

                            total:
                                item.total.toString(),

                        }),
                    ),

            });
        await sendEmail({
            to:
                result.user.email,
            subject:
                `Order Confirmed - ${result.orderNumber}`,
            html:
                emailHtml,
        });

    } catch (error) {

        console.error(
            "Order confirmation email failed:",
            error,
        );
    }

    return result;

};


// ============================================================
// UPDATE ORDER STATUS
// ============================================================

export const updateOrderStatus = async (
    orderId: bigint,
    status: OrderStatus,
) => {

    const order =
        await prisma.order.findUnique({
            where: {
                id:
                    orderId,
            },
        });

    if (!order) {
        throw new Error(
            "Order not found.",
        );
    }


    const updatedOrder =
        await prisma.order.update({
            where: {
                id:
                    orderId,
            },

            data: {
                // Type compatibility with generated Prisma client
                status:
                    status as any,
            },

            include: {
                user: true,
                items: true,
                vendorOrders: true,
                addresses: true,
                payments: true,
            },
        });


    return updatedOrder;

};