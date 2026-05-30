/** Match nav href against pathname (supports trailing slashes and nested routes). */
export function isNavActive(pathname: string, href: string): boolean {
  const normalize = (path: string) => {
    if (!path || path === "/") return "/";
    return path.endsWith("/") ? path.slice(0, -1) : path;
  };

  const current = normalize(pathname);
  const target = normalize(href);

  if (target === "/") return current === "/";
  return current === target || current.startsWith(`${target}/`);
}
