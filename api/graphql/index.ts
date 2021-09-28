import { PrismaClient, Todo } from '@prisma/client'
import { ApolloServer, gql } from "apollo-server-azure-functions";

const prisma = new PrismaClient()

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
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

// @ts-ignore
const server = new ApolloServer({ 
  typeDefs, 
  resolvers, 
  debug: true, 
  playground: true,
  context: ({ request }) => {        
    return { 
      loggedUserId: getLoggedUserId(request.headers['x-ms-client-principal']) 
    };
  },
});

export default server.createHandler({
  cors: {
    origin: '*'
  },
});