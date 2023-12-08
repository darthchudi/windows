import { useMemo, RefObject, forwardRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useFrame, useLoader } from "@react-three/fiber";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { getRandom } from "./utils";

type Props = {
  count: number;
  shape: string;
  color?: string;
  isOverlapping: boolean;
  position?: [number, number, number];
  isPeerNode?: boolean;
};

const modelPath = getRandom([
  "/models/love/love.gltf",
  "/models/dragon/red_dragon.glb",
  "/models/eva/scene.gltf",
]);

const BaseComponent = (props: Props, ref: RefObject<THREE.Points>) => {
  const { count, shape, color, isOverlapping, position, isPeerNode } = props;

  const gltf = useLoader(GLTFLoader, modelPath);

  const modelVertices = useMemo(() => {
    // The gltf object contains a number of nodes, some of which are meshes
    // We want to filter for the meshes and get their geometries
    // so we can merge them into one geometry, which we can then sample
    const nodes = Object.values(gltf.nodes);
    const geometries = nodes.reduce<THREE.BufferGeometry[]>(
      (accumulator, currentValue) => {
        const isEmptyObject = !!currentValue;
        if (!isEmptyObject) return accumulator;

        // @ts-ignore
        const isNonMeshObject = !currentValue.isMesh;
        if (isNonMeshObject) return accumulator;

        // @ts-ignore
        return [...accumulator, currentValue.geometry];
      },
      []
    );

    if (geometries.length === 0) {
      console.log("DEBUG: No geometries found in model");
      return [];
    }

    const mergedGeometries = BufferGeometryUtils.mergeGeometries(geometries);
    const mergedMesh = new THREE.Mesh(
      mergedGeometries,
      new THREE.MeshBasicMaterial({
        wireframe: true,
        color: new THREE.Color("red"),
      })
    );

    const sampler = new MeshSurfaceSampler(mergedMesh).build();
    const sampleCount = 4000;
    const sampleVector = new THREE.Vector3();
    const vertices = new Float32Array(sampleCount * 3);

    for (let i = 0; i < sampleCount; i++) {
      sampler.sample(sampleVector);
      vertices.set([sampleVector.x, sampleVector.y, sampleVector.z], i * 3);
    }

    return vertices;
  }, [gltf]);

  // Generate vertices for a shape (box or sphere)
  const shapeVertices = useMemo(() => {
    const positions = new Float32Array(count * 3);

    if (shape === "box") {
      for (let i = 0; i < count; i++) {
        let x = (Math.random() - 0.5) * 2;
        let y = (Math.random() - 0.5) * 2;
        let z = (Math.random() - 0.5) * 2;

        positions.set([x, y, z], i * 3);
      }
    }

    if (shape === "sphere") {
      const distance = 1;

      for (let i = 0; i < count; i++) {
        const theta = THREE.MathUtils.randFloatSpread(360);
        const phi = THREE.MathUtils.randFloatSpread(360);

        let x = distance * Math.sin(theta) * Math.cos(phi);
        let y = distance * Math.sin(theta) * Math.sin(phi);
        let z = distance * Math.cos(theta);

        positions.set([x, y, z], i * 3);
      }
    }

    return positions;
  }, [count, shape]);

  useFrame((state) => {
    const { clock } = state;

    if (!ref || !ref.current) return;

    if (!isOverlapping) return;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      ref.current.geometry.attributes.position.array[i3] +=
        Math.sin(clock.elapsedTime + Math.random() * 10) * 0.01;
      ref.current.geometry.attributes.position.array[i3 + 1] +=
        Math.cos(clock.elapsedTime + Math.random() * 10) * 0.01;
      ref.current.geometry.attributes.position.array[i3 + 2] +=
        Math.sin(clock.elapsedTime + Math.random() * 10) * 0.01;
    }

    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={position || [0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={modelVertices.length / 3}
          array={modelVertices as THREE.TypedArray}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color={color || "#5786F5"}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

// @ts-ignore
export const GeometryParticles = forwardRef(BaseComponent);
