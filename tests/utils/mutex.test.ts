import { Mutex, MutexRW } from "@/utils/index";

const timeout = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("mutex", { timeout: 10000 }, () => {
  it.concurrent("never allows accessors interfere", async () => {
    const mutex = new Mutex();
    let cntAccess = 0;
    const f = async () => {
      const release = await mutex.obtain();
      expect(++cntAccess).toBe(1);
      await timeout(Math.random() * 10);
      --cntAccess;
      release();
    };
    const threads: Promise<unknown>[] = [];
    for (let i = 0; i < 100; ++i) {
      threads.push(f());
    }
    await Promise.all(threads);
    expect(cntAccess).toBe(0);
  });

  it.concurrent(
    "never allows accessors interfere, with automatic disposal",
    async () => {
      const mutex = new Mutex();
      let cntAccess = 0;
      const f = async () => {
        using _ = await mutex.lock();
        expect(++cntAccess).toBe(1);
        await timeout(Math.random() * 10);
        --cntAccess;
      };
      const threads: Promise<unknown>[] = [];
      for (let i = 0; i < 100; ++i) {
        threads.push(f());
      }
      await Promise.all(threads);
      expect(cntAccess).toBe(0);
    }
  );
});

describe("mutex-rw", { timeout: 10000 }, () => {
  it.concurrent(
    "never allows readonly and read-write accessors interfere",
    async () => {
      const mutex = new MutexRW();
      let cntROAccess = 0;
      let cntRWAccess = 0;
      const fRO = async () => {
        const release = await mutex.obtainRO();
        ++cntROAccess;
        expect(cntRWAccess).toBe(0);
        await timeout(Math.random() * 10);
        --cntROAccess;
        release();
      };
      const fRW = async () => {
        const release = await mutex.obtainRW();
        expect(++cntRWAccess).toBe(1);
        expect(cntROAccess).toBe(0);
        await timeout(Math.random() * 10);
        --cntRWAccess;
        release();
      };
      const threads: Promise<unknown>[] = [];
      for (let i = 0; i < 100; ++i) {
        threads.push(Math.random() > 0.5 ? fRO() : fRW());
      }
      await Promise.all(threads);
      expect(cntROAccess).toBe(0);
      expect(cntRWAccess).toBe(0);
    }
  );

  it.concurrent(
    "never allows readonly and read-write accessors interfere, with automatic disposal",
    async () => {
      const mutex = new MutexRW();
      let cntROAccess = 0;
      let cntRWAccess = 0;
      const fRO = async () => {
        using _ = await mutex.lockRO();
        ++cntROAccess;
        expect(cntRWAccess).toBe(0);
        await timeout(Math.random() * 10);
        --cntROAccess;
      };
      const fRW = async () => {
        using _ = await mutex.lockRW();
        expect(++cntRWAccess).toBe(1);
        expect(cntROAccess).toBe(0);
        await timeout(Math.random() * 10);
        --cntRWAccess;
      };
      const threads: Promise<unknown>[] = [];
      for (let i = 0; i < 100; ++i) {
        threads.push(Math.random() > 0.5 ? fRO() : fRW());
      }
      await Promise.all(threads);
      expect(cntROAccess).toBe(0);
      expect(cntRWAccess).toBe(0);
    }
  );
});