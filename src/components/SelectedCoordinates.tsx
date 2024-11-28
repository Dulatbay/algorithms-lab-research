import {Coordinate} from "../types.ts";
import {Button} from "antd";
import Coord from "./Coord.tsx";

interface Props {
    coordinates: Coordinate[];
    handleTypeChange: (id: number, type: "warehouse" | "client") => void;
    handleDeleteCoordinate: (id: number) => void;
}

/*

 <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">Coordinates</h1>
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


*/


const SelectedCoordinates = ({coordinates, handleTypeChange, handleDeleteCoordinate}: Props) => {
    return (
        <div className="flex-1">
            <div className="flex justify-between flex-wrap items-center h-20">
                <h1 className="text-3xl font-bold">Coordinates</h1>
                <Button type={'primary'} size={'large'} className={'min-w-40 h-9'}>SEND</Button>
            </div>

            <div className="border border-solid border-[#515151] rounded-md  px-2">
                {
                    coordinates.map((coordinate, i) => {
                        return <Coord key={i}
                                      coord={coordinate}
                                      handleDeleteCoordinate={handleDeleteCoordinate}
                                      handleTypeChange={handleTypeChange}/>
                    })
                }
            </div>

        </div>
    );
};

export default SelectedCoordinates;