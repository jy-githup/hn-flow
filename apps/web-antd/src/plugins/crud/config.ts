import type { Merge, ModuleConfig } from '#/cool';

import { locale, setFocus } from '@cool-vue/crud';

import '@cool-vue/crud/dist/index.css';

export default (): Merge<ModuleConfig, CrudOptions> => {
  return {
    options: {
      // 字典配置
      dict: {
        primaryId: 'id',
        // 请求方法
        api: {
          list: 'list',
          add: 'add',
          update: 'update',
          delete: 'delete',
          info: 'info',
          page: 'page',
        },
        // 分页
        pagination: {
          page: 'page',
          size: 'size',
        },
        // 关键字搜索
        search: {
          keyWord: 'keyWord',
          query: 'query',
        },
        // 排序
        sort: {
          order: 'order',
          prop: 'prop',
        },
        // 语言
        label: locale.zhCn,
      },
      // 样式
      style: {
        colors: [
          '#d42ca8',
          '#1c109d',
          '#6d17c3',
          '#6dc9f1',
          '#04c273',
          '#06b31c',
          '#f9f494',
          '#aa7a24',
          '#d57121',
          '#e93f4d',
        ],
        // 表单配置
        form: {
          labelPostion: 'right',
          labelWidth: '100px',
          span: 24,
          // 插件列表
          plugins: [
            // 自动聚焦插件
            setFocus(),
          ],
        },
        // 表格配置
        table: {
          // 带边框
          border: true,
          // 是否高亮行
          highlightCurrentRow: true,
          // 自动计算高度
          autoHeight: true,
          // 右键菜单
          contextMenu: [
            'refresh',
            'check',
            'edit',
            'delete',
            'order-asc',
            'order-desc',
          ],
          // 列配置
          column: {
            // 对齐方式
            align: 'center',
            // 操作栏宽度
            opWidth: 160,
          },
        },
      },
    },
  };
};
