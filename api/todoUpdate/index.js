const { executeSQL } = require('../shared/utils');

todoUpdate = function (context, req) {
    var payload = { 
        "id": req.params.id,
        "todo": req.body
    };

    executeSQL(context, "put", payload)
}

module.exports = todoUpdate;

