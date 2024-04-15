import pino from "pino";

export const log = pino({
  base: undefined,
  enabled: !!process.env.NOLOG
});