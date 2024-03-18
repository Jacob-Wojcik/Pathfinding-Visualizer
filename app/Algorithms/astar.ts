import { getCityData } from "../constants";

class Node {
  public f: number = 0;
  public g: number = 0;
  public h: number = 0;
  public visited: boolean = false;
  public closed: boolean = false;
  public parent: Node | null = null;
  public neighbors: string[];

  constructor(public ref: string, neighbors: string[]) {
    this.neighbors = neighbors;
  }
}

interface NodeData {
  [key: string]: { lat: number; lon: number; adj: string[] };
}

const calculateHeuristic = (nodeA: { lat: number; lon: number; }, nodeB: { lat: number; lon: number; }): number => {
  const d1 = Math.abs(nodeB.lat - nodeA.lat);
  const d2 = Math.abs(nodeB.lon - nodeA.lon);
  return Math.sqrt(d1 ** 2 + d2 ** 2);
};

const reconstructPath = (currentNode: Node | null): string[] => {
  let path: string[] = [];
  while (currentNode) { // Ensures null is handled, avoiding undefined
    path.unshift(currentNode.ref);
    currentNode = currentNode.parent;
  }
  return path;
};

const astar = async (city: string, start: string, end: string): Promise<string[]> => {
  const nodeData: NodeData = await getCityData(city, () => {}, () => {});

  let openSet: Node[] = [];
  let closedSet: Set<string> = new Set();
  let nodes: { [key: string]: Node } = {};

  Object.keys(nodeData).forEach((key) => {
    nodes[key] = new Node(key, nodeData[key].adj);
  });

  if (!(start in nodes) || !(end in nodes)) {
    throw new Error("Start or end node not found in graph.");
  }

  nodes[start].g = 0;
  nodes[start].h = calculateHeuristic(nodeData[start], nodeData[end]);
  nodes[start].f = nodes[start].h;
  openSet.push(nodes[start]);

  while (openSet.length > 0) {
    let currentNode = openSet.shift();

    // Explicit check for undefined to satisfy TypeScript
    if (currentNode === undefined) break;

    if (currentNode.ref === end) {
      return reconstructPath(currentNode);
    }

    closedSet.add(currentNode.ref);

    currentNode.neighbors.forEach((neighbor) => {
      if (closedSet.has(neighbor)) return;
      
      let tentativeGScore = currentNode.g + calculateHeuristic(nodeData[currentNode.ref], nodeData[neighbor]);
      let neighborNode = nodes[neighbor];

      // Check if neighborNode exists in the openSet
      let isInOpenSet = openSet.find(n => n.ref === neighbor);

      if (!isInOpenSet || tentativeGScore < neighborNode.g) {
        neighborNode.parent = currentNode;
        neighborNode.g = tentativeGScore;
        neighborNode.h = calculateHeuristic(nodeData[neighbor], nodeData[end]);
        neighborNode.f = neighborNode.g + neighborNode.h;

        if (!isInOpenSet) {
          openSet.push(neighborNode);
        }
      }
    });
  }

  return []; // If no path is found
};

export default astar;
