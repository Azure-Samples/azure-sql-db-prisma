import { AzureFunction, Context, HttpRequest } from '@azure/functions'
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
  context: Context;
  req: HttpRequest;

  url: URL;  
  loggedUserId: string;

  constructor(context: Context, req: HttpRequest) {
    this.context = context;
    this.req = req;  
    
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

  public async Process(): Promise<any>
  {
    const method = this.req.method.toLowerCase()        

    const header = this.req.headers['x-ms-client-principal'];
    this.loggedUserId = this.GetLoggedUserId(header);

    switch (method) {
      case 'get':
        if (this.req.params.id) {
          await this.getTodo()
        } else {
          await this.getTodos()
        }
        break
      case 'post':
        await this.createTodo()
        break
      case 'patch':
        await this.updateTodo()
        break
      case 'put':
        await this.updateTodo()
        break
      case 'delete':
        if (this.req.params.id != null) {        
          await this.deleteTodo()
        } else {
          await this.deleteTodos()
        }      
        break
    }
  }

  public async getTodos(): Promise<void> {
    const todos = await prisma.todo.findMany({
      where: {
        ownerId: this.loggedUserId
      } 
    })
  
    if (todos) {
      this.context.res.body = todos.map(todo => this.toClientToDo(todo))
    } else {
      this.context.res = { status: 404 }
    }
  }
  
  public async getTodo(): Promise<void> {
    const parsedId = parseInt(this.req.params.id, 10)

    if (isNaN(parsedId)) {
      this.context.res.status = 400
      return
    }
  
    const todo = await prisma.todo.findFirst({
      where: {
        id: parsedId,
        ownerId: this.loggedUserId
      }
    })
  
    if (todo) {
      this.context.res.body = this.toClientToDo(todo)
    } else {
      this.context.res = { status: 404 }
    }
  }
  
  public async createTodo(): Promise<void> {
    if (!this.isTodo(this.req.body)) {
      this.context.res.status = 400
      return
    }
  
    try {
      const todo = await prisma.todo.create({
        data: {
          todo: this.req.body.title,
          completed: this.req.body.completed,
          ownerId: this.loggedUserId
        },
      })
      this.context.res.body = this.toClientToDo(todo)
    } catch (e) {
      this.context.res.body = e
      this.context.res.status = 500
    }
  }
  
  public async deleteTodo(): Promise<void> {
    const parsedId = parseInt(this.req.params.id, 10)

    if (isNaN(parsedId)) {
      this.context.res.status = 400
      return
    }
  
    try {
      const todo = await prisma.todo.findFirst({
        where: {
          id: parsedId,
          ownerId: this.loggedUserId
        }
      })

      await prisma.todo.deleteMany({
        where: {
          id: parsedId,
          ownerId: this.loggedUserId
        }
      })

      this.context.res.body = this.toClientToDo(todo)
    } catch (e) {
      this.context.res.status = 500
    }
  }
  
  public async deleteTodos(): Promise<void>  {
    try {
      const todo = await prisma.todo.deleteMany({
        where: {          
          ownerId: this.loggedUserId
        }
      })    
    } catch (e) {
      this.context.res.status = 500
    }
  }
  
  public async updateTodo(): Promise<void>  {
    if (!this.isTodo(this.req.body) || !this.req.params.id) {
      this.context.res.status = 400
      return
    }
  
    const parsedId = parseInt(this.req.params.id, 10)
    
    if (isNaN(parsedId)) {
      this.context.res.status = 400
      return
    }
    
    try {
      await prisma.todo.updateMany({
        data: {
          todo: this.req.body.title,
          completed: this.req.body.completed 
        },
        where: {
          id: parsedId,
          ownerId: this.loggedUserId
        }
      })
      
      const todo = await prisma.todo.findFirst({
        where: {
          id: parsedId,
          ownerId: this.loggedUserId
        }
      })

      this.context.res.body = this.toClientToDo(todo)
    } catch (e) {
      this.context.log(e)
      this.context.res.status = 500
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

const restHandler: AzureFunction = async function (context: Context, req: HttpRequest): Promise<any> 
{
  const uh = new UrlHandler(context, req);
  return uh.Process();
}

export default restHandler

