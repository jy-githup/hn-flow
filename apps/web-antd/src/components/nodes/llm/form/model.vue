<script setup lang="ts" name="node-llm-form-model">
import {
  computed,
  onMounted,
  type PropType,
  reactive,
  ref,
  useModel,
  watch,
} from 'vue';

import { isEmpty } from 'lodash-es';

import { useCool } from '#/hooks/hooks/index';

import ModelText from './model-text.vue';
import {getNodeInfoApi} from "#/api/flowManage";

const props = defineProps({
  modelValue: {
    type: Object as PropType<LLMData>,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue']);

const { refs, setRefs, service } = useCool();

// 绑定值
const value = useModel(props, 'modelValue');

// 关键字
const keyWord = ref('');

// 模型
const model = reactive({
  list: [] as LLMItem[],

  async get() {
    const res = await getNodeInfoApi('llm');
    if (res.data) {
      model.list = (res.data as Eps.FlowConfigEntity[]).map((e) => {
        const d: LLMItem = {
          options: [],
          title: e.name!,
          type: e.type!,
          id: e.id!,
          select: [],
        };

        (e.options?.options || []).forEach((e: LLMOption) => {
          if (e.field === 'model') {
            d.select = e.select!;
          } else {
            d.options.push(e);
          }
        });

        return d;
      });

      // 模型名称
      let name = value.value?.params?.model;

      // 已选中的
      let item = model.list.find((e) => e.select.includes(name));

      if (item) {
        item.options.forEach((a) => {
          const d = value.value.options.find((b) => a.field === b.field);

          if (d) {
            // 保留之前编辑的数据，其他配置重新加载
            a.value = d.value;
            a.enable = d.enable;
          }
        });
      } else {
        // 未选中，默认第一个
        item = model.list[0];

        if (item) {
          name = item.select[0];
        }
      }

      if (item) {
        model.select(name, item);
      }
    }
  },

  select(name: string, item: LLMItem) {
    if (!name) {
      return false;
    }

    // 模型名称
    value.value.params.model = name;

    // 模型供应商
    value.value.supplier = item.type;

    // 配置ID
    value.value.configId = item.id;

    // 设置参数列表
    value.value.options = item.options.map((e) => {
      if (e.value === undefined && e.default !== undefined) {
        e.value = e.default;
      }

      return e;
    });

    // 隐藏弹窗
    refs.modelPopover?.hide();
  },
});

// 模型列表
const list = computed(() => {
  return model.list.filter((item) => item.title.includes(keyWord.value));
});

// 显示后
function onShow() {
  model.get();
}

onMounted(() => {
  model.get();

  watch(
    () => value.value.options,
    (arr) => {
      arr.forEach((e) => {
        if (e.enable) {
          value.value.params[e.field] = e.value;
        } else {
          delete value.value.params[e.field];
        }
      });
    },
    {
      deep: true,
    },
  );
});
</script>

<template>
  <el-popover
    :offset="5"
    :teleported="false"
    popper-class="cl-flow__popper"
    trigger="click"
    width="100%"
    @show="onShow"
  >
    <template #reference>
      <div class="inner-item">
        <ModelText :data="value" />
      </div>
    </template>

    <div class="form-model">
      <div class="model">
        <p class="title">模型</p>

        <el-popover
          :ref="setRefs('modelPopover')"
          :offset="5"
          :popper-style="{
            padding: 0,
          }"
          :teleported="false"
          placement="bottom-end"
          popper-class="cl-flow__popper"
          trigger="click"
          width="300px"
        >
          <template #reference>
            <div class="inner">
              <span v-if="value?.params.model">{{ value.params.model }}</span>
              <span v-else class="placeholder">选择模型</span>

              <el-icon class="arrow">
                <arrow-down />
              </el-icon>
            </div>
          </template>

          <div class="search">
            <el-input
              v-model="keyWord"
              :prefix-icon="Search"
              clearable
              placeholder="搜索模型"
            />
          </div>

          <el-scrollbar max-height="400px">
            <div v-for="(item, index) in list" :key="index" class="list">
              <p class="label">{{ item.title }}</p>

              <div
                v-for="m in item.select"
                :key="m"
                :class="{
                  'is-check': value.params?.model === m,
                }"
                class="item"
                @click="model.select(m, item)"
              >
                <span>{{ m }}</span>

                <el-icon class="check">
                  <check />
                </el-icon>
              </div>
            </div>
          </el-scrollbar>

          <div v-if="isEmpty(list)" class="empty">未找到匹配项</div>
        </el-popover>
      </div>

      <div v-if="!isEmpty(value.options)" class="params">
        <p class="title">参数</p>

        <view v-for="(item, index) in value.options" :key="index" class="row">
          <span class="label">{{ item.title }}</span>

          <el-switch v-model="item.enable" size="small" />

          <el-slider
            v-if="item.type === 'number'"
            v-model="item.value"
            :max="item.max || 1"
            :min="item.min || 0"
            :show-input-controls="false"
            :step="(item.max || 1) / 10"
            class="slider"
            show-input
            size="small"
          />

          <el-input
            v-else-if="item.type === 'string'"
            v-model="item.value"
            class="string"
            clearable
            placeholder="请输入"
            size="small"
          />

          <el-switch
            v-if="item.type === 'boolean'"
            v-model="item.value"
            class="boolean"
          />
        </view>
      </div>
    </div>
  </el-popover>
</template>

<style lang="scss" scoped>
.form-model {
  padding: 0 5px;

  .title {
    font-size: 14px;
    font-weight: bold;
  }

  .model {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;

    .selector {
      width: 120px;
    }

    .inner {
      display: flex;
      align-items: center;
      height: 30px;
      min-width: 100px;
      border-radius: 6px;
      background-color: var(--el-fill-color-light);
      cursor: pointer;
      padding: 0 30px 0 10px;
      font-size: 12px;
      position: relative;

      .arrow {
        position: absolute;
        right: 8px;
      }

      &:hover {
        background-color: var(--el-fill-color-lighter);
      }
    }

    .search {
      padding: 5px;

      :deep(.el-input__wrapper) {
        box-shadow: none;
        background-color: var(--el-fill-color-light);
        border-radius: 6px;
      }
    }

    .empty {
      padding: 10px 5px 15px 5px;
      line-height: 1;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-align: center;
    }

    .list {
      padding: 0 5px 5px 5px;

      .label {
        padding: 5px;
        font-size: 12px;
        color: var(--el-color-info);
      }

      .item {
        display: flex;
        align-items: center;
        height: 30px;
        padding: 0 5px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;

        .check {
          display: none;
          margin-left: auto;
        }

        &.is-check {
          color: var(--el-color-primary);

          .check {
            display: inline-block;
          }
        }

        &:hover {
          background-color: var(--el-fill-color-lighter);
        }
      }
    }
  }

  .params {
    padding-top: 10px;
    border-top: 1px solid var(--el-fill-color-light);

    .row {
      display: flex;
      align-items: center;
      padding: 5px 0;

      .label {
        margin-right: 5px;
      }

      .slider {
        margin-left: auto;
        width: 200px;

        :deep(.el-input-number) {
          width: 60px;
        }
      }

      .string {
        width: 200px;
        margin-left: auto;
      }
    }
  }
}
</style>
