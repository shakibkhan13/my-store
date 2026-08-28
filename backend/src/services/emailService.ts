// import nodemailer from 'nodemailer'; 

// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST, 
//     port: Number(process.env.SMTP_PORT),
//     secure: false, 
//     auth: {
//         user: process.env.SMTP_USER, 
//         pass: process.env.SMTP_PASS
//     }, 
// }); 


// export const sendOtpEmail = async (to: string, otp: string) : Promise<void> =>{
//     const html =`
//         <h1>Email Verification</h1>
//         <p>Your OTP code is : </p>
//         <h2 
//             style=""color: #2d3748; background: #edf2f7; padding: 1rem; border-radius: 8px; display: inline-block;"
//         >${otp}</h2>
//         <p>This code will expire in 5 minutes.</p>
//     `; 

//     await transporter.sendMail({
//         from: `"Your App" <${process.env.FROM_EMAIL}>`, 
//         to, 
//         subject: 'Verify your Email.', 
//         html, 
//     }); 
// }; 



import nodemailer from "nodemailer";

// ============================================================
// SMTP TRANSPORTER
// ============================================================

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});


// ============================================================
// EMAIL OPTIONS
// ============================================================

interface SendEmailInput {
    to: string;
    subject: string;
    html: string;
    text?: string;
}


// ============================================================
// GENERIC SEND EMAIL
// ============================================================

export const sendEmail = async ({
    to,
    subject,
    html,
    text,
}: SendEmailInput): Promise<void> => {

    if (!to) {
        throw new Error("Recipient email is required.");
    }

    if (!process.env.FROM_EMAIL) {
        throw new Error("FROM_EMAIL is not configured.");
    }

    await transporter.sendMail({
        from: `"Your App" <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        html,
        text,
    });
};


// ============================================================
// SEND OTP EMAIL
// ============================================================

export const sendOtpEmail = async (
    to: string,
    otp: string,
): Promise<void> => {

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <title>Email Verification</title>
        </head>

        <body
            style="
                margin: 0;
                padding: 40px 20px;
                background: #f7fafc;
                font-family: Arial, Helvetica, sans-serif;
            "
        >

            <div
                style="
                    max-width: 500px;
                    margin: auto;
                    background: #ffffff;
                    padding: 35px;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                "
            >

                <h1
                    style="
                        color: #2d3748;
                        margin-bottom: 10px;
                    "
                >
                    Email Verification
                </h1>

                <p
                    style="
                        color: #4a5568;
                        font-size: 16px;
                    "
                >
                    Your OTP verification code is:
                </p>

                <div
                    style="
                        display: inline-block;
                        background: #edf2f7;
                        color: #2d3748;
                        padding: 15px 25px;
                        border-radius: 8px;
                        font-size: 28px;
                        font-weight: bold;
                        letter-spacing: 6px;
                        margin: 15px 0;
                    "
                >
                    ${otp}
                </div>

                <p
                    style="
                        color: #718096;
                        font-size: 14px;
                    "
                >
                    This code will expire in 5 minutes.
                </p>

                <p
                    style="
                        color: #718096;
                        font-size: 13px;
                        margin-top: 25px;
                    "
                >
                    If you did not request this code, you can safely ignore
                    this email.
                </p>

            </div>

        </body>
        </html>
    `;

    await sendEmail({
        to,
        subject: "Verify your Email",
        html,
    });
};


// ============================================================
// VERIFY SMTP CONNECTION
// ============================================================

export const verifyEmailTransporter = async (): Promise<void> => {

    try {

        await transporter.verify();

        console.log("✅ SMTP server is ready.");

    } catch (error) {

        console.error(
            "❌ SMTP connection failed:",
            error,
        );

        throw error;
    }
};