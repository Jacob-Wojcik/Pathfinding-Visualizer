import { dataDict } from "../types.ts";
import { getCityData } from "../constants";
import MinIndexedDHeap from "./minIndexDHeap.ts";

/**
 * I referenced William Fiset's implementation of Dijkstra's algorithm with a D-Heap in Java:
 * https://github.com/williamfiset/Algorithms/blob/master/src/main/java/com/williamfiset/algorithms/graphtheory/DijkstrasShortestPathAdjacencyListWithDHeap.java
 *
 * This is my interpretation of the implementation in TypeScript
 *
 */

class Dijkstras {
  private graph: dataDict;
  private priorityQueue: MinIndexedDHeap<string>;

  constructor(graph: dataDict, d: number) {
    this.graph = graph;
    this.priorityQueue = new MinIndexedDHeap<string>(d);
  }

  dijkstras(startNodeID: string, endNodeID: string): string[] | null {
    // Check if start and end nodes are provided
    if (!startNodeID || !endNodeID) {
      console.log("Error: Start and/or end nodes are missing.");
      return null;
    }

    // initialization: arrays are mutable in TypeScript
    const distances: { [nodeId: string]: number } = {}; // dist array to store the current best known distances from start node to each node
    const previousPath: { [nodeId: string]: string | null } = {}; // array that holds the nodes of the shortest distance path

    for (const nodeInGraph in this.graph) {
      // 'for...in loop' that iterates over all nodes in the graph
      if (nodeInGraph == startNodeID) console.log("Node key:", nodeInGraph); //works, all nodes are iterated over

      // set the distances in dist array. If start node, set to 0, otherwise they're all infinity.
      distances[nodeInGraph] = nodeInGraph === startNodeID ? 0 : Infinity;

      // add current node to IPQ with its initial distance
      this.priorityQueue.enqueue(distances[nodeInGraph], nodeInGraph);

      // initialize previous path to null
      previousPath[nodeInGraph] = null;
    }

    // Select node with the smallest known distance
    while (!this.priorityQueue.isEmpty()) {
      const dequeued = this.priorityQueue.dequeue();
      if (!dequeued) break;
      const [, currentNodeID] = dequeued;
      // Check if currentLabel is not null and is equal to endNodeID, this is the end of the path
      if (currentNodeID === endNodeID) {
        return this.reconstructPath(previousPath, endNodeID);
      }

      // access information about the current node and its adjacent nodes from the graph
      const currentNode = this.graph[currentNodeID];

      // iterate over the adjacent nodes of the current node
      for (const adjacentNode of currentNode.adj) {
        const adjacentNodeID = adjacentNode.nodeId; // retrieve nodeId of the current adjacent node
        const adjNodeDistance = adjacentNode.distance; // retrieve the distance associated with the current adjacent node

        // calculate total distance to reach the adjacent node
        const altDistance = distances[currentNodeID] + adjNodeDistance;

        // check if altDistance to the adjacent node is less than the current known distance to that node
        if (altDistance < distances[adjacentNodeID]) {
          distances[adjacentNodeID] = altDistance; // update the distance to the adjacent node with the new shorter distance
          previousPath[adjacentNodeID] = currentNodeID; // update the previous path to the adjacent node with the current nodeID

          // decrease the key (distance) of the adjacent node with altDistance (the new shorter distance)
          this.priorityQueue.updateKey(adjacentNodeID, altDistance);
        }
      }
    }
    return null;
  }

  private reconstructPath(
    previousPath: { [label: string]: string | null },
    endNodeID: string
  ) {
    const path: string[] = []; // hold the labels of the nodes in the shortest path
    let currentNodeID: string | null = endNodeID; // begin at the end node, will iterate up to the start node

    while (currentNodeID !== null) {
      path.unshift(currentNodeID); // add currentNodeID to the beginning of the path array, other elements are shifted back

      /*
      Breakdown of this piece of code:
      currentNodeID = previousPath[currentNodeID]   -> set the nodeID to the previous node
      previousPath[currentNodeID] !== null          -> checks that the retrieved value is not null
      ?                                             -> separates the condition from the expressions being evaluated
      previousPath[currentNodeID]!                  -> assume this value if the previous node is not null
      : null                                        -> null is assigned if the previous node is indeed null
      */
      currentNodeID =
        previousPath[currentNodeID] !== null
          ? previousPath[currentNodeID]!
          : null;
    }

    return path;
  }
}

export default async function dijkstras(
  city: string,
  start: string,
  end: string
) {
  const nodeData = await getCityData(
    city,
    () => {},
    () => {}
  );
  const dObject = new Dijkstras(nodeData, 2);

  return dObject.dijkstras(start, end);
}
