import {MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents} from "react-leaflet";
import React, {useState} from "react";
import {API_KEY, Coordinate, Road} from "../types.ts";
import Search from "antd/lib/input/Search";
import {darkTheme} from "../theme.ts";
import {Button, ConfigProvider} from "antd";
import * as ELG from "esri-leaflet-geocoder";

interface Props {
    coordinates: Coordinate[];
    roads: Road[];
    handleAddCoordinate: (lat: number, lon: number) => void;
}

const Map = ({coordinates, roads, handleAddCoordinate}: Props) => {
    const [search, setSearch] = useState<string>("");

    const MapClickHandler: React.FC = () => {
        useMapEvents({
            click(e) {
                console.log(e)
                handleAddCoordinate(e.latlng.lat, e.latlng.lng);
            },
        });
        return null;
    };

    const handleSearchLocation = async () => {
        try {
            const response = await fetch(
                `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(
                    search
                )}&key=${API_KEY}`
            );
            const data = await response.json();
            const point = data.result.items[0]?.point;
            if (point) {
                handleAddCoordinate(point.lat, point.lon);
            }
        } catch (err) {
            alert("Ошибка поиска местоположения.");
        }
    };

    return (
        <div className={'flex-1'}>

            <ConfigProvider theme={darkTheme}>
                <div className="flex w-full h-20 items-center">
                    <Search
                        placeholder="input search text"
                        allowClear
                        enterButton={
                            <Button type="primary" size="large">Search</Button>
                        }
                        size="large"
                        onChange={e => setSearch(e.target.value)}
                        onSearch={handleSearchLocation}
                    />
                </div>
            </ConfigProvider>
            <div
                className="rounded-md overflow-hidden border-4 border-solid border-[#91898C] hover:border-[#3E3E3E] transition-all duration-200">
                <MapContainer
                    center={[43.208, 76.669]}
                    zoom={9}
                    style={{height: "400px", width: "100%"}}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler/>
                    {coordinates.map((coord) => (
                        <Marker key={coord.id} position={[coord.lat, coord.lon]}/>
                    ))}
                    {roads.map((road, index) => {
                        console.log(road)
                        return (
                            <Polyline
                                key={index}
                                positions={[
                                    [road.start.lat, road.start.lon],
                                    [road.end.lat, road.end.lon],
                                ]}
                                color="blue"
                            />
                        )
                    })}
                </MapContainer>
            </div>
        </div>
    );
};

export default Map;