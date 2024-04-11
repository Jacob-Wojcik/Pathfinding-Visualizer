// ** Downloaded this from https://github.com/0kzh/pathfinding-visualizer
// ** Credits Kelvin Zhang

import { useEffect } from "react";
import { LatLng, PathOptions, PolylineOptions } from "leaflet";
import Animated_Polyline from "./Leaflet.AnimatedPolyline";
import { useMap } from "react-leaflet";

type Props = {
  snakeSpeed: number;
  positions: LatLng[];
} & PolylineOptions &
  PathOptions;

function AnimatedPolyline(props: Props) {
  const { positions, snakeSpeed, ...polylineOptions } = props;
  const map = useMap();

  useEffect(() => {
    const animatedPolyline = new Animated_Polyline(positions, polylineOptions);
    animatedPolyline.addTo(map);

    if (positions.length > 0) {
      animatedPolyline.setSnakeLatLngs(positions);
      animatedPolyline.snakeIn(snakeSpeed || Infinity);
    }

    return () => {
      map.removeLayer(animatedPolyline);
    };
  }, [positions, snakeSpeed, map, polylineOptions]);

  return null;
}

export default AnimatedPolyline;
