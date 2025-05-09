import {MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents} from "react-leaflet";
import React from "react";
import {Coordinate, Road} from "../types.ts";
import L from "leaflet";


interface Props {
    coordinates: Coordinate[];
    roads: Road[];
    handleAddCoordinate: (lat: number, lon: number) => void;
}

const customIcon = (type: 'warehouse' | 'client') =>
    new L.Icon({
        iconUrl: type == 'warehouse' ? '/w-marker.svg' : '/marker.svg', // Google Charts URL for dynamic marker
        iconSize: [30, 42], // Adjust size if needed
        iconAnchor: [15, 42], // Center the anchor point
        popupAnchor: [0, -42], // Position the popup
    });

const AppMap = ({coordinates, roads, handleAddCoordinate}: Props) => {
    // const [search] = useState<string>("");

    const MapClickHandler: React.FC = () => {
        useMapEvents({
            click(e) {
                console.log(e)
                handleAddCoordinate(e.latlng.lat, e.latlng.lng);
            },
        });
        return null;
    };


    // const handleSearchLocation = async () => {
    //     try {
    //         const response = await fetch(
    //             `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(
    //                 search
    //             )}&key=${API_KEY}`
    //         );
    //         const data = await response.json();
    //         const point = data.result.items[0]?.point;
    //         if (point) {
    //             handleAddCoordinate(point.lat, point.lon);
    //         }
    //     } catch (err) {
    //         alert("Ошибка поиска местоположения.");
    //     }
    // };

    return (
        <div className={'flex-1 min-w-[340px]'}>

            {/*<ConfigProvider theme={darkTheme}>*/}
            {/*    <div className="flex w-full h-20 items-center">*/}
            {/*        <Search*/}
            {/*            placeholder="input search text"*/}
            {/*            allowClear*/}
            {/*            enterButton={*/}
            {/*                <Button type="primary" size="large">Search</Button>*/}
            {/*            }*/}
            {/*            size="large"*/}
            {/*            onChange={e => setSearch(e.target.value)}*/}
            {/*            onSearch={handleSearchLocation}*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*</ConfigProvider>*/}
            <div
                className="rounded-md overflow-hidden border-4 border-solid border-[#91898C] hover:border-[#3E3E3E] transition-all duration-200">
                <MapContainer
                    center={[43.208, 76.669]}
                    zoom={16}
                    style={{height: "400px", width: "100%"}}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler/>
                    {coordinates.map((coord) => (
                        <Marker
                            key={coord.id}
                            position={[coord.lat, coord.lon]}
                            icon={customIcon(coord.type)}
                        >
                            <Popup>
                                Latitude: {Math.round(coord.lat * 100) / 100}, Longitude: {Math.round(coord.lon * 100) / 100} <br />
                                Id: {coord.id}
                            </Popup>
                        </Marker>
                    ))}

                    {roads.map((road, index) => {
                        return (
                            <Polyline
                                key={index}
                                positions={[
                                    [road.start.lat, road.start.lon],
                                    [road.end.lat, road.end.lon],
                                ]}
                                pathOptions={{
                                    color: road.highlight ? 'green' : 'blue',
                                }}
                            />
                        )
                    })}
                </MapContainer>
            </div>
        </div>
    );
};

export default AppMap;