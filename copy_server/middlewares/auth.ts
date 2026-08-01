import { NextFunction, Request, Response } from "express";
import { clerkMiddleware, clerkClient, getAuth } from '@clerk/express'
import User from "../models/User.js";

export interface AuthRequest extends Request{
    user?: {id: string, name: string, email: string}
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction)=>{
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            res.status(401).json({success: false, message: "Unauthenticated"})
            return;
        }

        // check if user exist locally in mongoDB
        let localUser = await User.findById(userId);

        if(!localUser){
            // Lazy sync: Fetch details from Clerk API
            const clerkuser = await clerkClient.users.getUser(userId)
            const email = clerkuser.emailAddresses[0]?.emailAddress;
            const name = [clerkuser.firstName, clerkuser.lastName].filter(Boolean).join(" ") || clerkuser.username || "Anonymous";

            //create fallback handle
            const handle = clerkuser.username || clerkuser.emailAddresses[0]?.emailAddress.split("@")[0] || userId;

            // Ensure unique handle in DB by appending random suffix if needed
            let finalHandle = handle.toLowerCase().replace(/[^a-z0-9_]/g, "");
            let handleExists = await User.findOne({handle: finalHandle})
            let counter = 1;
            while(handleExists){
                const testHandle = `${finalHandle}${counter}`;
                handleExists = await User.findOne({handle: testHandle})
                if(!handleExists){
                    finalHandle = testHandle
                    break;
                }
                counter++
            }

            localUser = await User.create({
                _id: userId,
                name,
                email: email.toLowerCase(),
                handle: finalHandle,
                avatar: clerkuser.imageUrl || "",
                bio: "Hey there! I am using HiFi👋",
                isOnline: true,
                lastSeen: new Date(),
            })
        }

        //attach user info to request for compatibility
        req.user = {
            id: localUser._id,
            name: localUser.name,
            email: localUser.email,
        }

        next()

    } catch (error) {
        console.error("Auth Middleware Error: ", error);
        res.status(401).json({ success: false, message: "Invalid or expired token"});
    }

}