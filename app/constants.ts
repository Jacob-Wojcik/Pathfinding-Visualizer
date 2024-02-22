import { pair } from "./types";

export const cities: Array<pair> = [
  { value: "ann_arbor", label: "Ann Arbor, MI" },
  { value: "detroit", label: "Detroit, MI" },
];

export const cityCenters: Record<string, { lat: number; long: number }> = {
  ann_arbor: { lat: 42.279, long: -83.732 },
  detroit: { lat: 42.331, long: -83.045 },
};

export const algos: Array<pair> = [
  { value: "dijkstras", label: "Dijkstra's Algorithm" },
  { value: "astar", label: "A* Search" },
  { value: "bfs", label: "Breadth First Search" },
  { value: "dfs", label: "Depth First Search" },
];
