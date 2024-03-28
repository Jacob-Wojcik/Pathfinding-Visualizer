import { getCityData } from "../constants";

interface PreviousDict {
  [key: string]: string | undefined;
}

const dfs = async (city: string, start: string, end: string) => {
  const nodeData = await getCityData(
    city,
    () => {},
    () => {}
  );

  console.log('running dfs');
  let stack: Array<string> = [];
  let visitedNodes = new Set<string>();
  let previous: PreviousDict = {};
  let path: Array<string> = [];

  // push initial node
  stack.push(start);
  while (stack.length > 0) {
    let node = stack.pop();
    if (!node) return;
    
    // reached the end, reconstruct the path
    if (node === end) {
      while (previous[node]) {
        path.push(node);
        node = previous[node]!;
      }
      path.push(start);
      return path.reverse();
    }

    visitedNodes.add(node);
    if (node in nodeData) {
      let nodeInformation = nodeData[node];
      const neighbors = nodeInformation.adj;
      neighbors.forEach((neighbor) => {
        const neighborId = neighbor.nodeId; // access nodeId from the adjacent node
        if (!visitedNodes.has(neighborId)) {
          previous[neighborId] = node;
          stack.push(neighborId);
        }
      });
    }
  }
};

export default dfs;
