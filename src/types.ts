export interface Coordinate {
    id: number;
    lat: number;
    lon: number;
    type: "warehouse" | "client";
}

export interface Road {
    start: Coordinate;
    end: Coordinate;
    distance: number;
    duration: number;
}


export const API_KEY = "923efe7e-ec05-4852-ace5-c773b8555df1";
