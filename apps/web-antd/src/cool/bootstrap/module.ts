import { type App, type Directive } from 'vue';

import { assign, isFunction, orderBy } from 'lodash-es';

import { hmr } from '../hooks';
import { module } from '../module';
import { filename } from '../utils';

// 扫描文件
const files = import.meta.glob(
  '/src/{modules,plugins}/*/{config.ts,service/**,directives/**}',
  {
    eager: true,
    import: 'default',
  },
);

// 模块列表
module.list = hmr.getData('modules', []);
// 解析
for (const i in files) {
  // 分割
  const [, , type, name, action] = i.split('/');

  // 文件名
  const n = filename(i);

  // 文件内容
  const v = files[i];

  // 模块是否存在
  const m = module.get(name);

  // 数据
  const d = m || {
    name,
    type,
    value: null,
    services: [],
    directives: [],
  };

  // 配置
  switch (action) {
    case 'config.ts': {
      d.value = v;

      break;
    }
    case 'directives': {
      d.directives?.push({ name: n, value: v as Directive });

      break;
    }
    case 'service': {
      const s = new (v as any)();

      if (s) {
        d.services?.push({
          path: s.namespace,
          value: s,
        });
      }

      break;
    }
    // No default
  }

  if (!m) {
    module.add(d);
  }
}

// 创建
export function createModule(app: App) {
  console.log(module.list);
  // 排序
  module.list.forEach((e) => {
    const d = isFunction(e.value) ? e.value(app) : e.value;

    if (d) {
      assign(e, d);
    }

    if (!d.order) {
      e.order = 0;
    }
  });

  const list = orderBy(module.list, 'order', 'desc').map((e) => {
    // 初始化
    e.install?.(app, e.options);
    // 注册组件
    e.components?.forEach(async (c) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const v = await (isFunction(c) ? c() : c);

      const n = v.default || v;

      if (n.name) {
        app.component(n.name, n);
      }
    });

    // 注册指令
    e.directives?.forEach((v) => {
      app.directive(v.name, v.value);
    });

    return e;
  });

  return {
    // 模块列表
    list,
    // 事件加载
    async eventLoop() {
      const events: any = {};

      for (const element of list) {
        if (element.onLoad) {
          assign(events, await element?.onLoad?.(events));
        }
      }
    },
  };
}
