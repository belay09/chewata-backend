import { IAuthJob } from "@auth/interfaces/auth.interface";
import { BaseQueue } from "./base.queue"; 
import { userWorker } from "@workers/user.worker";

 class UserQueue extends BaseQueue {
     constructor() {
         super("auth");
         this.processJob('addUserToDb',5,userWorker.addUserToDB);
     }
     public addUserJob(name:string,data:any):void {
            this.addJob(name,data);
 }}
 export const userQueue:UserQueue = new UserQueue();