export const Loading = {
  resolve: null as (() => void) | null,
  next: null as null | Promise<void>,

  async set(list: Promise<any>[]) {
    try {
      await Promise.all(list);
    } catch (error) {
      console.error('[Loading] Error:', error);
    }

    if (this.resolve) {
      this.resolve();
    }
  },

  async wait() {
    if (this.next) {
      return this.next;
    }
  },

  close() {
    const el = document.querySelector('#Loading');

    if (el) {
      setTimeout(() => {
        el.className += ' is-hide';
      }, 0);
    }
  },
};

Loading.next = new Promise<void>((resolve) => {
  Loading.resolve = resolve;
});
