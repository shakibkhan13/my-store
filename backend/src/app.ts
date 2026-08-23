import express, { NextFunction, Request, Response } from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import router from './routes/indexRoute.js';



dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(
    cors({
        origin: "*",
        credentials: false,
    })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Api is good",
        timestamp: new Date().toISOString()
    });
});

app.use((error: Error, req: Request,res: Response, next:NextFunction )=> {
    console.error("Error", error); 

    res.status(500).json({
        success: false, 
        message: "Invalid Server Error", 
        error: 
            process.env.NODE_ENV === "development" 
                ? 
                error.message
                : 
                undefined
    })
    }
); 


export default app ; 


