// import { Response } from "express";

// import { AuthRequest } from "../middleware/authMiddleware.js";

// import {
//   initiateSSLCommerzPayment,
//   completeSSLCommerzPayment,
//   failSSLCommerzPayment,
//   cancelSSLCommerzPayment,
// } from "../services/sslcommerzService.js";

// import prisma from "../config/db.js";

// // ============================================================
// // INITIATE SSL PAYMENT
// // ============================================================

// export const initiatePayment = async (
//   req: AuthRequest,
//   res: Response
// ) => {
//   try {
//     // --------------------------------------------------------
//     // Get authenticated user
//     // --------------------------------------------------------

//     const userId = req.user?.userId;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized.",
//       });
//     }

//     // --------------------------------------------------------
//     // Request body
//     // --------------------------------------------------------

//     const { orderId } = req.body;

//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "orderId is required.",
//       });
//     }

//     // --------------------------------------------------------
//     // Convert order ID to BigInt
//     // --------------------------------------------------------

//     let orderIdBigInt: bigint;

//     try {
//       orderIdBigInt = BigInt(orderId);
//     } catch {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid orderId.",
//       });
//     }

//     // --------------------------------------------------------
//     // Security check
//     // User can only pay his own order
//     // --------------------------------------------------------

//     const order = await prisma.order.findFirst({
//       where: {
//         id: orderIdBigInt,
//         userId: BigInt(userId),
//       },
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found.",
//       });
//     }

//     // --------------------------------------------------------
//     // Initiate SSLCommerz payment
//     // --------------------------------------------------------

//     const result = await initiateSSLCommerzPayment(
//       orderIdBigInt
//     );

//     return res.status(200).json({
//       success: true,
//       message:
//         "SSLCOMMERZ payment initialized successfully.",
//       data: result,
//     });
//   } catch (error) {
//     console.error(
//       "Initiate SSLCommerz Payment Error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         error instanceof Error
//           ? error.message
//           : "Payment initialization failed.",
//     });
//   }
// };

// // ============================================================
// // SUCCESS CALLBACK
// // ============================================================

// export const sslSuccess = async (
//   req: AuthRequest,
//   res: Response
// ) => {
//   try {
//     const result =
//       await completeSSLCommerzPayment(req.body);

//     const orderId = result.orderId.toString();

//     return res.redirect(
//       `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}`
//     );
//   } catch (error) {
//     console.error(
//       "SSL Success Callback Error:",
//       error
//     );

//     return res.redirect(
//       `${process.env.FRONTEND_URL}/payment/failed`
//     );
//   }
// };

// // ============================================================
// // IPN
// // ============================================================

// export const sslIPN = async (
//   req: AuthRequest,
//   res: Response
// ) => {
//   try {
//     const payload = req.body;

//     if (!payload?.tran_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Transaction ID missing.",
//       });
//     }

//     await completeSSLCommerzPayment(payload);

//     return res.status(200).json({
//       success: true,
//       message: "IPN processed successfully.",
//     });
//   } catch (error) {
//     console.error("SSL IPN Error:", error);

//     return res.status(400).json({
//       success: false,
//       message:
//         error instanceof Error
//           ? error.message
//           : "IPN processing failed.",
//     });
//   }
// };

// // ============================================================
// // FAILED CALLBACK
// // ============================================================

// export const sslFail = async (
//   req: AuthRequest,
//   res: Response
// ) => {
//   try {
//     await failSSLCommerzPayment(req.body);

//     return res.redirect(
//       `${process.env.FRONTEND_URL}/payment/failed`
//     );
//   } catch (error) {
//     console.error(
//       "SSL Fail Callback Error:",
//       error
//     );

//     return res.redirect(
//       `${process.env.FRONTEND_URL}/payment/failed`
//     );
//   }
// };

// // ============================================================
// // CANCEL CALLBACK
// // ============================================================

// export const sslCancel = async (
//   req: AuthRequest,
//   res: Response
// ) => {
//   try {
//     await cancelSSLCommerzPayment(req.body);

//     return res.redirect(
//       `${process.env.FRONTEND_URL}/payment/cancelled`
//     );
//   } catch (error) {
//     console.error(
//       "SSL Cancel Callback Error:",
//       error
//     );

//     return res.redirect(
//       `${process.env.FRONTEND_URL}/payment/cancelled`
//     );
//   }
// };



import { Response } from "express";

import { AuthRequest } from "../middleware/authMiddleware.js";

import {
  initiateSSLCommerzPayment,
  completeSSLCommerzPayment,
  failSSLCommerzPayment,
  cancelSSLCommerzPayment,
} from "../services/sslcommerzService.js";

import prisma from "../config/db.js";

// ============================================================
// CREATE / INITIATE SSL PAYMENT
// ============================================================

export const initiatePayment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // --------------------------------------------------------
    // Get authenticated user
    // --------------------------------------------------------

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    // --------------------------------------------------------
    // Get orderId from request body
    // --------------------------------------------------------

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required.",
      });
    }

    // --------------------------------------------------------
    // Convert orderId to BigInt
    // --------------------------------------------------------

    let orderIdBigInt: bigint;

    try {
      orderIdBigInt = BigInt(orderId);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId.",
      });
    }

    // --------------------------------------------------------
    // Security check
    //
    // User can only pay his own order
    // --------------------------------------------------------

    const order = await prisma.order.findFirst({
      where: {
        id: orderIdBigInt,
        userId: BigInt(userId),
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // --------------------------------------------------------
    // Initiate SSLCommerz payment
    // --------------------------------------------------------

    const result = await initiateSSLCommerzPayment(
      orderIdBigInt
    );

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "SSLCOMMERZ payment initialized successfully.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Initiate SSLCommerz Payment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Payment initialization failed.",
    });
  }
};

// ============================================================
// SSLCOMMERZ SUCCESS CALLBACK
// ============================================================
//
// SSLCommerz calls this endpoint after successful payment.
//
// POST
// /api/v1/payment/sslcommerz/success
//
// No frontend redirect.
// Backend returns JSON.
// ============================================================

export const sslSuccess = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // --------------------------------------------------------
    // Complete and validate payment
    // --------------------------------------------------------

    const result =
      await completeSSLCommerzPayment(req.body);

    // --------------------------------------------------------
    // JSON response
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Payment completed successfully.",
      data: {
        paymentId: result.id.toString(),
        orderId: result.orderId.toString(),
        status: result.status,
        paymentMethod: result.paymentMethod,
        amount: result.amount,
        paidAt: result.paidAt,
        referenceId: result.referenceId,
      },
    });
  } catch (error) {
    console.error(
      "SSLCommerz Success Callback Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Payment completion failed.",
    });
  }
};

// ============================================================
// SSLCOMMERZ IPN CALLBACK
// ============================================================
//
// POST
// /api/v1/payment/sslcommerz/ipn
//
// SSLCommerz server-to-server notification.
// ============================================================

export const sslIPN = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const payload = req.body;

    // --------------------------------------------------------
    // Check transaction ID
    // --------------------------------------------------------

    if (!payload?.tran_id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID missing.",
      });
    }

    // --------------------------------------------------------
    // Complete payment
    // --------------------------------------------------------

    const result =
      await completeSSLCommerzPayment(payload);

    // --------------------------------------------------------
    // JSON response
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "IPN processed successfully.",
      data: {
        paymentId: result.id.toString(),
        orderId: result.orderId.toString(),
        status: result.status,
        paymentMethod: result.paymentMethod,
        amount: result.amount,
        paidAt: result.paidAt,
        referenceId: result.referenceId,
      },
    });
  } catch (error) {
    console.error(
      "SSLCommerz IPN Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "IPN processing failed.",
    });
  }
};

// ============================================================
// SSLCOMMERZ FAILED CALLBACK
// ============================================================
//
// POST
// /api/v1/payment/sslcommerz/fail
//
// No frontend redirect.
// Backend returns JSON.
// ============================================================

export const sslFail = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // --------------------------------------------------------
    // Update payment as failed
    // --------------------------------------------------------

    const result =
      await failSSLCommerzPayment(req.body);

    // --------------------------------------------------------
    // No payment record found
    // --------------------------------------------------------

    if (!result) {
      return res.status(404).json({
        success: false,
        message:
          "Payment record not found.",
      });
    }

    // --------------------------------------------------------
    // JSON response
    // --------------------------------------------------------

    return res.status(200).json({
      success: false,
      message: "Payment failed.",
      data: {
        paymentId: result.id.toString(),
        orderId: result.orderId.toString(),
        status: result.status,
        amount: result.amount,
        failureReason: result.failureReason,
        failedAt: result.failedAt,
      },
    });
  } catch (error) {
    console.error(
      "SSLCommerz Fail Callback Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Payment failure processing failed.",
    });
  }
};

// ============================================================
// SSLCOMMERZ CANCEL CALLBACK
// ============================================================
//
// POST
// /api/v1/payment/sslcommerz/cancel
//
// No frontend redirect.
// Backend returns JSON.
// ============================================================

export const sslCancel = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // --------------------------------------------------------
    // Update payment as cancelled
    // --------------------------------------------------------

    const result =
      await cancelSSLCommerzPayment(req.body);

    // --------------------------------------------------------
    // No payment record found
    // --------------------------------------------------------

    if (!result) {
      return res.status(404).json({
        success: false,
        message:
          "Payment record not found.",
      });
    }

    // --------------------------------------------------------
    // JSON response
    // --------------------------------------------------------

    return res.status(200).json({
      success: false,
      message:
        "Payment cancelled by customer.",
      data: {
        paymentId: result.id.toString(),
        orderId: result.orderId.toString(),
        status: result.status,
        amount: result.amount,
      },
    });
  } catch (error) {
    console.error(
      "SSLCommerz Cancel Callback Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Payment cancellation processing failed.",
    });
  }
};