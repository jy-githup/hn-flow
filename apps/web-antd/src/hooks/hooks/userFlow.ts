import type { Connection } from '@vue-flow/core';

import type { FlowEdge, FlowField, FlowNode } from '#/types/flow';

import { computed, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';

import { useVueFlow } from '@vue-flow/core';
import {
  assign,
  cloneDeep,
  groupBy,
  isArray,
  isEmpty,
  keys,
  last,
  orderBy,
} from 'lodash-es';
import { defineStore } from 'pinia';

import { getFlowInfoApi, saveFlowApi } from '#/api/flowManage/index';
import { CustomNodes } from '#/components/nodes/index';

import { useCool } from './index';

const router = useRouter();

const offset = {
  x: 400,
  y_t: -10,
  y_b: 50,
  g: 150,
};

let id = 1;
let req: Promise<any>;

// 延迟
export function sleep(duration: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, duration);
  });
}

export const useFlow = () => {
  const vueFlow = useVueFlow();
  const { mitt } = useCool();
  const store = defineStore(`flow-${vueFlow.id}`, () => {
    // 所有节点
    const nodes = computed(() => {
      console.log('vueFlow.nodes.value', vueFlow.nodes.value);
      return vueFlow.nodes.value as FlowNode[];
    });

    // 所有线
    const edges = computed(() => vueFlow.edges.value as FlowEdge[]);

    // 当前选中的节点
    const node = shallowRef<FlowNode>();

    // 选中节点
    function setNode(data: any) {
      node.value = data;
      mitt.emit('flow.setNode', node.value);
    }

    // 清空节点
    function clearNode() {
      mitt.emit('flow.clearNode');

      setTimeout(() => {
        node.value = undefined;
      }, 0);
    }

    // 添加节点
    function addNode(type: string, options?: FlowNode) {
      const item = CustomNodes.value.find((e) => e.type === type);
      const data = {
        type,
        data: {
          inputParams: [],
          outputParams: [],
          options: {},
        },
        position: {
          x: 0,
          y: 0,
        },
        ...item,
        ...options,
        id: String(id++),
      };

      vueFlow.addNodes(cloneDeep(data));

      return findNode(data.id);
    }

    // 插入节点，自动计算位置
    function insertNode(type: string, source: FlowNode, options?: FlowNode) {
      return source
        ? addNode(type, {
            position: calcPosition(source, undefined),
            ...options,
          })
        : undefined;
    }

    // 更新节点
    function updateNode(id: string, data: any) {
      const node = findNode(id);

      if (node) {
        // 不同类型，清空相关连线
        if (data.name && data.name !== node.name) {
          removeEdgeByNodeId(id);

          ['handle', 'data', 'form'].forEach((k) => {
            if (!data[k]) {
              data[k] = {};
            }
          });
        }

        assign(node, data);
        vueFlow.updateNode(id, data);
      }
    }

    // 移除节点
    function removeNodes(nodes: any | any[], force?: boolean) {
      // start 节点不能删除，除非 force 强制删除
      const vals = (isArray(nodes) ? nodes : [nodes]).filter((e) =>
        force ? true : e.type !== 'start',
      );

      // 移除节点
      vueFlow.removeNodes(vals);

      // 移除连线
      vals.forEach((e) => {
        removeEdgeByNodeId(e.id);

        // 如果是当前选中节点，则清空
        if (e.id === node.value?.id) {
          clearNode();
        }
      });
    }

    // 搜索节点
    function findNode(id: string) {
      return nodes.value.find((n) => n.id === id) as FlowNode;
    }

    // 搜索节点
    function findNodeByType(type: string) {
      return nodes.value.find((n) => n.type === type) as FlowNode;
    }

    // 叶子节点
    function leafNodes(id: string) {
      return childrenAllNodes(id).filter((e) =>
        isEmpty(childrenNodes(e.id || '')),
      );
    }

    // 兄弟节点
    function slibingNodes(id: string, hasOwn: boolean = true) {
      // 找上级节点
      const pNode = parentNode(id);

      // 找同级
      return edges.value
        .filter((e) => e.source === pNode?.id)
        .map((e) => findNode(e.target))
        .filter((e) => (hasOwn ? true : e.id !== id));
    }

    // 父节点
    function parentNode(id: string) {
      const edge = edges.value.find((e) => e.target === id);
      return edge ? findNode(edge.source || '') : null;
    }

    // 所有父节点
    function parentAllNodes(id: string) {
      const nodes: FlowNode[] = [];

      function next(id: string) {
        const pNode = parentNode(id);

        if (pNode) {
          nodes.push(pNode);
          next(pNode.id || '');
        }
      }

      next(id);

      return nodes;
    }

    // 子节点
    function childrenNodes(id: string, handle?: string): FlowNode[] {
      const node = findNode(id);

      // 下级连接线
      const childrenEdges = edges.value.filter((e) => e.source === id);

      // 下级连接点
      const handles = node?.handle?.next || [{ value: 'source' }];

      // 根据连接点顺序返回
      return handles
        .filter((e) => {
          return handle ? e.value === handle : true;
        })
        .map((a: { value: string }) => {
          const edge = childrenEdges.find((e) => e.sourceHandle === a.value);
          return edge ? findNode(edge.target) : null;
        })
        .filter((e) => !!e);
    }

    // 子所有节点
    function childrenAllNodes(id: string, handle?: string) {
      const nodes: FlowNode[] = [];

      function next(id: string, i = 0) {
        const children = childrenNodes(id, i === 0 ? handle : undefined);

        children.forEach((e) => {
          nodes.push(e);
          next(e.id || '', i + 1);
        });
      }

      next(id, 0);

      return nodes;
    }

    // 获取与节点所有连接的其他节点
    function getConnectedNodes(nodeId: string) {
      const pNodes = parentAllNodes(nodeId);
      const cNodes = childrenAllNodes(nodeId);

      return [...pNodes, findNode(nodeId), ...cNodes].filter((e) => !!e);
    }

    // 是否存在线
    function hasEdge(connection: Connection) {
      return edges.value.filter((e) => {
        if (
          e.source === connection.source &&
          connection.sourceHandle === e.sourceHandle
        ) {
          return true;
        }

        if (
          e.target === connection.target &&
          connection.targetHandle === e.targetHandle
        ) {
          return true;
        }

        return false;
      });
    }

    // 添加边线
    function addEdge(connection: Connection) {
      const list = hasEdge(connection);
      if (!isEmpty(list)) {
        removeEdges(list);
      }

      vueFlow.addEdges({
        ...connection,
        animated: false,
        updatable: true,
        // markerEnd: MarkerType.ArrowClosed,
        style: {
          strokeWidth: 1.5,
        },
        type: 'button',
      });
    }

    // 查找边线
    function findEdge(id: string) {
      return vueFlow.findEdge(id);
    }

    // 更新边线
    function updateEdge(id: string, data: any) {
      const edge = findEdge(id);

      if (edge) {
        vueFlow.updateEdge(edge, assign(edge, data), false);
      }
    }

    // 移除线
    function removeEdges(edge: any | any[]) {
      vueFlow.removeEdges(edge);
    }

    // 根据节点移除线
    function removeEdgeByNodeId(nodeId: string, type?: 'source' | 'target') {
      const list = edges.value.filter((e) => {
        if (type) {
          return e[type] === nodeId;
        }

        return e.source === nodeId || e.target === nodeId;
      });

      removeEdges(list);

      return list;
    }

    // 突出已连接的线
    function activeEdge(nodeId: string, isShow: boolean) {
      const primaryColor = getComputedStyle(
        document.documentElement,
      ).getPropertyValue(`--el-color-primary`);

      edges.value
        .filter((e) => e.target === nodeId || e.source === nodeId)
        .forEach((e) => {
          const stroke = isShow ? primaryColor : e._stroke || '';

          // 记录之前的颜色
          e._stroke = e.style?.stroke;

          updateEdge(e.id, {
            style: {
              stroke,
            },
          });
        });
    }

    // 默认
    function def() {
      if (isEmpty(nodes.value)) {
        const node = addNode('start', {
          position: {
            x: 100,
            y: 100,
          },
        });

        setNode(node);
      }
    }

    // 清空画布
    function clear() {
      // 清空线
      removeEdges(edges.value);
      // 清空节点
      removeNodes(nodes.value, true);

      // 默认
      def();

      // 设置视图
      setViewport({ x: 0, y: 0 });
    }

    // 复制节点
    const copyData = shallowRef<FlowNode>();
    function setCopyNode(node: any) {
      copyData.value = cloneDeep(node);
    }
    // 缩放
    const zoom = ref(100);
    function setZoom(val: number) {
      zoom.value = val;
    }

    // 控制模式
    const controlMode = ref('hand');
    function setControlMode(val: 'hand' | 'pointer') {
      controlMode.value = val;
      vueFlow.panOnDrag.value = val === 'hand';
    }

    // 滚动距离 、缩放大小
    const viewport = computed(() => {
      return vueFlow.viewport.value || { zoom: 1 };
    });

    function setViewport(
      { x, y, zoom }: { x: number; y: number; zoom?: number },
      duration = 300,
    ) {
      vueFlow.setViewport(
        { x, y, zoom: zoom || viewport.value.zoom },
        { duration },
      );
    }

    // 设置节点中心位置
    async function setViewportByNode(node: FlowNode) {
      if (!node) {
        return false;
      }

      await sleep(10);

      const { zoom } = viewport.value;

      if (node) {
        const flowEl = document.querySelector('.cl-flow');
        const panelEl = document.querySelector('.cl-flow .tools-panel-right');
        const nodeEl = document.querySelector(`div[data-id="${node.id}"]`);

        const { x = 0, y = 0 } = node.position || {};

        const top =
          ((flowEl?.clientHeight || 0) - (nodeEl?.clientHeight || 0) * zoom) /
            2 -
          y * zoom;
        const left =
          ((flowEl?.clientWidth || 0) -
            ((panelEl?.clientWidth || 0) + 10) -
            (nodeEl?.clientWidth || 0) * zoom) /
            2 -
          x * zoom;

        setViewport({ x: left, y: top });
      } else {
        setViewport({ x: 0, y: 0 });
      }
    }

    // 计算位置信息
    function calcPosition(source: FlowNode, target?: FlowNode) {
      const { x = 0, y = 0 } = source.position || {};

      const position = {
        x: x + offset.x,
        y: 0,
      };

      // 子节点
      const nodes = childrenNodes(source.id || '');

      // 第一个子节点
      const fNode = nodes[0];

      // 【是否有相邻节点】有目标节点则判断是否与第一个相同，否则判断节点长度
      if (target ? fNode?.id !== target.id : !isEmpty(nodes)) {
        // 计算到第几个子节点
        const end = target
          ? nodes.findIndex((e) => e.id === target?.id)
          : nodes.length;

        // 前几个节点高度之和，从第一个节点的 y 开始算
        const height = nodes
          .filter((_, i) => i < end)
          .reduce((a, b) => {
            return (
              a +
              (document.querySelector(`div[data-id="${b.id}"]`)?.clientHeight ||
                0) +
              offset.y_b
            );
          }, fNode?.position?.y || 0);

        position.y = height;
      } else {
        position.y = y - offset.y_t;
      }

      return position;
    }

    // 整理
    async function arrange() {
      if (node.value) {
        clearNode();
        await sleep(200);
      }

      const list = nodes.value as FlowNode[];

      // 是否已连接
      const conntected: string[] = [];

      // 多个连接线
      const group: FlowNode[][] = [];

      list.forEach((e) => {
        if (!conntected.includes(e.id || '')) {
          const nodes = [e, ...childrenAllNodes(e.id || '')];

          nodes.forEach((e) => {
            conntected.push(e.id || '');
          });

          // 判断最后一个是否相同
          const sn = group.findIndex((e) => last(e)?.id === last(nodes)?.id);

          if (sn === -1) {
            group.push(nodes);
          } else {
            // 长的覆盖短的
            if (group[sn] && nodes.length > group[sn].length) {
              group[sn] = nodes;
            }
          }
        }
      });

      // 遍历组，计算每个节点
      group.forEach((row, i) => {
        // 起始
        const x = 100;
        let y = 100;

        // 根据上一组的 y 值来计算当前
        const prev = group[i - 1];

        if (prev) {
          const arr = prev.map((e) => {
            return (
              (e.position?.y || 0) +
              (document.querySelector(`div[data-id="${e.id}"]`)?.clientHeight ||
                0)
            );
          });

          y = Math.max(...arr, 0) + offset.g;
        }

        const node = row[0];

        if (node) {
          // 更新首节点
          updateNode(node.id || '', {
            position: {
              x,
              y,
            },
          });

          // 依次遍历子节点
          function next(item: FlowNode) {
            const children = childrenNodes(item.id || '');

            children.forEach((e) => {
              updateNode(e.id || '', {
                position: calcPosition(item, e),
              });

              next(e);
            });
          }

          next(node);
        }
      });

      // 回到初始位置
      setViewport({ x: 0, y: 0, zoom: 1 });
    }

    // 初始化
    function init() {
      // 设置删除键
      vueFlow.deleteKeyCode.value = 'none';

      // 禁用点击连接
      vueFlow.connectOnClick.value = false;
    }

    // 基本信息
    // const info = ref<Eps.FlowInfoEntity>();
    const info = ref<any>();

    // 获取
    async function get(flowId?: number, flowLabel?: string) {
      console.log(`传递的id：：：：：：${flowId}`);
      await req;
      const res = await getFlowInfoApi(flowId, flowLabel);
      if (res.data) {
        info.value = res.data;
        // 还原节点
        restore(res.data.draft);
        // 开始节点
        if (isEmpty(nodes.value)) {
          def();
        }
      } else {
        // ElMessageBox.alert('流程不存在或异常，请重新选择。', '提示', {
        //   callback() {
        //     router.push({
        //       name: 'flowManage',
        //     });
        //   },
        // });
      }
    }

    /**
     * 提取传给后端的数据
     * @param nodes
     * @param edges
     * @returns
     */
    function extractData(nodes: any, edges: any) {
      const nodesResult = (nodes as FlowNode[]).map((item: any) => {
        const e = { ...item };
        delete e.icon;
        // 开始节点
        if (e.type === 'start') {
          e.data?.inputParams?.forEach((p: any) => {
            p.name = p.field;
            p.nodeId = e.id;
            p.nodeType = 'start';
          });
        }

        // 其他节点
        else {
          ['inputParams', 'outputParams'].forEach((k) => {
            if (e.data?.[k]) {
              e.data?.[k].forEach((e: FlowField) => {
                const d = findNode(e.nodeId || '');

                if (d) {
                  e.nodeType = d.type;
                }
              });
            }
          });
        }

        return {
          ...e,
          component: undefined,
          form: undefined,
        };
      });

      const edgesResult = edges.map((e: any) => {
        return {
          ...e,
          animated: false,
          style: {},
        };
      });

      return {
        nodes: nodesResult,
        edges: edgesResult,
      };
    }

    // 保存
    async function save() {
      if (!info.value?.id) {
        return false;
      }

      const { nodes, edges, viewport } = vueFlow.toObject();

      // 提取有用数据
      const { nodes: nodesResult, edges: edgesResult } = extractData(
        nodes,
        edges,
      );
      const requestData = {
        id: info.value?.id,
        draft: {
          nodes: nodesResult,
          edges: edgesResult,
          viewport,
        },
      };
      req = saveFlowApi(requestData);
      req = Promise.resolve({
        nodes: nodesResult,
        edges: edgesResult,
        viewport,
      });

      await req;
    }

    // 还原
    async function restore(data: any) {
      if (data) {
        await vueFlow.fromObject(data);

        // 还原缩放比例
        zoom.value = viewport.value.zoom * 100;

        // 替换为本地的配置
        if (!isEmpty(nodes.value)) {
          id = Math.max(...nodes.value.map((e) => Number(e.id))) + 1;

          nodes.value.forEach((e) => {
            const cn = CustomNodes.value.find((a) => a.type === e.type);
            if (cn) {
              // 处理卡片宽度
              const configWidth = cn.form?.width || '400px';
              const width = `${Number.parseFloat(configWidth) + 30}px`;

              e.component = cn.component;
              e.form = cn.form;
              e.color = cn.color;
              e.group = cn.group;
              e.validator = cn.validator;
              e.cardWidth = width;
              if (cn.icon) {
                e.icon = cn.icon;
              }
            }
          });
        }
      }
    }

    // 分组显示
    function getGroup(keyWord: string) {
      const d = groupBy(
        CustomNodes.value.filter((e) => e.type !== 'start'),
        'group',
      );

      let list = keys(d)
        .map((k) => {
          return {
            label: k,
            children: d[k]?.filter((e) => {
              return keyWord ? e.label?.includes(keyWord) : true;
            }),
          };
        })
        .filter((e) => {
          return !isEmpty(e.children);
        });

      list = orderBy(list, 'label', 'asc');

      return list;
    }

    // 视图x,y偏移
    function viewPx(x: number, y: number) {
      return [
        (x - viewport.value.x) / viewport.value.zoom,
        (y - viewport.value.y) / viewport.value.zoom,
      ];
    }

    // 禁用拖拽
    function disabledDrag() {
      vueFlow.nodesDraggable.value = false;
      vueFlow.panOnDrag.value = false;
    }

    // 启用拖拽
    function enableDrag() {
      vueFlow.nodesDraggable.value = true;
      vueFlow.panOnDrag.value = true;
    }

    /**
     * 节点聚焦或失焦时调整子节点的位置
     * @param type open|close
     * @param node
     * @param id
     * @returns
     */
    async function updateChildrenPosition(
      type: 'close' | 'open',
      node: FlowNode,
    ) {
      if (node) {
        let list = [] as FlowNode[];

        list = type === 'open' ? childrenAllNodes(node.id || '') : nodes.value;

        list.forEach((e: any) => {
          e.isMoving = true;

          if (type === 'open') {
            e._offset = {
              x: Number.parseInt(node.form?.width || '400px') - 300 + 30,
              y: 0,
            };
            e.position.x += e._offset.x;
          } else {
            if (e._offset) {
              e.position.x -= e._offset.x;
              delete e._offset;
            }
          }

          updateNode(e.id || '', e);

          setTimeout(() => {
            e.isMoving = false;
          }, 200);
        });
      }
    }

    /**
     * 导出流程
     */
    async function exportFlow() {
      if (!info.value?.id) {
        return false;
      }

      const { nodes, edges, viewport } = vueFlow.toObject();

      // 提取有用数据
      const { nodes: nodesResult, edges: edgesResult } = extractData(
        nodes,
        edges,
      );

      const flowInfo = cloneDeep(info.value);

      // 处理无用数据
      delete flowInfo.id;
      delete flowInfo.createTime;
      delete flowInfo.updateTime;
      delete flowInfo.releaseTime;
      delete flowInfo.draft;

      // 导出的数据
      const result = {
        ...flowInfo,
        draft: {
          nodes: nodesResult,
          edges: edgesResult,
          viewport,
        },
      };

      const dataStr = JSON.stringify(result, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${info.value?.name || 'flow'}.json`);
      link.click();

      URL.revokeObjectURL(url);

      // Message.success('导出成功');
    }

    const expose: { [key: string]: any } = {
      CustomNodes,
      nodes,
      node,
      addNode,
      removeNodes,
      setCopyNode,
      insertNode,
      setNode,
      findNode,
      findNodeByType,
      slibingNodes,
      parentNode,
      parentAllNodes,
      childrenNodes,
      childrenAllNodes,
      leafNodes,
      getConnectedNodes,
      clearNode,
      updateNode,
      edges,
      addEdge,
      findEdge,
      updateEdge,
      activeEdge,
      removeEdges,
      removeEdgeByNodeId,
      copyData,
      clear,
      zoom,
      setZoom,
      controlMode,
      setControlMode,
      viewport,
      setViewport,
      setViewportByNode,
      arrange,
      init,
      info,
      get,
      save,
      restore,
      getGroup,
      viewPx,
      offset,
      disabledDrag,
      enableDrag,
      updateChildrenPosition,
      exportFlow,
    };

    // 事件传递
    [
      'addNodes',
      'updateNode',
      'removeNodes',
      'addEdge',
      'updateEdge',
      'removeEdges',
      'clear',
      'arrange',
    ].forEach((k) => {
      const fn = expose[k];

      expose[k] = (...args: any[]) => {
        const d = fn(...args);
        mitt.emit(`flow.${k}`, d);

        return d;
      };
    });

    return expose;
  });

  return store();
};
