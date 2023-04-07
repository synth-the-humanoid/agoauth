const request = require("./datatypes/request.js");
const emailCode = require("./datatypes/emailcode.js");
const user = require("./datatypes/user.js");
const token = require("./datatypes/token.js");

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

exports.register = register;
exports.login = login;