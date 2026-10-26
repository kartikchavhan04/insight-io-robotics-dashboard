import * as THREE from 'three';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';

/**
 * Color maps for Point Cloud Visualization
 */
export function applyColormap(pointsMesh, colorMode = 'elevation') {
  if (!pointsMesh || !pointsMesh.geometry) return;
  const geometry = pointsMesh.geometry;
  const position = geometry.attributes.position;
  if (!position) return;

  const count = position.count;
  let colors = geometry.attributes.color;

  if (!colors || colors.count !== count) {
    colors = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    geometry.setAttribute('color', colors);
  }

  // Calculate bounds
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox;
  const minZ = bbox ? bbox.min.z : -2;
  const maxZ = bbox ? bbox.max.z : 5;
  const rangeZ = Math.max(0.001, maxZ - minZ);

  // Check if intensity attribute exists
  const intensityAttr = geometry.attributes.intensity;

  for (let i = 0; i < count; i++) {
    const z = position.getZ(i);

    let r = 0.2, g = 0.7, b = 1.0;

    if (colorMode === 'elevation') {
      // Height map gradient: Cyan -> Green -> Yellow -> Orange/Red
      const t = Math.max(0, Math.min(1, (z - minZ) / rangeZ));
      if (t < 0.25) {
        // Deep blue to cyan
        r = 0.1;
        g = 0.2 + t * 3.2;
        b = 0.9;
      } else if (t < 0.5) {
        // Cyan to emerald green
        r = 0.1 + (t - 0.25) * 2;
        g = 0.95;
        b = 0.9 - (t - 0.25) * 3.2;
      } else if (t < 0.75) {
        // Green to yellow/orange
        r = 0.6 + (t - 0.5) * 1.5;
        g = 0.9 - (t - 0.5) * 1.2;
        b = 0.1;
      } else {
        // Orange to bright coral red
        r = 0.98;
        g = 0.4 - (t - 0.75) * 1.2;
        b = 0.2;
      }
    } else if (colorMode === 'intensity' && intensityAttr) {
      const val = Math.max(0, Math.min(1, intensityAttr.getX(i)));
      r = val;
      g = val * 0.9;
      b = val * 0.3;
    } else if (colorMode === 'industrial') {
      // Sleek industrial dark-charcoal & neon amber
      const t = Math.max(0, Math.min(1, (z - minZ) / rangeZ));
      r = 0.15 + t * 0.7;
      g = 0.18 + t * 0.4;
      b = 0.25 + t * 0.2;
    } else if (colorMode === 'cyberpunk') {
      // Neon Magenta to Cyan
      const t = Math.max(0, Math.min(1, (z - minZ) / rangeZ));
      r = 1.0 - t * 0.9;
      g = 0.1 + t * 0.8;
      b = 0.8 + t * 0.2;
    }

    colors.setXYZ(i, r, g, b);
  }

  colors.needsUpdate = true;
  if (pointsMesh.material) {
    pointsMesh.material.vertexColors = true;
    pointsMesh.material.needsUpdate = true;
  }
}

/**
 * Loads a PCD dataset from URL or File
 */
export async function loadPcdDataset(source, onProgress) {
  const loader = new PCDLoader();

  return new Promise((resolve, reject) => {
    if (typeof source === 'string') {
      loader.load(
        source,
        (points) => {
          resolve(points);
        },
        (xhr) => {
          if (onProgress && xhr.total) {
            onProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },
        (error) => {
          reject(new Error(`Failed to load PCD: ${error.message || 'Network/File error'}`));
        }
      );
    } else if (source instanceof ArrayBuffer) {
      try {
        const points = loader.parse(source);
        resolve(points);
      } catch (err) {
        reject(new Error(`Failed to parse PCD ArrayBuffer: ${err.message}`));
      }
    } else {
      reject(new Error('Unsupported source format for PCDLoader'));
    }
  });
}
