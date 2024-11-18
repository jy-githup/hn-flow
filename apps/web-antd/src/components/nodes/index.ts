import type { FlowNode } from '#/components/flow/types/index';

import { shallowRef } from 'vue';

const files: { [key: string]: { default: () => FlowNode } } = import.meta.glob(
  './*/index.{ts,tsx}',
  {
    eager: true,
  },
);

const CustomNodes = shallowRef<FlowNode[]>([]);
for (const i in files) {
  const [, type] = i.split('/');

  const d = files[i]?.default();

  if (d && d.enable !== false) {
    const configWidth = d.form?.width || '400px';
    const width = `${Number.parseFloat(configWidth) + 30}px`;

    CustomNodes.value.push({
      ...d,
      type,
      name: `node-${type}`,
      icon: type,
      cardWidth: width,
    });
  }
}

export { CustomNodes };
