import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'node:path';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import sharp from 'sharp';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { ensureDir } from 'fs-extra';
import { readFile, rename } from 'node:fs/promises';
import tmp from 'tmp-promise';

const algorithm = 'aes-256-cbc';
const iterations = 100000;
const keyLength = 32;
const ivLength = 16;

const pbkdf2 = promisify(crypto.pbkdf2);

@Injectable()
export class TandaTanganService {
  private tandaTanganPath: string;
  private tandaTanganPassword: string;

  constructor(configService: ConfigService) {
    this.tandaTanganPath = path.resolve(
      __dirname,
      '../',
      configService.getOrThrow('TANDA_TANGAN_PATH')
    );
    this.tandaTanganPassword = configService.getOrThrow(
      'TANDA_TANGAN_PASSWORD'
    );
  }

  private async derikeKeyAndIV(password: string, salt: Buffer) {
    const key = await pbkdf2(password, salt, iterations, keyLength, 'sha256');
    const iv = key.subarray(0, ivLength);
    return {
      key,
      iv,
    };
  }

  async set(username: string, stream: Readable) {
    await ensureDir(this.tandaTanganPath);
    const { path: filePath, cleanup } = await tmp.file();
    try {
      const salt = crypto.randomBytes(16);
      const { key, iv } = await this.derikeKeyAndIV(
        this.tandaTanganPassword,
        salt
      );

      const cipher = crypto.createCipheriv(algorithm, key, iv);

      const resizer = sharp()
        .resize({
          width: 500,
          withoutEnlargement: true,
        })
        .png({
          quality: 90,
        });
      const outputStream = createWriteStream(filePath);

      outputStream.write(salt);
      await pipeline(stream, resizer, cipher, outputStream);

      await rename(filePath, path.join(this.tandaTanganPath, username))
    } finally {
      cleanup();
    }
  }

  async get(username: string) {
    const filePath = path.join(this.tandaTanganPath, username);

    try {
      const buffer = await readFile(filePath);
      const salt = buffer.subarray(0, 16);
      const { key, iv } = await this.derikeKeyAndIV(
        this.tandaTanganPassword,
        salt
      );
      const decipher = crypto.createDecipheriv(algorithm, key, iv);

      return Buffer.concat([
        decipher.update(buffer.subarray(16)),
        decipher.final(),
      ]);
    } catch (e: any) {
      if (e.code == 'ENOENT') {
        return null;
      }
      throw e;
    }
  }
}
