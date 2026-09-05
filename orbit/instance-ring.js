/** Batch rigid shelf geometry without changing the book factory or its picking proxies.
 * Only opaque, static meshes are instanced. SDF cover and spine print stay live.
 * Stored mesh-to-slot matrices are invariant; each frame updates only slot poses.
 */
export function instanceRing(THREE, ring, slots) {
  ring.updateMatrixWorld(true);
  const batches = new Map();
  const materialKey = m => JSON.stringify({
    type: m.type, color: m.color?.getHex(), roughness: m.roughness, metalness: m.metalness,
    map: m.map?.uuid, normal: m.normalMap?.uuid, normalScale: m.normalScale?.toArray(),
    roughnessMap: m.roughnessMap?.uuid, bumpMap: m.bumpMap?.uuid, bumpScale: m.bumpScale,
    side: m.side, env: m.envMapIntensity, clearcoat: m.clearcoat, sheen: m.sheen,
    polygonOffset: m.polygonOffset, polygonOffsetFactor: m.polygonOffsetFactor,
  });
  for (const slot of slots) {
    const inverseSlot = slot.host.matrixWorld.clone().invert();
    slot.closed.group.traverse(mesh => {
      if (!mesh.isMesh || !mesh.visible || mesh.userData.isSDFText || mesh.isTroikaText) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      if (materials.some(m => m.transparent)) return;
      const g = mesh.geometry;
      const geoKey = g.parameters ? `${g.type}:${JSON.stringify(g.parameters)}` : g.uuid;
      const key = `${geoKey}|${materials.map(materialKey).join('|')}`;
      if (!batches.has(key)) batches.set(key, { geometry: g, material: mesh.material, instances: [] });
      batches.get(key).instances.push({ slot, local: inverseSlot.clone().multiply(mesh.matrixWorld) });
      // Raycaster still uses these meshes explicitly; visibility only excludes rasterization.
      mesh.visible = false;
    });
  }
  const pose = new THREE.Matrix4(), hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  for (const batch of batches.values()) {
    batch.mesh = new THREE.InstancedMesh(batch.geometry, batch.material, batch.instances.length);
    batch.mesh.frustumCulled = false;
    batch.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    ring.add(batch.mesh);
  }
  function update() {
    for (const batch of batches.values()) {
      batch.instances.forEach(({ slot, local }, index) => {
        slot.host.updateMatrix();
        batch.mesh.setMatrixAt(index, slot.visible ? pose.multiplyMatrices(slot.host.matrix, local) : hidden);
      });
      batch.mesh.instanceMatrix.needsUpdate = true;
    }
  }
  update();
  return { update, count: batches.size };
}
