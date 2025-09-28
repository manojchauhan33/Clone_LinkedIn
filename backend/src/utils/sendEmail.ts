import nodemailer from "nodemailer";

export const sendVerificationEmail = async (to: string, link: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"LinkedIn" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your email",
    html: `<h1>Welcome!</h1>
           <p>Click below to verify your email:</p>
           <a href="${link}">Verify Email</a>`,
  });
};


export const sendResetPasswordEmail = async (to: string, link: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Reset Your Password",
    html: `<p>Click <a href="${link}">here</a> to reset your password. Token expires in 15 minutes.</p>`,
  });
};