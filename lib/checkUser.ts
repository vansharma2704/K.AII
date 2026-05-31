import { currentUser } from "@clerk/nextjs/server"
import { db } from "./prisma";

export const checkUser = async () => {
    let user;
    try {
        user = await currentUser();
    } catch (err: any) {
        console.error(">>> [CLERK ERROR] Failed to fetch current user from Clerk API:", err.message || err);
        return null;
    }

    if (!user) {
        return null;
    }

    try {
        const loggedInUser = await db.user.findUnique({
            where: {
                clerkUserId: user.id
            }
        });
        
        if (loggedInUser) {
            return loggedInUser;
        }

        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const newUser = await db.user.create({
            data: {
                clerkUserId: user.id,
                name: name || 'User',
                imageUrl: user.imageUrl,
                email: user.emailAddresses[0].emailAddress
            }
        });
        
        return newUser;
    } catch (err: any) {
        console.error(">>> [PRISMA ERROR] Database connection or query failed in checkUser:", err.message);
        return null;
    }
}