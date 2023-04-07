const crypto = require("crypto");

function createRequest(ipAddress, apiEndpoint, sqlConnector) {
    var creationTimestamp = new Date().toISOString().substring(0,19).replace("T", " ");
    var requestID = crypto.createHash("sha256").update(ipAddress + creationTimestamp + apiEndpoint).digest("hex");
    sqlConnector.insert(requestID + ", " + ipAddress + ", " + creationTimestamp + ", " + apiEndpoint, "Requests");

    return new Request(requestID, sqlConnector);
}

class Request {
    constructor(requestID, sqlConnector) {
        this.connector = sqlConnector;
        this.requestID = requestID;
        var results = this.connector.select("INET_NTOA(IPAddress) AS IPAddress, CreationTimestamp, APIEndpoint", "Requests", "STRCMP(RequestID, " + this.requestID + ") = 0")[0];
        this.ipAddress = results["IPAddress"];
        this.apiEndpoint = results["APIEndpoint"];
        this.creationTimestamp = new Date(results["CreationTimestamp"]);
    }
}

exports.Request = Request;
exports.createRequest = createRequest;