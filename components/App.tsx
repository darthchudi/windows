import { World } from "./World";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useInterval } from "@/hooks";
import {
  DB_PREFIX,
  id,
  shape,
  DB_KEY,
  worldModelDetails,
  NODE_LAST_SEEN_THRESHOLD,
} from "@/components/utils";
import { NodeGroup } from "./types";

export default function App() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [meshX, setMeshX] = useState(0);
  const [meshY, setMeshY] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [nodes, setNodes] = useState<NodeGroup>({});

  /**
   * This interval is used to update the React state with the current window
   * position if it has changed since the last interval.
   */
  useInterval(() => {
    if (x != window.screenX) {
      setX(window.screenX);
    }

    if (y != window.screenY) {
      setY(window.screenY);
    }

    if (windowWidth != window.innerWidth) {
      setWindowWidth(window.innerWidth);
    }

    if (windowHeight != window.innerHeight) {
      setWindowHeight(window.innerHeight);
    }
  }, 1);

  /**
   * Updates local storage when the window/mesh position or size changes.
   * This is used to broadcast the window's details to other open windows.
   */
  useEffect(() => {
    const windowDetails = {
      id,
      windowWidth,
      windowHeight,
      windowX: x,
      windowY: y,
      color: worldModelDetails.color,
      meshPhysicalPositionX: meshX,
      meshPhysicalPositionY: meshY,
      timestamp: Date.now(),
      shape,
      modelPath: worldModelDetails.path,
    };

    const serialisedData = JSON.stringify(windowDetails);
    localStorage.setItem(DB_KEY, serialisedData);
  }, [meshX, meshY, windowWidth, windowHeight, x, y]);

  /**
   * Listens for local storage events from other open windows
   * and updates the React state with the latest node data
   */
  useEffect(() => {
    const handleStorageUpdated = (event: StorageEvent) => {
      if (!event.key || !event.newValue) return;

      const { key, newValue } = event;

      const isAppEvent = key.startsWith(DB_PREFIX);
      if (!isAppEvent) {
        return;
      }

      const peerNodeData = JSON.parse(newValue);

      setNodes((previousNodes) => {
        const updatedNodes = {
          ...previousNodes,
          [key]: peerNodeData,
        };
        return updatedNodes;
      });
    };

    window.addEventListener("storage", handleStorageUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageUpdated);
      localStorage.removeItem(DB_KEY);
    };
  }, []);

  // Removes the node from local storage when the component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem(DB_KEY);
    };
  }, []);

  /**
   * Update local storage state for this node every 3 seconds
   * Solves the problem of the node not being removed from
   * the state when the window is closed
   */
  useInterval(() => {
    const windowDetails = {
      id,
      windowWidth,
      windowHeight,
      windowX: x,
      windowY: y,
      color: worldModelDetails.color,
      shape,
      meshPhysicalPositionX: meshX,
      meshPhysicalPositionY: meshY,
      timestamp: Date.now(),
      modelPath: worldModelDetails.path,
    };

    const serialisedData = JSON.stringify(windowDetails);
    localStorage.setItem(DB_KEY, serialisedData);
  }, NODE_LAST_SEEN_THRESHOLD);

  return (
    <div className="App">
      <Canvas
        gl={(canvas) =>
          new THREE.WebGLRenderer({ canvas, logarithmicDepthBuffer: true })
        }
        camera={{ position: [1.5, 1.5, 1.5] }}
      >
        <OrbitControls autoRotate={true} />

        <World
          windowX={x}
          windowY={y}
          windowWidth={windowWidth}
          windowHeight={windowHeight}
          nodeGroup={nodes}
          meshX={meshX}
          meshY={meshY}
          setMeshX={setMeshX}
          setMeshY={setMeshY}
        />
      </Canvas>
    </div>
  );
}
