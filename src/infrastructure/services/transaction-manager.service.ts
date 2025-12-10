import { db, Transaction } from '@/src/infrastructure/database/drizzle';

export class TransactionManagerService{
  public startTransaction<T>(
    clb: (tx: Transaction) => Promise<T>,
    parent?: Transaction
  ): Promise<T> {
    const invoker = parent ?? db;
    return invoker.transaction(clb);
  }
}
