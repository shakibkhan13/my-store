import nodemailer from 'nodemailer'; 

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, 
    port: Number(process.env.SMTP_PORT),
    secure: false, 
    auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS
    }, 
}); 


export const sendOtpEmail = async (to: string, otp: string) : Promise<void> =>{
    const html =`
        <h1>Email Verification</h1>
        <p>Your OTP code is : </p>
        <h2 
            style=""color: #2d3748; background: #edf2f7; padding: 1rem; border-radius: 8px; display: inline-block;"
        >${otp}</h2>
        <p>This code will expire in 5 minutes.</p>
    `; 

    await transporter.sendMail({
        from: `"Your App" <${process.env.FROM_EMAIL}>`, 
        to, 
        subject: 'Verify your Email.', 
        html, 
    }); 
}; 

