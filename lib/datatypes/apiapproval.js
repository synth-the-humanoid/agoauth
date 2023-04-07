const crypto = require("crypto");

function createApproval(aKey, req, usr, sqlConnector) {
    var approvalID = crypto.createHash("sha256").update(aKey.keyID + req.requestID + usr.userID).digest("hex");
    var externUserID = crypto.createHash("sha256").update(usr.userID + aKey.keyID).digest("hex");
    sqlConnector.insert(approvalID + ", " + aKey.keyID + ", " + req.requestID + ", " + usr.userID + ", " + externUserID, "APIApprovals");
    return new APIApproval(approvalID, sqlConnector);
}

function getApprovalFromExternUserID(externUserID, sqlConnector) {
    var results = sqlConnector.select("ApprovalID", "APIApprovals", "STRCMP(ExternUserID, " + externUserID + ") = 0");
    if (results.len == 0) {
        return null;
    }

    return new APIApproval(results[0]["ApprovalID"], sqlConnector);
}

class APIApproval {
    constructor(approvalID, sqlConnector) {
        this.connector = sqlConnector;
        this.approvalID = approvalID;
        var results = this.connector.select("KeyID, RequestID, UserID, ExternUserID", "APIApprovals", "STRCMP(ApprovalID, " + this.approvalID + ") = 0")[0];
        this.apiKey = new APIKey(results["KeyID"], sqlConnector);
        this.request = new request.Request(results["RequestID"], sqlConnector);
        this.user = new user.User(results["UserID"], sqlConnector);
        this.externUserID = results["ExternUserID"];
    }

    revoke(req, tok) {
        this.connector.insert(this.approvalID + ", " + req.requestID + ", " + tok.tokenID, "APIRevocations");
    }

    isActive() {
        var results = this.connector.select("ApprovalID", "APIRevocations", "STRCMP(ApprovalID, " + this.approvalID + ") = 0");
        return (results.length == 0);
    }
}

exports.APIApproval = APIApproval;
exports.createApproval = createApproval;
exports.getApprovalFromExternUserID = getApprovalFromExternUserID;