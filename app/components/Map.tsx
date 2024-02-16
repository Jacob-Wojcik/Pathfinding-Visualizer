import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression } from "leaflet";

type Props = {
  zoom: number;
  center: LatLngExpression | undefined;
  layerTiles: string;
};

export default function Map(props: Props) {
  return (
    <div>
      <MapContainer
        className="w-full h-lvh"
        center={props.center}
        zoom={props.zoom}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={props.layerTiles}
        />
        <ZoomControl position={"bottomleft"} />
      </MapContainer>
    </div>
  );
}
