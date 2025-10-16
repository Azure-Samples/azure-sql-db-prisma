import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { PrismaClient, Todo } from '@prisma/client'

const prisma = new PrismaClient()
var url:URL = null;
  
// Type definition for the request input of a todo
interface InputTodo {
  id?: string
  completed?: boolean
  title: string
  ownerId: string
}

class UrlHandler {
  context: InvocationContext;
  request: HttpRequest;

  url: URL;  
  loggedUserId: string;

  constructor(context: InvocationContext, req: HttpRequest) {
    this.context = context;
    this.request = req;  
    
    url = new URL(req.url)
  }

  public GetLoggedUserId(header: string): string
  {
    if (header)
    {
      const encoded = Buffer.from(header, 'base64');
      const decoded = encoded.toString('ascii');
      return JSON.parse(decoded).userId;    
    }
    
    return "anonymous"
  }

  public async Process(): Promise<HttpResponseInit>
  {
    try {
      const method = this.request.method.toLowerCase()        

      const header = this.request.headers['x-ms-client-principal'];
      this.loggedUserId = this.GetLoggedUserId(header);

      switch (method) {
        case 'get':
          if (this.request.params.id) {
            return await this.getTodo()
          } else {
            return await this.getTodos()
          }
        case 'post':
          return await this.createTodo()
        case 'patch':
        case 'put':
          return await this.updateTodo()
        case 'delete':
          if (this.request.params.id != null) {        
            return await this.deleteTodo()
          } else {
            return await this.deleteTodos()
          }      
        default:
          return { status: 405, body: 'Method not allowed' }
      }
    } catch (error) {
      return { status: 500, body: `Internal server error: ${error.message}` }
    }
  }

  public async getTodos(): Promise<HttpResponseInit> {
    const todos = await prisma.todo.findMany({
      where: {
        ownerId: this.loggedUserId
      } 
    })
  
    if (todos) {
      return { 
        status: 200,
        jsonBody: todos.map(todo => this.toClientToDo(todo))
      }
    } else {
      return { status: 404 }
    }
  }
  
  public async getTodo(): Promise<HttpResponseInit> {
    const parsedId = parseInt(this.request.params.id, 10)

    if (isNaN(parsedId)) {
      return { status: 400, body: 'Invalid ID format' }
    }
  
    const todo = await prisma.todo.findFirst({
      where: {
        id: parsedId,
        ownerId: this.loggedUserId
      }
    })
  
    if (todo) {
      return { 
        status: 200,
        jsonBody: this.toClientToDo(todo)
      }
    } else {
      return { status: 404 }
    }
  }
  
  public async createTodo(): Promise<HttpResponseInit> {
    var payload = await this.request.json()

    if (!this.isTodo(payload)) {
      return { status: 400, body: 'Invalid todo format' }
    }
  
    try {
      const todo = await prisma.todo.create({
        data: {
          todo: payload.title,
          completed: payload.completed || false,
          ownerId: this.loggedUserId
        },
      })
      return { 
        status: 201,
        jsonBody: this.toClientToDo(todo)
      }
    } catch (e) {
      return { 
        status: 500, 
        body: `Error creating todo: ${e.message}` 
      }
    }
  }
  
  public async deleteTodo(): Promise<HttpResponseInit> {
    const parsedId = parseInt(this.request.params.id, 10)

    if (isNaN(parsedId)) {
      return { status: 400, body: 'Invalid ID format' }
    }
  
    try {
      const todo = await prisma.todo.findFirst({
        where: {
          id: parsedId,
          ownerId: this.loggedUserId
        }
      })

      if (!todo) {
        return { status: 404, body: 'Todo not found' }
      }

      await prisma.todo.deleteMany({
        where: {
          id: parsedId,
          ownerId: this.loggedUserId
        }
      })

      return { 
        status: 200,
        jsonBody: this.toClientToDo(todo)
      }
    } catch (e) {
      return { 
        status: 500, 
        body: `Error deleting todo: ${e.message}` 
      }
    }
  }
  
  public async deleteTodos(): Promise<HttpResponseInit>  {
    try {
      const result = await prisma.todo.deleteMany({
        where: {          
          ownerId: this.loggedUserId
        }
      })
      
      return { 
        status: 200,
        jsonBody: { deleted: result.count }
      }
    } catch (e) {
      return { 
        status: 500, 
        body: `Error deleting todos: ${e.message}` 
      }
    }
  }
  
  public async updateTodo(): Promise<HttpResponseInit>  {
    var payload = await this.request.json()
    
    if (!this.isTodo(payload) || !this.request.params.id) {
      return { status: 400, body: 'Invalid todo format or missing ID' }
    }
  
    const parsedId = parseInt(this.request.params.id, 10)
    
    if (isNaN(parsedId)) {
      return { status: 400, body: 'Invalid ID format' }
    }
    
    try {
      const updateResult = await prisma.todo.updateMany({
        data: {
          todo: payload.title,
          completed: payload.completed 
        },
        where: {
          id: parsedId,
          ownerId: this.loggedUserId
        }
      })

      if (updateResult.count === 0) {
        return { status: 404, body: 'Todo not found' }
      }
      
      const todo = await prisma.todo.findFirst({
        where: {
          id: parsedId,
          ownerId: this.loggedUserId
        }
      })

      return { 
        status: 200,
        jsonBody: this.toClientToDo(todo)
      }
    } catch (e) {
      this.context.log(e)
      return { 
        status: 500, 
        body: `Error updating todo: ${e.message}` 
      }
    }  
  }
  
  // Function to validate at runtime while giving type safety
  private isTodo(todo: unknown): todo is InputTodo
  {
    return typeof todo === 'object' && ('title' in todo || 'completed' in todo) 
  }
  
  // The ToDo stored in the database has different name from the ToDo required by the Web Client
  private toClientToDo(todo: Todo) 
  {
    return {
      id: todo.id,
      title: todo.todo,
      completed: todo.completed,
      url: `${url.protocol}//${url.hostname}:${url.port}/api/todo/${todo.id}`
    }
  }
}

export async function processRequest(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> 
{
  const uh = new UrlHandler(context, request);
  return uh.Process();
}

app.http('httpRestTrigger', {
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
    authLevel: 'anonymous',
    handler: processRequest,
    route: "todo/{id:int?}"
});