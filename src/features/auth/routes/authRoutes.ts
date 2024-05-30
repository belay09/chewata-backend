import { SignIn } from "@auth/controllers/signin";
import { signOut } from "@auth/controllers/signout";
import { SignUp } from "@auth/controllers/signup";
import { Password } from "@auth/controllers/password";
import express, { Router } from "express";

class AuthRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
  }
  public routes(): Router {
    this.router.post("/signup", SignUp.prototype.create);
    this.router.post("/signin", SignIn.prototype.read);
    this.router.post("/forgot-password", Password.prototype.create);
    this.router.post("/reset-password/:token", Password.prototype.update);

    return this.router;
  }
  public signoutRoute(): Router {
    this.router.get("/signout", signOut.prototype.update);
    return this.router;
  }
}

export const authRoutes = new AuthRoutes();
