import dotenv from "dotenv"; 
import app from "./app.js"; 
import { connectDB , disconnectDB } from "./config/db.js";


dotenv.config(); 
const PORT = Number(process.env.PORT) || 8000;


const startServer = async (): Promise<void> =>{
    try {
        await connectDB(); 
        const server = app.listen(PORT, ()=>{
            console.log(`Server is running at http://localhost:${PORT}`); 
        }); 

        const shutdown = async (signal: string) =>{
            console.log(`${signal} received sutting down`); 
            server.close(async ()=>{
                await disconnectDB(); 
                console.log(`Server Shut down successfully.`); 
                process.exit(); 
            });
        }; 

        process.on("SIGINT", ()=> shutdown("SIGINT")); 
        process.on("SIGTERM", ()=> shutdown("SIGTERM")); 
    } catch (error) {
        console.log(`Server Running Failed.`); 

        process.exit(); 
    }
}

startServer(); 
