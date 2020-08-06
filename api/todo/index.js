const { executeSQL } = require('../shared/utils');

todoREST = function (context, req) {    
    const method = req.method.toLowerCase();
    var payload = null;
    
    switch(method) {
        case "get":
            payload = req.params.id ? { "id": req.params.id } : null;            
            break;
        case "post":
            payload = req.body;            
            break;
        case "put":
            payload =  { 
                "id": req.params.id,
                "todo": req.body
            };   
            break;
        case "delete":
            payload = { "id": req.params.id };
            break;       
    }

    executeSQL(context, method, payload)
}

module.exports = todoREST;

