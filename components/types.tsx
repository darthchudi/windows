export type NodeDetails = {
  id: string;
  windowWidth: number;
  windowHeight: number;
  windowX: number;
  windowY: number;
  color: string;
  physicalPositionX: number;
  physicalPositionY: number;
  timestamp: number;
  shape: string;
  modelPath: string;
};

export type NodeGroup = {
  [key: string]: NodeDetails;
};

export type Rectangle = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};
