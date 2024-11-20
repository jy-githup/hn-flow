import type { App, Component, Directive } from 'vue';
import type { RouteRecordRaw, Router as VueRouter } from 'vue-router';

export declare type Merge<A, B> = B & Omit<A, keyof B>;

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

export declare interface Module extends ModuleConfig {
  name: string;
  options: {
    [key: string]: any;
  };
  value?: any;
  services?: { path: string; value: any }[];
  directives?: { name: string; value: Directive }[];
  [key: string]: any;
}

export declare interface Router extends VueRouter {
  find(path: string): RouteRecordRaw | undefined;
  append(
    data: {
      [key: string]: any;
      component?: any;
      isPage?: boolean;
      name?: string;
      path: string;
      viewPath?: string;
    }[],
  ): void;
  register(
    path: string,
  ): Promise<{ isReg: boolean; route: RouteRecordRaw | undefined }>;
  [key: string]: any;
}
