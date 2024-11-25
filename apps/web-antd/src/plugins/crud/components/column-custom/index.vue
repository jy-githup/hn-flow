<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  type PropType,
  ref,
  watch,
} from 'vue';

import { Button } from 'ant-design-vue';
import { has, isBoolean, orderBy } from 'lodash-es';
import Draggable from 'vuedraggable/src/vuedraggable';

import { storage } from '#/cool';

export default defineComponent({
  name: 'ClColumnCustom',

  components: {
    Draggable,
    Button,
  },

  props: {
    name: {
      type: String,
      default: '',
    },
    columns: {
      type: Array as PropType<any[]>,
      required: true,
      default: () => [],
    },
  },

  setup(props) {
    // 是否可见
    const visible = ref(false);

    // 名称
    const name = `column-custom__${props.name || location.pathname}`;

    // 列数据
    const list = ref<
      { checked?: boolean; label: string; orderNum?: number; prop: any }[]
    >([]);

    // 列配置
    const columns = computed(() => {
      return props.columns.filter((e) => !e.type && e.prop);
    });

    // 改变列
    function change() {
      nextTick(() => {
        columns.value.forEach((e) => {
          e.hidden = !list.value.find((a) => a.prop === e.prop)?.checked;
          e.orderNum = list.value.findIndex((a) => a.prop === e.prop);
        });
      });
    }

    // 保存
    function save() {
      storage.set(name, list.value);
      change();
      close();
    }

    // 重置
    function reset() {
      columns.value.forEach((e) => {
        if (e.orderNum !== undefined) {
          e.hidden = false;
          e.orderNum = 0;
        }
      });

      storage.remove(name);
      refresh();
      close();
    }

    // 打开
    function open() {
      visible.value = true;
      refresh();
    }

    // 关闭
    function close() {
      visible.value = false;
    }

    // 排序
    function sort(list: any[]) {
      return orderBy(list, 'orderNum', 'asc');
    }

    // 刷新
    function refresh() {
      if (!props.columns) {
        return false;
      }

      const selection: any[] = storage.get(name);

      list.value = sort(
        columns.value.map((e) => {
          let checked = true;
          let orderNum = e.orderNum || 0;

          if (isBoolean(e.hidden)) {
            checked = !e.hidden;
          }

          if (selection) {
            checked = selection.find((a) => a.prop === e.prop)?.checked;
            orderNum = selection.findIndex((a) => a.prop === e.prop);
          }

          return {
            label: e.label,
            prop: e.prop,
            checked,
            orderNum,
          };
        }),
      );

      change();
    }

    // 合计
    function summary(subData: { [key: string]: any }) {
      return sort(columns.value.filter((e) => !e.hidden)).map((e) => {
        return has(subData, e.prop) ? subData[e.prop] : '';
      });
    }

    watch(
      () => props.columns,
      () => {
        refresh();
      },
    );

    return {
      visible,
      list,
      open,
      close,
      save,
      reset,
      summary,
    };
  },
});
</script>

<template>
  <div class="cl-column-custom__wrap">
    <Button @click="open">自定义列</Button>

    <cl-dialog v-model="visible" title="自定义列">
      <div class="cl-column-custom__dialog">
        <div class="left">
          <Draggable v-model="list" item-key="prop">
            <template #item="{ element: item }">
              <a-checkbox v-model="item.checked" border>
                {{ item.label }}
              </a-checkbox>
            </template>
          </Draggable>
        </div>

        <div class="right"></div>
      </div>

      <template #footer>
        <Button @click="close">取消</Button>
        <Button type="danger" @click="reset">重置</Button>
        <Button type="success" @click="save">保存</Button>
      </template>
    </cl-dialog>
  </div>
</template>

<style lang="scss" scoped>
.cl-column-custom {
  &__wrap {
    margin-left: 10px;
  }

  &__dialog {
    .left {
      .el-checkbox {
        margin: 5px 10px 5px 0;
      }
    }

    .right {
      border-left: 1px solid #eee;
    }
  }
}
</style>
