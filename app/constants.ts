import axios from "axios";
import { cityDict, pair } from "./types";

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

export const cityData: cityDict = {
  ann_arbor: {
    data: {},
    file: "annarbor.json",
    loaded: false
  }
}

export async function getCityData(
  city: string,
  setLoading: (isLoading: boolean) => void,
  onProgress: (progress: number) => void
) {
  if (cityData[city].loaded) {
    return cityData[city].data;
  } else {
    const file = cityData[city].file;
    setLoading(true);
    const { data: jsonData } = await axios.get(`./data/${file}`, {
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      },
    });

    cityData[city].data = jsonData;
    setTimeout(() => {
      setLoading(false);
      cityData[city].loaded = true;
    }, 200);
    return cityData[city].data;
  }
}