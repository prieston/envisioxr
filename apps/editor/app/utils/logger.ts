/* eslint-disable no-console */

const isDev = process.env.NODE_ENV === "development";

export const createLogger = (prefix?: string) => {
  const format = (args: unknown[]) =>
    prefix ? ["[" + prefix + "]", ...args] : args;
  return {
    debug: (...args: unknown[]) => {
      if (isDev) console.debug(...format(args));
    },
    info: (...args: unknown[]) => {
      if (isDev) console.info(...format(args));
    },
    warn: (...args: unknown[]) => {
      if (isDev) console.warn(...format(args));
    },
    error: (...args: unknown[]) => {
      console.error(...format(args));
    },
  };
};

export const appLogger = createLogger("App");


