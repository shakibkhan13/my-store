import prisma from "../config/db.js";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

// ============================================================
// CONFIG
// ============================================================

const IS_SANDBOX =
  String(process.env.SSLCOMMERZ_SANDBOX).toLowerCase() === "true";

const STORE_ID = process.env.SSLCOMMERZ_STORE_ID;
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD;

const BACKEND_URL =
  process.env.BACKEND_URL || "http://localhost:8000";

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

const INIT_URL = IS_SANDBOX
  ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
  : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

const VALIDATION_URL = IS_SANDBOX
  ? "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
  : "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php";

// ============================================================
// TYPES
// ============================================================

interface SSLCommerzResponse {
  status?: string;
  failedreason?: string;

  GatewayPageURL?: string;
  GatewayPageURLFailed?: string;

  sessionkey?: string;

  tran_date?: string;
  tran_id?: string;
  val_id?: string;

  amount?: string;
  store_amount?: string;

  card_type?: string;
  card_no?: string;
  bank_tran_id?: string;

  currency?: string;

  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;

  risk_level?: string;
  risk_title?: string;

  [key: string]: unknown;
}

// ============================================================
// VALIDATION
// ============================================================

const validateConfig = () => {
  if (!STORE_ID) {
    throw new Error("SSLCOMMERZ_STORE_ID is not configured.");
  }

  if (!STORE_PASSWORD) {
    throw new Error(
      "SSLCOMMERZ_STORE_PASSWORD is not configured."
    );
  }
};

// ============================================================
// HELPERS
// ============================================================

const generateTransactionId = (orderNumber: string) => {
  return `${orderNumber}-${Date.now()}`;
};

const decimalToNumber = (value: unknown): number => {
  return Number(value ?? 0);
};

// ============================================================
// INITIATE PAYMENT
// ============================================================

export const initiateSSLCommerzPayment = async (
  orderId: bigint
) => {
  validateConfig();

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },

    include: {
      user: true,

      addresses: true,

      items: {
        include: {
          product: true,
          variant: true,
          vendor: true,
        },
      },

      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new Error("Cancelled order cannot be paid.");
  }

  if (order.status === OrderStatus.REFUNDED) {
    throw new Error("Refunded order cannot be paid.");
  }

  const existingPaidPayment = order.payments.find(
    (payment) =>
      payment.paymentMethod === PaymentMethod.ONLINE &&
      payment.status === PaymentStatus.PAID
  );

  if (existingPaidPayment) {
    throw new Error("This order has already been paid.");
  }

  const amount = decimalToNumber(order.grandTotal);

  if (!Number.isFinite(amount) || amount < 10) {
    throw new Error(
      "SSLCOMMERZ payment amount must be at least 10 BDT."
    );
  }

  const transactionId = generateTransactionId(
    order.orderNumber
  );

  // ----------------------------------------------------------
  // Create payment record first
  // ----------------------------------------------------------

  const payment = await prisma.orderPayment.create({
    data: {
      orderId: order.id,

      paymentMethod: PaymentMethod.ONLINE,

      status: PaymentStatus.PROCESSING,

      amount: order.grandTotal,

      transactionId,
    },
  });

  const shippingAddress = order.addresses.find(
    (address) => address.type.toLowerCase() === "shipping"
  );

  if (!shippingAddress) {
    await prisma.orderPayment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: "Shipping address not found.",
      },
    });

    throw new Error("Shipping address not found.");
  }

  // ----------------------------------------------------------
  // SSLCOMMERZ payload
  // ----------------------------------------------------------

  const formData = new URLSearchParams();

  formData.append("store_id", STORE_ID!);
  formData.append("store_passwd", STORE_PASSWORD!);

  formData.append("total_amount", amount.toFixed(2));
  formData.append("currency", order.currency);

  formData.append("tran_id", transactionId);

  // ----------------------------------------------------------
  // Callback URLs
  // ----------------------------------------------------------

  formData.append(
    "success_url",
    `${BACKEND_URL}/api/v1/payment/sslcommerz/success`
  );

  formData.append(
    "fail_url",
    `${BACKEND_URL}/api/v1/payment/sslcommerz/fail`
  );

  formData.append(
    "cancel_url",
    `${BACKEND_URL}/api/v1/payment/sslcommerz/cancel`
  );

  formData.append(
    "ipn_url",
    `${BACKEND_URL}/api/v1/payment/sslcommerz/ipn`
  );

  // ----------------------------------------------------------
  // Customer
  // ----------------------------------------------------------

  formData.append(
    "cus_name",
    `${order.user.firstName} ${order.user.lastName || ""}`.trim()
  );

  formData.append(
    "cus_email",
    order.user.email
  );

  formData.append(
    "cus_phone",
    order.user.phone || shippingAddress.phone
  );

  formData.append(
    "cus_add1",
    shippingAddress.addressLine1
  );

  formData.append(
    "cus_add2",
    shippingAddress.addressLine2 || ""
  );

  formData.append(
    "cus_city",
    shippingAddress.city || ""
  );

  formData.append(
    "cus_state",
    shippingAddress.state || ""
  );

  formData.append(
    "cus_postcode",
    shippingAddress.postalCode || ""
  );

  formData.append(
    "cus_country",
    shippingAddress.country || "Bangladesh"
  );

  // ----------------------------------------------------------
  // Shipping
  // ----------------------------------------------------------

  formData.append("shipping_method", "YES");
  formData.append("ship_name", shippingAddress.fullName);
  formData.append(
    "ship_add1",
    shippingAddress.addressLine1
  );
  formData.append(
    "ship_add2",
    shippingAddress.addressLine2 || ""
  );
  formData.append(
    "ship_city",
    shippingAddress.city || ""
  );
  formData.append(
    "ship_state",
    shippingAddress.state || ""
  );
  formData.append(
    "ship_postcode",
    shippingAddress.postalCode || ""
  );
  formData.append(
    "ship_country",
    shippingAddress.country || "Bangladesh"
  );

  // ----------------------------------------------------------
  // Product Information
  // ----------------------------------------------------------

  formData.append(
    "product_name",
    order.items
      .slice(0, 5)
      .map((item) => item.productName)
      .join(", ")
  );

  formData.append("product_category", "Ecommerce");
  formData.append("product_profile", "general");

  // ----------------------------------------------------------
  // Pricing
  // ----------------------------------------------------------

  formData.append(
    "product_amount",
    decimalToNumber(order.subtotal).toFixed(2)
  );

  formData.append(
    "shipping_method",
    "YES"
  );

  formData.append(
    "shipping_method",
    "YES"
  );

  formData.append(
    "num_of_item",
    String(
      order.items.reduce(
        (total, item) => total + item.quantity,
        0
      )
    )
  );

  formData.append(
    "value_a",
    order.id.toString()
  );

  formData.append(
    "value_b",
    payment.id.toString()
  );

  formData.append(
    "value_c",
    order.orderNumber
  );

  // ----------------------------------------------------------
  // Request
  // ----------------------------------------------------------

  let response: Response;

  try {
    response = await fetch(INIT_URL, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body: formData.toString(),
    });
  } catch (error) {
    await prisma.orderPayment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: PaymentStatus.FAILED,
        failureReason:
          error instanceof Error
            ? error.message
            : "Gateway connection failed.",
      },
    });

    throw new Error(
      "Unable to connect with SSLCOMMERZ."
    );
  }

  const result =
    (await response.json()) as SSLCommerzResponse;

  if (
    !response.ok ||
    result.status !== "SUCCESS" ||
    !result.GatewayPageURL
  ) {
    await prisma.orderPayment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: PaymentStatus.FAILED,

        gatewayResponse:
          result as any,

        failureReason:
          result.failedreason ||
          result.status ||
          "Payment session creation failed.",
      },
    });

    throw new Error(
      result.failedreason ||
        "Failed to initialize SSLCOMMERZ payment."
    );
  }

  await prisma.orderPayment.update({
    where: {
      id: payment.id,
    },

    data: {
      gatewayResponse: result as any,
    },
  });

  return {
    orderId: order.id.toString(),

    orderNumber: order.orderNumber,

    paymentId: payment.id.toString(),

    transactionId,

    amount,

    currency: order.currency,

    sessionKey: result.sessionkey,

    paymentUrl: result.GatewayPageURL,
  };
};

// ============================================================
// VALIDATE TRANSACTION
// ============================================================

export const validateSSLCommerzPayment = async (
  valId: string
): Promise<SSLCommerzResponse> => {
  validateConfig();

  if (!valId) {
    throw new Error("Validation ID is required.");
  }

  const params = new URLSearchParams();

  params.append("val_id", valId);
  params.append("store_id", STORE_ID!);
  params.append("store_passwd", STORE_PASSWORD!);
  params.append("format", "json");

  const response = await fetch(
    `${VALIDATION_URL}?${params.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error(
      "SSLCOMMERZ validation request failed."
    );
  }

  return (await response.json()) as SSLCommerzResponse;
};

// ============================================================
// FIND PAYMENT BY TRANSACTION
// ============================================================

const findPaymentByTransactionId = async (
  transactionId: string
) => {
  const payment =
    await prisma.orderPayment.findUnique({
      where: {
        transactionId,
      },

      include: {
        order: true,
      },
    });

  if (!payment) {
    throw new Error(
      `Payment not found for transaction: ${transactionId}`
    );
  }

  return payment;
};

// ============================================================
// COMPLETE PAYMENT
// ============================================================

export const completeSSLCommerzPayment = async (
  payload: SSLCommerzResponse
) => {
  const transactionId = payload.tran_id;

  if (!transactionId) {
    throw new Error("Transaction ID missing.");
  }

  const payment =
    await findPaymentByTransactionId(transactionId);

  const gatewayAmount = Number(payload.amount);

  const orderAmount =
    decimalToNumber(payment.amount);

  if (
    !Number.isFinite(gatewayAmount) ||
    Math.abs(gatewayAmount - orderAmount) > 0.01
  ) {
    await prisma.orderPayment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: PaymentStatus.FAILED,

        gatewayResponse: payload as any,

        failureReason:
          "Payment amount mismatch.",
      },
    });

    throw new Error(
      "Payment amount mismatch."
    );
  }

  // Already processed
  if (payment.status === PaymentStatus.PAID) {
    return payment;
  }

  const valId = payload.val_id;

  if (!valId) {
    throw new Error(
      "Validation ID missing from gateway response."
    );
  }

  // ----------------------------------------------------------
  // Server-side validation
  // ----------------------------------------------------------

  const validation =
    await validateSSLCommerzPayment(valId);

  if (
    validation.status !== "VALID" &&
    validation.status !== "VALIDATED"
  ) {
    await prisma.orderPayment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: PaymentStatus.FAILED,

        gatewayResponse: {
          ipn: payload,
          validation,
        } as any,

        failureReason:
          "SSLCOMMERZ transaction validation failed.",
      },
    });

    throw new Error(
      "SSLCOMMERZ transaction validation failed."
    );
  }

  const validatedTransactionId =
    validation.tran_id;

  if (
    validatedTransactionId &&
    validatedTransactionId !== transactionId
  ) {
    throw new Error(
      "Transaction ID validation mismatch."
    );
  }

  const validatedAmount =
    Number(validation.amount);

  if (
    !Number.isFinite(validatedAmount) ||
    Math.abs(validatedAmount - orderAmount) > 0.01
  ) {
    throw new Error(
      "Validated payment amount mismatch."
    );
  }

  // ----------------------------------------------------------
  // Atomic database update
  // ----------------------------------------------------------

  const updatedPayment =
    await prisma.$transaction(async (tx) => {
      const updated =
        await tx.orderPayment.update({
          where: {
            id: payment.id,
          },

          data: {
            status: PaymentStatus.PAID,

            paidAt: new Date(),

            referenceId:
              payload.bank_tran_id ||
              payload.val_id,

            gatewayResponse: {
              ipn: payload,
              validation,
            } as any,
          },
        });

      await tx.order.update({
        where: {
          id: payment.orderId,
        },

        data: {
          status: OrderStatus.CONFIRMED,
        },
      });

      return updated;
    });

  return updatedPayment;
};

// ============================================================
// FAILED PAYMENT
// ============================================================

export const failSSLCommerzPayment = async (
  payload: SSLCommerzResponse
) => {
  if (!payload.tran_id) {
    return null;
  }

  const payment =
    await prisma.orderPayment.findUnique({
      where: {
        transactionId: payload.tran_id,
      },
    });

  if (!payment) {
    return null;
  }

  if (payment.status === PaymentStatus.PAID) {
    return payment;
  }

  return prisma.orderPayment.update({
    where: {
      id: payment.id,
    },

    data: {
      status: PaymentStatus.FAILED,

      failedAt: new Date(),

      gatewayResponse: payload as any,

      failureReason:
        payload.failedreason ||
        payload.status ||
        "Payment failed.",
    },
  });
};

// ============================================================
// CANCEL PAYMENT
// ============================================================

export const cancelSSLCommerzPayment = async (
  payload: SSLCommerzResponse
) => {
  if (!payload.tran_id) {
    return null;
  }

  const payment =
    await prisma.orderPayment.findUnique({
      where: {
        transactionId: payload.tran_id,
      },
    });

  if (!payment) {
    return null;
  }

  if (payment.status === PaymentStatus.PAID) {
    return payment;
  }

  return prisma.orderPayment.update({
    where: {
      id: payment.id,
    },

    data: {
      status: PaymentStatus.CANCELLED,

      gatewayResponse: payload as any,

      failureReason: "Customer cancelled payment.",
    },
  });
};