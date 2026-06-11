import { AccountData } from './types';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
    interface User extends AccountData {}
  }
}
