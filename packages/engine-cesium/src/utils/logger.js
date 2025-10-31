/* eslint-disable no-console */
const isDev = process.env.NODE_ENV === "development";
export const createLogger = (prefix) => {
    const format = (args) => prefix ? ["[" + prefix + "]", ...args] : args;
    return {
        debug: (...args) => {
            if (isDev)
                console.debug(...format(args));
        },
        info: (...args) => {
            if (isDev)
                console.info(...format(args));
        },
        warn: (...args) => {
            if (isDev)
                console.warn(...format(args));
        },
        error: (...args) => {
            console.error(...format(args));
        },
    };
};
export const appLogger = createLogger("App");
