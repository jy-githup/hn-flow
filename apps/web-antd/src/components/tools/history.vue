<template>
	<div class="tools-history">
		<el-tooltip content="上一步">
      <VaadinArrowBackward
        :class="{
					disabled: !isPrev
				}"
        class="size-6"
        @click="prev"
      />
		</el-tooltip>

		<el-tooltip content="下一步">
			<EntypoForward
				:class="{
					disabled: !isNext
				}"
        class="size-6"
				@click="next"
			/>
		</el-tooltip>
	</div>
</template>

<script setup lang="ts" name="tools-history ">
import { ref, onMounted, watch } from "vue";
import { VaadinArrowBackward, EntypoForward } from '@vben/icons';
import { useFlow } from "#/hooks/hooks/userFlow";
import { debounce, cloneDeep } from "lodash-es";
import { computed } from "vue";
import { sleep } from "#/cool/utils";
import { useCool } from "#/cool";
import { onUnmounted } from "vue";

const { mitt } = useCool();
const flow = useFlow();

const list = ref<any[]>([]);
const active = ref(0);

// 能否上一个
const isPrev = computed(() => active.value > 0);

// 能否下一个
const isNext = computed(() => active.value < list.value.length - 1);

// 上一个
function prev() {
	if (isPrev.value) {
		active.value -= 1;
		update();
	}
}

// 下一个
function next() {
	if (isNext.value) {
		active.value += 1;
		update();
	}
}

let lock = false;

// 更新数据
async function update() {
	if (lock) {
		return false;
	}

	const d = list.value[active.value];

	if (d) {
		lock = true;

		await flow.restore(d);
		await sleep(300);

		lock = false;
	}
}

// 添加记录
const append = debounce(() => {
	if (lock) {
		return false;
	}

	list.value.splice(
		active.value + 1,
		list.value.length,
		cloneDeep({
			nodes: flow.nodes,
			edges: flow.edges,
			viewport: flow.viewport
		})
	);

	active.value = list.value.length - 1;
}, 300);

// flow触发的方法
const fns = ["addNodes", "updateNode", "removeNodes", "addEdge", "removeEdges", "clear", "arrange"];

onMounted(() => {
	append();

	fns.forEach((k) => {
		mitt.on(`flow.${k}`, append);
	});
});

onUnmounted(() => {
	fns.forEach((k) => {
		mitt.off(`flow.${k}`, append);
	});
});
</script>

<style lang="scss" scoped>
.tools-history {
	display: flex;
	cursor: pointer;

	.disabled {
		color: var(--el-text-color-disabled) !important;

		&:focus {
			color: var(--el-text-color-disabled) !important;
		}
	}
}
</style>
