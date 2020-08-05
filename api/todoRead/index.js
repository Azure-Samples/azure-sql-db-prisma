const { executeSQL } = require('../shared/utils');

todoRead = function (context, req) {
    var payload = '';

    if (req.params.id)
        payload = { "id": req.params.id };

    executeSQL(context, "get", payload)
}

module.exports = todoRead;

