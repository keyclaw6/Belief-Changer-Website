import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { instanceRing } from '../public/orbit/instance-ring.js';

test('unchanged rigid ring uploads nothing; moved or hidden slots update exact instance matrices', () => {
  const ring = new THREE.Group(),
    geometry = new THREE.BoxGeometry(1, 2, 3),
    material = new THREE.MeshStandardMaterial();
  const slots = Array.from({ length: 2 }, (_, i) => {
    const host = new THREE.Group(),
      group = new THREE.Group(),
      mesh = new THREE.Mesh(geometry, material);
    host.position.x = i * 4;
    mesh.position.y = 2;
    group.add(mesh);
    host.add(group);
    ring.add(host);
    return { host, visible: true, featuredBook: false, closed: { group } };
  });
  const batch = instanceRing(THREE, ring, slots),
    before = { ...batch.stats };
  batch.update();
  assert.equal(batch.stats.matrixWrites, before.matrixWrites);
  assert.equal(batch.stats.bufferUploads, before.bufferUploads);
  slots[1].host.position.x = 7;
  batch.update();
  assert.equal(batch.stats.matrixWrites, before.matrixWrites + 1);
  const mesh = ring.children.find((o) => o.isInstancedMesh),
    pose = new THREE.Matrix4();
  mesh.getMatrixAt(1, pose);
  assert.deepEqual(
    new THREE.Vector3().setFromMatrixPosition(pose).toArray(),
    [7, 2, 0],
  );
  slots[1].featuredBook = true;
  batch.update();
  mesh.getMatrixAt(1, pose);
  assert.equal(pose.determinant(), 0);
  slots[1].featuredBook = false;
  batch.update();
  mesh.getMatrixAt(1, pose);
  assert.deepEqual(
    new THREE.Vector3().setFromMatrixPosition(pose).toArray(),
    [7, 2, 0],
  );
  assert.equal(slots[0].closed.group.matrixAutoUpdate, false);
});
