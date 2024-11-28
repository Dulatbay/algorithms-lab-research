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
    const [vehicle, setVehicle] = useState<string>("Driving");
    const [typeOfAlgo, setTypeOfAlgo] = useState<string>("Jam");
    const [isLoading, setIsLoading] = useState<boolean>(false);

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

    const handleCalculateRoutesAsync = async () => {
        try {
            setIsLoading(true);
            // Формируем тело запроса
            const points = coordinates.map((coord) => ({ lat: coord.lat, lon: coord.lon }));
            const requestBody = {
                points,
                sources: points.map((_, index) => index),
                targets: points.map((_, index) => index),
                transport: vehicle.toLowerCase(),
                type: typeOfAlgo.toLowerCase(),
            };

            // Создание задачи
            const createTaskResponse = await fetch(
                `https://routing.api.2gis.com/async_matrix/create_task/get_dist_matrix?key=${API_KEY}&version=2.0`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestBody),
                }
            );
            const createTaskData = await createTaskResponse.json();
            if (!createTaskData?.task_id) throw new Error("Не удалось создать задачу.");

            const taskId = createTaskData.task_id;

            // Проверка статуса задачи
            let status = "TASK_IN_QUEUE";
            let resultLink = "";
            while (status !== "TASK_DONE") {
                const statusResponse = await fetch(
                    `https://routing.api.2gis.com/async_matrix/result/get_dist_matrix/${taskId}?version=2.0&key=${API_KEY}`
                );
                const statusData = await statusResponse.json();
                resultLink = statusData.result_link;
                status = statusData.status;
                if (status === "TASK_CANCELED") throw new Error("Задача завершилась с ошибкой.");
                if (status === "TASK_IN_QUEUE" || status === 'TASK_IN_PROGRESS') await new Promise((resolve) => setTimeout(resolve, 5000)); // Ожидание 2 секунды
            }

            console.log(resultLink);

            // Получение результата
            const resultResponse = await fetch(resultLink);
            const resultData = await resultResponse.json();

            // Обработка результата
            if (resultData?.routes) {
                let newRoads: Road[] = resultData.routes.map((route: any) => ({
                    start: coordinates[route.source_id],
                    end: coordinates[route.target_id],
                    distance: route.distance,
                    duration: route.duration,
                }));

                newRoads = newRoads
                    .filter((road) => road.start.id !== road.end.id)
                    .sort((a, b) => b.distance - a.distance);
                setRoads(newRoads);
            } else {
                console.error("Маршруты не найдены.");
            }
        } catch (err) {
            console.error("Ошибка при расчете маршрутов:", err);
        }
        finally {
            setIsLoading(false);
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
                                     handleCalculateRoutes={handleCalculateRoutesAsync}
                                     algorithm={algorithm}
                                     vehicle={vehicle}
                                     typeOfAlgo={typeOfAlgo}
                                     setAlgorithm={setAlgorithm}
                                     setVehicle={setVehicle}
                                     setTypeOfAlgo={setTypeOfAlgo}
                                     isLoading={isLoading}
                />
            </div>
            <Routes roads={roads} />
        </div>
    );
};

export default App;