import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { PrismaClient, Todo } from '@prisma/client'

const prisma = new PrismaClient()

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<any> {
  const method = req.method.toLowerCase()

  switch (method) {
    case 'get':
      await getTodo(context, req?.params?.id)
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

export default httpTrigger

async function getTodo(context: Context, id: string): Promise<void> {
  const parsedId = parseInt(id, 10)
  if (isNaN(parsedId)) {
    context.res.status = 400
    return
  }

  const todo = await prisma.todo.findUnique({
    where: {
      id: parsedId,
    },
  })

  if (todo) {
    context.res.body = todo
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
        todo: body.todo,
        completed: body.completed === 'true' || undefined,
      },
    })
    context.res.body = todo
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
        id: parsedId,
      },
    })
    context.res.body = todo
  } catch (e) {
    context.res.status = 500
  }
}

async function updateTodo(context: Context, id: string, body: unknown) {
  if (!isTodo(body) || !id) {
    context.res.status = 400
    return
  }

  try {
    // convert to boolean and undefined if not passed in so it doesn't change in the DB
    const completed =
      body.completed === 'true'
        ? true
        : body.completed === 'false'
        ? false
        : undefined

    const todo = await prisma.todo.update({
      data: {
        todo: body.todo,
        completed,
      },
      where: {
        id: parseInt(id, 10),
      },
    })
    context.res.body = todo
  } catch (e) {
    context.log(e)
    context.res.status = 500
  }
}

// Type definition for the request input of a todo
interface InputTodo {
  id?: string
  completed?: string
  todo: string
}

// Function to validate at runtime while giving type safety 
const isTodo = (todo: unknown): todo is InputTodo => {
  return typeof todo === 'object' && ('todo' in todo || 'completed' in todo)
}
