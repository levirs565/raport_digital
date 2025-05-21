/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Request, Response } from 'express';
import { AppModule } from './app/app.module';
import { AppRouter } from './app/app.router';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext } from './trpc/trpc.context';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const appModule = app.get(AppModule);
  appModule.configureApp(app);

  const appRouter = app.get(AppRouter);

  app.use(
    '/api',
    trpcExpress.createExpressMiddleware({
      router: appRouter.router,
      createContext: createContext,
    })
  );

  app.use('/panel', async (_: Request, res: Response) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).send('Not found');
    }

    const { renderTrpcPanel } = await import('trpc-ui');

    return res.send(
      renderTrpcPanel(appRouter.router, {
        url: '/api',
        meta: {
          title: 'Raport Digital',
          description: 'Documentation for Raport Digital tRPC API',
        },
        transformer: 'superjson',
      })
    );
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
