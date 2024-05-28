import { ObjectId } from 'mongodb';
import { Request,Response } from "express";
import { joiValidation } from "@global/decorators/joi-validation-decorator";
import { signupSchema } from "@auth/schemes/signup";
import { IAuthDocument, ISignUpData } from "@auth/interfaces/auth.interface";
import { authService } from "@services/db/auth.service";
import { BadRequestError } from "@global/helpers/error-handler";
import { Helpers } from "@global/helpers/helpers";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { uploads } from "@global/helpers/cloudinary-upload";
import HTTP_STATUS from 'http-status-codes';
import { IUserDocument } from '@user/interface/user.interface';
import { UserCache } from '@services/redis/user.cache';
import { config } from '@root/config';
import { omit, Omit } from 'lodash';
import { authQueue } from '@services/queues/auth.queues';
import { userQueue } from '@services/queues/user.queue';
import Logger from 'bunyan';
import JWT from 'jsonwebtoken';

const userCache: UserCache = new UserCache();
const log: Logger = config.createLogger("signupController");


export class SignUp{
    @joiValidation(signupSchema)
    public async create(req:Request,res:Response):Promise<void>{
        const {email,username,password,avatarColor,avatarImage} =req.body;
        const checkIfUserExist:IAuthDocument =await authService.getUserByUsernameOrEmail(username,email);
        log.info(`User exist: ${checkIfUserExist}`);
        if (checkIfUserExist) {
            throw new BadRequestError('User already exist');
           }
           const authObjectId:ObjectId = new ObjectId();
           const userObjectId:ObjectId = new ObjectId();
           const uId =`${Helpers.getRandomNumber(12)}`;
           const authData:IAuthDocument=SignUp.prototype.signUpData({
                _id:authObjectId,
                uId,
                email,
                username,
                password,
                avatarColor,
              });
            const result: UploadApiResponse=await uploads(avatarImage,`${userObjectId}`,true,true) as UploadApiResponse;
            if(!result.public_id){
                throw new BadRequestError('Error uploading image');
            }
            //add user to redis cache
            const userDataForCache:IUserDocument =SignUp.prototype.userData(authData,userObjectId);
            userDataForCache.profilePicture =`https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${userObjectId}`;
            await userCache.saveUserToCache(`${userObjectId}`,uId,userDataForCache);

            //add user to database
            omit(userDataForCache,'_id','userName','email','password','avatarColor');
            authQueue.addAuthUserJob('addAuthUserToDatabase',{ value:userDataForCache});
            userQueue.addUserJob('addUserToDb',{value:userDataForCache});
            const userJwt:string =SignUp.prototype.signToken(authData,userObjectId);
            req.session = {jwt:userJwt};
            res.status(HTTP_STATUS.CREATED).json({message:'User created successfully',authData,userJwt  });
        }
        private signToken(data:IAuthDocument,userObjectId:ObjectId):string{
            return JWT.sign({
                userId:userObjectId.toHexString(),
                uId:data.uId,
                email:data.email,
                username:data.username,
                avatarColor:data.avatarColor,
            },config.JWT_TOKEN_SECRET!)

        }
        private signUpData(data:ISignUpData):IAuthDocument{
            const {_id,email,username,password,avatarColor,uId} =data;
            return{
                _id,
                uId,
                email:Helpers.firstLetterUppercase(email),
                username:Helpers.firstLetterUppercase(username),
                password,
                avatarColor,
                createdAt:new Date(),
            } as IAuthDocument;
        }
        private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
            const { _id, username, email, uId, password, avatarColor } = data;
            return {
              _id: userObjectId,
              authId: _id,
              uId,
              username: Helpers.firstLetterUppercase(username),
              email,
              password,
              avatarColor,
              profilePicture: '',
              blocked: [],
              blockedBy: [],
              work: '',
              location: '',
              school: '',
              quote: '',
              bgImageVersion: '',
              bgImageId: '',
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              notifications: {
                messages: true,
                reactions: true,
                comments: true,
                follows: true
              },
              social: {
                facebook: '',
                instagram: '',
                twitter: '',
                youtube: ''
              }
            } as unknown as IUserDocument;
          }
        
}