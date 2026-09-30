import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// A small, deliberately sculptural hospitality character. +Z is the front;
// feet sit on y=0 and the head reaches 2.12 world units. The bent arm and hand
// use a separate batch so a greeting does not animate the entire character.
function buildHost() {
  const materials = {
    skin: new THREE.MeshStandardMaterial({ color: "#71462f", roughness: 0.84 }),
    skinLight: new THREE.MeshStandardMaterial({
      color: "#84523b",
      roughness: 0.84,
    }),
    hair: new THREE.MeshStandardMaterial({ color: "#211c17", roughness: 0.97 }),
    shirt: new THREE.MeshStandardMaterial({
      color: "#eee3cc",
      roughness: 0.93,
    }),
    collar: new THREE.MeshStandardMaterial({
      color: "#fff1d8",
      roughness: 0.86,
    }),
    apron: new THREE.MeshStandardMaterial({
      color: "#3f5140",
      roughness: 0.96,
    }),
    seam: new THREE.MeshStandardMaterial({ color: "#7a8462", roughness: 0.94 }),
    clay: new THREE.MeshStandardMaterial({ color: "#b56b4a", roughness: 0.86 }),
    eyes: new THREE.MeshStandardMaterial({ color: "#f1dfbf", roughness: 0.57 }),
    shoes: new THREE.MeshStandardMaterial({
      color: "#49362a",
      roughness: 0.71,
    }),
    brass: new THREE.MeshStandardMaterial({
      color: "#cba875",
      metalness: 0.3,
      roughness: 0.48,
    }),
  };
  const allGeometry = [];
  const assemble = (sculpt) => {
    const batches = new Map();
    const transform = new THREE.Object3D();
    const add = (
      geometry,
      material,
      position = [0, 0, 0],
      scale = [1, 1, 1],
      quaternion,
    ) => {
      transform.position.fromArray(position);
      transform.scale.fromArray(scale);
      transform.quaternion.copy(quaternion || new THREE.Quaternion());
      transform.updateMatrix();
      const unindexed = geometry.index ? geometry.toNonIndexed() : geometry;
      if (unindexed !== geometry) geometry.dispose();
      unindexed.applyMatrix4(transform.matrix);
      if (!batches.has(material)) batches.set(material, []);
      batches.get(material).push(unindexed);
    };
    const oval = (position, scale, material = "skin") =>
      add(new THREE.SphereGeometry(1, 20, 14), material, position, scale);
    const segment = (from, to, radius, material) => {
      const start = new THREE.Vector3(...from);
      const end = new THREE.Vector3(...to);
      const axis = end.clone().sub(start);
      add(
        new THREE.CapsuleGeometry(
          radius,
          Math.max(0.001, axis.length() - radius * 2),
          5,
          12,
        ),
        material,
        start.add(end).multiplyScalar(0.5).toArray(),
        [1, 1, 1],
        new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          axis.normalize(),
        ),
      );
    };
    const line = (points, radius, material) => {
      const path = new THREE.CatmullRomCurve3(
        points.map((p) => new THREE.Vector3(...p)),
      );
      add(
        new THREE.TubeGeometry(
          path,
          Math.max(10, points.length * 4),
          radius,
          6,
          false,
        ),
        material,
      );
    };
    const patch = (points, depth, material, position) => {
      const shape = new THREE.Shape();
      points.forEach(([x, y], i) =>
        i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y),
      );
      shape.closePath();
      add(
        new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 1,
          bevelSize: 0.009,
          bevelThickness: 0.004,
        }),
        material,
        position,
      );
    };
    sculpt({ add, oval, segment, line, patch });
    const group = new THREE.Group();
    batches.forEach((parts, name) => {
      const geometry = mergeGeometries(parts, false);
      parts.forEach((part) => part.dispose());
      allGeometry.push(geometry);
      const mesh = new THREE.Mesh(geometry, materials[name]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    });
    return group;
  };

  const body = assemble(({ add, oval, segment, line, patch }) => {
    // Trousers and softly rounded leather shoes, mostly below the bar.
    segment([-0.115, 0.12, 0], [-0.12, 0.95, 0], 0.105, "apron");
    segment([0.115, 0.12, 0], [0.12, 0.95, 0], 0.105, "apron");
    oval([-0.12, 0.075, 0.064], [0.115, 0.075, 0.195], "shoes");
    oval([0.12, 0.075, 0.064], [0.115, 0.075, 0.195], "shoes");

    const profile = [
      [0, 0.87],
      [0.21, 0.89],
      [0.225, 1.08],
      [0.225, 1.3],
      [0.29, 1.51],
      [0.28, 1.58],
      [0.19, 1.655],
      [0.085, 1.68],
      [0, 1.68],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    add(new THREE.LatheGeometry(profile, 28), "shirt", [0, 0, 0], [1, 1, 0.62]);
    segment([0, 1.62, 0], [0, 1.765, 0], 0.078, "skin");

    patch(
      [
        [-0.22, 0.84],
        [-0.23, 1.17],
        [-0.19, 1.4],
        [-0.14, 1.6],
        [0.14, 1.6],
        [0.19, 1.4],
        [0.23, 1.17],
        [0.22, 0.84],
      ],
      0.012,
      "apron",
      [0, 0, 0.158],
    );
    line(
      [
        [-0.14, 1.56, 0.174],
        [-0.115, 1.66, 0.1],
        [-0.105, 1.685, -0.043],
      ],
      0.025,
      "apron",
    );
    line(
      [
        [0.14, 1.56, 0.174],
        [0.115, 1.66, 0.1],
        [0.105, 1.685, -0.043],
      ],
      0.025,
      "apron",
    );
    patch(
      [
        [-0.12, 1.16],
        [-0.11, 1.03],
        [0.11, 1.03],
        [0.12, 1.16],
      ],
      0.006,
      "seam",
      [0, 0, 0.184],
    );
    line(
      [
        [-0.19, 1.37, 0.18],
        [0, 1.355, 0.195],
        [0.19, 1.37, 0.18],
      ],
      0.009,
      "seam",
    );
    patch(
      [
        [-0.09, 1.663],
        [-0.145, 1.612],
        [-0.052, 1.574],
        [0, 1.637],
      ],
      0.009,
      "collar",
      [0, 0, 0.143],
    );
    patch(
      [
        [0.09, 1.663],
        [0.145, 1.612],
        [0.052, 1.574],
        [0, 1.637],
      ],
      0.009,
      "collar",
      [0, 0, 0.143],
    );
    patch(
      [
        [-0.036, 1.516],
        [-0.036, 1.47],
        [0.06, 1.47],
        [0.06, 1.516],
      ],
      0.004,
      "clay",
      [0.06, 0, 0.185],
    );
    oval([-0.13, 1.573, 0.185], [0.012, 0.012, 0.007], "brass");
    oval([0.13, 1.573, 0.185], [0.012, 0.012, 0.007], "brass");

    // One hand rests toward the counter; the opposite forearm is the wave.
    segment([0.245, 1.555, 0], [0.405, 1.34, 0.105], 0.089, "shirt");
    segment([0.39, 1.36, 0.1], [0.34, 1.378, 0.205], 0.082, "collar");
    segment([0.345, 1.377, 0.18], [0.24, 1.391, 0.39], 0.063, "skin");
    oval([0.22, 1.4, 0.435], [0.078, 0.039, 0.106], "skinLight");
    oval([0.155, 1.4, 0.41], [0.035, 0.032, 0.066], "skin");
    segment([-0.246, 1.555, 0], [-0.55, 1.5, 0.03], 0.088, "shirt");
    segment([-0.488, 1.51, 0.024], [-0.56, 1.513, 0.03], 0.084, "collar");

    // Sculpted face: restrained eyes and smile keep the figure warm at the
    // small scale it occupies in the architectural scene.
    oval([0, 1.862, 0], [0.183, 0.226, 0.166]);
    oval([-0.183, 1.872, -0.006], [0.038, 0.061, 0.026]);
    oval([0.183, 1.872, -0.006], [0.038, 0.061, 0.026]);
    oval([-0.189, 1.869, 0.016], [0.018, 0.036, 0.011], "skinLight");
    oval([0.189, 1.869, 0.016], [0.018, 0.036, 0.011], "skinLight");
    oval([0, 1.782, 0.103], [0.112, 0.087, 0.066]);
    oval([-0.105, 1.843, 0.12], [0.063, 0.055, 0.031], "skinLight");
    oval([0.105, 1.843, 0.12], [0.063, 0.055, 0.031], "skinLight");
    oval([0, 1.861, 0.166], [0.032, 0.05, 0.027], "skinLight");
    oval([0, 1.841, 0.184], [0.042, 0.023, 0.03], "skinLight");
    [-1, 1].forEach((side) => {
      oval([side * 0.071, 1.908, 0.147], [0.03, 0.017, 0.013], "eyes");
      oval([side * 0.067, 1.909, 0.16], [0.011, 0.013, 0.005], "hair");
      oval([side * 0.065 - 0.003, 1.913, 0.164], [0.003, 0.003, 0.001], "eyes");
      line(
        [
          [side * 0.042, 1.95, 0.145],
          [side * 0.071, 1.957, 0.145],
          [side * 0.102, 1.946, 0.132],
        ],
        0.009,
        "hair",
      );
    });
    line(
      [
        [-0.06, 1.814, 0.156],
        [-0.035, 1.798, 0.168],
        [0, 1.794, 0.174],
        [0.035, 1.798, 0.168],
        [0.06, 1.814, 0.156],
      ],
      0.009,
      "hair",
    );
    line(
      [
        [-0.04, 1.807, 0.169],
        [0, 1.802, 0.18],
        [0.04, 1.807, 0.169],
      ],
      0.005,
      "eyes",
    );

    add(
      new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.49),
      "hair",
      [0, 1.907, -0.017],
      [0.191, 0.194, 0.167],
    );
    // Low relief coils create a cropped natural hair silhouette without a
    // separate draw call for each curl.
    for (let i = 0; i < 34; i++) {
      const ring = i < 13 ? 0 : i < 26 ? 1 : 2;
      const count = ring === 2 ? 8 : 13;
      const local = ring === 2 ? i - 26 : i % 13;
      const phi = 0.39 + ring * 0.47;
      const theta = (local / count) * Math.PI * 2 + ring * 0.23;
      oval(
        [
          Math.sin(phi) * Math.cos(theta) * 0.18,
          1.913 + Math.cos(phi) * 0.185,
          -0.017 + Math.sin(phi) * Math.sin(theta) * 0.156,
        ],
        [0.034, 0.027, 0.032],
        "hair",
      );
    }
  });

  const greeting = assemble(({ oval, segment }) => {
    segment([0, 0, 0], [-0.132, 0.302, 0.022], 0.061, "skin");
    oval([-0.143, 0.351, 0.025], [0.07, 0.089, 0.032], "skinLight");
    // Four rounded fingers and a thumb, separated enough to read as an open
    // palm from both the bar camera and the garden arrival camera.
    [
      [-0.201, 0.371, -0.224, 0.464],
      [-0.165, 0.405, -0.171, 0.502],
      [-0.128, 0.413, -0.121, 0.513],
      [-0.092, 0.393, -0.071, 0.476],
    ].forEach(([x1, y1, x2, y2]) => {
      segment([x1, y1, 0.025], [x2, y2, 0.025], 0.0175, "skinLight");
    });
    segment([-0.087, 0.338, 0.025], [-0.028, 0.382, 0.043], 0.024, "skin");
  });
  return {
    body,
    greeting,
    dispose: () => {
      allGeometry.forEach((geometry) => geometry.dispose());
      Object.values(materials).forEach((material) => material.dispose());
    },
  };
}

export default function BarHost({ animated = true }) {
  const host = useMemo(buildHost, []);
  const wave = useRef();
  const elapsed = useRef(0);
  useEffect(() => () => host.dispose(), [host]);
  useFrame((_, delta) => {
    if (!wave.current) return;
    if (animated) elapsed.current += Math.min(delta, 0.05);
    const time = elapsed.current;
    // A soft, intermittent wave: a short greeting followed by a quiet pause.
    const phase = time % 9;
    const envelope = phase < 3.6 ? Math.sin((phase / 3.6) * Math.PI) ** 2 : 0;
    wave.current.rotation.z = animated
      ? Math.sin(time * 4.1) * 0.105 * envelope
      : 0;
    wave.current.rotation.y = animated
      ? Math.sin(time * 2.05) * 0.045 * envelope
      : 0;
  });
  return (
    <group name="Tamberma welcoming host" dispose={null}>
      <primitive object={host.body} />
      <group ref={wave} position={[-0.55, 1.5, 0.03]}>
        <primitive object={host.greeting} />
      </group>
    </group>
  );
}
