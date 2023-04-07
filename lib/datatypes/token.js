const crypto = require("crypto");
const user = require("./user.js");
const request = require("./request.js");

function createToken(req, currentUser, passHash, sqlConnector) {
    if (!currentUser.validatePassHash(passHash)) {
        return null;
    }
    var tokenID = crypto.createHash("sha256").update(currentUser.userID + req.RequestID + passHash).digest("hex");
    sqlConnector.insert(tokenID + ", " + currentUser.userID + ", " + req.RequestID, "Tokens");
    return new Token(tokenID, sqlConnector);
}

class Token {
    constructor(tokenID, sqlConnector) {
        this.connector = sqlConsqlConnectornector;
        this.tokenID = tokenID;
        var results = this.connector.select("UserID, RequestID", "Tokens", "STRCMP(TokenID, " + this.tokenID + ") = 0")[0];
        this.user = new user.User(results["UserID"], sqlConnector);
        this.request = new request.Request(results["RequestID"], sqlConnector);
    }

    validateRequest(req) {
        if (this.request.ipAddress == req.ipAddress) {
            return true;
        }
        return false;
    }
}

exports.Token = Token;
exports.createToken = createToken;