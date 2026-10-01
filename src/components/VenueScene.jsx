import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import VenueEnvironment from "./VenueEnvironment";

// Each stop belongs to the same world. The native page scroll drives the dolly.
const STOPS = [
  { position: [11, 7.2, 15], look: [-2.2, 1.6, -1], fov: 44 },
  { position: [5.5, 3.2, 8], look: [-1.8, 1.65, -1.8], fov: 48 },
  { position: [2.65, 2.65, 3.35], look: [-0.65, 1, 0], fov: 44 },
  { position: [1.3, 2.3, 2.8], look: [4.5, 1.55, -2.2], fov: 47 },
  { position: [9.5, 6.2, 12], look: [-1.2, 1.5, -1.5], fov: 45 },
];
const MOBILE_FRAMING = [
  { distance: 2.7, x: 1.1, y: -2 },
  { distance: 2.7, x: 1.1, y: -2 },
  { distance: 1.25, x: 0.35, y: -0.7 },
  { distance: 2.7, x: 1.7, y: -0.7 },
  { distance: 2.7, x: 1.1, y: -2 },
];
const DAY = new THREE.Color("#e9cfad");
const DUSK = new THREE.Color("#303b40");
const SUN = new THREE.Color("#fff0d4");
const MOON = new THREE.Color("#b6c6e1");

function CameraJourney({
  progress,
  directScroll,
  reduced,
  exploring,
  nightRef,
  onReady,
  hotspot,
  chapter,
}) {
  const { camera, scene, size, gl, invalidate } = useThree();
  const controls = useRef();
  const sun = useRef();
  const fill = useRef();
  const last = useRef(-1);
  const smooth = useRef(progress.current);
  const aim = useRef(new THREE.Vector3(...STOPS[0].look));
  const projected = useMemo(() => new THREE.Vector3(), []);
  const data = useMemo(
    () => ({
      positions: STOPS.map((s) => new THREE.Vector3(...s.position)),
      looks: STOPS.map((s) => new THREE.Vector3(...s.look)),
      position: new THREE.Vector3(),
      look: new THREE.Vector3(),
      direction: new THREE.Vector3(),
    }),
    [],
  );

  useEffect(() => {
    scene.background = DAY.clone();
    scene.fog = new THREE.Fog(DAY, 24, 65);
    const id = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(id);
  }, [scene, onReady]);

  useEffect(() => {
    if (controls.current) {
      controls.current.target.copy(aim.current);
      controls.current.target.y = Math.max(0.8, controls.current.target.y);
      controls.current.update();
    }
    invalidate();
  }, [exploring, invalidate]);

  useEffect(() => {
    let frame;
    const redraw = () => {
      cancelAnimationFrame(frame);
      if (directScroll) invalidate();
      else frame = requestAnimationFrame(invalidate);
    };
    window.addEventListener("scroll", redraw, { passive: true });
    window.addEventListener("resize", redraw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", redraw);
      window.removeEventListener("resize", redraw);
    };
  }, [directScroll, invalidate]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const target = THREE.MathUtils.clamp(progress.current, 0, 1);
    // Preserve the desktop dolly; mobile follows native touch momentum directly.
    smooth.current = reduced
      ? Math.round(target * 4) / 4
      : directScroll
        ? target
        : THREE.MathUtils.damp(smooth.current, target, 4.5, delta);
    const p = smooth.current;
    const scaled = p * 4;
    const index = Math.min(3, Math.floor(scaled));
    const part = THREE.MathUtils.smoothstep(scaled - index, 0, 1);
    const night = THREE.MathUtils.smoothstep(p, 0.58, 0.98);
    nightRef.current = night;
    if (!exploring) {
      data.position.lerpVectors(
        data.positions[index],
        data.positions[index + 1],
        part,
      );
      data.look.lerpVectors(data.looks[index], data.looks[index + 1], part);
      // Portrait composition retains the room around the table instead of cropping it.
      if (size.width < 760) {
        const from = MOBILE_FRAMING[index];
        const to = MOBILE_FRAMING[index + 1];
        data.position.addScaledVector(
          data.direction.subVectors(data.position, data.look).normalize(),
          THREE.MathUtils.lerp(from.distance, to.distance, part),
        );
        data.look.y += THREE.MathUtils.lerp(from.y, to.y, part);
        data.look.x += THREE.MathUtils.lerp(from.x, to.x, part);
      }
      const blend = reduced || directScroll ? 1 : 1 - Math.exp(-delta * 8);
      camera.position.lerp(data.position, blend);
      aim.current.lerp(data.look, blend);
      camera.lookAt(aim.current);
      camera.fov =
        THREE.MathUtils.lerp(STOPS[index].fov, STOPS[index + 1].fov, part) +
        (size.width < 760 ? 11 : 0);
      camera.updateProjectionMatrix();
    }
    scene.background.copy(DAY).lerp(DUSK, night);
    if (hotspot.current) {
      camera.updateMatrixWorld();
      projected
        .set(...(chapter === 3 ? [5.4, 1.99, -0.55] : [0.55, 1.8, -0.1]))
        .project(camera);
      hotspot.current.style.transform = `translate3d(${(projected.x * 0.5 + 0.5) * size.width}px, ${(-projected.y * 0.5 + 0.5) * size.height}px, 0) translate(-50%, -50%)`;
      hotspot.current.style.visibility =
        projected.z < 1 &&
        Math.abs(projected.x) < 0.95 &&
        Math.abs(projected.y) < 0.85
          ? "visible"
          : "hidden";
    }
    scene.environmentIntensity = THREE.MathUtils.lerp(1, 0.28, night);
    scene.fog.color.copy(scene.background);
    sun.current.intensity = THREE.MathUtils.lerp(3.4, 0.6, night);
    sun.current.color.copy(SUN).lerp(MOON, night);
    fill.current.intensity = THREE.MathUtils.lerp(2.0, 0.65, night);
    gl.toneMappingExposure = THREE.MathUtils.lerp(1.05, 1.12, night);
    // Useful state for verifying that the visible journey really moves the camera.
    if (last.current !== Math.round(p * 1000)) {
      gl.domElement.dataset.journey = p.toFixed(3);
      last.current = Math.round(p * 1000);
    }
    if (
      !exploring &&
      !reduced &&
      !directScroll &&
      (Math.abs(target - p) > 0.00005 ||
        camera.position.distanceToSquared(data.position) > 0.00001 ||
        aim.current.distanceToSquared(data.look) > 0.00001)
    )
      invalidate();
  });
  return (
    <>
      <hemisphereLight ref={fill} args={["#fae9ce", "#75684c", 2]} />
      <directionalLight
        ref={sun}
        position={[4, 13, 7]}
        intensity={3.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={13}
        shadow-camera-bottom={-13}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
      />
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={1.3}
          position={[0, 8, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[18, 18, 1]}
          color="#f4e7cf"
        />
        <Lightformer
          form="rect"
          intensity={0.7}
          position={[-10, 3, 5]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[12, 8, 1]}
          color="#bec7ac"
        />
      </Environment>
      {exploring && (
        <OrbitControls
          ref={controls}
          makeDefault
          target={aim.current}
          enablePan={false}
          enableDamping
          dampingFactor={0.07}
          minDistance={2.5}
          maxDistance={25}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI * 0.48}
        />
      )}
    </>
  );
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function VenueScene({
  progress,
  directScroll,
  reduced,
  exploring,
  paused,
  onReady,
  onFail,
  chapter,
  hotspot,
}) {
  const night = useRef(0);
  const [available] = useState(() => {
    try {
      return !!document.createElement("canvas").getContext("webgl2");
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (!available) onFail();
  }, [available, onFail]);
  if (!available) return null;
  return (
    <SceneBoundary onFail={onFail}>
      <Canvas
        className="venue-canvas"
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.5]}
        camera={{ position: STOPS[0].position, fov: 44, near: 0.08, far: 90 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
        frameloop={paused ? "never" : "demand"}
        onCreated={({ gl }) => {
          gl.domElement.setAttribute("aria-hidden", "true");
          gl.domElement.addEventListener("webglcontextlost", onFail, {
            once: true,
          });
        }}
      >
        <Suspense fallback={null}>
          <CameraJourney
            progress={progress}
            directScroll={directScroll}
            reduced={reduced}
            exploring={exploring}
            nightRef={night}
            onReady={onReady}
            hotspot={hotspot}
            chapter={chapter}
          />
          <VenueEnvironment nightRef={night} breeze={!reduced} />
        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
}
