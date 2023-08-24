import { isAdmin } from 'src/utils/is-admin';

export function AdminOnly() {
  return function (target: any) {
    const original = target.prototype.onModuleInit;

    target.prototype.onModuleInit = function () {
      const methods = Object.getOwnPropertyNames(target.prototype);

      methods.forEach((methodName) => {
        if (
          methodName !== 'constructor' &&
          typeof this[methodName] === 'function'
        ) {
          const originalMethod = this[methodName];

          this[methodName] = function (...args: any[]) {
            const ctx = args[0];

            if (!isAdmin(ctx.from.id)) {
              return ctx.reply('You are not admin');
            }

            return originalMethod.apply(this, args);
          };
        }
      });

      if (original) {
        original.call(this);
      }
    };
  };
}
