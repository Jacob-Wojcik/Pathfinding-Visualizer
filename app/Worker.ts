import getStatistics from "./algorithms/statistics";
import { getCityData } from "./constants";

import { nodeInfo, pair, LeafletLatLng } from "./types";

import Timer from "timer-machine";

const ctx: Worker = self as any;

ctx.addEventListener("message", async (event) => {
  console.log("worker received a new message!");
  const { city, algorithm, startNode, endNode } = JSON.parse(event.data);
  const result = await findPath(
    city,
    algorithm,
    startNode,
    endNode
  );
  if(result){
    const [path, pathCoordinates, executionTime, distanceInMiles] = result;
    
    ctx.postMessage(
      JSON.stringify({
        type: "setPath",
        path: path,
        pathCoordinates: pathCoordinates,
        executionTime: executionTime,
        distanceInMiles: distanceInMiles
      })
    );

    console.log(path);
    console.log(pathCoordinates );
    console.log( executionTime);
    
  }

  
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
    const timer = new Timer();
    timer.start();
    const path = await pathfindingFunction(city, startNode, endNode, nodeData);
    timer.stop();
    const executionTime = timer.time();

   // if (!path) return;
    const distanceInMiles = getStatistics(nodeData, path);
    // create an array of latlng points for the animated polyline to draw the path
    let pathCoordinates: Array<LeafletLatLng> = [];
    for (const nodeId of path) {
      const node: nodeInfo = nodeData[nodeId];
      pathCoordinates.push({ lat: node.lat, lng: node.lon });
    }
    return [path, pathCoordinates, executionTime, distanceInMiles];
  }
};

export default ctx;
