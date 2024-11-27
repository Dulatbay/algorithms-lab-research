import React, {useState} from "react";
import {MapContainer, TileLayer, Marker, Polyline, useMapEvents} from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Coordinate {
    id: number;
    lat: number;
    lon: number;
    type: "warehouse" | "client";
}

interface Road {
    start: Coordinate;
    end: Coordinate;
    distance: string;
    duration: string;
}

const API_KEY = "923efe7e-ec05-4852-ace5-c773b8555df1";

const App: React.FC = () => {
    const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
    const [roads, setRoads] = useState<Road[]>([]);
    const [search, setSearch] = useState<string>("");

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

    // Поиск местоположения
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

    const handleCalculateRoutes = async () => {
        try {
            // Формируем массив points
            const points = coordinates.map((coord) => ({
                lat: coord.lat,
                lon: coord.lon,
            }));

            // Формируем индексы sources и targets
            const sources = points.map((_, index) => index); // Все точки — отправления
            const targets = points.map((_, index) => index).reverse(); // Все точки — прибытия

            const requestBody = {
                points,
                sources,
                targets,
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
                const newRoads: Road[] = data.routes.map((route: any) => {
                    console.log("route", route)
                    return {
                        start: coordinates[sources[route.source_id]],
                        end: coordinates[targets[route.target_id]],
                        distance: `${
                            (route.distance / 1000).toFixed(2)}км`,
                        duration: `${Math.round(route.duration / 60)}мин`, // Преобразуем в минуты
                    }
                });

                setRoads(newRoads);
            } else {
                console.error("Маршруты не найдены.");
            }
        } catch (err) {
            console.error("Ошибка при расчете маршрутов:", err);
        }
    };


// Обработчик кликов на карте
    const MapClickHandler: React.FC = () => {
        useMapEvents({
            click(e) {
                handleAddCoordinate(e.latlng.lat, e.latlng.lng);
            },
        });
        return null;
    };

    return (
        <div className="flex flex-col items-center p-4 bg-green-200 min-h-screen">
            <h1 className="text-3xl font-bold mb-4">
                Find the shortest path. Manage your business.
            </h1>
            <div className="flex w-full mb-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search location..."
                    className="flex-1 border p-2"
                />
                <button
                    onClick={handleSearchLocation}
                    className="bg-blue-500 text-white px-4"
                >
                    Search
                </button>
            </div>
            <MapContainer
                center={[48.3794, 31.1656]} // Центр карты
                zoom={6}
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
            <div className="w-full mt-4">
                <h2 className="text-xl font-bold">Coordinates</h2>
                <table className="table-auto w-full bg-white border">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Type</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {coordinates.map((coord, index) => (
                        <tr key={coord.id}>
                            <td>{index + 1}</td>
                            <td>{coord.lat.toFixed(6)}</td>
                            <td>{coord.lon.toFixed(6)}</td>
                            <td>
                                <select
                                    value={coord.type}
                                    onChange={(e) =>
                                        handleTypeChange(coord.id, e.target.value as "warehouse" | "client")
                                    }
                                >
                                    <option value="client">Client</option>
                                    <option value="warehouse">Warehouse</option>
                                </select>
                            </td>
                            <td>
                                <button
                                    onClick={() => handleDeleteCoordinate(coord.id)}
                                    className="text-red-500"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="w-full mt-4">
                <h2 className="text-xl font-bold">Roads</h2>
                <table className="table-auto w-full bg-white border">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Distance</th>
                        <th>Duration</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {roads.map((road, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                                {road.start.lat.toFixed(3)}, {road.start.lon.toFixed(3)}
                            </td>
                            <td>
                                {road.end.lat.toFixed(3)}, {road.end.lon.toFixed(3)}
                            </td>
                            <td>{road.distance}</td>
                            <td>{road.duration}</td>
                            <td>
                                <button
                                    onClick={() =>
                                        setRoads((prev) =>
                                            prev.filter((r) => r !== road)
                                        )
                                    }
                                    className="text-red-500"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <button
                onClick={handleCalculateRoutes}
                className="bg-green-500 text-white px-6 py-2 mt-4"
            >
                Update values (durations and distances)
            </button>
        </div>
    );
};

export default App;