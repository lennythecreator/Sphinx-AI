import NextAuth from "next-auth"
import Nodemailer from "next-auth/providers/nodemailer"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
})