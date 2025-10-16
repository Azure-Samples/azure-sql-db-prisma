import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { PrismaClient, Todo } from '@prisma/client'
import { ApolloServer } from '@apollo/server'

const prisma = new PrismaClient()

// Construct a schema, using GraphQL schema language
const typeDefs = `
  type Query {
      todo(
        id: ID!
      ): Todo

      todoList: [Todo!]!
  }

  type Mutation {
    
    addTodo(
      title: String!,
      completed: Boolean
    ): Todo

    updateTodo(
      id: ID!,
      title: String,
      completed: Boolean
    ): Todo

    deleteTodo(
      id: ID!
    ): Todo

  }

  type Todo {
      id: ID!
      title: String!
      completed: Boolean
  }
`

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {

    todoList: (parent, args, context)  => {
      return prisma.todo.findMany({
        where: { 
          ownerId: context.loggedUserId
        }
      }).then(value => value.map(todo => toClientToDo(todo)))
    },

    todo: (parent, args, context)  => {
      return prisma.todo.findFirst({
        where: {
          id: parseInt(args.id, 10),
          ownerId: context.loggedUserId
        },
      }).then(value => toClientToDo(value))
    }

  },

  Mutation: {

    addTodo: (parent, args, context) => {
      return prisma.todo.create({
        data: {
          todo: args.title,
          completed: args.completed,
          ownerId: context.loggedUserId
        }
      }).then(value => toClientToDo(value))
    },

    updateTodo: (parent, args, context)  => {
      const parsedId = parseInt(args.id, 10)

      return prisma.todo.updateMany({
        data: {
          todo: args.title,
          completed: args.completed
        },
        where: {
          id: parsedId,
          ownerId: context.loggedUserId
        }
      }).then(value => {
        return prisma.todo.findFirst({
          where: {
            id: parsedId,
            ownerId: context.loggedUserId
          }
        })
      }).then(value => toClientToDo(value))
    },

    deleteTodo: (parent, args, context)  => {
      const parsedId = parseInt(args.id, 10)

      return prisma.todo.findFirst({
        where: {
          id: parseInt(args.id, 10),
          ownerId: context.loggedUserId
        }
      }).then(value => {
        return prisma.todo.deleteMany({
          where: {
            id: parsedId,
            ownerId: context.loggedUserId
          }
        }).then(_ => toClientToDo(value))
      })
    }

  }
};

const toClientToDo = (todo: Todo) => {
  return {
    id: todo.id,
    title: todo.todo,
    completed: todo.completed
  }
}

const getLoggedUserId = (header: string): string => 
{
  if (header)
  {
    const encoded = Buffer.from(header, 'base64');
    const decoded = encoded.toString('ascii');
    return JSON.parse(decoded).userId;    
  }
  
  return "anonymous"
}

const server = new ApolloServer({ 
  typeDefs, 
  resolvers
});

// Flag to ensure server is started only once
let serverStarted = false;

const graphqlHandler = async function (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Start the server only once
    if (!serverStarted) {
      await server.start();
      serverStarted = true;
    }

    const loggedUserId = getLoggedUserId(req.headers.get('x-ms-client-principal'));
    
    const body = await req.text();
    const { query, variables, operationName } = JSON.parse(body);

    const result = await server.executeOperation(
      {
        query,
        variables,
        operationName,
      },
      {
        contextValue: { loggedUserId },
      }
    );

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    context.log('GraphQL Error:', error);
    return {
      status: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export default graphqlHandler;

app.http('httpGraphQLTrigger', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: graphqlHandler,
    route: "todo/graphql"
});