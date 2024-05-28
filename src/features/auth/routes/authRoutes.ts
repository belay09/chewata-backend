import { SignIn } from "@auth/controllers/signin";
import { signOut } from "@auth/controllers/signout";
import { SignUp } from "@auth/controllers/signup";
import express,{Router}  from "express";

class AuthRoutes{
    public router:Router;
    constructor(){
        this.router=Router();
    }
    public routes(): Router{
        this.router.post('/signup',SignUp.prototype.create);
        this.router.post('/signin',SignIn.prototype.read);
        return this.router;
    }
    public signoutRoute():Router{
        this.router.get('/signout',signOut.prototype.update);
        return this.router;
    }
}

export const authRoutes = new AuthRoutes();