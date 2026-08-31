import { create } from "zustand"; 
import type { AuthState } from "@/types/auth";

export const useAuthStore = create<AuthState>((set)=>({
    user: null, 
    token: null, 

    setAuth: (user, token)=> {
        localStorage.setItem("token", token);
        
        set({
            user, 
            token, 
        }); 
    }, 

    logout: ()=>{
        localStorage.removeItem("token"); 

        set({
            user : null, 
            token: null , 
        }); 
    },
})); 


