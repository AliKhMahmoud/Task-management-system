const nodemailer = require("nodemailer");

// handler the mail service
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false,
    auth: {
        user: "29f2f2d922353e",
        pass: "6ed6ccfdabeaca"
    }
});

const sendMessage = (mailOptions) => {
    if (!mailOptions.from) {
        mailOptions.from = "Your App <noreply@example.com>"; 
    }
    
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error Sending Message:", error.message);
                return reject(error); 
            }
        
            console.log(`Message Sent: ${info.messageId} - Response: ${info.response}`);
            resolve(info); 
        });
    });
}

module.exports = sendMessage;
