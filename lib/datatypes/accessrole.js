const crypto = require("crypto");
const systemRoles = ["ADMIN", "DEVELOPER"];

function createRole(roleName, sqlConnector) {
    var roleID = crypto.createHash("sha256").update(roleName + new Date().toString()).digest("hex");
    sqlConnector.insert(roleID + ", " + roleName, "AccessRoles");
    return new AccessRole(roleID, sqlConnector);
}

function hasBeenInitialized(sqlConnector) {
  return (sqlConnector.select("COUNT(RoleID) AS RoleCount", "AccessRoles")[0]["RoleCount"] == 0);
}

function ensureInitialized(sqlConnector) {
    if (hasBeenInitialized(sqlConnector)) {
        return;
    }
    
    systemRoles.forEach((roleName) => {
        createRole(roleName, sqlConnector);
    });
    return;
}

function getRoleByName(roleName, sqlConnector) {
    var results = sqlConnector.select("RoleID", "AccessRoles", "STRCMP(RoleName, " + roleName + ") = 0");
    if (results.length == 0) {
        return null;
    }
    return new AccessRole(results[0]["RoleID"], sqlConnector);
}

class AccessRole {
    constructor(roleID, sqlConnector) {
        this.connector = sqlConnector;
        this.roleID = roleID;
        this.roleName = this.connector.select("RoleName", "AccessRoles", "STRCMP(RoleID, " + this.roleID + ") = 0")[0]["RoleName"];
    }
}

exports.AccessRole = AccessRole;
exports.createRole = createRole;
exports.ensureInitialized = ensureInitialized;
exports.getRoleByName = getRoleByName;