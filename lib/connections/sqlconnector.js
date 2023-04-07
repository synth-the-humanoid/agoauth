const mysql = require("mysql");

class SQLConnector {
    constructor(sqlConfigJSON) {
        this.connector = mysql.createConnection(sqlConfigJSON);
    }

    query(sqlQuery) {
        return new Promise((resolve, reject) => {
            this.connector.connect((err) => {
                if (err) {
                    reject(err);
                }
                this.connector.query(sqlQuery, (err, results) => {
                    if (err) {
                        reject(err);
                    }

                    this.connector.end((err) => {
                        if (err) {
                            reject(err);
                        }
                    });

                    resolve(results);
                });
            });
        });
    }

    select(values, table, where="", etc="") {
        var sqlQuery = "SELECT " + values + " FROM " + table;

        if (where != "") {
            sqlQuery += " WHERE " + where;
        }

        if (etc != "") {
            sqlQuery += " " + etc;
        }

        return this.query(sqlQuery).then((results) => {
            return results;
        }).catch((err) => {
            throw err;
        });
    }

    insert(values, table) {
        var sqlQuery = "INSERT INTO " + table + " VALUES (" + values + ")";

        return this.query(sqlQuery).then((results) => {
            return results;
        }).catch((err) => {
            throw err;
        });
    }
}

export default SQLConnector;