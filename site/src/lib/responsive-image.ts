import { assetPath } from './deployment'
import manifest from './image-manifest.json'

type Entry = { width: number; height: number; variants: Array<{ src: string; width: number; bytes: number }> }
export function responsiveImage(src: string): { srcSet?: string; width?: number; height?: number } {
  const image = (manifest as Record<string, Entry>)[src]
  if (!image) return {}
  return {
    srcSet: image.variants.map(v => `${assetPath(v.src)} ${v.width}w`).join(', '),
    width: image.width,
    height: image.height,
  }
}
