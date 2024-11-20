<script setup lang="ts" name="node-llm-form-content">
import { onMounted, onUnmounted, type PropType, useModel } from 'vue';

import { last } from 'lodash-es';
import Draggable from 'vuedraggable';

import ToolsVar from '#/components/tools/var.vue';
import { useFlow } from '#/hooks/hooks/userFlow';
import { useCool } from '#/hooks/hooks/index';
import { sleep } from '#/hooks/hooks/userFlow';

const props = defineProps({
  modelValue: {
    type: Array as PropType<LLMMessage[]>,
    default: () => [],
  },
});

const { refs, setRefs } = useCool();
const flow = useFlow();

// 绑定值
const list = useModel(props, 'modelValue');

// 获取类型
function getRoles(item: LLMMessage) {
  return [
    {
      label: 'SYSTEM',
      value: 'system',
    },
    {
      label: 'USER',
      value: 'user',
    },
    {
      label: 'ASSISTANT',
      value: 'assistant',
    },
  ].filter((e) => {
    return item.role == 'system' ? true : e.value != 'system';
  });
}

// 添加
function add() {
  const item = last(list.value);

  list.value.push({
    role: item?.role == 'user' ? 'assistant' : 'user',
    content: '',
  });
}

// 删除
function remove(index: number) {
  list.value.splice(index, 1);
}

// 设置内容
function setContent(el: HTMLElement, item: LLMMessage) {
  let val = '';

  function deep(e: Node) {
    if (e.nodeType == 1) {
      const node = e as HTMLElement;
      const field = node.dataset.field;

      if (field) {
        val += `{${field}}`;
      } else {
        if (val) {
          val += '\n';
        }

        if (e.textContent) {
          e.childNodes.forEach(deep);
        }
      }
    } else {
      val += e.textContent;
    }
  }

  deep(el);

  item.content = val;
}

// 监听内容输入
async function onContentInput(e: any, item: LLMMessage) {
  setContent(e.target, item);

  const sel = window.getSelection();

  if (!sel || sel.rangeCount == 0) {
    return;
  }

  await sleep(10);

  const range = sel.getRangeAt(0);

  // 获取光标位置
  const startContainer: any = range.startContainer;
  const startOffset = range.startOffset;

  // 如果光标在文本节点中，检查前一个字符
  if (
    startOffset > 0 &&
    startContainer.textContent?.[startOffset - 1] === '/'
  ) {
    range.setStart(sel.anchorNode!, sel.anchorOffset);
    range.collapse(true);

    // 获取选中的位置
    const rect = range.getBoundingClientRect();

    // 获取选中父级的位置
    const container = startContainer.parentElement.closest('.form-content');
    const containerRect = container.getBoundingClientRect();

    // 计算相对位置
    const relativeReact = {
      top: rect.top - containerRect.top + 8,
      left: rect.left - containerRect.left,
      width: rect.width,
      height: rect.height,
    };

    // 自定义变量节点
    refs.toolsVar.open({
      rect: relativeReact,
      onSelect(item: any) {
        const pos = range.startOffset;

        if (pos > 0) {
          // 删除 / 符号
          range.setStart(range.startContainer, pos - 1);
          range.deleteContents();

          // 创建自定义元素
          const node = document.createElement('div');
          node.setAttribute('contenteditable', 'false');
          node.dataset.field = item.field;
          node.className = 'field';
          node.innerText = item.field;

          // 选中当前元素
          node.addEventListener('click', () => {
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
          });

          // 插入元素
          range.insertNode(node);

          // 设置光标
          range.setStartAfter(node);
          range.setEndAfter(node);

          // 让新的range生效
          const sel2 = window.getSelection();
          sel2?.removeAllRanges();
          sel2?.addRange(range);
        }
      },
    });
  } else {
    refs.toolsVar.close();
  }
}

// 方向键控制
function onContentKeydown(e: KeyboardEvent) {
  if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
    refs.toolsVar.focus(e);
  }
}

// 监听选择
function onSelectionChange() {
  function isRangeInsideElement(range: Range, element: Element) {
    const elementRange = document.createRange();
    elementRange.selectNodeContents(element);
    return range.intersectsNode(element);
  }

  const selection = document.getSelection();

  if (selection && selection.rangeCount != 0) {
    const selectedRange = selection.getRangeAt(0);

    for (const i in refs) {
      // 所有输入框
      if (
        i.includes('input-') &&
        refs[i]?.contains(selectedRange.commonAncestorContainer)
      ) {
        const list = refs[i].querySelectorAll('.field') as HTMLElement[];

        // 判断是选中
        list.forEach((e) => {
          e.className = isRangeInsideElement(selectedRange, e)
            ? 'field active'
            : 'field';
        });

        return;
      }
    }
  }
}

onMounted(() => {
  list.value.forEach((e) => {
    let start = -1;
    const arr: any[] = [];

    for (let i = 0; i < e.content.length; i++) {
      const v = e.content[i];

      if (v == '{') {
        start = i;
      } else if (v == '}') {
        const field = e.content.substring(start + 1, i);
        const param = flow.node?.data?.inputParams?.find(
          (e) => e.field == field,
        );

        if (param) {
          arr.push(
            `<div class="field" contenteditable="false" data-field="${field}">${field}</div>`,
          );
        }

        start = -1;
      } else {
        if (start == -1) {
          arr.push(v);
        }
      }
    }

    e.text = arr.join('');
  });

  document.addEventListener('selectionchange', onSelectionChange);
});

onUnmounted(() => {
  document.removeEventListener('selectionchange', onSelectionChange);
});
</script>

<template>
  <div class="form-content">
    <cl-svg class="btn-icon is-rt" name="add" @click="add()" />

    <Draggable
      v-model="list"
      :animation="300"
      class="list"
      item-key="id"
      tag="div"
    >
      <template #item="{ element: item, index }">
        <div
          :class="{
            error: !item.content,
          }"
          class="item textarea-item"
        >
          <div class="head">
            <a-select
              v-model="item.role"
              :disabled="item.role == 'system'"
              class="role"
              popper-class="cl-flow__popper"
              size="small"
            >
              <a-select-option
                v-for="t in getRoles(item)"
                :key="t.value"
                :label="t.label"
                :value="t.value"
              />
            </a-select>

            <div class="op">
              <cl-svg
                v-if="item.role != 'system'"
                class="btn-icon"
                name="delete"
                @click="remove(index)"
              />
            </div>
          </div>

          <div
            :ref="setRefs(`input-${index}`)"
            :class="{
              'is-empty': !item.content,
            }"
            class="content"
            contenteditable="true"
            @focus="(e) => onContentInput(e, item)"
            @input="(e) => onContentInput(e, item)"
            @keydown="(e) => onContentKeydown(e)"
            v-html="item.text"
          ></div>
        </div>
      </template>
    </Draggable>

    <!-- 选择变量 -->
    <ToolsVar
      :ref="setRefs('toolsVar')"
      :autofocus="false"
      :show-picker="false"
      only-select
      position="absolute"
      use-input-params
    />
  </div>
</template>

<style lang="scss" scoped>
.form-content {
  // pointer-events: all;
  position: relative;

  .list {
    .item {
      .head {
        padding: 5px 10px !important;

        .role {
          width: 100px;
        }
      }

      .content {
        outline: none;
        line-height: 1.5;
        padding: 0 10px;
        min-height: 50px;
        user-select: text;
        white-space: pre-wrap;
        word-break: break-word;
        cursor: text;

        :deep(.field) {
          display: inline-block;
          border-radius: 4px;
          padding: 0 4px;
          margin: 0 2px;
          font-size: 12px;
          cursor: pointer;
          border: 1px solid var(--el-border-color);
          box-sizing: border-box;
          user-select: none;
          color: var(--el-color-primary);

          &:hover,
          &.active {
            border-color: var(--el-color-primary);
          }
        }

        &.is-empty {
          color: var(--el-text-color-placeholder);
          cursor: text;

          &::before {
            content: '在这里写你的提示词，输入 “/” 插入变量';
          }
        }
      }

      &.error {
        border-color: var(--el-color-danger) !important;
      }
    }
  }
}
</style>
