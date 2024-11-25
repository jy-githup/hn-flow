<script lang="tsx" name="know-data-type" setup>
import { onActivated, reactive, ref } from 'vue';

import { useCrud, useUpsert } from '@cool-vue/crud';
import { QuestionFilled } from '@element-plus/icons-vue';
import { isEmpty } from 'lodash-es';
// import { ctx } from 'virtual:ctx';
const ctx = {
  serviceLang: 'Java',
};

import { useCool } from '#/cool';

import KnowConfig from '../../components/config.vue';
import SelectModel from '../../components/select-model.vue';
import { useIcon } from '../../hooks';

const { service, router } = useCool();
const icon = useIcon();

// 选项
const options = reactive({
  model: {},
  embed: [] as any[],
});

// 列表
const list = ref<KnowType[]>([]);

// cl-upsert
const Upsert = useUpsert<Eps.KnowDataTypeEntity>({
  items: [
    {
      label: '图标',
      prop: 'icon',
      component: {
        name: 'slot-icon',
      },
      required: true,
    },
    {
      label: '名称',
      prop: 'name',
      component: { name: 'el-input' },
      required: true,
    },
    {
      label: '描述',
      prop: 'description',
      component: { name: 'el-input', props: { type: 'textarea', rows: 4 } },
    },
    {
      label: '索引模型',
      renderLabel: () => {
        return (
          <el-text>
            索引模型
            <el-tooltip content="将数据向量化的模型">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </el-text>
        );
      },
      prop: 'embedOptions',
      component: {
        vm: SelectModel,
        props: {
          field: 'embed',
        },
      },
      required: true,
      value: {
        model: '',
      },
    },
    {
      label: '重排模型',
      renderLabel: () => {
        return (
          <el-text>
            重排模型
            <el-tooltip content="对结果进行智能排序，使其更符合文本内容">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </el-text>
        );
      },
      prop: 'rerankOptions',
      component: {
        name: 'slot-rerank',
      },
      value: {
        model: '',
      },
      hidden: ctx.serviceLang != 'Node',
    },
    {
      label: '状态',
      prop: 'enable',
      value: 1,
      component: {
        name: 'el-radio-group',
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
    },
  ],

  onOpened(data) {
    if (Upsert.value?.mode == 'update') {
      data.icon = icon.get(data.icon);
    }
  },

  onSubmit(data, { next }) {
    next({
      ...data,
      icon: icon.get(data.icon),
    });
  },
});

// cl-crud
const Crud = useCrud(
  {
    service: service.know.data.type,
    async onRefresh(params, { next }) {
      const res = await next({
        ...params,
        size: 1000,
      });

      list.value = res.list;
    },
  },
  (app) => {
    app.refresh();
  },
);

// 模型
const model = reactive({
  refresh() {
    service.know.config.getByFunc({ func: 'embed' }).then((res: any[]) => {
      res.forEach((e) => {
        if (e.options.options) {
          options.model[e.id] =
            (e.options.options as any[]).find((e) => e.field == 'model')
              ?.select || [];
        }
      });

      // 模型供应商
      options.embed = res.map((e) => {
        return {
          label: e.name,
          value: e.id,
        };
      });
    });
  },

  getTag(item: KnowType) {
    let v = options.embed.find((e) => e.value == item.embedConfigId)?.label;

    if (item.embedOptions?.model) {
      v += ` / ${item.embedOptions?.model}`;
    }

    return v;
  },
});

// 详情
function toDetail(item: KnowType) {
  router.push({
    path: '/know/data/info',
    query: {
      id: item.id,
      title: item.name,
    },
  });
}

onActivated(() => {
  model.refresh();
});
</script>

<template>
  <cl-crud ref="Crud">
    <cl-row>
      <cl-add-btn>添加知识库</cl-add-btn>
      <KnowConfig @close="model.refresh()" />
    </cl-row>

    <el-row :gutter="10">
      <el-col
        v-for="(item, index) in list"
        :key="index"
        :lg="6"
        :md="12"
        :xs="24"
      >
        <div class="data-item" @click="toDetail(item)">
          <div class="head">
            <img :src="icon.get(item.icon)" class="icon" />

            <span class="name">{{ item.name }}</span>

            <cl-svg name="delete" @click.stop="Crud?.rowDelete(item)" />
            <cl-svg name="set" @click.stop="Crud?.rowEdit(item)" />
          </div>

          <div class="content">
            <div class="desc">{{ item.description || '暂无描述' }}</div>
          </div>

          <div class="footer">
            <el-tooltip :content="model.getTag(item)">
              <div class="tag">{{ model.getTag(item) }}</div>
            </el-tooltip>

            <cl-switch
              v-model="item.enable"
              :column="{
                property: 'enable',
              }"
              :scope="item"
            />
          </div>
        </div>
      </el-col>
    </el-row>

    <cl-upsert ref="Upsert">
      <template #slot-icon="{ scope }">
        <div class="slot-icon">
          <cl-upload
            v-model="scope.icon"
            :show-tag="false"
            :size="80"
            text=""
          />

          <div class="icons">
            <img
              v-for="item in icon.list"
              :key="item.name"
              :src="item.path"
              @click="scope.icon = item.path"
            />
          </div>
        </div>
      </template>

      <template #slot-rerank="{ scope }">
        <cl-switch v-model="scope.enableRerank" :style="{ width: '60px' }" />
        <SelectModel
          :disabled="!scope.enableRerank"
          :scope="scope"
          field="rerank"
        />
      </template>
    </cl-upsert>

    <div v-if="isEmpty(list)" class="empty">
      <el-empty :image-size="100" />
    </div>
  </cl-crud>
</template>

<style lang="scss" scoped>
.data-item {
  display: flex;
  flex-direction: column;
  height: 140px;
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
    margin-bottom: 10px;

    .icon {
      height: 28px;
      width: 28px;
      margin-right: 10px;
    }

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
    margin-bottom: 10px;

    .desc {
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      word-break: break-all;
      color: var(--el-color-info);
      font-size: 12px;
    }
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .tag {
      border: 1px solid var(--el-bg-color-page);
      color: var(--el-color-info);
      border-radius: 4px;
      padding: 4px 10px;
      max-width: 200px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 12px;

      &:hover {
        background-color: var(--el-bg-color-page);
      }
    }
  }

  &:hover {
    box-shadow: 0 25px 40px -25px var(--el-bg-color-page);
    border-color: var(--el-color-primary);
  }
}

.empty {
  margin-top: 100px;
}

.slot-icon {
  .icons {
    display: flex;
    flex-wrap: wrap;

    img {
      height: 26px;
      width: 26px;
      margin: 10px 10px 0 0;
      padding: 2px;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>
