import nodemailer from "nodemailer"
import { User } from '@prisma/client';
import SMTPTransport from "nodemailer/lib/smtp-transport";

const transport = new SMTPTransport({
  service: 'gmail',
  auth: {
    user: 'chiguas5000@gmail.com',
    pass: 'miSuperPassword',
  }
});

const transporter = nodemailer.createTransport(transport);

export default async function sendWelcomeMail(user: User) {
  await transporter.sendMail({
    from: 'chiguas5000@gmail.com',
    to: user.email,
    subject: `Bienvenido`,
    html: `<p>bienvenido ${user.name} a nuestra plataforma :)</p>`,
  })
}
