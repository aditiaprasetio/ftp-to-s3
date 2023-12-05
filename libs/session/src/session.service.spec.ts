import { RedisModule } from '@nestjs-modules/ioredis';
import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          config: {
            url: 'redis://localhost:6379',
          }
        })
      ],
      providers: [SessionService],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.saveSession).toBeDefined();
    expect(service.getSession).toBeDefined();
    expect(service.saveSessionWithId).toBeDefined();
    expect(service.removeSession).toBeDefined();
  });

  describe('test saveSession', () => {
    it('should give sessionId when saveSession', async () => {
      const inputData = {
        userId: 'user-123',
        disabled: true,
      };

      const sessionId = await service.saveSession(inputData);
      expect(sessionId === null).toBeFalsy();
    })

    it('should save the session properly', async () => {
      const inputData = {
        userId: 'user-123',
        disabled: true,
      };

      const sessionId = await service.saveSession(inputData);
      const sessionData = await service.getSession(sessionId);
      expect(sessionData).toStrictEqual(inputData);
    })

    it('should expired properly', async () => {
      const inputData = {
        userId: 'user-123',
        disabled: true,
      };
      const expired = 1;

      const sessionId = await service.saveSession(inputData, expired);
      const sessionData = await service.getSession(sessionId);
      expect(sessionData).toStrictEqual(inputData);
      await (new Promise((resolve) => setTimeout(() => resolve(true), 1100)));
      const secondSessionData = await service.getSession(sessionId);
      expect(secondSessionData).toBeNull();
    })
  })

  describe('test saveSessionWithId', () => {
    it('should save the session with given key', async () => {
      const inputData = {
        userId: 'user-789',
        disabled: true,
      };

      const sessionId = 'sesi sembarang';
      const result = await service.saveSessionWithId(
        sessionId,
        inputData
      );
      const sessionData = await service.getSession(sessionId);
      expect(result === null).toBeFalsy();
      expect(sessionData).toStrictEqual(inputData);
    })
  })

  describe('test getSession', () => {
    it('should return null when session not available', async () => {
      const sessionId = 'fake-session-id';
      const sessionData = await service.getSession(sessionId);
      expect(sessionData).toBeNull();
    })
    it('should return correct sessionData when available', async () => {
      const inputDatas = [{
        userId: 'user-123',
        disabled: true,
      }, {
        userId: 'user-234',
        disabled: false,
      }];

      const sessionIds = await Promise.all(inputDatas.map(async (inputData) => (
        service.saveSession(inputData)
      )));

      const sessionDatas = await Promise.all(sessionIds.map(async (sessionId) => (
        service.getSession(sessionId)
      )));

      for(let i = 0; i < sessionDatas.length; ++i) {
        expect(sessionDatas[i]).toStrictEqual(inputDatas[i]);
      }
    })
  })

  describe('test removeSession', () => {
    it('should remove sessionData', async () => {
      const inputData = {
        userId: 'user-123',
        disabled: true,
      };
  
      const sessionId = await service.saveSession(inputData);
      const removeSessionResult = await service.removeSession(sessionId);
      expect(removeSessionResult).toBeTruthy();
      
      const sessionData = await service.getSession(sessionId);
      expect(sessionData === null).toBeTruthy();
    })
  })
});
