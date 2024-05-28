import { Request, Response } from 'express';

export const signOut = (req: Request, res: Response) => {
    // Implement your sign out logic here
    // For example, you can clear the user session or token
    req.session = null;
    

    // Send a response indicating successful sign out
    res.status(200).json({ message: 'Sign out successful' });
};