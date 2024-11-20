import type { Emitter } from 'mitt';

import Mitt from 'mitt';

import { hmr } from './hmr';

const mitt: Emitter<any> = hmr.getData('mitt', Mitt());

export function useMitt() {
  return mitt;
}
