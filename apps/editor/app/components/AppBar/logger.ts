/* eslint-disable no-console */
export type LogLevel = "debug" | "info" | "warn" | "error";

const isDev = process.env.NODE_ENV === "development";

export const logger = {
  // eslint-disable-next-line no-console
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },
  // eslint-disable-next-line no-console
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
  // eslint-disable-next-line no-console
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  // eslint-disable-next-line no-console
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
