//"5432252677":{"lat":37.78133773803711,"lon":-122.46539306640625,
//"adj":["3978836030","258910917"]}

/*
Takes a starting point on the map, and finds a path to the end location
by using a breadth-first search. Also requires a Map (aka Hash table) with
all of the nodes on the map provided
*/
import { nodeInfo } from "../types.ts";



function BFS(start: string, end: string, nodes: Map<string, nodeInfo>) {

	//Hash table to store which vertices have been visited. Keys are the previous node in the path
	const visited: Map<string,string> = new Map<string, string>();

	const queue: string[] = [start];

	visited.set(start, "start");


	//Loop until end is found
	while (queue.length > 0) {

		const current: string = queue[0];
		const currentNode: nodeInfo = nodes.get(current);

		//Found the end!
		if (current === (end)) {

			return findPath(end, visited);
		}


		//For each node adjacent to queued element
		for (let i: number = 0; i < currentNode.adj.length; i++) {

			//If the adjacent nodes to the queued element have not been visited yet
			if (!visited.has(currentNode.adj[i])) {

				//marks current adjacent node with where it came from (use vertex names for hash table)
				//Key is the adj node's identity, the value of it is the current node's identity
				//i.e. if 1 goes to 2 and 2 to 3, the hash table would look like {[2,1], [3,2]} at end of program
				visited.set(currentNode.adj[i], queue[0]);

				//Adds adjacent node to queue
				queue.push(currentNode.adj[i]);
			}
		}



		//Removes this element from queue
		queue.shift();
	}
	//There is no path --> ???
	return null;
}



//Recursively finds the path and returns a path list
function findPath(current: string, visited: Map<string, string>){

	//If this element has a node that the path came through before this
	if (visited.get(current) === ("start")) {

		//Recursive call to find beginning of the path,
		//returns a list with ordering of path
		return findPath(visited.get(current), visited).push(current); // needs to add current element to recursive call list

	}

	//Base case: hash table does not have parent element, i.e. the start
	else {
		//Returns a list with the starting location at index 0
		return [current];
	}
}

const example: Map<string, nodeInfo> = new Map();