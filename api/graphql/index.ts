import { PrismaClient, Todo } from '@prisma/client'
import { ApolloServer, gql } from "apollo-server-azure-functions";

require('dotenv').config()

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

    todoList: () => {
      return prisma.todo.findMany().then(value => value.map(todo => toClientToDo(todo)))
    },

    todo: (parent, args) => {
      return prisma.todo.findUnique({
        where: {
          id: parseInt(args.id, 10)
        },
      }).then(value => toClientToDo(value))
    }

  },

  Mutation: {

    addTodo: (parent, args) => {
      return prisma.todo.create({
        data: {
          todo: args.title,
          completed: args.completed
        }
      }).then(value => toClientToDo(value))
    },

    updateTodo: (parent, args) => {
      return prisma.todo.update({
        data: {
          todo: args.title,
          completed: args.completed ?? false
        },
        where: {
          id: parseInt(args.id, 10)
        }
      }).then(value => toClientToDo(value))
    },

    deleteTodo: (parent, args) => {
      return prisma.todo.delete({
        where: {
          id: parseInt(args.id, 10)
        }
      }).then(value => toClientToDo(value))
    }

  }
};

const toClientToDo = (todo: Todo) => {
  return {
    id: todo.id,
    title: todo.todo ,
    completed: todo.completed 
  }
}

// @ts-ignore
const server = new ApolloServer({ typeDefs, resolvers, debug: true, playground: true });

export default server.createHandler({
  cors: {
    origin: '*'
  },
});