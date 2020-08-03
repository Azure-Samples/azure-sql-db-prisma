using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace api
{
    public class ToDoModel
    {
        public string Title {get; set;}
        public bool Completed {get; set;}
    }

    public static class ToDoController
    {
        [FunctionName("CreateToDo")]
        public static async Task<IActionResult> Post(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "todo")] HttpRequest req,
            ILogger log)
        {
            string body = await new StreamReader(req.Body).ReadToEndAsync();
            var todo = JsonConvert.DeserializeObject<ToDoModel>(body);

            return new OkObjectResult(todo);
        }       
    }
}
