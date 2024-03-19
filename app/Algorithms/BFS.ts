//"5432252677":{"lat":37.78133773803711,"lon":-122.46539306640625,
//"adj":["3978836030","258910917"]}

/*
Takes a starting point on the map, and finds a path to the end location
by using a breadth-first search. Also requires a Map (aka Hash table) with
all of the nodes on the map provided
*/
import { nodeInfo } from "../types.ts";
import { getCityData } from "../constants.ts";
import { dataDict } from "../types.ts";

async function BFS(city: string, start: string, end: string) {

	const nodes = await getCityData(city,() => {}, () => {});

	//Hash table to store which vertices have been visited. Keys are the previous node in the path
	const nodesSeen: Map<string,string> = new Map<string, string>();

	const queue: string[] = [start];

	nodesSeen.set(start, "start");


	//Loop until end is found
	while (queue.length > 0) {

		const currentNodeName: string = queue[0];
		const currentNode = nodes[currentNodeName];

		//Found the end!
		if (currentNodeName === (end)) {

			//return findPath(end, nodesSeen);




		}


		//For each node adjacent to queued element
		for (let i: number = 0; i < currentNode.adj.length; i++) {

			//If the adjacent nodes to the queued element have not been visited yet
			if (!nodesSeen.has(currentNode.adj[i])) {

				//marks current adjacent node with where it came from (use vertex names for hash table)
				//Key is the adj node's identity, the value of it is the current node's identity
				//i.e. if 1 goes to 2 and 2 to 3, the hash table would look like {[2,1], [3,2]} at end of program
				nodesSeen.set(currentNode.adj[i], queue[0]);

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
function findPath(current: string | undefined, visited: Map<string,string>): Array<string>{

	

	//const nodes = await getCityData(city,() => {}, () => {});
	//If this element has a node that the path came through before this
	if (current != ("start")) {

		if(!current)
			current = "";


		//Recursive call to find beginning of the path,
		//returns a list with ordering of path
		const previousList: Array<string> = findPath(visited.get(current), visited);
		
		previousList.unshift(current); // needs to add current element to recursive call list

		return previousList;
	}

	//Base case: hash table does not have parent element, i.e. the start
	else {
		//Returns a list with the starting location at index 0
		return new Array<string>(current);
	}
}


export  function test (){

	const example: Map<string, nodeInfo> = new Map();
	example.set("1", {lon: 1 , lat: 1, adj: ["2", "4"] });
	example.set("2", {lon: 2 , lat: 2, adj: ["3", "4", "5"] });
	example.set("3", {lon: 3 , lat: 3, adj: ["1", "2"] });
	example.set("4", {lon: 4 , lat: 4, adj: ["7","8"] });
	example.set("5", {lon: 5 , lat: 5, adj: ["4"] });
	example.set("6", {lon: 6 , lat: 6, adj: ["3", "4"] });
	example.set("7", {lon: 7 , lat: 7, adj: ["end"] });
	example.set("8", {lon: 8 , lat: 8, adj: ["2", "6"] });
	example.set("end", {lon: 9 , lat: 9, adj: ["1", "4", "5"] });

	console.log(BFS("annarbor","1", "end"));
}