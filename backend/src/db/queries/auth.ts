import { eq, sql } from "drizzle-orm";
import { db } from "../index.ts";
import { users, accounts } from "../schema.ts";

type UserInput = Omit<typeof users.$inferInsert, "id"> & { id?: string };
type AccountInput = Omit<typeof accounts.$inferInsert, "id" | "userId"> & {
  id?: string;
};

export async function upsertUserAndAccount(
  userData: UserInput,
  accountData: AccountInput
) {
  return await db.transaction(async (tx) => {
    const now = sql`(current_timestamp)`;

    // Find existing user by id or email
    let existingUser = null;

    if (userData.id) {
      existingUser = await tx.query.users.findFirst({
        where: eq(users.id, userData.id),
      });
    }

    if (!existingUser) {
      existingUser = await tx.query.users.findFirst({
        where: eq(users.email, userData.email),
      });
    }

    let user;
    if (existingUser) {
      [user] = await tx
        .update(users)
        .set({
          name: userData.name,
          email: userData.email,
          emailVerified: userData.emailVerified,
          image: userData.image,
          updatedAt: now,
        })
        .where(eq(users.id, existingUser.id))
        .returning();
    } else {
      // CREATE with randomUUID
      [user] = await tx
        .insert(users)
        .values({
          id: userData.id ?? crypto.randomUUID(),
          name: userData.name,
          email: userData.email,
          emailVerified: userData.emailVerified ?? 0,
          image: userData.image,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
    }

    // Upsert account for this user
    const accountId = accountData.id ?? crypto.randomUUID();

    const [account] = await tx
      .insert(accounts)
      .values({
        id: accountId,
        userId: user.id,
        accountId: accountData.accountId,
        providerId: accountData.providerId,
        accessToken: accountData.accessToken,
        refreshToken: accountData.refreshToken,
        idToken: accountData.idToken,
        accessTokenExpiresAt: accountData.accessTokenExpiresAt,
        refreshTokenExpiresAt: accountData.refreshTokenExpiresAt,
        scope: accountData.scope,
        password: accountData.password,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: accounts.id,
        set: {
          accessToken: accountData.accessToken,
          refreshToken: accountData.refreshToken,
          idToken: accountData.idToken,
          accessTokenExpiresAt: accountData.accessTokenExpiresAt,
          refreshTokenExpiresAt: accountData.refreshTokenExpiresAt,
          scope: accountData.scope,
          updatedAt: now,
        },
      })
      .returning();

    return { user, account };
  });
}
