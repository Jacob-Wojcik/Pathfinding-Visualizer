"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Child,
  IconWrapper,
  Select,
  Settings,
} from "./components/Styles";
import { algos, cities, cityCenters } from "./constants";
import { getCityData } from "./constants";
import { MoonIcon, SunIcon } from "@primer/octicons-react";
import { qtNode, dataDict } from "./types";
import * as d3 from "d3-quadtree";
import { LatLng, LeafletMouseEvent } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { markerA, markerB } from "./Icons";

export default function Home() {

  const [lat, setLat] = useState<number>(42.279);
  const [long, setLong] = useState<number>(-83.732);
  const [zoom, setZoom] = useState<number>(12);

  // start and end markers
  const [startNode, setStartNode] = useState<string | null>(null);
  const [endNode, setEndNode] = useState<string | null>(null);

  // configuration options
  const [algorithm, setAlgorithm] = useState<string>("djikstras");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [city, setCity] = useState<string>("ann_arbor");
  const [loading, setLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  const [startMarkerPos, setStartMarkerPos] = useState<LatLng | null>(null);
  const [endMarkerPos, setEndMarkerPos] = useState<LatLng | null>(null);

  const [qt, setQt] = useState<d3.Quadtree<qtNode>>(d3.quadtree<qtNode>());
  const [nodeData, setNodeData] = useState<dataDict>({});

  const layerTiles = darkMode
    ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  useEffect(() => {
    if (city && city in cityCenters) {
      setLat(cityCenters[city].lat);
      setLong(cityCenters[city].long);
    }

    // reset the state of the application
    setStartNode(null);
    setEndNode(null);
    setStartMarkerPos(null);
    setEndMarkerPos(null);

    getCityData(city, setLoading, setProgress).then((data) => {
      setNodeData(data);
    });
  }, [city]);

  useEffect(() => {
    // when node data changes,build quadtree from nodes
    // this allows us to find closest node to a coordinate in O(log n) time

    // we need to format data to store it as a node in quadtree
    // original { x, y }
    // new: { nodeId, x, y}
    const transformed = [];
    for (let [key, value] of Object.entries(nodeData)) {
      transformed.push({ key: key, lat: value.lat, lon: value.lon });
    }

    setQt(
      qt
        .x((d: qtNode) => {
          return d.lat;
        })
        .y((d: qtNode) => {
          return d.lon;
        })
        .addAll(transformed)
    );
  }, [nodeData]);

  // Takes a { lat, lng } object and finds the closest node, uses the quad tree
  const findClosestNode = (latlng: LatLng) => {
    if (qt.size() > 0) {
      const lat = latlng.lat;
      const lon = latlng.lng;
      const closestNode = qt.find(lat, lon);
      console.log("node nearest click is", closestNode);
      return closestNode;
    }
  };

  const handleClick = (e: LeafletMouseEvent) => {
    if (!startNode || !endNode) {
      const closestNode = findClosestNode(e.latlng);
      if (closestNode) {
        if (!startNode) {
          setStartNode(closestNode.key);
          setStartMarkerPos(new LatLng(closestNode.lat, closestNode.lon));
        } else {
          setEndNode(closestNode.key);
          setEndMarkerPos(new LatLng(closestNode.lat, closestNode.lon));
        }
      }
    }
  };

  function MapEventHandler() {
    const map = useMapEvents({
      click: (e) => handleClick(e)
    });
    return null;
  }

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
      <MapContainer
          className="w-full h-lvh"
          center={[lat, long]}
          zoom={zoom}
          zoomControl={false}
        >
          <MapEventHandler />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={layerTiles}
          />
            {startMarkerPos && (
            <Marker icon={markerA} position={startMarkerPos}>
              <Popup>Start</Popup>
            </Marker>
            )}
            {endMarkerPos && (
              <Marker icon={markerB}position={endMarkerPos}>
                <Popup>End</Popup>
              </Marker>
            )}
          <ZoomControl position={"bottomleft"} />
        </MapContainer>
    </div>
  );
}
