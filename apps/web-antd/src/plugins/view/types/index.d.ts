import { TreeNode as Node, TreeData } from 'ant-design-vue/es/tree';

export declare namespace ClViewGroup {
  interface Item {
    id: any;
    name: string;
    children: Item[];
    [key: string]: any;
  }

  type M<T> = Item & T;

  interface Ref<T = Item> {
    selected: M<T> | undefined;
    isExpand: boolean;
    select(data?: any): void;
    expand(value?: boolean): void;
    edit(item?: M<T>): void;
    remove(item: M<T>): void;
    refresh(params?: any): void;
  }

  interface Options<T = Item> {
    label: string;
    title: string;
    leftWidth: string;
    data: {
      [key: string]: any;
    };
    tree: {
      lazy?: boolean;
      onLoad?(node: Node, resolve: (data: TreeData) => void): void;
      props?: {
        children?: any;
        class?: any;
        disabled?: ((node: Node, data: any) => string) | string;
        isLeaf?: ((node: Node, data: any) => string) | string;
        label?: ((node: Node, data: any) => string) | string;
      };
    };
    service: {
      [key: string]: any;
      _permission: {
        [key: string]: boolean;
      };
      add(data: any): Promise<any>;
      delete(data: any): Promise<any>;
      list(data?: any): Promise<any[]>;
      page(data?: any): Promise<{
        list: any[];
        pagination: { page: number; size: number; total: number };
      }>;
      permission: {
        [key: string]: string;
      };
      update(data: any): Promise<any>;
    };
    enableContextMenu?: boolean;
    enableAdd?: boolean;
    enableRefresh?: boolean;
    enableKeySearch?: boolean;
    custom?: boolean;
    onSelect?(item: M<T>): void;
    onEdit?(item?: M<T>): DeepPartial<ClForm.Options>;
    onContextMenu?(item: M<T>): ClContextMenu.Options;
    onData?(list: M<T>[]): any[];
    onDelete?(
      item: M<T>,
      { next }: { next(params: any): void },
    ): Promise<void> | void;
  }
}
