import { SignIn } from "@auth/controllers/signin";
import { signOut } from "@auth/controllers/signout";
import { CurrentUser } from "@auth/controllers/current-user";
import { SignUp } from "@auth/controllers/signup";
import { authMiddleware } from "@global/helpers/auth.middleware";
import express,{Router}  from "express";

class CurrentUserRoutes{
    public router:Router;
    constructor(){
        this.router=Router();
    }

    public routes():Router{
        this.router.get('/currentuser',authMiddleware.CheckAuthentication,CurrentUser.prototype.read);
        return this.router;
    }
}

export const currentUserRoutes = new CurrentUserRoutes();