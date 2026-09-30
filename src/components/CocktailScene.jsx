import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import "./cocktail-scene.css";

const DRINK_DESCRIPTION =
  "Interactive 3D study of a citrus cocktail in a stemmed glass, garnished with fresh lime, mint and ice.";

function citrusTexture(kind = "lime") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const lime = kind === "lime";
  ctx.clearRect(0, 0, 512, 512);
  ctx.fillStyle = lime ? "#688134" : "#dd781e";
  ctx.beginPath();
  ctx.arc(256, 256, 254, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f0edb6";
  ctx.beginPath();
  ctx.arc(256, 256, 237, 0, Math.PI * 2);
  ctx.fill();
  const wedges = 10;
  for (let i = 0; i < wedges; i += 1) {
    const a = (i * Math.PI * 2) / wedges;
    const b = ((i + 1) * Math.PI * 2) / wedges;
    ctx.beginPath();
    ctx.moveTo(256 + Math.cos(a + 0.04) * 31, 256 + Math.sin(a + 0.04) * 31);
    ctx.arc(256, 256, 222, a + 0.024, b - 0.024);
    ctx.lineTo(256 + Math.cos(b - 0.04) * 31, 256 + Math.sin(b - 0.04) * 31);
    ctx.closePath();
    const gradient = ctx.createRadialGradient(256, 256, 15, 256, 256, 238);
    gradient.addColorStop(0, lime ? "#e9eaa1" : "#ffe496");
    gradient.addColorStop(0.6, lime ? "#c6d573" : "#fbb655");
    gradient.addColorStop(1, lime ? "#aabc54" : "#ef9a38");
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.save();
    ctx.clip();
    for (let j = 0; j < 56; j += 1) {
      const direction = a + 0.04 + ((j * 0.618) % 1) * (b - a - 0.08);
      const distance = 30 + ((j * 37.13) % 180);
      ctx.strokeStyle = j % 3 ? "rgba(255,255,218,.24)" : "rgba(117,121,24,.1)";
      ctx.lineWidth = 1 + (j % 3);
      ctx.beginPath();
      ctx.moveTo(
        256 + Math.cos(direction) * distance,
        256 + Math.sin(direction) * distance,
      );
      ctx.lineTo(
        256 + Math.cos(direction) * (distance + 21),
        256 + Math.sin(direction) * (distance + 21),
      );
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.fillStyle = "#f5efca";
  ctx.beginPath();
  ctx.arc(256, 256, 19, 0, Math.PI * 2);
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function Citrus({ kind = "lime", radius = 0.4, ...props }) {
  const texture = useMemo(() => citrusTexture(kind), [kind]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group {...props}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, 0.075, 64]} />
        <meshStandardMaterial
          color={kind === "lime" ? "#6f8538" : "#e7982e"}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0, 0, 0.039]}>
        <circleGeometry args={[radius * 0.985, 64]} />
        <meshStandardMaterial map={texture} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, -0.039]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[radius * 0.985, 64]} />
        <meshStandardMaterial map={texture} roughness={0.4} />
      </mesh>
    </group>
  );
}

function leafGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(-0.21, 0.18, -0.24, 0.48, 0, 0.72);
  shape.bezierCurveTo(0.23, 0.48, 0.2, 0.18, 0, 0);
  const geometry = new THREE.ShapeGeometry(shape, 14);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    positions.setZ(i, Math.sin(y * 3.7) * 0.1 - Math.abs(x) * 0.5);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function MintLeaf(props) {
  const geometry = useMemo(leafGeometry, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <group {...props}>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial
          color="#497444"
          side={THREE.DoubleSide}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0, 0.29, 0.075]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.005, 0.008, 0.57, 6]} />
        <meshStandardMaterial color="#8fa265" roughness={0.9} />
      </mesh>
    </group>
  );
}

const bowlPoints = [
  [0, 0.89],
  [0.18, 0.91],
  [0.34, 1.01],
  [0.5, 1.16],
  [0.66, 1.4],
  [0.755, 1.68],
  [0.79, 1.96],
  [0.78, 2.23],
  [0.742, 2.48],
  [0.724, 2.48],
  [0.756, 2.23],
  [0.766, 1.96],
  [0.729, 1.69],
  [0.632, 1.42],
  [0.479, 1.18],
  [0.318, 1.03],
  [0.165, 0.944],
  [0, 0.927],
].map(([x, y]) => new THREE.Vector2(x, y));

const liquidPoints = [
  [0, 0.97],
  [0.16, 0.973],
  [0.305, 1.06],
  [0.46, 1.205],
  [0.614, 1.44],
  [0.71, 1.7],
  [0.745, 1.96],
  [0.739, 2.185],
  [0, 2.185],
].map(([x, y]) => new THREE.Vector2(x, y));

function Cocktail({ animated }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (group.current && animated)
      group.current.rotation.y = Math.sin(clock.elapsedTime * 0.24) * 0.065;
  });
  return (
    <group ref={group} position={[0, 0.095, 0]} rotation={[0, -0.08, 0]}>
      <mesh castShadow>
        <latheGeometry args={[bowlPoints, 96]} />
        <meshPhysicalMaterial
          color="#fffdf1"
          transparent
          opacity={0.3}
          transmission={0.55}
          thickness={0.025}
          roughness={0.055}
          metalness={0}
          ior={1.5}
          envMapIntensity={1.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <latheGeometry args={[liquidPoints, 80]} />
        <meshPhysicalMaterial
          color="#d0c65e"
          transparent
          opacity={0.94}
          transmission={0.17}
          thickness={0.5}
          roughness={0.13}
          ior={1.333}
          envMapIntensity={0.9}
        />
      </mesh>
      <mesh position={[0, 2.193, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.739, 80]} />
        <meshPhysicalMaterial
          color="#e2d98c"
          roughness={0.1}
          metalness={0.04}
          transparent
          opacity={0.84}
        />
      </mesh>
      <mesh position={[0, 2.483, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.733, 0.012, 8, 96]} />
        <meshPhysicalMaterial
          color="#fffaf0"
          roughness={0.08}
          transparent
          opacity={0.65}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.47, 0]}>
        <cylinderGeometry args={[0.033, 0.052, 0.87, 24]} />
        <meshPhysicalMaterial
          color="#f7f3df"
          roughness={0.06}
          transparent
          opacity={0.7}
          transmission={0.45}
        />
      </mesh>
      <mesh position={[0, 0.034, 0]} scale={[1, 0.065, 1]} castShadow>
        <sphereGeometry args={[0.47, 48, 16]} />
        <meshPhysicalMaterial
          color="#fff9eb"
          roughness={0.06}
          transparent
          opacity={0.5}
          transmission={0.4}
        />
      </mesh>
      <mesh position={[0, 0.067, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.452, 0.012, 8, 64]} />
        <meshStandardMaterial
          color="#f6ebcc"
          transparent
          opacity={0.65}
          roughness={0.1}
        />
      </mesh>
      {[
        [-0.32, 2.24, -0.25, 0.3],
        [0.22, 2.24, -0.31, -0.25],
        [0.34, 2.27, 0.12, 0.4],
        [-0.15, 2.29, 0.23, -0.3],
        [-0.42, 2.26, 0.17, 0.3],
        [0.02, 2.36, -0.05, 0.65],
      ].map(([x, y, z, rotation], i) => (
        <RoundedBox
          key={i}
          args={[0.31, 0.3, 0.3]}
          radius={0.055}
          smoothness={3}
          position={[x, y, z]}
          rotation={[rotation * 0.6, rotation, rotation * 0.2]}
        >
          <meshPhysicalMaterial
            color="#ffffeb"
            roughness={0.14}
            transparent
            opacity={0.61}
            transmission={0.35}
            thickness={0.25}
            ior={1.31}
            envMapIntensity={1.8}
          />
        </RoundedBox>
      ))}
      <Citrus
        radius={0.38}
        position={[-0.5, 2.44, 0.18]}
        rotation={[0.13, -0.22, -0.35]}
      />
      <Citrus
        kind="orange"
        radius={0.31}
        position={[-0.24, 2.45, -0.27]}
        rotation={[-0.04, -0.32, -0.4]}
      />
      <group position={[0.29, 2.28, -0.09]} rotation={[0.05, 0.12, -0.2]}>
        <MintLeaf rotation={[-0.14, 0.55, -0.3]} scale={0.77} />
        <MintLeaf rotation={[0.09, -0.5, 0.5]} scale={0.86} />
        <MintLeaf rotation={[-0.7, 0.3, -1.08]} scale={0.64} />
      </group>
      <mesh position={[0.39, 2.59, -0.34]} rotation={[0.08, 0, -0.13]}>
        <cylinderGeometry args={[0.019, 0.019, 1.2, 14]} />
        <meshStandardMaterial color="#a66b35" roughness={0.74} />
      </mesh>
      {Array.from({ length: 23 }, (_, i) => {
        const angle = (i * 2.3999) % (Math.PI * 2);
        const y = 1.48 + ((i * 0.179) % 0.9);
        const radius = y < 1.7 ? 0.715 : 0.792 - Math.max(0, y - 2) * 0.07;
        return (
          <mesh
            key={i}
            position={[Math.sin(angle) * radius, y, Math.cos(angle) * radius]}
            scale={[1, 1.4 + (i % 3) * 0.25, 0.6]}
          >
            <sphereGeometry args={[0.012 + (i % 4) * 0.004, 8, 6]} />
            <meshPhysicalMaterial
              color="#fffbea"
              transparent
              opacity={0.65}
              roughness={0}
              metalness={0.08}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Linen() {
  const geometry = useMemo(() => {
    const fabric = new THREE.PlaneGeometry(2.45, 1.65, 28, 22);
    const positions = fabric.attributes.position;
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      positions.setZ(
        i,
        Math.sin(x * 6 + y * 2) * 0.022 + Math.sin(y * 10) * 0.012,
      );
    }
    fabric.computeVertexNormals();
    return fabric;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      geometry={geometry}
      position={[0.03, 0.027, 0.12]}
      rotation={[-Math.PI / 2, 0, -0.3]}
      receiveShadow
    >
      <meshStandardMaterial
        color="#bf704d"
        roughness={1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Set({ animated }) {
  return (
    <>
      <ambientLight intensity={0.7} color="#ffedda" />
      <directionalLight
        position={[-3, 7, 4]}
        intensity={3.3}
        color="#fff5df"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={5}
        shadow-camera-bottom={-3}
        shadow-normalBias={0.025}
        shadow-radius={5}
      />
      <directionalLight position={[4, 4, -3]} intensity={1.1} color="#e5ebc5" />
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={4}
          position={[-4, 4, 3]}
          rotation={[0, Math.PI / 4, 0]}
          scale={[3, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3}
          position={[4, 3, 2]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[1, 5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          position={[0, 6, -2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[6, 6, 1]}
          color="#ffe6be"
        />
      </Environment>
      <mesh position={[0, -0.09, 0]} receiveShadow>
        <cylinderGeometry args={[7, 7, 0.16, 80]} />
        <meshStandardMaterial color="#edcaaa" roughness={0.83} />
      </mesh>
      <Linen />
      <mesh position={[0, 0.068, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.62, 0.64, 0.065, 64]} />
        <meshStandardMaterial color="#d3a87d" roughness={0.96} />
      </mesh>
      <Cocktail animated={animated} />
      <Citrus
        radius={0.35}
        position={[0.86, 0.08, 0.39]}
        rotation={[-Math.PI / 2, 0, 0.32]}
      />
      <Citrus
        radius={0.3}
        kind="orange"
        position={[1.02, 0.14, 0.38]}
        rotation={[-1.46, 0.03, -0.5]}
      />
      <MintLeaf
        position={[-0.87, 0.06, 0.18]}
        rotation={[-Math.PI / 2, 0, -0.9]}
        scale={0.6}
      />
      <MintLeaf
        position={[-0.86, 0.065, 0.17]}
        rotation={[-Math.PI / 2, 0, 0.3]}
        scale={0.48}
      />
      <OrbitControls
        target={[0, 1.48, 0]}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-0.7}
        maxAzimuthAngle={0.8}
        rotateSpeed={0.6}
        enableDamping
        dampingFactor={0.07}
      />
    </>
  );
}

function StaticCocktail() {
  return (
    <div className="cocktail-static" role="img" aria-label={DRINK_DESCRIPTION}>
      <svg viewBox="0 0 500 540" aria-hidden="true">
        <defs>
          <linearGradient id="cocktail-liquid" x1="0" x2="1">
            <stop stopColor="#c4b65c" />
            <stop offset="0.5" stopColor="#e4d98e" />
            <stop offset="1" stopColor="#b7b45b" />
          </linearGradient>
          <linearGradient id="cocktail-glass">
            <stop stopColor="#fff" stopOpacity=".75" />
            <stop offset=".35" stopColor="#fff" stopOpacity=".05" />
            <stop offset="1" stopColor="#fff" stopOpacity=".65" />
          </linearGradient>
        </defs>
        <ellipse
          cx="270"
          cy="447"
          rx="128"
          ry="25"
          fill="#a56e43"
          opacity=".13"
        />
        <path d="m116 428 216-43 69 62-214 32z" fill="#bf704d" />
        <ellipse
          cx="250"
          cy="444"
          rx="60"
          ry="13"
          fill="#fff5dc"
          opacity=".65"
        />
        <path
          d="M246 328h8v112h-8z"
          fill="url(#cocktail-glass)"
          stroke="#fff7e8"
          strokeWidth="1"
        />
        <path
          d="M157 174c-8 68 9 138 93 157 84-19 101-89 93-157Z"
          fill="url(#cocktail-liquid)"
        />
        <ellipse cx="250" cy="175" rx="93" ry="20" fill="#e5dca3" />
        <path
          d="M153 128c-17 114 2 179 97 207 95-28 114-93 97-207Z"
          fill="url(#cocktail-glass)"
          stroke="#fff6e4"
          strokeWidth="2"
        />
        <ellipse
          cx="250"
          cy="128"
          rx="97"
          ry="20"
          fill="none"
          stroke="#fff7e5"
          strokeWidth="3"
        />
        <rect
          x="195"
          y="153"
          width="37"
          height="35"
          rx="8"
          fill="#fffdf0"
          opacity=".65"
          transform="rotate(-14 213 170)"
        />
        <rect
          x="250"
          y="149"
          width="38"
          height="35"
          rx="8"
          fill="#fffdf0"
          opacity=".65"
          transform="rotate(18 269 166)"
        />
        <path d="m288 167 25-104" stroke="#a66b35" strokeWidth="5" />
        <path
          d="M288 137q-37-49-21-68 37 14 21 68M289 138q1-51 31-57 15 32-31 57"
          fill="#557c43"
        />
        <circle cx="186" cy="129" r="40" fill="#748b37" />
        <circle cx="186" cy="129" r="34" fill="#d8df91" />
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={i}
            d="M186 129v-32"
            stroke="#f8efbf"
            strokeWidth="3"
            transform={`rotate(${i * 45} 186 129)`}
          />
        ))}
        <path
          d="M168 181q-2 80 45 112"
          fill="none"
          stroke="#fff"
          strokeOpacity=".65"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <StaticCocktail /> : this.props.children;
  }
}

export default function CocktailScene({ className = "", paused = false }) {
  const container = useRef();
  const [available, setAvailable] = useState(null);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const testCanvas = document.createElement("canvas");
    const context =
      testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
    setAvailable(Boolean(context));
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(preference.matches);
    updateMotion();
    preference.addEventListener("change", updateMotion);
    let inViewport = true;
    const updateVisibility = () =>
      setVisible(inViewport && document.visibilityState === "visible");
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting;
        updateVisibility();
      },
      { rootMargin: "80px" },
    );
    if (container.current) observer.observe(container.current);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);
  return (
    <div ref={container} className={`cocktail-scene ${className}`}>
      <SceneBoundary>
        {available ? (
          <Canvas
            shadows={{ type: THREE.PCFShadowMap }}
            camera={{ position: [3.4, 3.5, 6.7], fov: 31 }}
            dpr={[1, 1.5]}
            frameloop={
              visible && !reducedMotion && !paused ? "always" : "demand"
            }
            gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
            aria-label={DRINK_DESCRIPTION}
            role="img"
            onCreated={({ gl }) => {
              gl.setClearColor("#edcaaa", 1);
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.05;
              gl.domElement.addEventListener(
                "webglcontextlost",
                () => setAvailable(false),
                { once: true },
              );
            }}
          >
            <Suspense fallback={null}>
              <Set animated={visible && !reducedMotion && !paused} />
            </Suspense>
          </Canvas>
        ) : (
          <StaticCocktail />
        )}
      </SceneBoundary>
    </div>
  );
}
