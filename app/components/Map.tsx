import { MapContainer, useMapEvents, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression, LeafletMouseEvent } from "leaflet";
import React from "react";

type Props = {
  zoom: number;
  center: LatLngExpression | undefined;
  layerTiles: string;
  handleClick: (e: LeafletMouseEvent) => void;
  children?: React.ReactNode;
};

export default function Map(props: Props) {
  function MapEventHandler() {
    const map = useMapEvents({
      click: (e) => props.handleClick(e)
    });
    return null;
  }

  return (
    <div>
      <MapContainer
        className="w-full h-lvh"
        center={props.center}
        zoom={props.zoom}
        zoomControl={false}
      >
        <MapEventHandler/>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={props.layerTiles}
        />
        <ZoomControl position={"bottomleft"} />
        {props.children}
      </MapContainer>
    </div>
  );
}
