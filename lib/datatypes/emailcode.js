const crypto = require("crypto");
const request = require("./request.js");

function createEmailCode(req, emailAddress, sqlConnector, mailConnector) {
    var emailCode = "";
    while(emailCode.length < 8) {
        emailCode += (Math.floor(Math.random() * 11)).toString();
    }
    var codeID = crypto.createHash("sha256").update(emailCode + req.requestID + emailAddress).digest("hex");
    mailConnector.sendMail(emailAddress, "AgoAuth Code", "Your AgoAuth Code is: " + emailCode);
    sqlConnector.insert(codeID + ", " + emailCode + ", " + req.requestID + ", " + emailAddress, "EmailCodes");

    return new EmailCode(codeID, sqlConnector);
}

class EmailCode {
    constructor(codeID, sqlConnector) {
        this.connector = sqlConnector;
        this.codeID = codeID;
        var results = this.connector.select("RequestID, EmailAddress", "EmailCodes", "STRCMP(CodeID, " + this.codeID + ") = 0")[0];
        this.request = new request.Request(results["RequestID"], sqlConnector);
        this.emailAddress = results["EmailAddress"];
    }

    getVerifiedRequest() {
        var results = this.connector.select("RequestID", "EmailVerifications", "STRCMP(CodeID, " + this.codeID + ") = 0");
            if (results.length == 0) {
                return null;
            }
            return new request.Request(results[0]["RequestID"], this.connector);
    }

    verifyRequest(emailCode, verifiedRequest) {
        var results = this.connector.select("STRCMP(EmailCode, " + emailCode + ") AS Comparison", "EmailCodes", "STRCMP(CodeID, " + this.codeID + ") = 0")[0];
        if (results["Comparison"] == 0) {
            this.connector.insert(this.codeID + ", " + verifiedRequest.requestID, "EmailVerifications");
            return true;
        }
        return false;
    }

    validate() {
        return new Promise((resolve, reject) => {
            var count = 0;
            var interval = setImmediate(() => {
                if (this.getVerifiedRequest()) {
                    clearInterval(interval);
                    resolve(this.codeID);
                }
                else if (count >= 20) {
                    clearInterval(interval);
                    reject("Request timed out")
                }
                else {
                    count++;
                }
            }, 5000);
        });
    }
}

exports.EmailCode = EmailCode;
exports.createEmailCode = createEmailCode;