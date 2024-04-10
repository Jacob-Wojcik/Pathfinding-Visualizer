import { getCityData } from "./constants";

import { nodeInfo, pair, LeafletLatLng } from "./types";

const ctx: Worker = self as any;

ctx.addEventListener("message", async (event) => {
  console.log("worker received a new message!");
  const { city, algorithm, startNode, endNode } = JSON.parse(event.data);
  const path = await findPath(city, algorithm, startNode, endNode);
  ctx.postMessage(JSON.stringify({ type: "setPath", path: path }));
});

const findPath = async (
  city: string,
  algorithm: string,
  startNode: string,
  endNode: string
) => {
  const nodeData = await getCityData(
    city,
    () => {},
    () => {}
  );

  const pathfindingModule = await import(`./algorithms/${algorithm}`);
  const pathfindingFunction = pathfindingModule.default;

  if (startNode && endNode) {
    const computedPath = await pathfindingFunction(
      city,
      startNode,
      endNode,
      nodeData
    );

    if (!computedPath) return;

    // create an array of latlng points for the animated polyline to draw the path
    let path: Array<LeafletLatLng> = [];
    for (const nodeId of computedPath) {
      const node: nodeInfo = nodeData[nodeId];
      path.push({ lat: node.lat, lng: node.lon });
    }
    return path;
  }
};

export default ctx;
