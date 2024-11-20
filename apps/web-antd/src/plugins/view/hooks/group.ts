import type { ClViewGroup } from '../types';

import { getCurrentInstance, provide, ref } from 'vue';
import type { Ref } from 'vue';

export function useParent(name: string, r: Ref) {
  const d = getCurrentInstance();

  if (d) {
    let parent = d.proxy?.$.parent;

    if (parent) {
      while (parent && parent.type?.name !== name) {
        parent = parent?.parent;
      }

      if (parent && parent.type.name === name) {
        r.value = parent.exposed;
      }
    }
  }

  return r;
}

export function useViewGroup<T = ClViewGroup.Item>(
  options?: DeepPartial<ClViewGroup.Options<T>>,
) {
  const ViewGroup = ref<ClViewGroup.Ref<T>>();
  useParent('cl-view-group', ViewGroup);

  if (options) {
    provide('useViewGroup__options', options);
  }

  return { ViewGroup };
}
