// Logger de utilidade para o ambiente Pink Pulse
// Em produção (process.env.NODE_ENV === 'production'), permanece silencioso.
// Em desenvolvimento, formata as mensagens de forma limpa no console.

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) {
      console.log('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDev) {
      console.error('[ERROR]', ...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug('[DEBUG]', ...args);
    }
  },
};
