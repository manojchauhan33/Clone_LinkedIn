import sequelize from "../config/db";
import { Transaction } from "sequelize";

export async function withTransaction<T>(callback: (t: Transaction) => Promise<T>): Promise<T> {
  const t = await sequelize.transaction();
  try {
    const result = await callback(t);
    await t.commit();
    return result;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}
