import * as THREE from "three";
import { v4 as uuid } from "uuid";
import { Rectangle } from "./types";

export const id = uuid();
export const DB_PREFIX = "ije-multi-tabs-experiment-db";
export const DB_KEY = `${DB_PREFIX}:${id}`;
export const NODE_LAST_SEEN_THRESHOLD = 3000;

export function doRectanglesHaveOverlap(
  firstRectangle: Rectangle,
  secondRectangle: Rectangle
) {
  return (
    firstRectangle.left < secondRectangle.right &&
    firstRectangle.right > secondRectangle.left &&
    firstRectangle.top < secondRectangle.bottom &&
    firstRectangle.bottom > secondRectangle.top
  );
}

export const getRandom = (list: any[]) => {
  const randomElement = list[Math.floor(Math.random() * list.length)];
  return randomElement;
};

export function enumerateLocalStorage() {
  for (let i = 0; i < localStorage.length; i++) {
    // set iteration key name
    const key = localStorage.key(i);

    if (!key) continue;

    // use key name to retrieve the corresponding value
    const value = localStorage.getItem(key);

    // console.log the iteration key and value
    console.log("Key: " + key + ", Value: " + value);
  }
}

export function generatePastelColor() {
  // Generating a random base color in RGB
  const baseRed = Math.floor(Math.random() * 256);
  const baseGreen = Math.floor(Math.random() * 256);
  const baseBlue = Math.floor(Math.random() * 256);

  // Mixing the base color with white to create a pastel shade
  const pastelRed = Math.floor((baseRed + 255) / 2);
  const pastelGreen = Math.floor((baseGreen + 255) / 2);
  const pastelBlue = Math.floor((baseBlue + 255) / 2);

  // Returning the pastel color in hexadecimal format
  return `#${pastelRed.toString(16).padStart(2, "0")}${pastelGreen
    .toString(16)
    .padStart(2, "0")}${pastelBlue.toString(16).padStart(2, "0")}`;
}

export function convertFromWorldSpaceToPixelSpace(
  obj: THREE.Points,
  camera: THREE.Camera,
  domElement: HTMLCanvasElement
) {
  const position = new THREE.Vector3();
  obj.updateMatrixWorld();
  position.setFromMatrixPosition(obj.matrixWorld);

  const ndc = position.project(camera);

  // The returned ndc values range from -1 to 1. We want to scale this value based on the canvas's
  // width. To do this, we should convert the range so it's from 0 to 1.
  // Divide the NDC x axis (ranging from -1 to 1) value by 2, bringing the range to -0.5 to 0.5
  // Then add 0.5, so we can arrive at the range 0 to 1
  const normalisedX = 0.5 + ndc.x / 2;
  const normalisedY = 0.5 - ndc.y / 2;

  const x = normalisedX * (domElement.width / window.devicePixelRatio);
  const y = normalisedY * (domElement.height / window.devicePixelRatio);

  return {
    x: Math.round(x),
    y: Math.round(y),
  };
}

export function calculateBoundingBoxPositionInPixelSpace(
  obj: THREE.Mesh,
  camera: THREE.Camera,
  domElement: HTMLCanvasElement
) {
  const size = new THREE.Vector3();
  const boundingBox = new THREE.Box3().setFromObject(obj);
  boundingBox.getSize(size);

  const ndc = size.project(camera);

  const normalisedX = 0.5 + ndc.x / 2;
  const normalisedY = 0.5 - ndc.y / 2;

  const x = normalisedX * (domElement.width / window.devicePixelRatio);
  const y = normalisedY * (domElement.height / window.devicePixelRatio);

  return {
    x: Math.round(x),
    y: Math.round(y),
  };
}

const COLOR_RANGE = ["#FFD1DC", "#B5EAD7", "#C7CEEA", "#FFB7B2", "#FAF1E6"];

const initialColorRange = ["#FA7070", "#A6CF98"];

export const color = generatePastelColor();

export const shape = getRandom(["box", "sphere"]);

const MODELS = [
  {
    path: "/models/dragon/red_dragon.glb",
    id: "dragon",
    color: "#ad3627",
  },
  {
    path: "/models/dolphin/scene.gltf",
    id: "dolphin",
    color: "#90accb",
  },
];

export const worldModelDetails = getRandom(MODELS);
