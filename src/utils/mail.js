import Mailgen from "mailgen";
import { google } from "googleapis";

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

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Create email in MIME format
    const subject = options.subject;
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
    const messageParts = [
        `From: ${process.env.GMAIL_USER_EMAIL || "projectpms1255@gmail.com"}`,
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
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
        throw new Error(`Failed to send email: ${error.message}`);
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
