import { IUserDocument } from "@user/interface/user.interface";
import { BaseCache } from "./base.cache";
import { config } from "@root/config";
import Logger from "bunyan";
import { InternalServerError } from "@global/helpers/error-handler";
import { Server } from "socket.io";
import { Response } from 'express';
import { Helpers } from "@global/helpers/helpers";

const log: Logger = config.createLogger("chewata-UserCache");

export class UserCache extends BaseCache {
    constructor() {
        super("userCache");
    }
    public async saveUserToCache(key: string, userUId: string,createdUser:IUserDocument): Promise<void> {
        const createdAt = new Date();
        const {
            email,
            username,
            _id,
            blocked,
            avatarColor,
            blockedBy,
            postsCount,
            profilePicture,
            followersCount,
            followingCount,
            notifications,
            work,
            location,
            school,
            quote,
            social,
            bgImageId,
            bgImageVersion,
            uId,    
        } = createdUser;
        const firstList: string[] = [
            '_id', `${_id}`,
            'uId', `${uId}`,
            'username', `${username}`,
            'email', `${email}`,
            'avatarColor', `${avatarColor}`,
            'createdAt', `${createdAt}`,
            'postsCount', `${postsCount}`,
        ];
        const secondList: string[] = [
            'blocked', JSON.stringify(blocked),
            'blockedBy',JSON.stringify(blockedBy),
            'profilePicture', `${profilePicture}`,
            'followersCount', `${followersCount}`,
            'followingCount', `${followingCount}`,
            'notifications', JSON.stringify(notifications),
            'social', JSON.stringify(social),];
            const thirdList: string[] = [
                'work', `${work}`,
                'location', `${location}`,
                'school', `${school}`,
                'quote', `${quote}`,
                'bgImageId', `${bgImageId}`,
                'bgImageVersion', `${bgImageVersion}`,
            ];
            const dataToSave: string[] = [...firstList, ...secondList, ...thirdList];
            try {
                if(!this.client.isOpen){
                    await this.client.connect();
                }
                await this.client.ZADD('user',{score:parseInt(userUId,10),value:`${key}`});
                await this.client.HSET(`users:${key}`,dataToSave);

                
            } catch (error) {
                log.error(error);
                throw new InternalServerError('Error saving user to cache');
            }
        }
        public async getUserFromCache(userId: string): Promise<IUserDocument> {
            try {
                if(!this.client.isOpen){
                    await this.client.connect();
                }
                const response = await this.client.HGETALL(`users:${userId}`) as unknown as IUserDocument;                response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`));
                response.blocked = Helpers.parseJson(`${response.blocked}`);
                response.blockedBy = Helpers.parseJson(`${response.blockedBy}`);
                response.notifications = Helpers.parseJson(`${response.notifications}`);
                response.social = Helpers.parseJson(`${response.social}`);
                response.postsCount = parseInt(`${response.postsCount}`,10);
                response.followersCount = parseInt(`${response.followersCount}`,10);
                response.followingCount = parseInt(`${response.followingCount}`,10);

                return response;


            } catch (error) {
                log.error(error);
                throw new InternalServerError('Error getting user from cache');
            }
        }


}