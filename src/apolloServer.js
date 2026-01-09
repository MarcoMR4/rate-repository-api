import { ApolloServer } from '@apollo/server';
import { ValidationError } from 'yup';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { koaMiddleware } from '@as-integrations/koa';
import AuthService from './utils/authService.js';
import createDataLoaders from './utils/createDataLoaders.js';
import logger from './utils/logger.js';
import { resolvers, typeDefs } from './graphql/schema.js';

const apolloErrorFormatter = (error) => {
  logger.error(error);
  const { originalError } = error;
  if (originalError instanceof ValidationError) {
    return {
      message: error.message,
      extensions: {
        code: 'BAD_USER_INPUT',
        errors: originalError.errors,
      },
    };
  }
  return error;
};

const createApolloServer = (httpServer) => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    formatError: apolloErrorFormatter,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
};

export { createApolloServer, koaMiddleware, AuthService, createDataLoaders };
