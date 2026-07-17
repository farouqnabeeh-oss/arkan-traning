import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClient = globalThis.prisma || new PrismaClient();

function isDatabaseConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return [
    "can't reach database server",
    "prisma client has no connection",
    "connect econnrefused",
    "etimedout",
    "econnreset",
    "p1001",
    "p2024",
    "connection terminated",
  ].some((fragment) => message.includes(fragment));
}

function getFallbackValue(methodName: string): unknown {
  switch (methodName) {
    case "findMany":
    case "findManyOrThrow":
    case "groupBy":
      return [];
    case "findUnique":
    case "findUniqueOrThrow":
    case "findFirst":
    case "findFirstOrThrow":
      return null;
    case "count":
      return 0;
    case "aggregate":
      return { _avg: { rating: null }, _count: 0 };
    default:
      return undefined;
  }
}

function createSafeDbProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (typeof value === "function") {
        return (...args: unknown[]) => {
          const methodName = String(prop);

          try {
            const result = value.apply(target, args);

            if (result && typeof result.then === "function") {
              return result.catch((error: unknown) => {
                if (isDatabaseConnectionError(error)) {
                  console.warn(
                    `[db] Falling back for ${methodName} because the database is unavailable.`,
                    error,
                  );
                  return getFallbackValue(methodName);
                }
                throw error;
              });
            }

            return result;
          } catch (error) {
            if (isDatabaseConnectionError(error)) {
              console.warn(
                `[db] Falling back for ${methodName} because the database is unavailable.`,
                error,
              );
              return getFallbackValue(methodName);
            }
            throw error;
          }
        };
      }

      if (
        value &&
        typeof value === "object" &&
        prop !== "$disconnect" &&
        prop !== "$connect" &&
        prop !== "$on" &&
        prop !== "$use"
      ) {
        return createSafeDbProxy(value as object);
      }

      return value;
    },
  }) as T;
}

export const db = createSafeDbProxy(prismaClient);

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prismaClient;
}
