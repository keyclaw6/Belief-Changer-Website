/** Mount-path support for isolated previews, without changing canonical app routes. */
export const deploymentBase = import.meta.env.BASE_URL.replace(/\/$/, '')
export function assetPath(path: string): string {
  return path.startsWith('/') && !path.startsWith('//') ? `${deploymentBase}${path}` : path
}
