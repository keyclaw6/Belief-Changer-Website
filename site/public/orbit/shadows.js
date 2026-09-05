/** Stable analytic penumbrae: no frozen shadow map, no per-frame render target. */
export function createBookShadows(THREE, scene, ring, count) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(35,29,22,.43)');
  gradient.addColorStop(.35, 'rgba(35,29,22,.22)');
  gradient.addColorStop(.7, 'rgba(35,29,22,.065)');
  gradient.addColorStop(1, 'rgba(35,29,22,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
  const material = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false, toneMapped: false, opacity: .7 });
  const geometry = new THREE.PlaneGeometry(1, 1); geometry.rotateX(-Math.PI / 2);
  const footprints = new THREE.InstancedMesh(geometry, material, count);
  footprints.frustumCulled = false; footprints.renderOrder = -1;
  footprints.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  ring.add(footprints);
  const detail = new THREE.Mesh(geometry, material.clone());
  detail.visible = false; detail.renderOrder = -1; scene.add(detail);
  const pose = new THREE.Object3D();
  return {
    updateSlot(index, x, z, yaw, lift, visible = true) {
      pose.position.set(x + 1.8, -11.26, z - 1.5);
      pose.rotation.y = yaw;
      // Elevated objects cast a wider, softer shadow, never a stamped black oval.
      pose.scale.set(visible ? 28 + lift * 1.3 : 0, 1, visible ? 18 + lift * .8 : 0);
      pose.updateMatrix(); footprints.setMatrixAt(index, pose.matrix);
      footprints.instanceMatrix.needsUpdate = true;
    },
    updateDetail(position, cover, visible, dark) {
      detail.visible = visible && !dark;
      if (!visible) return;
      detail.position.set(position.x - cover * 8 + 3, -7, position.z - 5);
      detail.scale.set(52 + cover * 24, 1, 29);
      detail.material.opacity = .52;
    },
    setDark(dark) { footprints.visible = !dark; },
    dispose() { geometry.dispose(); material.map.dispose(); material.dispose(); detail.material.dispose(); }
  };
}
