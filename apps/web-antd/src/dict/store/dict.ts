import { computed, reactive, toRaw } from 'vue';

import { isArray } from 'lodash-es';
import { defineStore } from 'pinia';

import { Dict } from '../types';
import { deepFind } from '../utils';

import { service } from '/@/cool';
import { deepTree } from '/@/cool/utils';

const useDictStore = defineStore('dict', () => {
  // 对象数据
  const data = reactive<Dict.Data>({});

  // 获取
  function get(name: string) {
    return computed(() => data[name] || []);
  }

  // 查找
  function find(name: string, value: any | any[]) {
    const arr = isArray(value) ? value : [value];
    return arr
      .filter((e) => e !== undefined)
      .map((v) => deepFind(v, get(name).value));
  }

  // 刷新
  async function refresh(types?: string[]) {
    return {}
  }

  return {
    data,
    get,
    find,
    refresh,
  };
});

export { useDictStore };
