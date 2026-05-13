import { Suspense, memo, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ── Neural Network Particle System ──────────────────────────────────────────
const NODE_COUNT = 48;
const CONNECTION_RADIUS = 2.8;

function generateNodes(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    const r = 3.2 + Math.sin(i * 0.6) * 0.6;
    return new THREE.Vector3(
      r * Math.cos(theta) * Math.sin(phi),
      r * Math.sin(theta) * Math.sin(phi),
      r * Math.cos(phi)
    );
  });
}

function NeuralParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const nodes = useMemo(() => generateNodes(NODE_COUNT), []);

  // Build connection geometry between nearby nodes
  const lineGeometry = useMemo(() => {
    const positions: number[] = [];
    nodes.forEach((a, i) => {
      nodes.forEach((b, j) => {
        if (i >= j) return;
        if (a.distanceTo(b) < CONNECTION_RADIUS) {
          positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      });
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [nodes]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    nodes.forEach((node, i) => {
      const speed = 0.18 + (i % 5) * 0.04;
      const offset = i * 1.1;
      dummy.position.set(
        node.x + Math.sin(t * speed + offset) * 0.22,
        node.y + Math.cos(t * speed * 0.8 + offset) * 0.22,
        node.z + Math.sin(t * speed * 0.6 + offset) * 0.18
      );
      dummy.scale.setScalar(0.055 + Math.sin(t * 1.2 + i) * 0.018);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {/* Connection lines */}
      <lineSegments ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.18}
          linewidth={1}
        />
      </lineSegments>

      {/* Node spheres */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, NODE_COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#818cf8"
          emissive="#6366f1"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.4}
          transparent
          opacity={0.85}
        />
      </instancedMesh>
    </>
  );
}

// ── Central Morphing Core ────────────────────────────────────────────────────
function CoreOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.08) * 0.15;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.05, 18]} />
        <MeshDistortMaterial
          color="#6366f1"
          roughness={0.04}
          metalness={0.55}
          distort={0.32}
          speed={1.8}
          transparent
          opacity={0.82}
          envMapIntensity={1.2}
        />
      </mesh>
      {/* inner glow sphere */}
      <mesh>
        <sphereGeometry args={[0.78, 32, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={0.55}
          transparent
          opacity={0.18}
        />
      </mesh>
    </Float>
  );
}

// ── Orbit rings ──────────────────────────────────────────────────────────────
function OrbitRing({ radius, tiltX, tiltZ, speed, color }: {
  radius: number; tiltX: number; tiltZ: number; speed: number; color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, 0.008, 4, 120]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.45} />
    </mesh>
  );
}

// ── Camera drift on mouse ────────────────────────────────────────────────────
function CameraRig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 1.2, 0.028);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.7, 0.028);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ── Floating accent shapes ───────────────────────────────────────────────────
function AccentShapes() {
  return (
    <>
      <Float speed={1.2} rotationIntensity={1.1} floatIntensity={1.6}>
        <mesh position={[3.4, 2.0, -1.8]} rotation={[0.5, 0.3, 0.6]}>
          <octahedronGeometry args={[0.52, 0]} />
          <meshStandardMaterial color="#f0f4ff" emissive="#6366f1" emissiveIntensity={0.3} metalness={0.6} roughness={0.06} transparent opacity={0.7} />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={0.7} floatIntensity={1.1}>
        <mesh position={[-3.2, -1.6, -1.2]}>
          <torusKnotGeometry args={[0.3, 0.1, 100, 16]} />
          <meshStandardMaterial color="#a5b4fc" emissive="#38bdf8" emissiveIntensity={0.3} metalness={0.75} roughness={0.14} transparent opacity={0.65} />
        </mesh>
      </Float>
      <Float speed={1.0} rotationIntensity={0.5} floatIntensity={0.9}>
        <mesh position={[2.8, -2.4, -0.6]} rotation={[0.2, 1.0, 0.4]}>
          <tetrahedronGeometry args={[0.44, 0]} />
          <meshStandardMaterial color="#22d3ee" emissive="#0ea5e9" emissiveIntensity={0.35} metalness={0.5} roughness={0.1} transparent opacity={0.7} />
        </mesh>
      </Float>
    </>
  );
}

// ── Main Scene ───────────────────────────────────────────────────────────────
function SceneObjects() {
  return (
    <>
      <color attach="background" args={['#04050f']} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 6, 4]} intensity={2.0} color="#dbeafe" />
      <pointLight position={[-4, -3, 5]} intensity={1.6} color="#38bdf8" />
      <pointLight position={[3, 4, -2]} intensity={1.0} color="#818cf8" />

      <NeuralParticles />
      <CoreOrb />
      <AccentShapes />

      <OrbitRing radius={2.0} tiltX={Math.PI / 2.5} tiltZ={0.2} speed={0.22} color="#6366f1" />
      <OrbitRing radius={2.7} tiltX={Math.PI / 3.5} tiltZ={-0.35} speed={-0.14} color="#38bdf8" />
      <OrbitRing radius={3.4} tiltX={0.4} tiltZ={0.5} speed={0.09} color="#a5b4fc" />

      <Stars radius={60} depth={28} count={500} factor={3.5} saturation={0} fade speed={0.25} />
      <CameraRig />
    </>
  );
}

function CinematicSceneBase() {
  return (
    <div className="h-full w-full" style={{ background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SceneObjects />
        </Suspense>
      </Canvas>
    </div>
  );
}

export const CinematicScene = memo(CinematicSceneBase);
export default CinematicScene;
