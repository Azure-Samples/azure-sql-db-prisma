const { executeSQL } = require('../shared/utils');

todoCreate = function (context, req) {
    executeSQL(context, "post", req.body)
}

module.exports = todoCreate;


