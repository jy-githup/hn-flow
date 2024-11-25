<script setup lang="ts" name="node-problem-form-adv">
import { useModel } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const data = useModel(props, 'modelValue');
</script>

<template>
  <div class="form-adv">
    <div class="textarea-item">
      <div class="head">
        <span>指令</span>
      </div>

      <el-input
        v-model="data.cmd"
        :autosize="{
          minRows: 4,
          maxRows: 6,
        }"
        placeholder="输入你的指令"
        resize="none"
        type="textarea"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-adv {
}
</style>
