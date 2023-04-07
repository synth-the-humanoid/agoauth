const nodemailer = require("nodemailer");

class MailConnector {
    constructor(mailConfigJSON) {
        var secure = false;
        if (mailConfigJSON["port"] == 587) {
            secure = true;
        }
        this.connector = nodemailer.createTransport({
            host: mailConfigJSON["host"],
            port: mailConfigJSON["port"],
            secure: secure,
            auth: {
                user: mailConfigJSON["user"],
                pass: mailConfigJSON["pass"]
            }
        });

        this.emailAddress = mailConfigJSON["user"] + "@" + mailConfigJSON["host"];
    }

    sendMail(to, subject, text) {
        var message = {
            from: this.emailAddress,
            to: to,
            subject: subject,
            text: text
        };
        return this.connector.sendMail(message, (err, info) => {
            if (err) {
                throw err;
            }
            return info;
        });
    }
};

export default MailConnector;