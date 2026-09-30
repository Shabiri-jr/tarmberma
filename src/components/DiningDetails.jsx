import { useEffect, useMemo } from "react";
import * as THREE from "three";

const UP = Math.PI / 2;
const ceramic = "#f0e5cd";
const brass = "#a88650";

function surfaceTexture(type) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (type === "linen") {
    ctx.fillStyle = "#cbb993";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 256; i += 2) {
      ctx.strokeStyle = i % 4 ? "#d4c4a4" : "#b8a57e";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = "#dcab50";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 90; i++) {
      const x = ((i * 73.71) % 246) + 5;
      const y = ((i * 113.93) % 246) + 5;
      ctx.fillStyle = ["#edd285", "#cd813b", "#a94c27", "#e4ba67"][i % 4];
      ctx.beginPath();
      ctx.ellipse(x, y, 4 + (i % 10), 3 + (i % 7), i, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#a86530";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(128, 128);
      ctx.lineTo(128 + Math.cos(angle) * 128, 128 + Math.sin(angle) * 128);
      ctx.stroke();
    }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

function Plate({ radius = 0.24, ...props }) {
  const points = useMemo(
    () =>
      [
        [0, 0.01],
        [radius * 0.65, 0.01],
        [radius * 0.94, 0.027],
        [radius, 0.047],
        [radius * 0.98, 0.055],
        [radius * 0.74, 0.021],
        [0, 0.018],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [radius],
  );
  return (
    <group {...props}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[points, 40]} />
        <meshStandardMaterial color={ceramic} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0.052, 0]} rotation={[UP, 0, 0]}>
        <torusGeometry args={[radius * 0.975, 0.006, 5, 40]} />
        <meshStandardMaterial color="#9f5035" roughness={0.55} />
      </mesh>
    </group>
  );
}

function Herb({ color = "#52633c", ...props }) {
  return (
    <group {...props}>
      {[
        [-0.018, 0, -0.01, -0.5],
        [0.018, 0.005, 0, 0.8],
        [0, 0.011, 0.025, 0],
      ].map(([x, y, z, r], i) => (
        <mesh
          key={i}
          position={[x, y, z]}
          rotation={[0, r, 0]}
          scale={[0.021, 0.006, 0.044]}
          castShadow
        >
          <sphereGeometry args={[1, 8, 5]} />
          <meshStandardMaterial color={color} roughness={0.82} />
        </mesh>
      ))}
    </group>
  );
}

function Pizza({ map, ...props }) {
  return (
    <group {...props}>
      <Plate radius={0.475} />
      <mesh position={[0, 0.057, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.417, 0.421, 0.062, 48]} />
        <meshStandardMaterial color="#bd7b34" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.09, 0]} rotation={[-UP, 0, 0]} receiveShadow>
        <circleGeometry args={[0.387, 48]} />
        <meshStandardMaterial map={map} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.088, 0]} rotation={[UP, 0, 0]} castShadow>
        <torusGeometry args={[0.399, 0.039, 8, 48]} />
        <meshStandardMaterial color="#d5a35a" roughness={0.86} />
      </mesh>
      {Array.from({ length: 16 }, (_, i) => {
        const a = i * 2.39996;
        const r = 0.07 + Math.sqrt(i / 16) * 0.255;
        return (
          <group
            key={i}
            position={[Math.cos(a) * r, 0.115, Math.sin(a) * r]}
            rotation={[0, a, 0]}
          >
            <mesh scale={[0.049, 0.026, 0.035]} castShadow>
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? "#a35428" : "#c47838"}
                roughness={0.85}
              />
            </mesh>
            {i % 3 === 0 && <Herb position={[0.035, 0.008, 0]} scale={0.75} />}
            {i % 2 === 0 && (
              <mesh rotation={[UP, 0, 0]} position={[-0.028, -0.007, 0.027]}>
                <torusGeometry args={[0.021, 0.006, 5, 12, Math.PI * 1.55]} />
                <meshStandardMaterial color="#924e68" roughness={0.75} />
              </mesh>
            )}
          </group>
        );
      })}
      {Array.from({ length: 15 }, (_, i) => {
        const a = (i * Math.PI * 2) / 15;
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * 0.405, 0.112, Math.cos(a) * 0.405]}
            scale={[0.011, 0.004, 0.022]}
            rotation={[0, a, 0]}
          >
            <sphereGeometry args={[1, 6, 4]} />
            <meshStandardMaterial color="#8a542b" roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

function Cutlery({ ...props }) {
  return (
    <group {...props}>
      {[-0.045, 0.045].map((x, i) => (
        <group key={i} position={[x, 0.012, 0]}>
          <mesh position={[0, 0, 0.055]} castShadow>
            <boxGeometry args={[0.015, 0.008, 0.18]} />
            <meshStandardMaterial
              color={brass}
              metalness={0.7}
              roughness={0.27}
            />
          </mesh>
          {i === 0 ? (
            <>
              <mesh position={[0, 0, -0.05]}>
                <boxGeometry args={[0.036, 0.008, 0.046]} />
                <meshStandardMaterial
                  color={brass}
                  metalness={0.7}
                  roughness={0.27}
                />
              </mesh>
              {[-0.014, -0.005, 0.005, 0.014].map((t) => (
                <mesh key={t} position={[t, 0, -0.09]}>
                  <boxGeometry args={[0.005, 0.007, 0.044]} />
                  <meshStandardMaterial
                    color={brass}
                    metalness={0.7}
                    roughness={0.27}
                  />
                </mesh>
              ))}
            </>
          ) : (
            <mesh position={[0.006, 0, -0.056]}>
              <boxGeometry args={[0.029, 0.007, 0.125]} />
              <meshStandardMaterial
                color={brass}
                metalness={0.7}
                roughness={0.27}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function Linen({ map, ...props }) {
  return (
    <group {...props}>
      <mesh position={[0, 0.011, 0]} receiveShadow>
        <boxGeometry args={[0.19, 0.017, 0.35]} />
        <meshStandardMaterial map={map} roughness={1} />
      </mesh>
      <mesh position={[0.003, 0.025, 0.03]} rotation={[0.035, 0.03, 0]}>
        <boxGeometry args={[0.183, 0.011, 0.27]} />
        <meshStandardMaterial map={map} roughness={1} />
      </mesh>
      <mesh
        position={[0, 0.036, 0.025]}
        rotation={[UP, 0, 0]}
        scale={[1, 1, 0.34]}
      >
        <torusGeometry args={[0.102, 0.009, 6, 24]} />
        <meshStandardMaterial color="#876949" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Lime({ ...props }) {
  return (
    <group {...props}>
      <mesh rotation={[UP, 0, 0]}>
        <cylinderGeometry args={[0.048, 0.048, 0.011, 20]} />
        <meshStandardMaterial color="#6c812e" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, 0.007]}>
        <circleGeometry args={[0.039, 20]} />
        <meshStandardMaterial
          color="#c9cf74"
          roughness={0.68}
          side={THREE.DoubleSide}
        />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i * Math.PI) / 3) * 0.02,
            Math.sin((i * Math.PI) / 3) * 0.02,
            0.008,
          ]}
          rotation={[0, 0, (i * Math.PI) / 3]}
        >
          <boxGeometry args={[0.036, 0.0018, 0.001]} />
          <meshStandardMaterial color="#efebb8" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Drink({ color = "#d89c4b", cocktail = false, ...props }) {
  const points = useMemo(
    () =>
      (cocktail
        ? [
            [0, 0.015],
            [0.078, 0.015],
            [0.078, 0.021],
            [0.009, 0.027],
            [0.009, 0.15],
            [0.058, 0.17],
            [0.107, 0.3],
            [0.12, 0.36],
            [0.116, 0.36],
            [0.104, 0.3],
            [0.054, 0.177],
            [0, 0.171],
          ]
        : [
            [0, 0],
            [0.073, 0],
            [0.081, 0.28],
            [0.077, 0.28],
            [0.069, 0.015],
            [0, 0.015],
          ]
      ).map(([x, y]) => new THREE.Vector2(x, y)),
    [cocktail],
  );
  const base = cocktail ? 0.171 : 0.02;
  return (
    <group {...props}>
      <mesh receiveShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.012, 28]} />
        <meshStandardMaterial color="#ac7e4c" roughness={0.92} />
      </mesh>
      <group position={[0, 0.008, 0]}>
        <mesh>
          <latheGeometry args={[points, 32]} />
          <meshPhysicalMaterial
            color="#fff9dc"
            transparent
            opacity={0.3}
            roughness={0.09}
            metalness={0.12}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, cocktail ? 0.254 : 0.102, 0]}>
          <cylinderGeometry
            args={[
              cocktail ? 0.103 : 0.075,
              cocktail ? 0.047 : 0.069,
              cocktail ? 0.155 : 0.16,
              28,
            ]}
          />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.85}
            roughness={0.2}
            metalness={0.04}
          />
        </mesh>
        <mesh position={[0, cocktail ? 0.361 : 0.281, 0]} rotation={[UP, 0, 0]}>
          <torusGeometry args={[cocktail ? 0.119 : 0.079, 0.003, 5, 32]} />
          <meshStandardMaterial
            color="#fff7d8"
            transparent
            opacity={0.65}
            metalness={0.24}
            roughness={0.11}
          />
        </mesh>
        {[
          [-0.023, 0, -0.023],
          [0.02, 0.004, 0.012],
        ].map(([x, y, z], i) => (
          <mesh
            key={i}
            position={[x, base + 0.127 + y, z]}
            rotation={[0.25, i, 0.22]}
          >
            <boxGeometry args={[0.041, 0.039, 0.041]} />
            <meshStandardMaterial
              color="#f1e8bf"
              transparent
              opacity={0.72}
              roughness={0.08}
              metalness={0.12}
            />
          </mesh>
        ))}
        {cocktail && (
          <>
            <Lime position={[0.087, 0.355, 0]} rotation={[0.13, 0.5, -0.18]} />
            <Herb
              position={[-0.04, 0.344, -0.04]}
              rotation={[-0.3, 0.2, 0]}
              scale={1.15}
            />
          </>
        )}
      </group>
    </group>
  );
}

function Vase(props) {
  const points = useMemo(
    () =>
      [
        [0, 0],
        [0.063, 0],
        [0.077, 0.035],
        [0.072, 0.14],
        [0.034, 0.19],
        [0.034, 0.225],
        [0.028, 0.225],
        [0.028, 0.205],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  );
  return (
    <group {...props}>
      <mesh castShadow>
        <latheGeometry args={[points, 24]} />
        <meshStandardMaterial color="#b77150" roughness={0.88} />
      </mesh>
      {[-0.25, 0.05, 0.31].map((angle, i) => (
        <group
          key={i}
          position={[0, 0.19, 0]}
          rotation={[angle, i * 2, angle * 0.3]}
        >
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.0025, 0.003, 0.24, 5]} />
            <meshStandardMaterial color="#626640" />
          </mesh>
          <Herb position={[0, 0.1, 0]} rotation={[-0.7, 0, 0]} scale={0.8} />
          <group position={[0, 0.21, 0]}>
            {[0, 1, 2, 3, 4].map((p) => (
              <mesh
                key={p}
                position={[
                  Math.cos(p * 1.256) * 0.018,
                  0,
                  Math.sin(p * 1.256) * 0.018,
                ]}
                scale={[0.022, 0.008, 0.013]}
                rotation={[0, -p * 1.256, 0]}
              >
                <sphereGeometry args={[1, 7, 4]} />
                <meshStandardMaterial color="#eee2c2" roughness={0.9} />
              </mesh>
            ))}
            <mesh>
              <sphereGeometry args={[0.01, 8, 6]} />
              <meshStandardMaterial color="#ad7c32" roughness={1} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

/** Positions are relative to the tabletop or bar counter surface. */
export default function DiningDetails({ variant = "dining" }) {
  const textures = useMemo(
    () => ({ linen: surfaceTexture("linen"), pizza: surfaceTexture("pizza") }),
    [],
  );
  useEffect(
    () => () => Object.values(textures).forEach((texture) => texture.dispose()),
    [textures],
  );
  if (variant === "bar")
    return (
      <group>
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.41, 0.41, 0.036, 48]} />
          <meshStandardMaterial
            color="#8e754b"
            metalness={0.6}
            roughness={0.32}
          />
        </mesh>
        <mesh position={[0, 0.046, 0]} rotation={[UP, 0, 0]}>
          <torusGeometry args={[0.406, 0.012, 6, 48]} />
          <meshStandardMaterial
            color={brass}
            metalness={0.65}
            roughness={0.28}
          />
        </mesh>
        <Drink
          position={[-0.19, 0.043, -0.065]}
          cocktail
          color="#d6b957"
          scale={1.25}
        />
        <Drink
          position={[0.17, 0.043, 0.08]}
          cocktail
          color="#bf7046"
          scale={1.12}
        />
        <Lime
          position={[-0.1, 0.073, 0.255]}
          rotation={[-UP, 0, 0]}
          scale={1.5}
        />
        <Lime
          position={[-0.02, 0.085, 0.266]}
          rotation={[-1.1, 0, -0.3]}
          scale={1.5}
        />
        <Linen
          map={textures.linen}
          position={[0.59, 0.005, 0.05]}
          rotation={[0, -0.28, 0]}
        />
        <Herb position={[0.5, 0.055, 0.03]} scale={1.8} />
      </group>
    );
  return (
    <group>
      <Pizza position={[-0.095, 0, 0.02]} map={textures.pizza} />
      <group position={[-0.68, 0, -0.18]} rotation={[0, -0.85, 0]}>
        <Plate radius={0.2} />
        <Linen map={textures.linen} position={[0, 0.046, 0]} scale={0.9} />
        <Cutlery position={[-0.27, 0, 0]} />
      </group>
      <group position={[0.48, 0, 0.53]} rotation={[0, 0.65, 0]}>
        <Plate radius={0.21} />
        <Linen map={textures.linen} position={[0, 0.046, 0]} scale={0.9} />
        <Cutlery position={[0.25, 0, 0]} />
      </group>
      <Drink position={[-0.52, 0, -0.65]} color="#d3b15c" />
      <Drink position={[0.67, 0, 0.06]} cocktail color="#c99549" />
      <Vase position={[0.22, 0, -0.68]} />
    </group>
  );
}
