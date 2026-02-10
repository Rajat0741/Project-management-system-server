import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "https://taskmanagelink.com"
        }
    })

    const emailHtml = mailGenerator.generate(options.mailgenContent);
    const emailText = mailGenerator.generatePlaintext(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mail = {
        from: "projectpms1255@gmail.com",
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHtml
    }

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.log("Email service failed silently. Make sure you have configured the SMTP credentials in the .env file");
        console.error(`Error sending email: ${error}`);
    }

}

const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "You have successfully created an account on our platform. Please verify your email address by clicking on the button below.",
            action: {
                instructions: "To verify your email address, please click on the button below.",
                button: {
                    color: "#1fc816ff",
                    text: "Verify Email Address",
                    link: verificationUrl
                }
            },
            outro: "If you did not create an account, please ignore this email or reply to this email to let us know."
        }
    };
}

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "You have requested to reset your password. Please click on the button below to reset your password.",
            action: {
                instructions: "To reset your password, please click on the button below.",
                button: {
                    color: "#1fc816ff",
                    text: "Reset Password",
                    link: passwordResetUrl
                }
            },
            outro: "If you did not request to reset your password, please ignore this email or reply to this email to let us know."
        }
    };
}

export {
    sendEmail,
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent
};
