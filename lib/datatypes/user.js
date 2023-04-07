const crypto = require("crypto");
const request = require("./request.js");
const accessRole = require("./accessrole.js");
const token = require("./token.js");

function createUser(req, emailAddress, passHash, sqlConnector, eCode) {
    if (emailInUse(emailAddress, sqlConnector)) {
        return null;
    }

    return eCode.validate().then((codeID) => {
        var userID = crypto.createHash("sha256").update(req.requestID + emailAddress + passHash).digest("hex");
        sqlConnector.insert(userID + ", " + req.requestID , "Users");
        var newUser = new User(userID, sqlConnector);
        newUser.updateEmailAddress(req, eCode);
        newUser.updatePassHash(passHash);
        if (getUserCount(sqlConnector) == 0) {
            var newToken = token.createToken(req, newUser, passHash, sqlConnector);
            newUser.assignRole(req, newToken, accessRole.getRoleByName("ADMIN"), true);
        }

        return newUser;
    }).catch((err) => {
        return null;
    });
}

function getUserByEmail(emailAddress, sqlConnector) {
    var results = sqlConnector.select("EmailUpdates.UserID", "EmailUpdates", "STRCMP(EmailCodes.EmailAddress, " + emailAddress + ") = 0", " INNER JOIN EmailCodes ON EmailUpdates.CodeID = EmailCodes.CodeID INNER JOIN Requests ON EmailUpdates.RequestID = Requests.RequestID GROUP BY EmailUpdates.UserID ORDER BY Requests.CreationTimestamp DESC");
    if (results.length == 0) {
        return null;
    }
    return new User(results[0]["UserID"], sqlConnector);
}

function emailInUse(emailAddress, sqlConnector) {
    return (getUserByEmail(emailAddress, sqlConnector) != null);
}

function getUserCount(sqlConnector) {
    return sqlConnector.select("COUNT(UserID) AS UserCount", "Users")[0]["UserCount"];
}

class User {
    constructor(userID, sqlConnector) {
        this.connector = sqlConnector;
        this.userID = userID;
        var requestID = this.connector.select("RequestID", "Users", "STRCMP(UserID, " + this.userID + ") = 0")[0]["RequestID"];
        this.request = new request.Request(requestID, this.connector);
    }

    updatePassHash(req, passHash) {
        this.connector.insert(this.userID + ", " + req.requestID + ", " + passHash);
    }

    updateEmailAddress(req, eCode) {
        if (emailInUse(eCode.emailAddress)) {
            return false;
        }

        return eCode.validate().then((codeID) => {
            this.connector.insert(this.userID + ", " + req.requestID + ", " + codeID);
        }).catch((err) => {
            return false;
        });
    }

    getEmailAddress() {
        var results = this.connector.select("EmailCodes.EmailAddress", "EmailCodes", "STRCMP(EmailUpdates.UserID, " + this.userID + ") = 0", "INNER JOIN EmailUpdates ON EmailCodes.CodeID = EmailUpdates.CodeID INNER JOIN Requests ON EmailUpdates.RequestID = Requests.RequestID ORDER BY Requests.CreationTimestamp DESC")[0];
        return results["EmailAddress"];
    }

    validatePassHash(passHash) {
        var results = this.connector.select("STRCMP(HashUpdates.UserHash, " + passHash + ") AS Comparison", "HashUpdates", "STRCMP(HashUodates.UserID, " + this.userID + ") = 0", "INNER JOIN Requests ON HashUpdates.RequestID = Requests.RequestID ORDER BY Requests.CreationTimestamp DESC")[0];
        return results["Comparison"] == 0;
    }

    assignRole(req, tok, role, enabled) {
        if (enabled) {
            enabled = 1;
        }
        else {
            enabled = 0;
        }

        this.connector.insert(role.roleID + ", " + req.requestID + ", " + this.userID + ", " + tok.tokenID + ", " + enabled, "RoleAssignments");
    }

    getRoles() {
        var results = this.connector.select("RoleAssignments.RoleID", "RoleAssignments", "STRCMP(RoleAssignments.UserID, " + this.userID + ") = 0 AND RoleAssignments.Enabled = 1", "INNER JOIN Requests ON RoleAssignments.RequestID = Requests.RequestID GROUP BY RoleAssignments.RoleID ORDER BY Requests.CreationTimestamp DESC");
        return results.forEach((roleID) => {
            return new accessRole.AccessRole(roleID, this.connector);
        });
    }

    checkForRoleName(roleName) {
        var roleNames = this.getRoles().forEach((roleObj) => {
            return roleObj.roleName;
        });
        return (roleName in roleNames);
    }
}

exports.User = User;
exports.createUser = createUser;
exports.getUserByEmail = getUserByEmail;