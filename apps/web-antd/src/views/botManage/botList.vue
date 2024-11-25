<script setup lang="ts">
import BotListItem from '#/views/botManage/components/botListItem.vue';

import { getDeaftBotListApi } from '#/api/botManage/index';
import {onMounted} from "vue";

const queryBotList = async () => {
  try {
    const params = {};
    const res = await getDeaftBotListApi(params);
    console.log(res);
  } catch {};
};

onMounted(() => {
  queryBotList();
});
</script>

<template>
  <div class="flex">
    <BotListItem />
  </div>
</template>

<style scoped lang="scss"></style>
