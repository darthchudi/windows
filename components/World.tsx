import { useEffect, useRef, createRef, RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { useInterval } from "@/hooks";
import {
  doRectanglesHaveOverlap,
  NODE_LAST_SEEN_THRESHOLD,
  worldModelDetails,
  convertFromWorldSpaceToPixelSpace,
} from "@/components/utils";
import * as THREE from "three";
import { ParticleModel } from "./ParticleModel";
import { NodeGroup } from "./types";

type Props = {
  windowX: number;
  windowY: number;
  windowWidth: number;
  windowHeight: number;
  nodeGroup: NodeGroup;
  meshX: number;
  meshY: number;
  setMeshX: (x: number) => void;
  setMeshY: (y: number) => void;
};

export const World = (props: Props) => {
  const {
    windowX,
    windowY,
    windowWidth,
    windowHeight,
    nodeGroup,
    meshX,
    meshY,
    setMeshX,
    setMeshY,
  } = props;
  const { camera, gl } = useThree();
  const ref = useRef<THREE.Points>(null);
  const peerNodeRefs = useRef<RefObject<THREE.Points>[]>([]);
  const nodes = Object.values(nodeGroup);

  const windowRectangle = {
    left: windowX,
    right: windowX + windowWidth,
    top: windowY,
    bottom: windowY + windowHeight,
  };

  const overlappingNodes = nodes.filter((node) => {
    if (node == null) return false;

    // Ignore this node if the last timestamp was more than 3 seconds ago
    // as it could be from a closed node window
    const lastSeen = Date.now() - node.timestamp;
    if (lastSeen > NODE_LAST_SEEN_THRESHOLD) {
      return false;
    }

    const peerRectangle = {
      left: node.windowX,
      right: node.windowX + node.windowWidth,
      top: node.windowY,
      bottom: node.windowY + node.windowHeight,
    };

    const hasOverlap = doRectanglesHaveOverlap(windowRectangle, peerRectangle);
    return hasOverlap;
  });

  const overlappingNodesHash = overlappingNodes
    .map((node) => node.id)
    .join(",");

  const numOverlappingNodes = overlappingNodes.length;

  // Create a ref for each peer node
  useEffect(() => {
    peerNodeRefs.current = Array.from({ length: numOverlappingNodes }).map(
      () => {
        return createRef<THREE.Points>();
      }
    );
  }, [overlappingNodesHash, numOverlappingNodes]);

  const meshPhysicalPosition = {
    x: meshX,
    y: meshY,
  };

  if (ref.current) {
    const meshPixelPositionInCanvas = convertFromWorldSpaceToPixelSpace(
      ref.current,
      camera,
      gl.domElement
    );

    // The mesh's physical position on the screen is relative to the canvas,
    // so we need to add the window's position as an offset
    meshPhysicalPosition.x = windowX + meshPixelPositionInCanvas.x;
    meshPhysicalPosition.y = windowY + meshPixelPositionInCanvas.y;
  }

  /**
   * Sets the mesh's physical position in React state if its changed
   */
  useEffect(() => {
    setMeshX(meshPhysicalPosition.x);
    setMeshY(meshPhysicalPosition.y);
  }, [meshPhysicalPosition.x, meshPhysicalPosition.y, setMeshX, setMeshY]);

  useEffect(() => {
    if (!gl) return;

    gl.setClearColor(new THREE.Color("white"));
  }, [gl]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      <ParticleModel
        ref={ref}
        count={1000}
        isOverlapping={overlappingNodes.length > 0}
        modelPath={worldModelDetails.path}
        color={worldModelDetails.color}
      />

      {overlappingNodes.map((peerNode, index) => {
        const isToLeft = peerNode.windowX <= windowX;
        const isToTop = peerNode.windowY <= windowY;

        const basePeerMeshX = 0.5 * (index + 1);
        const basePeerMeshY = 0.5 * (index + 1);

        const peerMeshX = isToLeft ? -basePeerMeshX * 2 : basePeerMeshX * 2;
        const peerMeshY = isToTop ? -basePeerMeshY * 1.5 : basePeerMeshY * 1.5;

        const peerNodeRef = peerNodeRefs.current[index];

        return (
          <ParticleModel
            ref={peerNodeRef}
            key={index}
            count={1000}
            shape={peerNode.shape}
            color={peerNode.color}
            modelPath={peerNode.modelPath}
            position={[peerMeshX, 0, -0.5]}
            isOverlapping
            isPeerNode
          />
        );
      })}
    </>
  );
};
