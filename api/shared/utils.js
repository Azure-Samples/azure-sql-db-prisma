require('dotenv').config();

var Connection = require('tedious').Connection;
var Request = require('tedious').Request
var TYPES = require('tedious').TYPES;

const executeSQL = (context, verb, payload) => {
    var result = "";    
    const paramPayload = (payload != null) ? JSON.stringify(payload) : '';
    context.log(payload);

    const connection = new Connection({
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

    const request = new Request(`web.${verb}_todo`, (err) => {
        if (err) {
            context.log.error(err);
            context.res.status = 500;
            context.res.body = "Error executing T-SQL command";
        } else {
            context.res = {
                body: result
            }   
        }
        context.done();
    });    
    request.addParameter('payload', TYPES.NVarChar, paramPayload, Infinity);

    request.on('row', columns => {
        columns.forEach(column => {
            result += column.value;                
        });
    });

    connection.on('connect', err => {
        if (err) {
            context.log.error(err);              
            context.res.status = 500;
            context.res.body = "Error connecting to Azure SQL query";
            context.done();
        }
        else {
            connection.callProcedure(request);
        }
    });

    connection.connect();
}

exports.executeSQL = executeSQL;