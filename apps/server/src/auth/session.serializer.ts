import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AccountData } from '../types';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(
    user: AccountData,
    done: (err: Error | null, user: any) => void
  ): any {
    done(null, user);
  }

  deserializeUser(
    payload: any,
    done: (err: Error | null, payload: any) => void
  ): any {
    done(null, payload);
  }
}
