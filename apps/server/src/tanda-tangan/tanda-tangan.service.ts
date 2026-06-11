import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'node:path';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import sharp from 'sharp';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { ensureDir } from 'fs-extra';
import { readFile, rename } from 'node:fs/promises';
import tmp from 'tmp-promise';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const algorithm = 'aes-256-cbc';
const iterations = 100000;
const keyLength = 32;
const ivLength = 16;

const pbkdf2 = promisify(crypto.pbkdf2);

interface TandaTanganStorage {
  set(username: string, fileTempPath: string): Promise<void>;
  get(username: string): Promise<Buffer | null>;
}

class LocalTandaTanganStorage implements TandaTanganStorage {
  constructor(private rootPath: string) {}

  async set(username: string, fileTempPath: string): Promise<void> {
    await ensureDir(this.rootPath);
    await rename(fileTempPath, path.join(this.rootPath, username));
  }
  async get(username: string): Promise<Buffer | null> {
    try {
      return await readFile(path.join(this.rootPath, username));
    } catch (err: any) {
      if (err.code == 'ENOENT') {
        return null;
      }
      throw err;
    }
  }
}

class S3TandaTanganStorage implements TandaTanganStorage {
  client: S3Client;

  constructor(private bucket: string, private prefix: string) {
    this.client = new S3Client();
  }

  async set(username: string, fileTempPath: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: path.posix.join(this.prefix, username),
        Body: createReadStream(fileTempPath),
      })
    );
  }
  typedArrayToBuffer(array: Uint8Array): ArrayBuffer {
    return array.buffer.slice(
      array.byteOffset,
      array.byteLength + array.byteOffset
    ) as ArrayBuffer;
  }
  async get(username: string): Promise<Buffer | null> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: path.posix.join(this.prefix, username),
        })
      );
      if (!response.Body) return Buffer.alloc(0);
      return Buffer.from(
        this.typedArrayToBuffer(await response.Body?.transformToByteArray())
      );
    } catch (err: any) {
      if (err.name === 'NoSuchKey' || err.$metadata.httpStatusCode === 404) {
        return null;
      }
      throw err;
    }
  }
}

@Injectable()
export class TandaTanganService {
  private storage: TandaTanganStorage;
  private tandaTanganTempPath: string;
  private tandaTanganPassword: string;

  constructor(configService: ConfigService) {
    if (configService.get('TANDA_TANGAN_PATH')) {
      const rootPath = path.resolve(
        __dirname,
        '../',
        configService.getOrThrow('TANDA_TANGAN_PATH')
      );
      this.storage = new LocalTandaTanganStorage(rootPath);
    } else if (configService.get('TANDA_TANGAN_S3_BUCKET')) {
      this.storage = new S3TandaTanganStorage(
        configService.getOrThrow('TANDA_TANGAN_S3_BUCKET'),
        configService.get('TANDA_TANGAN_S3_PREFIX') ?? ''
      );
    } else {
      throw new Error('Please provide tanda tangan config');
    }

    this.tandaTanganTempPath = path.resolve(
      __dirname,
      '../',
      configService.getOrThrow('TANDA_tANGAN_TEMP_PATH')
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
    await ensureDir(this.tandaTanganTempPath);
    const { path: filePath, cleanup } = await tmp.file({
      tmpdir: this.tandaTanganTempPath,
    });

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

      await this.storage.set(username, filePath);
    } finally {
      await cleanup();
    }
  }

  async get(username: string) {
    const buffer = await this.storage.get(username);
    if (!buffer) return null;

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
  }
}
