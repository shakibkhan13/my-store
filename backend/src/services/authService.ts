import prisma from "../config/db.js";
import { hashPassword , comparePassword } from "../utils/password.js";
import { generateOtp } from "../utils/otp.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
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
    let payload: any; 

    try {
        payload = verifyToken(tempToken); 
        
    } catch (error) {
        throw new Error('Invalid or expire temporary token'); 
    }

    if(payload.purpose !=='registration'){
        throw new Error('Invalid toke purpose'); 
    }

    const {
        email , 
        firstName, 
        lastName, 
        password,
    } = payload; 

    const otpRecord = await prisma.otp.findFirst({
        where: {
            email, 
            type: 'email', 
            usedAt: null, 
            expiresAt: {
                gt: new Date()
            }, 
        }, 
        orderBy : {
            createdAt: 'desc', 
        }
    });

    if(!otpRecord) {
        throw new Error('Invalid or expired otp'); 
    }

    if(otpRecord.otp !== otp){
        throw new Error('Invalid OTP'); 
    }

    await prisma.otp.update({
        where: {
            id: otpRecord.id
        }, 
        data: {
            usedAt: new Date(),
        }
    });
    
    const hashedPassword = await hashPassword(password); 

    // user create
    const user = await prisma.user.create({
        data: {
            firstName, 
            lastName, 
            email, 
            password: hashedPassword, 
            emailVerifiedAt: new Date(),
            isActive: true
        }, 
    }); 

    const token = generateToken({userId: user.id, email: user.email}); 

    return {
        user, 
        token
    }; 
}



export const loginUser = async(email: string, password: string) =>{
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    }) ; 

    if(!user){
        throw new Error('User not found. Please try again'); 
    }; 

    if(!user.emailVerifiedAt){
        throw new Error('Email is not verified.'); 
    }

    if(!user.isActive){
        throw new Error('Account is inactive'); 
    }

    const isPasswordValid = await comparePassword(password, user.password); 

    if(!isPasswordValid){
        throw new Error('Your password is incorrect. Please try again'); 
    }; 

    await prisma.user.update({
        where:{
            id: user.id
        },
        data: {
            lastLoginAt: new Date()
        }
    }); 

    const token = generateToken({
        userId: user.id,
        email: user.email,
    }); 

    const {
        password: _, ...userWithoutPassword 
    } = user ; 

    return {
        user: userWithoutPassword, token
    } ; 
} ; 


export  const resendOtp = async (email: string) =>{
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    }); 

    if(user && user.emailVerifiedAt){
        throw new Error("Email already Verified"); 
    }

    await prisma.otp.deleteMany({
        where: {
            email, 
            type: 'email', 
            usedAt: null, 
        },
    }); 

    const otp = generateOtp(6); 

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000); 

    await prisma.otp.create({
        data: {
            email, 
            otp, 
            type: 'email', 
            expiresAt, 
        },
    });

    await sendOtpEmail(email, otp); 
    
    return {
        message: 'Otp resent successfully'
    }; 
}




