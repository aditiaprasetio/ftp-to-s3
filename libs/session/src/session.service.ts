import { Injectable } from "@nestjs/common";
import { InjectRedis, Redis } from "@nestjs-modules/ioredis"
import * as Crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class SessionService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
  ) { }

  async getSession(sessionId: string): Promise<Object> {
    try {
      const result = await this.redis.get(sessionId);
      return JSON.parse(result);
    } catch(err) {
      console.log('err: ', err);
      return null;
    }
  }

  async saveSession(
    sessionObject: Object,
    timeoutInSec: number = 600
  ): Promise<string> {
    const sessionId = Crypto
      .createHmac(
        'sha256', 
        process.env.RANDOM_SESSION_KEY || '2r8u32niejf'
      )
      .update(`${Date.now}-${uuidv4()}`)
      .digest('hex');
    return this.saveSessionWithId(
      sessionId,
      sessionObject,
      timeoutInSec,
    );
  }

  async saveSessionWithId(
    sessionId: string,
    sessionObject: Object,
    timeoutInSec: number = 600,
  ): Promise<string> {
    const result = await this.redis.set(
      sessionId,
      JSON.stringify(sessionObject),
      'EX',
      timeoutInSec,
    )
    return result === 'OK' ? sessionId : null;
  }

  async removeSession(
    sessionId: string,
  ): Promise<boolean> {
    const result = await this.redis.del(sessionId);

    return result === 1;
  }
}