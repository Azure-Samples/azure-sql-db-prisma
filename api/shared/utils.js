require('dotenv').config();

var Connection = require('tedious').Connection;
var Request = require('tedious').Request
var TYPES = require('tedious').TYPES;

const executeSQL = (context, verb, payload) => {
    var result = "";    

    var connection = new Connection({
        server: process.env["db_server"],
        authentication: {
            type: 'default',
            options: {
                userName: process.env["db_user"],
                password: process.env["db_password"],
            }
        },
        options: {
            database: process.env["db_database"],
            encrypt: true
        }
    });

    connection.connect();

    connection.on('connect', err => {
        if (err) {
            context.log.error(err);
            context.done();
        }
        else {
            request = new Request(`dbo.${verb}_todo`, (err) => {
                if (err) {
                    context.log.error(err);
                }
                connection.close();
                context.res = {
                    body: result
                }
                context.done();
            });
        
            request.addParameter('payload', TYPES.NVarChar, JSON.stringify(payload), Infinity);
        
            request.on('row', columns => {
                columns.forEach(column => {
                    result += column.value;                
                });
            });
        
            connection.callProcedure(request);
        }
    });
}

exports.executeSQL = executeSQL;