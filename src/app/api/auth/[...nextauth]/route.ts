// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";

export const authOptions: AuthOptions = {
    session: {
        strategy: "jwt",        // 使用 JWT 而非数据库 session
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                mode: { label: "Mode", type: "text" },       // "login" or "register"
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                username: { label: "Username", type: "text" },// 仅注册时使用
            },
            async authorize(credentials) {
                if (!credentials) return null;
                const { mode, email, password, username } = credentials;

                // —— 注册流程 ——
                if (mode === "register") {
                    // 检查邮箱是否已被注册
                    const existing = await prisma.user.findUnique({ where: { email } });
                    if (existing) {
                        throw new Error("Email 已被使用");
                    }
                    // 密码哈希
                    const hashed = await hash(password, 12);
                    // 创建用户
                    const user = await prisma.user.create({
                        data: { email, password: hashed, name: username },
                    });
                    return { id: user.id, email: user.email, name: user.name };
                }

                // —— 登录流程 ——
                if (mode === "login") {
                    // 查找用户
                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) {
                        throw new Error("用户不存在");
                    }
                    // 验证密码
                    const isValid = await compare(password, user.password);
                    if (!isValid) {
                        throw new Error("密码错误");
                    }
                    return { id: user.id, email: user.email, name: user.name };
                }

                return null;
            },
        }),
    ],
    callbacks: {
        // 签发 JWT 时，将 user.id 注入 token
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        // 将 token 中的 id 注入 session
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user!,
                    id: token.id as string,
                };
            }
            return session;
        },
    },
    pages: {
        // 可以自定义路由，如： signIn: "/auth/custom-signin"
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
