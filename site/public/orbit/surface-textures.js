/** Subtle material variation, not artwork filters. Deterministic and shared. */
export function createSurfaceTextures(THREE) {
  let seed = 9137;
  const noise = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const make = (size, sample, repeatX = 1, repeatY = 1) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const v = Math.max(0, Math.min(255, Math.round(sample(x, y))));
      image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.NoColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.anisotropy = 4;
    return texture;
  };
  const clothRoughness = make(256, (x, y) => 225 + 9 * Math.sin(x * Math.PI / 2) * Math.sin(y * Math.PI / 2) + (noise() - 0.5) * 12, 5, 7);
  const artRoughness = clothRoughness.clone();
  artRoughness.channel = 1;
  const paperHeight = make(256, () => 128 + (noise() - 0.5) * 34, 4, 6);
  const edgeHeight = make(512, (x, y) => 128 + 20 * Math.sin(y * Math.PI) + 12 * Math.cos(y * 2.7) + (noise() - 0.5) * 8);
  return { clothRoughness, artRoughness, paperHeight, edgeHeight };
}
