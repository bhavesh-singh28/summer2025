import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_APP_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

// Verify connection once at startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Email service connection failed:", error);
  } else {
    console.log("Email service ready to send messages.");
  }
});

// ✅ Student Signup Email
const studentsignup = async (to, email, password) => {
  try {
    const mailOptions = {
      from: process.env.GOOGLE_APP_EMAIL,
      to,
      subject: "Sign Up Successful",
      text: `Welcome to the Mess and Canteen Management System!

Your account has been created successfully.

Here are your login credentials:
Email: ${email}
Password: ${password}

Please keep this information safe and do not share it with anyone.

Thank you,
Mess and Canteen Management Team`,
    };

    await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error("Error sending signup email:", error);
  }
};

// ✅ OTP Verification Email
const sendOtpVerificationEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: process.env.GOOGLE_APP_EMAIL,
      to,
      subject: "OTP Verification - Mess and Canteen Management System",
      text: `Dear User,

We received a request to verify your email address. Please use the One-Time Password (OTP) below to complete your verification:

Your OTP: ${otp}

This OTP is valid for the next 10 minutes. Do not share it with anyone.

If you didn't request this, please ignore this email.

Best regards,  
Mess and Canteen Management Team`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

// ✅ Student Login Credentials Email
const sendLoginCredentials = async (to, fullName, email, password) => {
  try {
    const mailOptions = {
      from: process.env.GOOGLE_APP_EMAIL,
      to,
      subject:
        "🎉 Welcome! Your Account Has Been Approved - Login Credentials Inside",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Welcome to Mess Management!</h1>
            <p style="color: #e8e8e8; margin: 10px 0 0 0; font-size: 16px;">Your verification has been approved</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">🎉 Congratulations, ${fullName}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Great news! Your verification request has been approved by our admin team. 
              You can now access your student portal using the credentials below.
            </p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 5px;">
              <h3 style="color: #333; margin: 0 0 15px 0;">🔐 Your Login Credentials:</h3>
              <div style="margin-bottom: 10px;">
                <strong style="color: #667eea;">Email:</strong> 
                <span style="background: #e9ecef; padding: 5px 10px; border-radius: 3px; font-family: monospace;">${email}</span>
              </div>
              <div>
                <strong style="color: #667eea;">Password:</strong> 
                <span style="background: #e9ecef; padding: 5px 10px; border-radius: 3px; font-family: monospace;">${password}</span>
              </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>🔒 Security Notice:</strong> For your security, please change your password after your first login. 
                Keep your credentials confidential and never share them with anyone.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173/login" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 15px 30px; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        display: inline-block; 
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                🚀 Login to Your Account
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
              If you have any questions or need assistance, please contact our support team.<br>
              <strong>Mess & Canteen Management System</strong><br>
              📧 Email: support@messmanagement.com | 📞 Phone: +1 (555) 123-4567
            </p>
          </div>
        </div>
      `,
      text: `Welcome to Mess Management System!

Dear ${fullName},

Congratulations! Your verification request has been approved by our admin team.

Your Login Credentials:
Email: ${email}
Password: ${password}

For your security, please change your password after your first login.

Login URL: http://localhost:5173/login

Thank you,
Mess & Canteen Management Team`,
    };

    await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error("Error sending login credentials email:", error);
    throw error;
  }
};

// ✅ Export both functions
export { studentsignup, sendOtpVerificationEmail, sendLoginCredentials };
