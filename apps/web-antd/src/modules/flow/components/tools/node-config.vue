<script setup lang="ts" name="tools-set-node-config">
import { ref } from 'vue';

import { useCrud, useUpsert } from '@cool-vue/crud';
import { isEmpty, keys } from 'lodash-es';

import { useCool } from '#/cool';

import { useViewGroup } from '#/plugins/view';

const { service } = useCool();

// 列表数据
const list = ref<Eps.FlowConfigEntity>([]);

// 配置
const config = ref({});

// 分组
const { ViewGroup } = useViewGroup({
  enableAdd: false,
  enableContextMenu: false,
  enableKeySearch: false,
  label: '节点',
  title: '配置',
  service: {
    async page(params) {
      return service.flow?.config.all(params).then((res) => {
        return {
          list: res.map((e) => {
            return {
              ...e,
              name: e.title,
            };
          }),
          pagination: {
            total: res.length,
            page: 1,
            size: 100,
          },
        };
      });
    },
  },
  onSelect(item) {
    refresh({
      node: item.type,
    });
  },
});

// Crud
const Crud = useCrud({
  service: service.flow?.config,
  async onRefresh(params, { next }) {
    const res = await next({
      ...params,
      size: 1000,
    });

    list.value = res.list;
  },
});

// Upsert
const Upsert = useUpsert({
  dialog: {
    width: '800px',
  },
  props: {
    labelPosition: 'top',
  },
  items: [
    {
      label: '类型',
      prop: 'type',
      component: {
        name: 'el-select',
        options: [],
        props: {
          onChange(val: string) {
            Upsert.value?.setForm(
              'options',
              JSON.stringify(config.value[val], null, 4),
            );
          },
        },
      },
      span: 8,
      required: true,
    },
    {
      label: '名称',
      prop: 'name',
      component: {
        name: 'el-input',
      },
      span: 16,
      required: true,
    },
    {
      label: '描述',
      prop: 'description',
      component: {
        name: 'el-input',
        props: {
          type: 'textarea',
          rows: 3,
        },
      },
    },
    {
      label: '配置',
      prop: 'options',
      component: {
        name: 'slot-options',
      },
    },
  ],

  onOpen() {
    service.flow?.config
      .config({
        node: ViewGroup.value?.selected?.type,
      })
      .then((res) => {
        config.value = res;

        // 类型
        const types = keys(res).map((e) => {
          return {
            label: e,
            value: e,
          };
        });

        // 设置类型
        Upsert.value?.setOptions('type', types);

        // 默认值
        if (Upsert.value?.mode == 'add') {
          const type = types[0]?.value;

          if (type) {
            Upsert.value?.setForm('type', type);
            Upsert.value?.setForm('options', config.value[type]);
          }
        }
      });
  },

  onSubmit(data, { next }) {
    next({
      ...data,
      node: ViewGroup.value?.selected?.type,
    });
  },
});

// 刷新列表
function refresh(params?: any) {
  Crud.value?.refresh(params);
}

// 重置
function reset() {
  const type = Upsert.value?.getForm('type');
  Upsert.value?.setForm('options', JSON.stringify(config.value[type], null, 4));
}

// 是否可见
const visible = ref(false);

// 打开
function open() {
  visible.value = true;
}

// 关闭
function close() {
  visible.value = false;
}

defineExpose({
  open,
  close,
});
</script>

<template>
  <cl-dialog
    v-model="visible"
    :scrollbar="false"
    height="700px"
    padding="0"
    title="配置"
    width="1200px"
  >
    <cl-view-group ref="ViewGroup">
      <template #item="{ item, selected }">
        <div
          :class="{
            'is-active': selected?.type == item.type,
          }"
          class="node-item"
        >
          <span>{{ item.title }}</span>
          <cl-svg :name="item.type" />
        </div>
      </template>

      <template #right>
        <div class="opbar">
          <el-button size="small" type="success" @click="Crud?.rowAdd()">
            添加
          </el-button>
        </div>

        <cl-crud ref="Crud" padding="0 10px">
          <el-row :gutter="10">
            <el-col
              v-for="(item, index) in list"
              :key="index"
              :span="8"
              :xs="24"
            >
              <div class="data-item">
                <div class="head">
                  <span class="name">{{ item.name }}</span>

                  <cl-svg name="delete" @click="Crud?.rowDelete(item)" />
                  <cl-svg name="set" @click="Crud?.rowEdit(item)" />
                </div>

                <div class="content">
                  <el-text :line-clamp="4" size="small" type="info">
                    {{ item.description || '暂无描述' }}
                  </el-text>
                </div>
              </div>
            </el-col>
          </el-row>

          <cl-upsert ref="Upsert">
            <template #slot-options="{ scope }">
              <cl-editor-monaco v-model="scope.options" />

              <el-tooltip content="重置">
                <cl-svg class="options-btn" name="change" @click="reset" />
              </el-tooltip>
            </template>
          </cl-upsert>

          <div v-if="isEmpty(list)" class="empty">
            <el-empty :image-size="100" />
          </div>
        </cl-crud>
      </template>
    </cl-view-group>
  </cl-dialog>
</template>

<style lang="scss" scoped>
.node-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 10px;
  margin: 0 10px;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;

  .cl-svg {
    font-size: 20px;
    color: var(--el-color-info);
  }

  &.is-active,
  &:hover {
    background-color: var(--el-bg-color-page);
  }
}

.data-item {
  display: flex;
  flex-direction: column;
  height: 120px;
  width: 100%;
  border-radius: 10px;
  box-sizing: border-box;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  padding: 10px;
  border: 1px solid var(--el-bg-color-page);

  .head {
    display: flex;
    align-items: center;
    margin-bottom: 5px;

    .name {
      font-size: 14px;
      font-weight: bold;
      margin-right: auto;
    }

    .cl-svg {
      padding: 3px;
      border-radius: 6px;
      font-size: 16px;
      color: var(--el-text-color-regular);
      margin-left: 5px;

      &:hover {
        background-color: var(--el-fill-color-light);
        color: var(--el-text-color-primary);
      }
    }
  }

  .content {
    flex: 1;
  }

  &:hover {
    box-shadow: 0 25px 40px -25px var(--el-bg-color-page);
  }
}

.opbar {
  position: absolute;
  right: 12px;
  top: 8px;

  .el-button {
    border-radius: 4px;
  }
}

.empty {
  margin-top: 100px;
}

.options-btn {
  position: absolute;
  right: 0;
  top: -26px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  padding: 4px;
  flex-shrink: 0;
  position: absolute;
  top: -30px;
  right: 0;
  outline: none;

  &:hover {
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
  }
}
</style>
