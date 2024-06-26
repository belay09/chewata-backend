 
import { Request, Response } from 'express';
import { UserCache } from '../../../shared/services/redis/user.cache';
import { IUserDocument } from '@user/interface/user.interface';
import { userService } from '@services/db/user.service';
import HTTP_STATUS from 'http-status-codes';
const userCache  :UserCache =new UserCache();
export class CurrentUser {
    public async read(req: Request, res: Response) {
        let isUser = false;
        let token=null;
        let user=null;
        const  cachedUser:IUserDocument = await userCache.getUserFromCache(`${req.currentUser?.userId}`) as IUserDocument;
        const existingUser:IUserDocument=cachedUser? cachedUser:await userService.getUserById(`${req.currentUser?.userId}`);
        if (Object.keys(existingUser).length) {
            isUser = true;
            user = existingUser;
            token=req.session?.jwt;   
        }
        res.status(HTTP_STATUS.OK).json({ isUser, user,token });



    }
}

export const currentUser:CurrentUser=new CurrentUser();
