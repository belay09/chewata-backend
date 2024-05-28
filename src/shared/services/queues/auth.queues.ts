import { IAuthJob } from "@auth/interfaces/auth.interface";
import { BaseQueue } from "./base.queue"; 
import { authWorker } from "@workers/auth.worker";

 class AuthQueue extends BaseQueue {
     constructor() {
         super("auth");
         this.processJob('addAuthUserToDatabase',5,authWorker.addAuthUserToDB);
     }
     public addAuthUserJob(name:string,data:IAuthJob):void {
        // console.log('addAuthUserJob',name,data);
            this.addJob(name,data);
 }}
 export const authQueue:AuthQueue = new AuthQueue(); 