import type { ModuleConfig } from '#/cool';

import { config } from '#/config';

import { useStore } from './store';

export default (): ModuleConfig => {
  return {
    order: 99,
    components: Object.values(import.meta.glob('./components/**/*.{vue,tsx}')),
    install() {
      // 设置标题
      document.title = config.app.name;
    },
    async onLoad() {
      const { user, menu, app } = useStore();

      // token 事件
      async function hasToken(cb: () => Promise<any> | void) {
        if (cb) {
          app.addEvent('hasToken', cb);

          if (user.token) {
            await cb();
          }
        }
      }

      await hasToken(async () => {
        // 获取用户信息
        user.get();
        // 获取菜单权限
        await menu.get();
      });

      return {
        hasToken,
      };
    },
  };
};
