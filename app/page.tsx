"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Child,
  IconWrapper,
  Select,
  Settings,
} from "./components/Styles";
import { algos, cities, cityCenters } from "./constants";
import { MoonIcon, SunIcon } from "@primer/octicons-react";

export default function Home() {
  const Map = dynamic(() => import("./components/Map"), {
    ssr: false,
  });

  const [lat, setLat] = useState<number>(42.279);
  const [long, setLong] = useState<number>(-83.732);
  const [zoom, setZoom] = useState<number>(12);

  // configuration options
  const [algorithm, setAlgorithm] = useState<string>("djikstras");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [city, setCity] = useState<string>("ann_arbor");

  const layerTiles = darkMode
    ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const MemoizedMap = useMemo(
    () => <Map center={[lat, long]} zoom={zoom} layerTiles={layerTiles} />,
    [lat, long, zoom, layerTiles]
  );

  useEffect(() => {
    if (city && city in cityCenters) {
      setLat(cityCenters[city].lat);
      setLong(cityCenters[city].long);
    }
  }, [city]);

  return (
    <div>
      <Settings>
        <Child className="justify-start">
          <Select
            onChange={(e) => setAlgorithm(e.target.value)}
            value={algorithm}
            className="rounded-sm"
          >
            {algos.map((algo) => (
              <option key={algo.value} value={algo.value}>
                {algo.label}
              </option>
            ))}
          </Select>
        </Child>
        <Child className="justify-center">
          <Select
            onChange={(e) => setCity(e.target.value)}
            value={city}
            className="rounded-l-sm"
          >
            {cities.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </Select>
          <Button className="rounded-r-sm">Visualize</Button>
        </Child>
        <Child className="justify-end">
          <IconWrapper onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? (
              <SunIcon className="fill-white" size={24} />
            ) : (
              <MoonIcon className="fill-black" size={24} />
            )}
          </IconWrapper>
        </Child>
      </Settings>
      {MemoizedMap}
    </div>
  );
}
