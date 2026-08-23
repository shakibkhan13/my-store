import prisma from "../config/db.js";
import { hashPassword , comparePassword } from "../utils/password.js";
import { generateOtp } from "../utils/otp.js";
import { generateToken } from "../utils/jwt.js";
import { sendOtpEmail } from "./emailService.js";


const OTP_EXPIRY_MINUTES = 10; 

export const registerUser = async(data: {
    firstName: string; 
    lastName: string;
    email: string;
    password: string;
}) =>{
    const { firstName, lastName,email, password } = data ; 

    const exitingUser = await prisma.user.findUnique({
        where: {email}
    }); 

    if(exitingUser){
        throw new Error('User already exists with this email.'); 
    }

    await prisma.otp.deleteMany({
        where: {
            email, 
            type: "email", 
            usedAt: null
        }, 
    }); 

    const otp = generateOtp(6); 
    const expiresAt = new Date(Date.now()+ OTP_EXPIRY_MINUTES *  60 * 1000 ); 

    await prisma.otp.create({
        data: {
            email, 
            otp, 
            type: "email", 
            expiresAt, 
        },
    }); 

    await sendOtpEmail(email , otp); 


    const tempToken = generateToken({
        email,
        firstName, 
        lastName, 
        password, 
        purpose: 'registration', 
    }); 

    return {
        message: 'OTP sent to your email', 
        tempToken
    }; 
}; 

export const verifyOtpAndCreateUser = async (tempToken: string, otp:string) =>{

}




