module.exports = async function (context, req) {
    const toDo = req.body;
    
    context.res = {        
        body: toDo
    };
}