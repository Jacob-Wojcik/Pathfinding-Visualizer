import { dataDict } from "../types.ts";
import MinIndexedDHeap from "./minIndexDHeap.ts";

class AStar {
  private graph: dataDict;
  private priorityQueue: MinIndexedDHeap<string>;
  private endNodeID: string;

  constructor(graph: dataDict, endNodeID: string, d: number) {
    this.graph = graph;
    this.endNodeID = endNodeID;
    this.priorityQueue = new MinIndexedDHeap<string>(d);
  }

  //taxi distance

  heuristic(nodeID: string, endNodeID: string): number {
    const node1 = this.graph[nodeID];
    const node2 = this.graph[endNodeID];
    const lat1 = node1.lat;
    const lon1 = node1.lon;
    const lat2 = node2.lat;
    const lon2 = node2.lon;
    const dLat = Math.abs(lat2 - lat1);
    const dLon = Math.abs(lon2 - lon1);
    const distance = Math.sqrt(Math.pow(dLat, 2) + Math.pow(dLon, 2));
    return distance;
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  aStar(startNodeID: string): string[] | null {
    if (!startNodeID || !this.endNodeID) {
      console.log("Error: Start and/or end nodes are missing.");
      return null;
    }

    const weights: { [nodeId: string]: number } = {};
    const previousPath: { [nodeId: string]: string | null } = {};
    const fScore: { [nodeId: string]: number } = {};

    for (const nodeInGraph in this.graph) {
      weights[nodeInGraph] = nodeInGraph === startNodeID ? 0 : Infinity;
      previousPath[nodeInGraph] = null;
    }

    this.priorityQueue.enqueue(0, startNodeID);

    while (!this.priorityQueue.isEmpty()) {
      const dequeued = this.priorityQueue.dequeue();
      if (!dequeued) break;
      const [, currentNodeID] = dequeued;
      if (currentNodeID === this.endNodeID) {
        return this.reconstructPath(previousPath, this.endNodeID);
      }
      const currentNode = this.graph[currentNodeID];
      for (const adjacentNode of currentNode.adj) {
        const adjacentNodeID = adjacentNode.nodeId;
        const adjNodeTime = adjacentNode.time; // Use 'time' instead of 'distance'
        const gScore = weights[currentNodeID] + adjNodeTime;
        if (gScore < weights[adjacentNodeID]) {
          weights[adjacentNodeID] = gScore;
          previousPath[adjacentNodeID] = currentNodeID;
          fScore[adjacentNodeID] =
            gScore + this.heuristic(adjacentNodeID, this.endNodeID);
          if (this.priorityQueue.contains(currentNodeID)) {
            this.priorityQueue.updateKey(
              adjacentNodeID,
              fScore[adjacentNodeID]
            );
          } else {
            this.priorityQueue.enqueue(fScore[adjacentNodeID], adjacentNodeID);
          }
        }
      }
    }
    return null;
  }

  private reconstructPath(
    previousPath: { [label: string]: string | null },
    endNodeID: string
  ) {
    let path: string[] = [];
    let currentNodeID: string | null = endNodeID;

    while (currentNodeID !== null) {
      path.unshift(currentNodeID);
      currentNodeID =
        previousPath[currentNodeID] !== null
          ? previousPath[currentNodeID]!
          : null;
    }

    return path;
  }
}

export default async function aStar(
  city: string,
  start: string,
  end: string,
  nodeData: dataDict
) {
  const aStarObject = new AStar(nodeData, end, 2);

  return aStarObject.aStar(start);
}
