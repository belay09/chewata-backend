
import { Request, Response } from 'express';
import { authService } from "@services/db/auth.service";
import { BadRequestError } from "@global/helpers/error-handler";
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from "@global/decorators/joi-validation-decorator";
import JWT from 'jsonwebtoken';
import { config } from '@root/config';
import { loginSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { IUserDocument } from '@user/interface/user.interface';
import { userService } from '@services/db/user.service';

export class SignIn {
    @joiValidation(loginSchema)
    public async read(req:Request, res:Response):Promise<void> {
        // Implementation
        const { username, password } = req.body;
        const existingUser:IAuthDocument = await authService.getUserByUsername(username);
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }
        const passwordMatch:boolean = await existingUser.comparePassword(password);
        if (!passwordMatch) {
            throw new BadRequestError('Invalid credentials');
        }
        const user:IUserDocument=await userService.getUserByAuthId(`${existingUser._id}`)
        console.log("user",user,existingUser)
        const userJwt:string = JWT.sign({ userId: user._id,
            email: existingUser.email,
            username: existingUser.username,
            avatarColor: existingUser.avatarColor,
            uId: existingUser.uId

        }, config.JWT_TOKEN_SECRET!,);
        req.session = { jwt: userJwt };
        console.log('existingUser', existingUser);
        const userDocument:IUserDocument ={
            ...user,
            // authId: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            avatarColor: existingUser.avatarColor,
            uId: existingUser.uId,
            createdAt: existingUser.createdAt
        } as IUserDocument;

        res.status(HTTP_STATUS.OK).json({ message: 'User successfully signed in', userJwt, user: userDocument});
    }
}