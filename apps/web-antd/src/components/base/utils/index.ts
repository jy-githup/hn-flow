export function revisePath(path: string) {
  if (!path) {
    return '';
  }

  return path[0] === '/' ? path : `/${path}`;
}

export function createLink(url: string, id?: string) {
  const link = document.createElement('link');
  link.href = url;
  link.type = 'text/css';
  link.rel = 'stylesheet';
  if (id) {
    link.id = id;
  }

  setTimeout(() => {
    document.querySelectorAll('head').item(0)?.append(link);
  }, 0);
}
