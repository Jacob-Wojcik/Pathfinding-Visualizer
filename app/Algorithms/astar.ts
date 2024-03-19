// Import the function to get city data from a separate constants file
import { getCityData } from "../constants";

// Node class represents each node in the graph
class Node {
  // Total cost of the node (f = g + h)
  public f: number = 0;
  // Acutal length from start node to this node
  public g: number = 0;
  // Estimated cost from this node to end node (heuristic)
  public h: number = 0;
  // Indicates if the node has been visited
  public visited: boolean = false;
  // Indicates if the node has been processed
  public closed: boolean = false;
  public parent: Node | null = null;
  public neighbors: string[];

  // Constructor to initialize the node with its reference and neighbors
  constructor(public ref: string, neighbors: string[]) {
    this.neighbors = neighbors;
  }
}

// Interface for the structure of node data
interface NodeData {
  [key: string]: { lat: number; lon: number; adj: string[] };
}


const calculateHeuristic = (nodeA: { lat: number; lon: number; }, nodeB: { lat: number; lon: number; }): number => {
  // Calculate the absolute distance in latitude and longitude
  const d1 = Math.abs(nodeB.lat - nodeA.lat);
  const d2 = Math.abs(nodeB.lon - nodeA.lon);


  // Euclidean distance as the heuristic
  return Math.sqrt(d1 ** 2 + d2 ** 2);
};

// Function to reconstruct by backtracking from the end node
const reconstructPath = (currentNode: Node | null): string[] => {
  let path: string[] = [];

  // Traverse from end node to start node
  while (currentNode) { 
    // Add current node's reference to the path
    path.unshift(currentNode.ref);
    // Move to the parent node
    currentNode = currentNode.parent;
  }
  return path;
};

// A* pathfinding algorithm
const astar = async (city: string, start: string, end: string): Promise<string[]> => {


  const nodeData: NodeData = await getCityData(city, () => {}, () => {});

  // The set of nodes yet to be evaluated
  let openSet: Node[] = [];
  // The set of nodes already evaluated
  let closedSet: Set<string> = new Set();
  // Object to hold node instances for quick access
  let nodes: { [key: string]: Node } = {};

  // Initialize nodes from nodeData
  Object.keys(nodeData).forEach((key) => {
    nodes[key] = new Node(key, nodeData[key].adj);
  });

  // if start or end node doesn't exist
  if (!(start in nodes) || !(end in nodes)) {
    throw new Error("Start or end node not found in graph.");
  }

  // Initialize the start node
  nodes[start].g = 0;
  nodes[start].h = calculateHeuristic(nodeData[start], nodeData[end]);
  nodes[start].f = nodes[start].h;
  openSet.push(nodes[start]);

  // main loop 
  while (openSet.length > 0) {
    // Remove the first node t
    let currentNode = openSet.shift();

    // check for undefined 
    if (currentNode === undefined) break;

    // If the current node is the end node, reconstruct and return the path
    if (currentNode.ref === end) {
      return reconstructPath(currentNode);
    }

    // Add current node to the closed set
    closedSet.add(currentNode.ref);

    // Loop through each neighbor of the current node
    currentNode.neighbors.forEach((neighbor) => {
      if (closedSet.has(neighbor)) return;
      
      // Calculate tentative g score for the neighbor node

      // TODO: FIX currentNode possibly being undefined?
      let tentativeGScore = currentNode.g + calculateHeuristic(nodeData[currentNode.ref], nodeData[neighbor]);
      let neighborNode = nodes[neighbor];

      // Check if the neighbor node is not in the open set
      let isInOpenSet = openSet.find(n => n.ref === neighbor);

      // If not in the openSet or tentative g score is better, update the node
      if (!isInOpenSet || tentativeGScore < neighborNode.g) {
        neighborNode.parent = currentNode;
        neighborNode.g = tentativeGScore;
        neighborNode.h = calculateHeuristic(nodeData[neighbor], nodeData[end]);
        neighborNode.f = neighborNode.g + neighborNode.h;

        // If the neighbor node was not in the open set, add it
        if (!isInOpenSet) {
          openSet.push(neighborNode);
        }
      }
    });
  }

  return []; // Return an empty path if no path to the end node is found
};

export default astar;
