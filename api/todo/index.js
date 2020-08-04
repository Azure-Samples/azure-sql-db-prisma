require('dotenv').config();

var Connection = require('tedious').Connection;
var Request = require('tedious').Request
var TYPES = require('tedious').TYPES;

module.exports = function (context, req) {
    const toDo = req.body;
    var result = "";

    var connection = new Connection({
        server: process.env["server"],
        authentication: {
            type: 'default',
            options: {
                userName: process.env["userName"],
                password: process.env["password"],
            }
        },
        options: {
            database: process.env["database"],
            encrypt: true
        }
    });

    connection.connect();

    connection.on('connect', err => {
        if (err) {
            context.log(err);
            context.done();
        }
        else {
            executeStatement(req.body);
        }
    });
    
    function executeStatement(p1) {
        request = new Request("dbo.get_todo", (err) => {
            if (err) {
                context.log(err);
            }
            connection.close();
            context.res = {
                body: result
            }
            context.done();
        });

        request.on('row', columns => {
            columns.forEach(column => {
                result += column.value;                
            });
        });

        connection.execSql(request);
    }   
}
