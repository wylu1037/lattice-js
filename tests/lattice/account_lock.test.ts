import { AccountLockImpl, newAccountLock } from "@/lattice/account_lock";

const timeout = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("account-lock", { timeout: 10000 }, () => {
  it("should create account lock instance", () => {
    const accountLock = newAccountLock();
    expect(accountLock).toBeInstanceOf(AccountLockImpl);
  });

  it.concurrent("should lock and unlock account", async () => {
    const accountLock = newAccountLock();
    await accountLock.obtain("chain1", "address1");
    accountLock.unlock("chain1", "address1");
  });

  it.concurrent("should execute function with lock", async () => {
    const accountLock = newAccountLock();
    let executed = false;

    await accountLock.withLock("chain1", "address1", async () => {
      executed = true;
      await timeout(10);
      return true;
    });

    expect(executed).toBe(true);
  });

  it.concurrent(
    "should prevent concurrent access to the same account",
    async () => {
      const accountLock = newAccountLock();
      let accessCount = 0;

      const task = async () => {
        await accountLock.withLock("chain1", "address1", async () => {
          accessCount++;
          expect(accessCount).toBe(1); // ensure that only one access is allowed at a time
          await timeout(50);
          accessCount--;
          expect(accessCount).toBe(0); // ensure that the count is zero before leaving
        });
      };

      // concurrent execution of multiple tasks
      const tasks = Array(10)
        .fill(0)
        .map(() => task());
      await Promise.all(tasks);
    }
  );

  it.concurrent(
    "should allow concurrent access to different accounts",
    async () => {
      const accountLock = newAccountLock();
      const accounts = new Map<string, number>();

      const task = async (chainId: string, address: string) => {
        const key = `${chainId}_${address}`;
        await accountLock.withLock(chainId, address, async () => {
          const count = accounts.get(key) || 0;
          accounts.set(key, count + 1);
          await timeout(50);
          const currentCount = accounts.get(key) || 0;
          accounts.set(key, currentCount - 1);
        });
      };

      // concurrent execution of multiple tasks, accessing different accounts
      const tasks = [
        task("chain1", "address1"),
        task("chain1", "address2"),
        task("chain2", "address1"),
        task("chain2", "address2")
      ];
      await Promise.all(tasks);

      // ensure that the count of all accounts is 0
      for (const count of accounts.values()) {
        expect(count).toBe(0);
      }
    }
  );
}); 