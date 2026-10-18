import nodemailer from 'nodemailer';

// Email service commented out
const sendEmail = async (options) => {
  /*
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',           // Gmail SMTP
    port: 465,                        // TLS port
    secure: true,                     // Use true for 465
    auth: {
      user: process.env.GOOGLE_APP_EMAIL,    // match .env exactly
      pass: process.env.GOOGLE_APP_PASSWORD, // match .env exactly
    },
  });

  const mailOptions = {
    from: `Mess Management System <${process.env.GOOGLE_APP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('ERROR SENDING EMAIL:', error);
    throw new Error(error.message); // pass the real reason up
  }
  */
  return { success: true, message: "Email service disabled" };
};

export default sendEmail;
