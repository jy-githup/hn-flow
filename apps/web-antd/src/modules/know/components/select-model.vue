<script lang="ts" setup name="select-model">
import { computed, onMounted, PropType, ref } from 'vue';

import { Search } from '@element-plus/icons-vue';
import { isEmpty } from 'lodash-es';

import { useCool } from '#/cool';

interface Row {
  id: number;
  title: string;
  list: string[];
}

const props = defineProps({
  scope: {
    type: Object as PropType<KnowType>,
    default: () => ({}),
  },
  field: String,
  disabled: Boolean,
});

const { service } = useCool();

// 关键字
const keyWord = ref();

// 字典
const idKey = computed(() => `${props.field}ConfigId`);
const optionsKey = computed(() => `${props.field}Options`);

// 绑定值
const value = computed(() => {
  return props.scope[idKey.value]
    ? `${props.scope[optionsKey.value]?.model}==${props.scope[idKey.value]}`
    : '';
});

// 供应商名称
const supplierName = computed(() => {
  return data.value.find((e) => e.id == props.scope[idKey.value])?.title;
});

// 模型数据
const data = ref<Row[]>([]);

// 渲染列表
const list = computed(() => {
  return data.value.filter((e) =>
    e.list.some((a) => (keyWord.value ? a.includes(keyWord.value) : true)),
  );
});

// 加载数据
function refresh() {
  service.know.config
    .getByFunc({
      func: props.field,
    })
    .then((res: KnowConfig[]) => {
      const rows: Row[] = [];

      res.forEach((e) => {
        if (!isEmpty(e.options?.options)) {
          const d = e.options?.options?.find((e) => e.field == 'model');

          if (d && !isEmpty(d?.select)) {
            rows.push({
              id: e.id,
              title: e.name,
              list: d.select || [],
            });
          }
        }
      });

      data.value = rows;
    });
}

// 监听选择
function onChange(val: string) {
  const [model, id] = (val || '').split('==');

  props.scope[idKey.value] = id;
  props.scope[optionsKey.value].model = model;
}

onMounted(() => {
  refresh();
});
</script>

<template>
  <div class="select-model">
    <el-select
      :disabled="disabled"
      :model-value="value"
      clearable
      placeholder="选择模型"
      @change="onChange"
    >
      <template #label>
        <div v-if="supplierName" class="select-model__inner">
          <span class="supplier">{{ supplierName }}</span>
          <span v-if="scope[optionsKey]?.model">{{
            scope[optionsKey]?.model
          }}</span>
        </div>
      </template>

      <template #header>
        <div class="select-model__search">
          <el-input
            v-model="keyWord"
            :prefix-icon="Search"
            clearable
            placeholder="搜索模型"
          />
        </div>
      </template>

      <div class="select-model__list">
        <div v-for="(row, rowIndex) in list" :key="rowIndex" class="row">
          <p class="label">{{ row.title }}</p>

          <el-option
            v-for="item in row.list"
            :key="item"
            :label="item"
            :value="`${item}==${row.id}`"
            class="item"
          />
        </div>
      </div>
    </el-select>
  </div>
</template>

<style lang="scss" scoped>
.select-model {
  &__inner {
    display: flex;
    align-items: center;
    cursor: pointer;
    height: 30px;
    width: 100%;
    position: relative;
    transition: all 0.2s;

    .supplier {
      border-right: 1px solid var(--el-border-color);
      padding-right: 10px;
      margin-right: 10px;
    }

    .placeholder {
      color: var(--el-text-color-placeholder);
      font-size: 14px;
    }

    .arrow,
    .close {
      position: absolute;
      right: 6px;
      font-size: 12px !important;
      color: var(--el-color-info);
    }

    .close {
      display: none;
    }

    &:hover {
      border-color: var(--el-border-color-hover);

      .close {
        display: block;
      }
    }
  }

  &__search {
    :deep(.el-input__wrapper) {
      box-shadow: none;
      background-color: var(--el-fill-color-light);
      border-radius: 6px;
    }
  }

  &__list {
    padding: 0 10px 5px 10px;

    .label {
      color: var(--el-color-info);
      margin: 5px;
      font-size: 12px;
    }

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 32px;
      cursor: pointer;
      padding: 0 15px;
      border-radius: 6px;

      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }
  }

  &__empty {
    padding: 15px 5px 5px 5px;
    line-height: 1;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
}
</style>
