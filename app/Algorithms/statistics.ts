import { dataDict } from "../types.ts";

export default function getStatistics(nodes: dataDict, path: Array<string>) {
  let distanceOfPath = 0.0;
  let travelTime = 0.0;

  //find length of path in miles

  //Start by looping through each element in the list

  for (let i = 0; i < path.length; i++) {
    //Each node is a string of the id to the node

    //Track current and next node to find distance between the two
    const nextNode = nodes[path[i + 1]];
    const thisNode = nodes[path[i]];

    //For each node in the adjacency list
    for (const adjNode of thisNode.adj) {
      //if the node is the next node in the path
      if (nodes[adjNode.nodeId] === nextNode) {
        distanceOfPath += adjNode.distance;
        travelTime += adjNode.time;
      }
    }
  }

  return [distanceOfPath, travelTime];
}
