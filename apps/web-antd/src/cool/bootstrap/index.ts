import type { App } from 'vue';

import { createPinia } from 'pinia';

import { Loading } from '../utils';
import { createModule } from './module';

export async function bootstrap1(app: App) {
  // pinia
  app.use(createPinia());

  // 模块
  const { eventLoop } = createModule(app);

  // 加载
  Loading.set([eventLoop()]);
}
