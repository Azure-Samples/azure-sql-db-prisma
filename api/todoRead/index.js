const { executeSQL } = require('../shared/utils');

todoRead = function (context, req) {
    var payload = { "id": req.params.id };

    executeSQL(context, "get", payload)
}

module.exports = todoRead;

