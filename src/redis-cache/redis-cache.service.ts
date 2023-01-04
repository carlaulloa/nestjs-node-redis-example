import { Injectable, Logger } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  private client: RedisClientType;

  constructor() {
    (async () => {
      try {
        this.client = createClient({
          url: 'redis://127.0.0.1',
          socket: {
            reconnectStrategy: (retries) => {
              this.logger.log('Retries redis reconnection ' + retries);
              return 20 * 1000;
            },
          },
        });
        this.client.on('error', (err) =>
          this.logger.error('Redis error', err.stack),
        );

        this.client.on('reconnecting', () =>
          this.logger.log('Redis reconnecting'),
        );

        this.client.on('connect', () => this.logger.log('Redis connected'));

        this.client.on('ready', () => this.logger.log('Redis is ready'));

        await this.client.connect();
      } catch (error) {
        this.logger.error('Unexpected error', error);
      }
    })();
  }

  get(key: string): Promise<string> {
    if (!this.client?.isReady) {
      this.logger.log('Redis is not ready');
      return null;
    }
    return this.client.get(key);
  }

  async set(key: string, value: string, expiresAt: number): Promise<boolean> {
    if (!this.client?.isReady) {
      this.logger.log('Redis is not ready');
      return false;
    }
    await this.client.setEx(key, expiresAt, value);
    return true;
  }

  async delete(key: string): Promise<boolean> {
    if (!this.client?.isReady) {
      this.logger.log('Redis is not ready');
      return true;
    }
    await this.client.del(key);
    return false;
  }
}
