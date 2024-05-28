import { Request ,Response,NextFunction } from "express";
import JWT  from "jsonwebtoken";
import { UnauthorizedError } from "./error-handler";
import { AuthPayload } from "@auth/interfaces/auth.interface";
import { config } from "@root/config";
export class AuthMiddleware {
    public verifyUser (req:Request,res:Response,next:NextFunction){
        if (!req.session?.jwt){
            throw new UnauthorizedError("Token not found")

        }
        try {
            const payload:AuthPayload =JWT.verify(req.session?.jwt,config.JWT_TOKEN_SECRET!)  as AuthPayload;
            req.currentUser = payload;
            next();
        } catch (error) {
            throw new UnauthorizedError("token not valid ,please login again")
            
        }
    }
    public CheckAuthentication(req:Request,res:Response,next:NextFunction):void{
        console.log("we are here",req.currentUser)
        if (!req.currentUser){
            throw new UnauthorizedError("Not authorized")
        }
        next();
    }
}
export const authMiddleware = new AuthMiddleware();

