// types/next-auth.d.ts
import { DefaultSession, DefaultUser, DefaultJWT } from "next-auth";

declare module "next-auth" {
    /**
     * 扩展 Session.user
     */
    interface Session {
        user: {
            /** 你的自定义字段 */
            id: string;
            name: string;
        } & DefaultSession["user"];
    }

    /**
     * 扩展 CredentialsProvider 授权后返回的 User
     */
    interface User extends DefaultUser {
        id: string;
        name: string;
    }

    /**
     * 扩展 JWT Token
     */
    interface JWT extends DefaultJWT {
        id: string;
        name: string;
    }
}
