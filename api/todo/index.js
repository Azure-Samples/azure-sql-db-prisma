var Connection = require('tedious').Connection;
var Request = require('tedious').Request
var TYPES = require('tedious').TYPES;

module.exports = function (context, req) {
    const toDo = req.body;
    var result = "";

    var connection = new Connection({
        server: '172.29.179.73',
        authentication: {
            type: 'default',
            options: {
                userName: 'sa',
                password: 'Passw0rd!',
            }
        },
        options: {
            database: "ToDo01",
            encrypt: false
        }
    });

    connection.connect();

    connection.on('connect', err => {
        if (err) {
            context.log(err);
        }
        else {
            executeStatement(req.body);
        }
    });
    
    function executeStatement(p1) {
        request = new Request("dbo.get_todo", function (err, rowCount) {
            if (err) {
                context.log(err);
            }
            connection.close();
            context.res = {
                body: result
            }
            context.done();
        });

        request.on('row', function (columns) {
            columns.forEach(function (column) {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    result += column.value;
                }
            });
        });

        connection.execSql(request);
    }   
}
