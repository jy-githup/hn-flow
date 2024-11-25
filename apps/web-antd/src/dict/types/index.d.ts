export namespace Dict {
  interface Item {
    id: string;
    label: string;
    value: any;
    children?: Item[];
    [key: string]: any;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Data {
    [key: string]: Item[];
  }
}
