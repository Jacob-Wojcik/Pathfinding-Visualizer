import { dataDict } from "../types.ts";
import { getCityData } from "../constants";
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

  heuristic(nodeID: string, endNodeID: string): number {
    const node1 = this.graph[nodeID];
    const node2 = this.graph[endNodeID];
    const lat1 = node1.lat;
    const lon1 = node1.lon;
    const lat2 = node2.lat;
    const lon2 = node2.lon;
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }
  
  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  aStar(startNodeID: string): string[] | null {
    if (!startNodeID || !this.endNodeID) {
      console.log("Error: Start and/or end nodes are missing.");
      return null;
    }

    const distances: { [nodeId: string]: number } = {};
    const previousPath: { [nodeId: string]: string | null } = {};
    const fScore: { [nodeId: string]: number } = {};

    for (const nodeInGraph in this.graph) {
      distances[nodeInGraph] = nodeInGraph === startNodeID ? 0 : Infinity;
      fScore[nodeInGraph] = distances[nodeInGraph] + this.heuristic(nodeInGraph, this.endNodeID);
      this.priorityQueue.enqueue(fScore[nodeInGraph], nodeInGraph);
      previousPath[nodeInGraph] = null;
    }

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
        const altTime = distances[currentNodeID] + adjNodeTime;
        if (altTime < distances[adjacentNodeID]) {
          distances[adjacentNodeID] = altTime;
          previousPath[adjacentNodeID] = currentNodeID;
          fScore[adjacentNodeID] = altTime + this.heuristic(adjacentNodeID, this.endNodeID);
          this.priorityQueue.updateKey(adjacentNodeID, fScore[adjacentNodeID]);
        }
      }
    }
    return null;
  }

  private reconstructPath(previousPath: { [label: string]: string | null }, endNodeID: string) {
    let path: string[] = [];
    let currentNodeID: string | null = endNodeID;

    while (currentNodeID !== null) {
      path.unshift(currentNodeID);
      currentNodeID = previousPath[currentNodeID] !== null ? previousPath[currentNodeID]! : null;
    }

    return path;
  }
}

export default async function aStar(city: string, start: string, end: string) {
  const nodeData = await getCityData(city, () => {}, () => {});
  const aStarObject = new AStar(nodeData, end, 2);

  return aStarObject.aStar(start);
}
