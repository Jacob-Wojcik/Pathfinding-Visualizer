/*
Takes a starting point on the map, and finds a path to the end location
by using a breadth-first search. Also requires a Map (aka Hash table) with
all of the nodes on the map provided
*/
import { getCityData } from "../constants.ts";

export default async function bfs(city: string, start: string, end: string) {
  const nodes = await getCityData(
    city,
    () => {},
    () => {}
  );

  //Hash table to store which vertices have been visited. Keys are the previous node in the path
  const nodesSeen: Map<string, string> = new Map<string, string>();

  const queue: string[] = [start];

  nodesSeen.set(start, "start");

  //Loop until end is found
  while (queue.length > 0) {
    const currentNodeName: string = queue[0];
    const currentNode = nodes[currentNodeName];

    //Found the end!
    if (currentNodeName === end) {
      return findPath(end, nodesSeen).reverse();
    }

    //For each node adjacent to queued element
    for (let i: number = 0; i < currentNode.adj.length; i++) {
      //If the adjacent nodes to the queued element have not been visited yet
      if (!nodesSeen.has(currentNode.adj[i].nodeId)) {
        //marks current adjacent node with where it came from (use vertex names for hash table)
        //Key is the adj node's identity, the value of it is the current node's identity
        //i.e. if 1 goes to 2 and 2 to 3, the hash table would look like {[2,1], [3,2]} at end of program
        nodesSeen.set(currentNode.adj[i].nodeId, queue[0]);

        //Adds adjacent node to queue
        queue.push(currentNode.adj[i].nodeId);
      }
    }
    //Removes this element from queue
    queue.shift();
  }
  //There is no path --> ???
  return null;
}

//Recursively finds the path and returns a path list
function findPath(
  current: string | undefined,
  visited: Map<string, string>
): Array<string> {
  //const nodes = await getCityData(city,() => {}, () => {});
  //If this element has a node that the path came through before this
  if (current != "start") {
    if (!current) current = "";

    //Recursive call to find beginning of the path,
    //returns a list with ordering of path
    const previousList: Array<string> = findPath(visited.get(current), visited);

    previousList.unshift(current); // needs to add current element to recursive call list

    return previousList;
  }

  //Base case: hash table does not have parent element, i.e. the start
  else {
    //Returns an empty list
    return [];
  }
}
