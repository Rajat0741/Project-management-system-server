import Mailgen from "mailgen";
import { google } from "googleapis";
import { env } from "../config/env.js";

interface SendEmailOptions {
    email: string;
    subject: string;
    mailgenContent: Mailgen.Content;
}

const sendEmail = async (options: SendEmailOptions) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Tasky- Project Management System",
            link: "https://tasky-steel-mu.vercel.app/"
        }
    })

    const emailHtml = mailGenerator.generate(options.mailgenContent);
    const emailText = mailGenerator.generatePlaintext(options.mailgenContent);

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
        env.GMAIL_CLIENT_ID,
        env.GMAIL_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: env.GMAIL_REFRESH_TOKEN
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Create email in MIME format
    const subject = options.subject;
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
    const messageParts = [
        `From: ${env.GMAIL_USER_EMAIL}`,
        `To: ${options.email}`,
        `Content-Type: multipart/alternative; boundary="boundary"`,
        `MIME-Version: 1.0`,
        `Subject: ${utf8Subject}`,
        "",
        "--boundary",
        "Content-Type: text/plain; charset=utf-8",
        "",
        emailText,
        "--boundary",
        "Content-Type: text/html; charset=utf-8",
        "",
        emailHtml,
        "--boundary--"
    ];

    const message = messageParts.join("\n");
    const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    try {
        await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage
            }
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error sending email: ${message}`);
        throw new Error(`Failed to send email: ${message}`);
    }

}

const emailVerificationMailgenContent = (username: string, verificationUrl: string) => {
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

const forgotPasswordMailgenContent = (username: string, passwordResetUrl: string) => {
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
