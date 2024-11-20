import { App, Component, CSSProperties } from 'vue';

export declare type FlowField = {
  [key: string]: any;
  field: string; // 自定义命名
  label?: string; // 显示名称
  name?: string; // 选择的变量名
  nodeId?: string; // 选择的节点ID
  nodeType?: string; // 选择的节点类型 start end ...
  required?: boolean; // 是否必填
  type?: string; // 字段类型 string number ...
  value?: string; // 自定义值
};

declare interface FlowData {
  inputParams?: FlowField[];
  outputParams?: FlowField[];
  options?: any;
}

declare interface FlowNode {
  enable?: boolean;
  id?: string;
  label?: string;
  description?: string;
  type?: string;
  icon?: string;
  name?: `node-${string}`;
  position?: {
    x: number;
    y: number;
  };
  form?: {
    focus?: string;
    items: ClForm.Item[];
    width?: string;
  };
  handle?: {
    next?: { [key: string]: any; label: string; value: string }[];
    source?: boolean;
    target?: boolean;
  };
  data?: FlowData;
  validator?(data: FlowData): any | string;
  isDisableDrag?: boolean; // 是否禁用拖拽（部分组件跟拖拽事件冲突，需禁用。例：伪富文本dom）
  [key: string]: any;
}

export declare interface FlowEdge {
  id: string;
  type?: string;
  target: string;
  source: string;
  targetHandle?: null | string;
  sourceHandle?: null | string;
  animated?: boolean;
  style?: CSSProperties;
  [key: string]: any;
}

declare interface FlowNodeResult {
  duration: number;
  isEnd: boolean;
  nodeId?: string;
  node?: FlowNode;
  nextNodeId?: string;
  inputParams?: any;
  outputParams?: any;
  llmStream?: boolean;
  count?: {
    tokenUsage: number;
  };
  result: {
    error: {
      message: string;
    };
    result: {
      [key: string]: any;
    };
    success: boolean;
  };
  [key: string]: any;
}

export declare interface ModuleConfig {
  name?: string;
  label?: string;
  description?: string;
  order?: number;
  version?: string;
  logo?: string;
  author?: string;
  updateTime?: string;
  demo?: { component: Component; name: string }[] | string;
  options?: {
    [key: string]: any;
  };
  toolbar?: {
    component: Promise<any>;
    h5?: boolean;
    order?: number;
    pc?: boolean;
  };
  components?: Component[];
  views?: RouteRecordRaw[];
  pages?: RouteRecordRaw[];
  install?(app: App, options?: any): any;
  onLoad?(events: {
    [key: string]: any;
    hasToken: (cb: () => Promise<any> | void) => Promise<any> | void;
  }): Promise<{ [key: string]: any }> | Promise<void> | void;
}
