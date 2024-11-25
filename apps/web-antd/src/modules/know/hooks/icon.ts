import { filename } from '#/cool/utils';

import IconData from '../static/icon/data.png';
import IconDepot from '../static/icon/depot.png';
import IconGoods from '../static/icon/goods.png';
import IconInfo from '../static/icon/info.png';
import IconResource from '../static/icon/resource.png';

export function useIcon() {
  const list = [IconData, IconDepot, IconGoods, IconInfo, IconResource].map(
    (e) => {
      return {
        path: e,
        name: filename(e),
      };
    },
  );

  function get(val?: string) {
    if (!val) {
      return IconData;
    }

    if (val.includes('http')) {
      return val;
    }

    const icon = val.includes('/')
      ? list.find((e) => e.path == val)?.name
      : list.find((e) => e.name == val)?.path;

    return icon || IconData;
  }

  return {
    list,
    get,
  };
}
