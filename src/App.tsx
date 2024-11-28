import React, {useState} from "react";
import "leaflet/dist/leaflet.css";
import {API_KEY, Coordinate, Road} from "./types.ts";
import Map from "./components/Map.tsx";
import SelectedCoordinates from "./components/SelectedCoordinates.tsx";
import Routes from "./components/Routes.tsx";
import routes from "./components/Routes.tsx";


let id = 1;

const App: React.FC = () => {
    const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
    const [roads, setRoads] = useState<Road[]>([]);
    const [algorithm, setAlgorithm] = useState<string>("2Gis Api");
    const [vehicle, setVehicle] = useState<string>("Car");
    const [typeOfAlgo, setTypeOfAlgo] = useState<string>("Jam");

    // Добавление точки
    const handleAddCoordinate = (lat: number, lon: number) => {
        setCoordinates((prev) => [
            ...prev,
            {id: id++, lat, lon, type: "client"},
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

    const handleCalculateRoutes = async () => {
        try {
            // Формируем массив points
            const points = coordinates.map((coord) => ({
                lat: coord.lat,
                lon: coord.lon,
            }));
            // Формируем индексы sources и targets
            const sources = points.map((_, index) => index); // Все точки — отправления
            const targets = points.map((_, index) => index); // Все точки — прибытия
            const requestBody = {
                points,
                sources,
                targets,
                transport: vehicle.toLowerCase(),
                type: typeOfAlgo.toLowerCase(),
            };
            console.log("Тело запроса:", requestBody);
            const response = await fetch(
                    `https://routing.api.2gis.com/get_dist_matrix?key=${API_KEY}&version=2.0`,
                    {
                        method: "POST",
                        headers:
                            {
                                "Content-Type":
                                    "application/json"
                            }
                        ,
                        body: JSON.stringify(requestBody),
                    }
                )
            ;
            const data = await response.json();
            console.log("Ответ API:", data);
            if (data && data.routes) {
                let newRoads: Road[] = data.routes.map((route: any) => {
                    console.log("route", route)
                    return {
                        start: coordinates[sources[route.source_id]],
                        end: coordinates[targets[route.target_id]],
                        distance: route.distance,
                        duration: route.duration,
                    }
                })

                newRoads = newRoads.filter(road => road.start.id != road.end.id)
                setRoads(newRoads);
            } else {
                console.error("Маршруты не найдены.");
            }
        } catch (err) {
            console.error("Ошибка при расчете маршрутов:", err);
        }
    };


    return (
        <div className="max-w-[1400px]">
            <div className={'flex  flex-wrap m-auto gap-16 mt-16'}>
                <Map coordinates={coordinates}
                     roads={roads}
                     handleAddCoordinate={handleAddCoordinate}
                />
                <SelectedCoordinates coordinates={coordinates}
                                     handleTypeChange={handleTypeChange}
                                     handleDeleteCoordinate={handleDeleteCoordinate}
                                     handleCalculateRoutes={handleCalculateRoutes}
                                     algorithm={algorithm}
                                     vehicle={vehicle}
                                     typeOfAlgo={typeOfAlgo}
                                     setAlgorithm={setAlgorithm}
                                     setVehicle={setVehicle}
                                     setTypeOfAlgo={setTypeOfAlgo}
                />
            </div>
            <Routes roads={roads} />
        </div>
    );
};

export default App;