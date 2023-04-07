const request = require("./datatypes/request.js");
const emailCode = require("./datatypes/emailcode.js");
const user = require("./datatypes/user.js");
const token = require("./datatypes/token.js");
const accessRole = require("./datatypes/accessrole.js");

function register(emailAddress, passHash, ipAddress, apiEndpoint, sqlConnector, mailConnector) {
    var newRequest = request.createRequest(ipAddress, apiEndpoint, sqlConnector);
    var eCode = emailCode.createEmailCode(newRequest, emailAddress, sqlConnector, mailConnector);
    var newUser = user.createUser(newRequest, emailAddress, passHash, sqlConnector, eCode);
    if ( newUser ) {
        var newToken = token.createToken(newRequest, newUser, passHash, sqlConnector);
        return {
            token: newToken.tokenID,
            error: ""
        };
    }
    return {
        token: "",
        error: "Unable to create user."
    };
}

function login(emailAddress, passHash, ipAddress, apiEndpoint, sqlConnector) {
    var newRequest = request.createRequest(ipAddress, apiEndpoint, sqlConnector);
    var currentUser = user.getUserByEmail(emailAddress, sqlConnector);
    if ( currentUser ) {
        var newToken = token.createToken(newRequest, currentUser, passHash, sqlConnector);
        if ( newToken ) {
            return {
                token: newToken.tokenID,
                error: ""
            };
        }
        return {
            token: "",
            error: "Invalid password"
        };
    }
    return {
        token: "",
        error: "Email address not in use"
    };
}

function updateEmail(tokenID, emailAddress, ipAddress, apiEndpoint, sqlConnector, mailConnector) {
    var newRequest = request.createRequest(ipAddress, apiEndpoint, sqlConnector);
    var eCode = emailCode.createEmailCode(newRequest, emailAddress, sqlConnector, mailConnector);
    var currentToken = new token.Token(tokenID, sqlConnector);
    
    if ( currentToken ) {
        if ( currentToken.user.updateEmailAddress(newRequest, eCode) ) {
            return {
                error: ""
            };
        }
        return {
            error: "Unable to update email address."
        };
    }
    return {
        error: "Invalid token"
    };
}

function updatePassHash(tokenID, passHash, ipAddress, apiEndpoint, sqlConnector) {
    var newRequest = request.createRequest(ipAddress, apiEndpoint, sqlConnector);
    var currentToken = new token.Token(tokenID, sqlConnector);
    if ( currentToken ) {
        currentToken.user.updatePassHash(newRequest, passHash);
        return {
            error: ""
        };
    }
    return {
        error: "Invalid token"
    }
}

function setRole(tokenID, userID, roleName, enabled, ipAddress, apiEndpoint, sqlConnector) {
    var newRequest = request.createRequest(ipAddress, apiEndpoint, sqlConnector);
    var currentToken = new token.Token(tokenID, sqlConnector);
    if ( currentToken ) {
        if ( currentToken.user.checkForRoleName("ADMIN") ) {
            var currentUser = new user.User(userID, sqlConnector);
            if ( currentUser ) {
                var role = accessRole.getRoleByName(roleName, sqlConnector);
                if ( role ) {
                    currentUser.assignRole(newRequest, currentToken, role, enabled)
                    return {
                        error: ""
                    };
                }
                return {
                    error: "Role doesn't exist"
                };
            }
            return {
                error: "Invalid user ID"
            };
        }
        return {
            error: "Invalid permissions"
        };
    }
    return {
        error: "Invalid token"
    };
}

exports.register = register;
exports.login = login;
exports.updateEmail = updateEmail;
exports.updatePassHash = updatePassHash;
exports.setRole = setRole;