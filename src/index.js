import http from 'http';

import logger from './utils/logger.js';
import { API_PORT, APOLLO_PORT } from './config.js';
import {
  createApolloServer,
  AuthService,
  koaMiddleware,
} from './apolloServer.js';
import app from './app.js';

const startServer = async () => {
  const httpServer = http.createServer(app);

  const apolloServer = createApolloServer(httpServer);

  await apolloServer.start();

  app.use(
    koaMiddleware(apolloServer, {
      context: async ({ ctx }) => {
        const token = ctx.request.header.authorization;
        const accessToken = token && token.toLowerCase().startsWith('bearer ')
          ? token.substring(7)
          : null;

        return {
          authService: new AuthService({
            accessToken,
            dataLoaders: ctx.dataLoaders,
          }),
          dataLoaders: ctx.dataLoaders,
        };
      },
    }),
  );

  httpServer.on('request', app.callback());

  await new Promise((resolve) =>
    httpServer.listen({ port: API_PORT }, resolve),
  );

  logger.info(`Apollo Server ready at http://localhost:${API_PORT}`);
};

startServer();
