import { NestFactory } from '@nestjs/core';
import { parseArgs } from 'node:util';
import { AppModule } from './app/app.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';

const {
  values: { username, password, type, name },
} = parseArgs({
  options: {
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
  },
});

if (!username || !password) {
  console.log('Username or password missing');
  process.exit();
}

if (type != 'operator' && type != 'kepala_sekolah') {
  console.log(`type must be "operator" or "kepala_sekolah"`);
  process.exit();
}

if (type == 'kepala_sekolah' && !name) {
  console.log(`type "kepala_sekolah" need name`);
  process.exit();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const accountService = app.select(AuthModule).get(AuthService);

  if (type == 'operator') {
    await accountService.createOperatorAccount(username!, password!);
  } else {
    await accountService.createKepalaSekolahAccount(
      username!,
      password!,
      name!
    );
  }

  await app.close();
}

bootstrap();
