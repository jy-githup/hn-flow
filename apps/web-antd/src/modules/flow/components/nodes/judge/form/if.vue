<script setup lang="ts" name="node-judge-form-if">
import { onMounted, type PropType, useModel } from 'vue';

import ToolsVar from '#/modules/flow/components/tools/var.vue';

const props = defineProps({
  modelValue: {
    type: Object as PropType<JudgeItem[]>,
    default: () => ({}),
  },
});

const list = useModel(props, 'modelValue');

const condition = [
  {
    label: '包含',
    value: 'include',
  },
  {
    label: '不包含',
    value: 'exclude',
  },
  {
    label: '开始是',
    value: 'startWith',
  },
  {
    label: '结束是',
    value: 'endWith',
  },
  {
    label: '等于',
    value: 'equal',
  },
  {
    label: '不等于',
    value: 'notEqual',
  },
  {
    label: '大于',
    value: 'greaterThan',
  },
  {
    label: '大于等于',
    value: 'greaterThanOrEqual',
  },
  {
    label: '小于',
    value: 'lessThan',
  },
  {
    label: '小于等于',
    value: 'lessThanOrEqual',
  },
  {
    label: '为空',
    value: 'isNull',
  },
  {
    label: '不为空',
    value: 'isNotNull',
  },
];

const operator = [
  {
    label: 'OR',
    value: 'OR',
  },
  {
    label: 'AND',
    value: 'AND',
  },
];

function del(index: number) {
  list.value.splice(index, 1);
}

function add() {
  list.value.push({
    field: '',
    condition: '',
    value: '',
    operator: 'OR',
  });
}

onMounted(() => {
  list.value.forEach((e) => {
    if (!e.operator) {
      e.operator = 'OR';
    }
  });
});
</script>

<template>
  <div class="form-if">
    <cl-svg class="btn-icon is-rt" name="add" @click="add()" />

    <div v-for="(item, index) in list" :key="index" class="item">
      <ToolsVar
        v-model="item.field"
        v-model:node-id="item.nodeId"
        v-model:node-type="item.nodeType"
      />

      <el-select
        v-model="item.condition"
        :style="{
          width: '100px',
        }"
        placeholder="操作符"
        popper-class="cl-flow__popper"
      >
        <el-option
          v-for="c in condition"
          :key="c.value"
          :label="c.label"
          :value="c.value"
        />
      </el-select>

      <el-input
        v-model="item.value"
        :style="{
          width: '80px',
        }"
        placeholder="输入值"
      />

      <cl-svg class="btn-icon" name="delete" @click="del(index)" />

      <div class="operator">
        <el-button-group size="small">
          <el-button
            v-for="o in operator"
            :key="o.value"
            :type="item.operator == o.value ? 'primary' : ''"
            @click="item.operator = o.value"
          >
            {{ o.label }}
          </el-button>
        </el-button-group>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-if {
  .item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 35px;
    position: relative;

    .el-select {
      margin: 0 5px;
    }

    .el-select,
    .el-input {
      flex-shrink: 0;
    }

    .btn-icon {
      margin-left: 5px;
    }

    .operator {
      position: absolute;
      bottom: 0;
    }

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;

      .operator {
        display: none;
      }
    }
  }
}
</style>
