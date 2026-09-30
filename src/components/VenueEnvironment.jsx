import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import DiningDetails from "./DiningDetails";
import BarHost from "./BarHost";
import BarWelcome from "./BarWelcome";

const WIND_MATERIALS = new Set([
  "leaf",
  "leafLight",
  "leafDark",
  "palmWood",
  "palmWoodLight",
]);

// Geometry is already baked into world coordinates. Each vertex carries its
// plant's ground/root height, size and phase, preserving material batching.
// Use the same displacement for the visible mesh and its shadow map.
function addBreezeShader(material, uniforms) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uBreezeTime;
        uniform float uBreezeStrength;
        attribute vec4 windPlant;
        attribute vec2 windLeaf;
        vec3 gardenBreeze(vec3 point) {
          float t = uBreezeTime;
          float phase = windPlant.z;
          float reach = clamp((point.y - windPlant.x) / max(windPlant.y, 0.001), 0.0, 1.2);
          float gust = 0.76 + 0.24 * sin(t * 0.21 + phase * 0.8);
          float sway = sin(t * 0.58 + phase) * 0.7 + sin(t * 0.93 + phase * 1.9) * 0.3;
          float bend = windPlant.w * pow(reach, 1.7) * gust;
          vec3 offset = vec3(sway * bend, 0.0, sin(t * 0.48 + phase + 1.2) * bend * 0.62);
          float flutter = windLeaf.x * windLeaf.x * windPlant.w * 0.22;
          offset.x += (sin(t * 1.83 + windLeaf.y) * 0.55 + sin(t * 2.91 + windLeaf.y * 1.6) * 0.22) * flutter;
          offset.y += sin(t * 2.1 + windLeaf.y) * flutter * 0.55;
          offset.z += sin(t * 1.63 + windLeaf.y + 0.7) * flutter * 0.6;
          return offset * uBreezeStrength;
        }`,
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\ntransformed += gardenBreeze(position);",
      );
  };
  material.customProgramCacheKey = () => "tamberma-rooted-breeze-v1";
}

// A deliberately stylised architectural concept, not a measured venue model.
// Static geometry is collected into material batches so the large garden uses
// a few dozen draw calls instead of one draw call for every individual leaf.
function makeNoiseTexture(kind) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d");
  const pixels = context.createImageData(256, 256);
  let seed = 4671;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const i = (y * 256 + x) * 4;
      const grain =
        kind === "wood"
          ? Math.sin(x * 0.17 + Math.sin(y * 0.032) * 1.8) * 12 +
            Math.sin(x * 0.62 + y * 0.013) * 5
          : 0;
      const n = 232 + random() * 22 + grain;
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = n;
      pixels.data[i + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === "wood" ? 2 : 4, kind === "wood" ? 1 : 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeSignTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 2048, 512);
  ctx.fillStyle = "#f2dfbf";
  ctx.textAlign = "center";
  ctx.font = "normal 250px Georgia, serif";
  ctx.fillText("tamberma", 1024, 280);
  ctx.font = "28px Arial, sans-serif";
  ctx.fillText("R E S T A U R A N T   &   B A R", 1024, 375);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildVenue() {
  const group = new THREE.Group();
  const plaster = makeNoiseTexture("plaster");
  const woodTexture = makeNoiseTexture("wood");
  const signTexture = makeSignTexture();
  const standard = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
      ...extra,
    });
  const materials = {
    sand: standard("#cbbca2", { map: plaster }),
    paving: standard("#e9d8b9", { map: plaster }),
    limestone: standard("#eadfc7", { map: plaster }),
    clay: standard("#b66649", { map: plaster }),
    clayLight: standard("#c7845e", { map: plaster }),
    clayDark: standard("#8f4b35", { map: plaster }),
    wood: standard("#6c452c", { map: woodTexture, roughness: 0.68 }),
    woodLight: standard("#a17448", { map: woodTexture, roughness: 0.65 }),
    rattan: standard("#b88e58", { roughness: 0.85 }),
    seat: standard("#ded0a8", { map: plaster }),
    oliveSeat: standard("#667253"),
    charcoal: standard("#343c31", { roughness: 0.75 }),
    brass: standard("#a77d38", { metalness: 0.65, roughness: 0.28 }),
    leaf: standard("#4d6941", { side: THREE.DoubleSide, roughness: 0.82 }),
    leafLight: standard("#748452", { side: THREE.DoubleSide, roughness: 0.88 }),
    leafDark: standard("#2d4b34", { side: THREE.DoubleSide, roughness: 0.85 }),
    soil: standard("#4b3d2b"),
    stone: standard("#989076", { map: plaster }),
    bottleGreen: standard("#264c3b", { roughness: 0.26, metalness: 0.25 }),
    bottleAmber: standard("#a77532", { roughness: 0.28, metalness: 0.25 }),
    bottleClear: standard("#9eb3a1", { roughness: 0.22, metalness: 0.2 }),
    label: standard("#eddfbf", { roughness: 0.8 }),
    bulb: standard("#fff1bd", { emissive: "#ffd48c", emissiveIntensity: 0.8 }),
    shade: standard("#d6b67e", { side: THREE.DoubleSide }),
    sign: new THREE.MeshBasicMaterial({
      map: signTexture,
      transparent: true,
      depthWrite: false,
    }),
  };
  // Palm bark has its own batches; pergolas, tables and pots remain still.
  materials.palmWood = materials.wood.clone();
  materials.palmWoodLight = materials.woodLight.clone();
  const windUniforms = {
    uBreezeTime: { value: 0 },
    uBreezeStrength: { value: 1 },
  };
  const shadowMaterials = [];
  WIND_MATERIALS.forEach((name) =>
    addBreezeShader(materials[name], windUniforms),
  );
  const batches = new Map();
  const transform = new THREE.Object3D();
  let windPlant = null;
  const withWind = (root, height, strength, phase, build) => {
    const previous = windPlant;
    windPlant = [
      root[1],
      height,
      root[0] * 0.43 + root[2] * 0.29 + phase,
      strength,
    ];
    build();
    windPlant = previous;
  };
  const add = (
    material,
    geometry,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
  ) => {
    if (windPlant && material === "wood") material = "palmWood";
    if (windPlant && material === "woodLight") material = "palmWoodLight";
    transform.position.set(...position);
    transform.rotation.set(...rotation);
    transform.scale.set(...scale);
    transform.updateMatrix();
    geometry.applyMatrix4(transform.matrix);
    const normalized = geometry.index ? geometry.toNonIndexed() : geometry;
    if (normalized !== geometry) geometry.dispose();
    // Every batch has position, normal and UV; merge never depends on the
    // different index conventions of the primitive geometry constructors.
    if (!normalized.attributes.uv) {
      normalized.setAttribute(
        "uv",
        new THREE.BufferAttribute(
          new Float32Array(normalized.attributes.position.count * 2),
          2,
        ),
      );
    }
    if (WIND_MATERIALS.has(material)) {
      const count = normalized.attributes.position.count;
      const plants = new Float32Array(count * 4);
      const profile = windPlant || [0, 1, 0, 0];
      for (let index = 0; index < count; index++)
        plants.set(profile, index * 4);
      normalized.setAttribute(
        "windPlant",
        new THREE.BufferAttribute(plants, 4),
      );
      if (!normalized.attributes.windLeaf) {
        normalized.setAttribute(
          "windLeaf",
          new THREE.BufferAttribute(new Float32Array(count * 2), 2),
        );
      }
    }
    if (!batches.has(material)) batches.set(material, []);
    batches.get(material).push(normalized);
  };
  const box = (mat, p, s, r) => add(mat, new THREE.BoxGeometry(...s), p, r);
  const cyl = (mat, p, rt, rb, h, r = [0, 0, 0], seg = 16) =>
    add(mat, new THREE.CylinderGeometry(rt, rb, h, seg), p, r);
  const ball = (mat, p, radius, scale = [1, 1, 1]) =>
    add(mat, new THREE.SphereGeometry(radius, 12, 8), p, [0, 0, 0], scale);
  const tube = (mat, points, radius = 0.02, segments = 12) => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
    );
    add(mat, new THREE.TubeGeometry(curve, segments, radius, 5, false));
  };
  const rod = (mat, a, b, radius = 0.025) => {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const geometry = new THREE.CylinderGeometry(
      radius,
      radius,
      start.distanceTo(end),
      6,
    );
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      end.clone().sub(start).normalize(),
    );
    geometry.applyQuaternion(quaternion);
    geometry.translate(...start.add(end).multiplyScalar(0.5).toArray());
    add(mat, geometry);
  };

  // Courtyard plinth and inlaid flagstone paths. The floor stays broad enough
  // to fill the horizon without the edge of a miniature diorama entering view.
  box("sand", [0, -0.28, 0], [120, 0.25, 120]);
  box("clayDark", [0, -0.08, -0.5], [18.8, 0.22, 16.2]);
  box("paving", [0, 0.04, -0.5], [18.3, 0.1, 15.8]);
  for (let x = -8.2; x < 9; x += 1.37) {
    for (let z = -7.2; z < 7; z += 1.37) {
      box("limestone", [x, 0.101, z], [1.337, 0.018, 1.337]);
    }
  }
  box("clayLight", [0, -0.02, 7.6], [8.5, 0.18, 0.55]);
  box("paving", [0, -0.13, 8.05], [9.1, 0.15, 0.6]);
  for (const x of [-9.05, 9.05]) box("clay", [x, 0.3, -0.8], [0.3, 0.56, 15.7]);

  // Arches are true openings in an extruded plaster wall.
  const wall = new THREE.Shape();
  wall.moveTo(-9, 0);
  wall.lineTo(9, 0);
  wall.lineTo(9, 5.05);
  wall.lineTo(-9, 5.05);
  wall.closePath();
  for (const center of [-5.7, 0, 5.7]) {
    const hole = new THREE.Path();
    const radius = 1.52;
    hole.moveTo(center - radius, 0.06);
    hole.lineTo(center - radius, 2.25);
    hole.absarc(center, 2.25, radius, Math.PI, 0, true);
    hole.lineTo(center + radius, 0.06);
    hole.closePath();
    wall.holes.push(hole);
  }
  add(
    "clay",
    new THREE.ExtrudeGeometry(wall, {
      depth: 0.48,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.045,
      bevelThickness: 0.045,
      curveSegments: 30,
    }),
    [0, 0.1, -6.05],
  );
  box("clayLight", [0, 5.1, -5.8], [18.15, 0.18, 0.7]);
  box("clayDark", [0, 0.25, -6.45], [18.3, 0.5, 0.55]);
  for (const center of [-5.7, 0, 5.7]) {
    const archPoints = [
      [center - 1.67, 0.18, -5.5],
      [center - 1.67, 2.34, -5.5],
    ];
    for (let a = Math.PI; a >= 0; a -= Math.PI / 28) {
      archPoints.push([
        center + Math.cos(a) * 1.67,
        2.34 + Math.sin(a) * 1.67,
        -5.5,
      ]);
    }
    archPoints.push([center + 1.67, 0.18, -5.5]);
    tube("clayLight", archPoints, 0.055, 60);
  }
  // A darker rear colonnade gives every arch physical depth.
  box("clayDark", [0, 2.4, -8.5], [18, 4.8, 0.3]);
  box("paving", [0, 0.16, -7.2], [17.8, 0.1, 2.6]);
  for (let x = -8; x < 8; x += 0.34)
    box("wood", [x, 2.35, -8.29], [0.065, 4.1, 0.09]);
  box("wood", [0, 4.86, -7.22], [18, 0.2, 2.7]);
  add("sign", new THREE.PlaneGeometry(4.55, 1.1375), [0, 4.39, -5.49]);

  // An open timber pergola casts a moving rhythm of sunlight over the room.
  const columns = [
    [-7.7, -4.3],
    [-7.7, 2.3],
    [7.7, -4.3],
    [7.7, 2.3],
  ];
  columns.forEach(([x, z]) => {
    box("wood", [x, 2.18, z], [0.22, 4.2, 0.22]);
    box("clay", [x, 0.48, z], [0.49, 0.75, 0.49]);
    box("woodLight", [x, 4.25, z], [0.4, 0.18, 0.4]);
  });
  for (const z of [-4.3, 2.3]) box("wood", [0, 4.27, z], [16.5, 0.26, 0.24]);
  for (const x of [-7.7, 7.7]) box("wood", [x, 4.28, -1], [0.24, 0.27, 7.5]);
  for (let x = -7.8; x <= 8; x += 1.02)
    box("woodLight", [x, 4.42, -1], [0.09, 0.15, 7.9]);

  // A generous curved garden bench and woven lounge chairs.
  box("clayLight", [-6.9, 0.43, -1.5], [1.35, 0.65, 5.1]);
  box("clay", [-7.42, 0.92, -1.5], [0.32, 1.3, 5.4]);
  box("seat", [-6.78, 0.8, -1.5], [1.02, 0.15, 4.95]);
  for (const z of [-3.25, -1.6, 0.05]) {
    box("oliveSeat", [-7.05, 1.16, z], [0.26, 0.61, 0.72], [0, 0, -0.15]);
    box("clayLight", [-7.01, 1.15, z + 0.8], [0.28, 0.52, 0.59], [0, 0, -0.15]);
  }

  const table = (x, z, radius, height = 1.1) => {
    cyl(
      "woodLight",
      [x, height - 0.06, z],
      radius,
      radius,
      0.12,
      [0, 0, 0],
      64,
    );
    cyl("wood", [x, 0.56, z], 0.14, 0.28, 0.92);
    cyl("wood", [x, 0.17, z], 0.62, 0.66, 0.12, [0, 0, 0], 32);
    // Thin concentric rings make the surface feel assembled, not a primitive.
    add(
      "wood",
      new THREE.TorusGeometry(radius - 0.08, 0.009, 4, 64),
      [x, height + 0.005, z],
      [Math.PI / 2, 0, 0],
    );
  };
  const chair = (x, z, angle, color = "seat") => {
    const at = (a, b, c) => [
      x + a * Math.cos(angle) + c * Math.sin(angle),
      b,
      z - a * Math.sin(angle) + c * Math.cos(angle),
    ];
    cyl("rattan", at(0, 0.58, 0), 0.38, 0.34, 0.11, [0, 0, 0], 24);
    cyl(color, at(0, 0.66, 0), 0.35, 0.35, 0.08, [0, 0, 0], 24);
    [
      [-0.25, -0.25],
      [0.25, -0.25],
      [-0.25, 0.25],
      [0.25, 0.25],
    ].forEach(([a, c]) =>
      rod("wood", at(a * 1.23, 0.1, c * 1.2), at(a, 0.56, c), 0.027),
    );
    const curve = [];
    for (let a = -Math.PI / 2; a <= Math.PI / 2 + 0.01; a += Math.PI / 12)
      curve.push(at(Math.sin(a) * 0.41, 1.2, -Math.cos(a) * 0.4));
    tube("rattan", curve, 0.042, 22);
    for (let i = 0; i < 11; i++) {
      const a = -Math.PI / 2 + (i / 10) * Math.PI;
      rod(
        "rattan",
        at(Math.sin(a) * 0.34, 0.65, -Math.cos(a) * 0.31),
        at(Math.sin(a) * 0.41, 1.2, -Math.cos(a) * 0.4),
        0.014,
      );
    }
    for (const side of [-1, 1])
      rod(
        "rattan",
        at(side * 0.37, 0.82, 0.15),
        at(side * 0.4, 1.2, -0.03),
        0.025,
      );
  };
  // The open side of each chair is local +Z; point it at its own table.
  const chairFacingTable = (x, z, tableX, tableZ, color = "seat") =>
    chair(x, z, Math.atan2(tableX - x, tableZ - z), color);
  table(0, 0, 1.15, 1.12);
  for (const a of [0.4, 2.0, 3.65, 5.05]) {
    const x = Math.sin(a) * 1.58;
    const z = Math.cos(a) * 1.58;
    chairFacingTable(x, z, 0, 0, a === 2 ? "oliveSeat" : "seat");
  }
  [
    [-3.8, -3.5],
    [2.5, -3.7],
    [-4.15, 1.4],
  ].forEach(([x, z], index) => {
    table(x, z, 0.7, 1.02);
    chairFacingTable(x - 1, z, x, z, index % 2 ? "seat" : "oliveSeat");
    chairFacingTable(x + 1, z, x, z);
    cyl("limestone", [x, 1.04, z], 0.2, 0.19, 0.045, [0, 0, 0], 24);
    cyl("clay", [x, 1.16, z], 0.06, 0.075, 0.21);
    withWind([x, 1.2, z], 0.35, 0.014, index, () => {
      rod("leafDark", [x, 1.2, z], [x + 0.08, 1.48, z], 0.007);
      ball("leafLight", [x + 0.08, 1.45, z], 0.12, [0.35, 1, 0.5]);
    });
  });

  // The bar runs down the right-hand side, facing into the garden.
  box("clayDark", [5.65, 0.69, -2], [1.5, 1.2, 5.65]);
  box("woodLight", [4.87, 0.72, -2], [0.055, 1.19, 5.6]);
  for (let z = -4.77; z <= 0.8; z += 0.155)
    box("wood", [4.825, 0.7, z], [0.065, 1.15, 0.055]);
  box("limestone", [5.55, 1.365, -2], [1.85, 0.13, 5.95]);
  box("brass", [4.71, 1.31, -2], [0.03, 0.05, 5.95]);
  rod("brass", [4.37, 0.31, -4.6], [4.37, 0.31, 0.4], 0.03);
  for (const z of [-4, -2.7, -1.4, -0.1]) {
    cyl("woodLight", [3.99, 0.97, z], 0.28, 0.26, 0.11, [0, 0, 0], 24);
    for (const [dx, dz] of [
      [-0.16, -0.16],
      [0.16, -0.16],
      [-0.16, 0.16],
      [0.16, 0.16],
    ])
      rod(
        "charcoal",
        [3.99 + dx * 1.5, 0.1, z + dz * 1.5],
        [3.99 + dx, 0.92, z + dz],
        0.022,
      );
    add(
      "brass",
      new THREE.TorusGeometry(0.24, 0.013, 5, 20),
      [3.99, 0.43, z],
      [Math.PI / 2, 0, 0],
    );
  }
  box("clay", [8.3, 1.52, -2.75], [0.22, 2.85, 4.5]);
  for (const y of [1.15, 2.02, 2.9]) {
    box("wood", [7.94, y, -2.75], [0.7, 0.1, 4.6]);
    for (let i = 0; i < 11; i++) {
      const z = -4.7 + i * 0.38;
      const height = 0.34 + (i % 3) * 0.07;
      const mat = ["bottleGreen", "bottleAmber", "bottleClear"][i % 3];
      cyl(
        mat,
        [7.85, y + height / 2 + 0.06, z],
        0.072,
        0.077,
        height,
        [0, 0, 0],
        12,
      );
      cyl(mat, [7.85, y + height + 0.13, z], 0.03, 0.054, 0.15, [0, 0, 0], 10);
      cyl(
        "brass",
        [7.85, y + height + 0.225, z],
        0.033,
        0.033,
        0.044,
        [0, 0, 0],
        10,
      );
      box("label", [7.772, y + height / 2 + 0.07, z], [0.005, 0.11, 0.09]);
    }
  }

  // Cane pendant shades are open lattices, so their glow is visible at dusk.
  const pendants = [
    [-3.6, -2.6],
    [0, -2.6],
    [3.45, -2.6],
    [5.55, 0.8],
  ];
  pendants.forEach(([x, z], idx) => {
    const y = idx === 3 ? 3.15 : 3.38;
    rod("charcoal", [x, y + 0.1, z], [x, 4.45, z], 0.012);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const points = [
        [0.13, 0.28],
        [0.4, 0.08],
        [0.47, -0.2],
        [0.42, -0.33],
      ].map(([r, dy]) => [x + Math.cos(a) * r, y + dy, z + Math.sin(a) * r]);
      tube("rattan", points, 0.011, 7);
    }
    [
      [0.14, 0.27],
      [0.35, 0.13],
      [0.45, -0.09],
      [0.46, -0.21],
      [0.42, -0.33],
    ].forEach(([r, dy]) =>
      add(
        "rattan",
        new THREE.TorusGeometry(r, 0.011, 4, 32),
        [x, y + dy, z],
        [Math.PI / 2, 0, 0],
      ),
    );
    ball("bulb", [x, y - 0.07, z], 0.085, [1, 1.4, 1]);
  });
  // Two catenaries frame the journey; visible light is geometry, not expensive
  // individual point lights.
  for (const z of [2.8, -4.7]) {
    const points = [];
    for (let i = 0; i <= 30; i++) {
      const x = -8 + (i / 30) * 16;
      const y = 4.2 - 0.55 * Math.sin((i / 30) * Math.PI);
      points.push([x, y, z]);
    }
    tube("charcoal", points, 0.013, 40);
    for (let i = 0; i <= 16; i++) {
      const x = -8 + i;
      const y = 4.2 - 0.55 * Math.sin((i / 16) * Math.PI);
      rod("charcoal", [x, y, z], [x, y - 0.16, z], 0.008);
      cyl("brass", [x, y - 0.17, z], 0.028, 0.028, 0.045, [0, 0, 0], 8);
      ball("bulb", [x, y - 0.24, z], 0.051, [1, 1.22, 1]);
    }
  }

  const pot = (x, z, scale = 1) => {
    const h = 0.82 * scale;
    cyl(
      "clay",
      [x, h / 2 + 0.1, z],
      0.46 * scale,
      0.31 * scale,
      h,
      [0, 0, 0],
      24,
    );
    cyl(
      "clayLight",
      [x, h + 0.1, z],
      0.49 * scale,
      0.49 * scale,
      0.1 * scale,
      [0, 0, 0],
      24,
    );
    cyl(
      "soil",
      [x, h + 0.155, z],
      0.43 * scale,
      0.43 * scale,
      0.012,
      [0, 0, 0],
      24,
    );
    for (const dy of [0.23, 0.41, 0.59])
      add(
        "clayDark",
        new THREE.TorusGeometry(
          (0.31 + (dy / 0.82) * 0.15) * scale,
          0.009 * scale,
          4,
          24,
        ),
        [x, 0.1 + dy * scale, z],
        [Math.PI / 2, 0, 0],
      );
    return h + 0.1;
  };

  // A softly curved pointed leaf; local X runs from stem to tip and Z gives
  // width. Bend values add enough real depth to catch sunlight from any angle.
  const leaf = (material, base, tip, width, bend = 0.13) => {
    const a = new THREE.Vector3(...base),
      b = new THREE.Vector3(...tip);
    const direction = b.clone().sub(a);
    const side = new THREE.Vector3(-direction.z, 0.1, direction.x)
      .normalize()
      .multiplyScalar(width);
    const vertices = [],
      uvs = [],
      leafWind = [],
      indices = [];
    const sections = 7;
    for (let i = 0; i <= sections; i++) {
      const t = i / sections;
      const center = a.clone().lerp(b, t);
      center.y += Math.sin(t * Math.PI) * bend;
      const w = Math.sin(t * Math.PI) ** 0.85;
      const left = center.clone().addScaledVector(side, w);
      const right = center.clone().addScaledVector(side, -w);
      vertices.push(
        ...left.toArray(),
        center.x,
        center.y + Math.sin(t * Math.PI) * width * 0.12,
        center.z,
        ...right.toArray(),
      );
      uvs.push(0, t, 0.5, t, 1, t);
      const phase = base[0] * 1.71 + base[1] * 0.73 + base[2] * 1.13;
      leafWind.push(t, phase, t, phase, t, phase);
      if (i < sections) {
        const k = i * 3;
        indices.push(
          k,
          k + 3,
          k + 1,
          k + 1,
          k + 3,
          k + 4,
          k + 1,
          k + 4,
          k + 2,
          k + 2,
          k + 4,
          k + 5,
        );
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute(
      "windLeaf",
      new THREE.Float32BufferAttribute(leafWind, 2),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    add(material, geometry);
  };
  const banana = (x, z, scale = 1, phase = 0) => {
    const base = pot(x, z, scale * 0.85);
    withWind([x, base - 0.05, z], 1.65 * scale, 0.085 * scale, phase, () => {
      for (let i = 0; i < 9; i++) {
        const a = i * 2.399 + phase;
        const h = (1.0 + (i % 3) * 0.38) * scale;
        const reach = (0.72 + (i % 4) * 0.16) * scale;
        const stemTop = [
          x + Math.sin(a) * reach * 0.45,
          base + h,
          z + Math.cos(a) * reach * 0.45,
        ];
        rod("leafDark", [x, base - 0.05, z], stemTop, 0.017 * scale);
        leaf(
          i % 3 === 0 ? "leafLight" : "leaf",
          stemTop,
          [
            x + Math.sin(a) * reach * 1.3,
            base + h - 0.45 * scale,
            z + Math.cos(a) * reach * 1.3,
          ],
          0.23 * scale,
          0.17 * scale,
        );
      }
    });
  };
  const palm = (x, z, height, phase = 0) => {
    const top = [x + 0.28, height, z - 0.2];
    withWind([x, 0.1, z], height - 0.1, 0.24, phase, () => {
      tube(
        "woodLight",
        [
          [x, 0.1, z],
          [x - 0.12, height * 0.38, z + 0.1],
          [x + 0.05, height * 0.75, z],
          top,
        ],
        0.15,
        16,
      );
      for (let y = 0.25; y < height - 0.1; y += 0.25)
        add(
          "wood",
          new THREE.TorusGeometry(0.147, 0.016, 5, 12),
          [
            x + (y / height) * 0.28 - Math.sin((y / height) * Math.PI) * 0.12,
            y,
            z - (y / height) * 0.2,
          ],
          [Math.PI / 2, 0, 0],
        );
      for (let i = 0; i < 10; i++) {
        const angle = i * Math.PI * 0.2 + phase;
        const direction = new THREE.Vector3(
          Math.sin(angle),
          0,
          Math.cos(angle),
        );
        const tangent = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
        const length = 2.45 + (i % 3) * 0.25;
        const arch = (t) =>
          new THREE.Vector3(...top)
            .addScaledVector(direction, length * t)
            .add(
              new THREE.Vector3(0, Math.sin(t * Math.PI) * 0.63 - t * 0.5, 0),
            );
        const points = Array.from({ length: 12 }, (_, index) =>
          arch(index / 11).toArray(),
        );
        tube("leafDark", points, 0.023, 14);
        for (let j = 1; j < 12; j++) {
          const t = j / 12;
          const center = arch(t);
          const extent = Math.sin(t * Math.PI) * 0.76 + 0.07;
          for (const side of [-1, 1]) {
            const tip = center
              .clone()
              .addScaledVector(tangent, extent * side)
              .addScaledVector(direction, 0.28)
              .add(new THREE.Vector3(0, -0.15 - t * 0.13, 0));
            leaf(
              j % 4 ? "leaf" : "leafLight",
              center.toArray(),
              tip.toArray(),
              0.055 + extent * 0.025,
              0.055,
            );
          }
        }
      }
    });
  };
  [
    [-8.0, -4.5, 6.4, 0.5],
    [8.8, -6.8, 6.9, 0],
    [-9.2, 3.8, 6.3, 0.2],
    [9.1, 5.3, 6.8, 0.8],
  ].forEach((p) => palm(...p));
  [
    [-7.9, 4.0, 1.2, 1],
    [7.7, 4.3, 1.2, 0],
    [-3.7, -5.0, 0.93, 0],
    [3.7, -5, 1.04, 1],
    [-8.3, -0.5, 0.8, 0],
    [8.7, 1.7, 1.0, 0],
  ].forEach((p) => banana(...p));

  // Low border planting establishes scale and overlapping foreground depth.
  const border = (x, z, seed) => {
    cyl("clayDark", [x, 0.26, z], 0.48, 0.4, 0.35);
    withWind([x, 0.33, z], 0.75, 0.04, seed, () => {
      for (let i = 0; i < 12; i++) {
        const a = i * 2.4 + seed;
        const r = 0.35 + (i % 3) * 0.11;
        const tip = [
          x + Math.cos(a) * r,
          0.4 + (i % 4) * 0.16,
          z + Math.sin(a) * r,
        ];
        leaf(i % 2 ? "leafDark" : "leaf", [x, 0.33, z], tip, 0.095, 0.25);
      }
    });
  };
  for (const x of [-8.45, 8.45])
    for (let z = -3.6; z < 6.5; z += 1.1) border(x, z, z);
  // A few limestone boulders finish the garden without visual noise.
  [
    [-8.3, 5.8, 0.43],
    [8, 6.3, 0.3],
    [-9.9, 2.4, 0.48],
    [9.6, -1.5, 0.6],
  ].forEach(([x, z, r]) => {
    add(
      "stone",
      new THREE.IcosahedronGeometry(r, 1),
      [x, 0.16, z],
      [0.3, x, 0],
      [1.3, 0.65, 0.9],
    );
  });

  for (const [name, geometries] of batches) {
    const merged = mergeGeometries(geometries, false);
    if (!merged) throw new Error(`Cannot merge venue material ${name}`);
    merged.computeBoundingSphere();
    // Shader displacement must not disappear at the undeformed frustum edge.
    if (WIND_MATERIALS.has(name)) merged.boundingSphere.radius += 0.45;
    const mesh = new THREE.Mesh(merged, materials[name]);
    if (WIND_MATERIALS.has(name)) {
      mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
        side: materials[name].side,
      });
      mesh.customDistanceMaterial = new THREE.MeshDistanceMaterial({
        side: materials[name].side,
      });
      for (const shadowMaterial of [
        mesh.customDepthMaterial,
        mesh.customDistanceMaterial,
      ]) {
        addBreezeShader(shadowMaterial, windUniforms);
        shadowMaterials.push(shadowMaterial);
      }
    }
    mesh.castShadow = ![
      "sand",
      "paving",
      "bulb",
      "sign",
      "label",
      "soil",
    ].includes(name);
    mesh.receiveShadow = !["bulb", "sign"].includes(name);
    mesh.name = `venue-${name}`;
    group.add(mesh);
    geometries.forEach((geometry) => geometry.dispose());
  }
  const lights = [
    [0, 3.0, -2.3],
    [5.5, 2.8, -1.8],
    [-5, 2.8, -1.5],
  ].map(([x, y, z]) => {
    const light = new THREE.PointLight("#ffc17f", 2, 9, 2);
    light.position.set(x, y, z);
    group.add(light);
    return light;
  });
  return {
    group,
    lights,
    materials,
    windUniforms,
    shadowMaterials,
    textures: [plaster, woodTexture, signTexture],
  };
}

export default function VenueEnvironment({ nightRef, breeze = true }) {
  const venue = useMemo(buildVenue, []);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    venue.windUniforms.uBreezeStrength.value = breeze ? 1 : 0;
    invalidate();
  }, [breeze, invalidate, venue]);
  useFrame((_, rawDelta) => {
    if (breeze) {
      // Paused or hidden canvases resume from their previous wind phase.
      venue.windUniforms.uBreezeTime.value += Math.min(rawDelta, 0.05);
      invalidate();
    }
    const night = nightRef?.current || 0;
    venue.materials.bulb.emissiveIntensity = 0.7 + night * 2.3;
    venue.lights.forEach((light) => {
      light.intensity = 1.3 + night * 19;
    });
  });
  useEffect(
    () => () => {
      venue.group.traverse((object) => object.geometry?.dispose());
      Object.values(venue.materials).forEach((material) => material.dispose());
      venue.shadowMaterials.forEach((material) => material.dispose());
      venue.textures.forEach((texture) => texture.dispose());
    },
    [venue],
  );
  return (
    <group>
      <primitive object={venue.group} dispose={null} />
      <group position={[0, 1.13, 0]}>
        <DiningDetails />
      </group>
      <group position={[5.4, 1.435, -0.55]}>
        <DiningDetails variant="bar" />
      </group>
      <group position={[6.95, 0.1, -2.7]} rotation={[0, -0.9, 0]}>
        <BarHost animated={breeze} />
      </group>
      <BarWelcome position={[6.75, 2.75, -2.7]} />
    </group>
  );
}
