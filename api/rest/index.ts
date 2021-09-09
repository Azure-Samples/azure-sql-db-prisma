import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { PrismaClient, Todo } from '@prisma/client'

const prisma = new PrismaClient()

const restHandler: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<any> {
  const method = req.method.toLowerCase()

  switch (method) {
    case 'get':
      if (req?.params?.id) {
        await getTodo(context, req?.params?.id)
      } else {
        await getTodos(context)
      }
      break
    case 'post':
      await createTodo(context, req.body)
      break
    case 'put':
      await updateTodo(context, req?.params?.id, req.body)
      break
    case 'delete':
      await deleteTodo(context, req?.params?.id)
      break
  }
}

export default restHandler

async function getTodos(context: Context): Promise<void> {
  const todos = await prisma.todo.findMany()

  if (todos) {
    context.res.body = todos.map(todo => toClientToDo(todo))
  } else {
    context.res = { status: 404 }
  }
}

async function getTodo(context: Context, id: string): Promise<void> {
  const parsedId = parseInt(id, 10)
  if (isNaN(parsedId)) {
    context.res.status = 400
    return
  }

  const todo = await prisma.todo.findUnique({
    where: {
      id: parsedId
    },
  })

  if (todo) {
    context.res.body = toClientToDo(todo)
  } else {
    context.res = { status: 404 }
  }
}

async function createTodo(context: Context, body: unknown) {
  if (!isTodo(body)) {
    context.res.status = 400
    return
  }

  try {
    const todo = await prisma.todo.create({
      data: {
        todo: body.title,
        completed: body.completed
      },
    })
    context.res.body = toClientToDo(todo)
  } catch (e) {
    context.res.body = e
    context.res.status = 500
  }
}

async function deleteTodo(context: Context, id: string) {
  const parsedId = parseInt(id, 10)
  if (isNaN(parsedId)) {
    context.res.status = 400
    return
  }

  try {
    const todo = await prisma.todo.delete({
      where: {
        id: parsedId
      },
    })
    context.res.body = toClientToDo(todo)
  } catch (e) {
    context.res.status = 500
  }
}

async function updateTodo(context: Context, id: string, body: unknown) {
  if (!isTodo(body) || !id) {
    context.res.status = 400
    return
  }

  const parsedId = parseInt(id, 10)
  if (isNaN(parsedId)) {
    context.res.status = 400
    return
  }
  console.log(body);
  try {
    const todo = await prisma.todo.update({
      data: {
        todo: body.title,
        completed: body.completed 
      },
      where: {
        id: parsedId
      },
    })
    context.res.body = toClientToDo(todo)
  } catch (e) {
    context.log(e)
    context.res.status = 500
  }
}

// Type definition for the request input of a todo
interface InputTodo {
  id?: string
  completed?: boolean
  title: string
}

// Function to validate at runtime while giving type safety
const isTodo = (todo: unknown): todo is InputTodo => {
  return typeof todo === 'object' && ('title' in todo || 'completed' in todo)
}

// The ToDo stored in the database has different name from the ToDo required by the Web Client
const toClientToDo = (todo: Todo) => {
  return {
    id: todo.id,
    title: todo.todo,
    completed: todo.completed
  }
}