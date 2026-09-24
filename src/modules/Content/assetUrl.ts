/** Resolve a public/ path against Vite base (needed for GitHub Pages /wortland-ai/). */
export function assetUrl(path: string): string {
  const clean = path.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${clean}`;
}
