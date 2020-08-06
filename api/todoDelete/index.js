const { executeSQL } = require('../shared/utils');

todoDelete = function (context, req) {
    var payload = { "id": req.params.id };

    executeSQL(context, "delete", payload)
}

module.exports = todoDelete;

