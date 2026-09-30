import { useEffect, useMemo } from "react";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";

function greetingTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 448;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.shadowColor = "#1f2c2645";
  context.shadowBlur = 20;
  context.shadowOffsetY = 10;
  context.fillStyle = "#fbf0db";
  context.beginPath();
  context.roundRect(24, 20, 976, 344, 40);
  context.fill();
  context.shadowBlur = 0;
  context.shadowOffsetY = 0;
  context.beginPath();
  context.moveTo(458, 357);
  context.lineTo(512, 425);
  context.lineTo(564, 357);
  context.closePath();
  context.fill();
  context.textAlign = "center";
  context.fillStyle = "#8c603f";
  context.font = "500 44px Arial, sans-serif";
  context.fillText("W E L C O M E  T O", 512, 113);
  context.fillStyle = "#314839";
  context.font = "normal 132px Georgia, serif";
  context.fillText("Tamberma", 512, 269);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export default function BarWelcome(props) {
  const texture = useMemo(greetingTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <Billboard {...props} follow>
      <mesh name="bar-welcome-greeting" renderOrder={2}>
        <planeGeometry args={[1.9, 0.83125]} />
        <meshBasicMaterial
          map={texture}
          transparent
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Billboard>
  );
}
