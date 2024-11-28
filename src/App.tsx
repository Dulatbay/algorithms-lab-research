import React, {useState} from "react";
import "leaflet/dist/leaflet.css";
import {Coordinate, Road} from "./types.ts";
import Map from "./components/Map.tsx";
import SelectedCoordinates from "./components/SelectedCoordinates.tsx";


const App: React.FC = () => {
    const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
    const [roads, setRoads] = useState<Road[]>([]);

    // Добавление точки
    const handleAddCoordinate = (lat: number, lon: number) => {
        setCoordinates((prev) => [
            ...prev,
            {id: Date.now(), lat, lon, type: "client"},
        ]);
    };

    // Удаление точки
    const handleDeleteCoordinate = (id: number) => {
        setCoordinates((prev) => prev.filter((coord) => coord.id !== id));
        setRoads((prev) => prev.filter((road) => road.start.id !== id && road.end.id !== id));
    };

    // Изменение типа точки
    const handleTypeChange = (id: number, type: "warehouse" | "client") => {
        setCoordinates((prev) =>
            prev.map((coord) =>
                coord.id === id ? {...coord, type} : coord
            )
        );
    };


    return (
        <div className="">
            <div className={'flex max-w-[1400px] flex-wrap m-auto gap-16 mt-16'}>
                <Map coordinates={coordinates} roads={roads} handleAddCoordinate={handleAddCoordinate}/>
                <SelectedCoordinates coordinates={coordinates} handleTypeChange={handleTypeChange}
                                     handleDeleteCoordinate={handleDeleteCoordinate}/>
            </div>
        </div>
    );
};

export default App;