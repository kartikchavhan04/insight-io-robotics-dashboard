import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { applyColormap } from '../utils/pcdLoaderHelper';

describe('PCD Loader Helper & Shaders', () => {
  it('applies elevation colormap to point cloud geometry', () => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      0, 0, 0,
      1, 1, 1,
      2, 2, 2,
      3, 3, 3
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ size: 1.0 });
    const points = new THREE.Points(geometry, material);

    applyColormap(points, 'elevation');

    const colorAttr = geometry.getAttribute('color');
    expect(colorAttr).toBeDefined();
    expect(colorAttr.count).toBe(4);
    expect(material.vertexColors).toBe(true);
  });

  it('applies intensity colormap when intensity attribute is present', () => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([0, 0, 0, 1, 1, 1]);
    const intensities = new Float32Array([0.2, 0.8]);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('intensity', new THREE.BufferAttribute(intensities, 1));
    const material = new THREE.PointsMaterial({ size: 1.0 });
    const points = new THREE.Points(geometry, material);

    applyColormap(points, 'intensity');

    const colorAttr = geometry.getAttribute('color');
    expect(colorAttr).toBeDefined();
    expect(colorAttr.count).toBe(2);
  });
});

