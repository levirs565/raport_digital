import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc/trpc.service';
import { TrpcRouter } from '../trpc/trpc.router';
import { AuthRouter } from '../auth/auth.router';
import { OperatorRouter } from '../operator/operator.router';
import { GuruRouter } from '../guru/guru.router';
import { CommonRouter } from '../common/common.router';

@Injectable()
export class AppRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly trpcRouter: TrpcRouter,
    private readonly authRouter: AuthRouter,
    private readonly commonRouter: CommonRouter,
    private readonly operatorRouter: OperatorRouter,
    private readonly guruRouter: GuruRouter
  ) {}

  router = this.trpc.mergeRouters(
    this.trpcRouter.router,
    this.trpc.router({
      auth: this.authRouter.router,
      common: this.commonRouter.router,
      operator: this.operatorRouter.router,
      guru: this.guruRouter.router
    })
  );
}

export type AppRouterType = AppRouter['router'];
