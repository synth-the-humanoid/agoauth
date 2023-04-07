const crypto = require("crypto");
const request = require("./request.js");
const user = require("./user.js");

function createAPIKey(req, usr, callbackURL, sqlConnector) {
    var keyID = crypto.createHash("sha256").update(req.requestID + usr.userID + callbackURL).digest("hex");
    var loginKey = crypto.createHash("sha256").update(keyID + req.requestID + usr.userID + callbackURL).digest("hex");
    sqlConnector.insert(keyID + ", " + req.requestID + ", " + usr.userID + ", " + loginKey + ", " + callbackURL, "APIKeys");
    return new APIKey(keyID, sqlConnector);
}


class APIKey {
    constructor(keyID, sqlConnector) {
        this.connector = sqlConnector;
        this.keyID = keyID;
        var results = this.connector.select("RequestID, UserID, LoginKey, CallbackURL", "APIKeys", "STRCMP(KeyID, " + this.keyID + ") = 0")[0];
        this.request = new request.Request(results["RequestID"], sqlConnector);
        this.user = new user.User(results["UserID"], sqlConnector);
        this.loginKey = results["LoginKey"];
        this.callbackURL = results["CallbackURL"];
    }
}

exports.APIKey = APIKey;
exports.createAPIKey = createAPIKey;