// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";

const authOptions: AuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 14,      // fortnight expiry
        updateAge: 60 * 60 * 24,        // daily refresh
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                mode: { label: "Mode", type: "text" },       // "login" or "register"
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                username: { label: "Username", type: "text" },// register only
            },
            async authorize(credentials) {
                if (!credentials) return null;
                const { mode, email, password, username } = credentials;

                // Register
                if (mode === "register") {
                    const existing = await prisma.user.findUnique({ where: { email } });
                    if (existing) {
                        throw new Error("Email is already in use. Try login.");
                    }
                    const hashed = await hash(password, 12);
                    // create with PRISMA
                    const user = await prisma.user.create({
                        data: { email, password: hashed, name: username },
                    });
                    return { id: user.id, email: user.email, name: user.name };
                }

                // Login
                if (mode === "login") {
                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) {
                        throw new Error("Hey! You are not registed yet!");
                    }
                    const isValid = await compare(password, user.password);
                    if (!isValid) {
                        throw new Error("Come'on! You can remember your password!");
                    }
                    return { id: user.id, email: user.email, name: user.name };
                }

                return null;
            },
        }),
    ],
    callbacks: {
        // Inject user id into jwt
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        // then into session
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
        // future custom route goes here, e.g. signIn: "/auth/custom-signin"
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
