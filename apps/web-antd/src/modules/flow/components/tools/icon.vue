<script lang="ts" setup name="tools-icon">
defineOptions({
  name: 'ToolsIcon',
});
const props = defineProps({
  name: String,
  size: {
    type: Number,
    default: 20,
  },
  color: String,
});
</script>

<template>
  <div
    :class="[`is-${name}`]"
    :style="{
      height: `${size}px`,
      width: `${size}px`,
      backgroundColor: color,
    }"
    class="tools-icon"
  >
    <cl-svg :name="name" />
  </div>
</template>

<style lang="scss" scoped>
.tools-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  background-color: var(--el-color-primary);
  color: #fff;
  font-size: 14px;
  flex-shrink: 0;

  &.is-add {
    background-color: var(--el-color-info-light-5);
  }
}
</style>
