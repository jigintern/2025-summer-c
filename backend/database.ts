import {ItemData} from "../types/schema.ts";

export async function findById(kv: Deno.Kv, id: string){
    const data = await kv.get(["items", id]);
    return data["value"];
}

export async function find(kv: Deno.Kv, year: number, x: number, y: number, x2: number, y2: number){
    const ans : any[] = [];
    const dataList = await kv.list({
        prefix: ["items"],
    });

    for await (const item of dataList) {
        const data = item["value"] as ItemData;

        if(year !== -1 && (data["decade"]["gt"] > year || data["decade"]["lte"] < year)){
            continue;
        }

        const coordinates = data["geometry"]["geometry"]["coordinates"];
        let isDataAdded = false;
        for (const polygon of coordinates) {
            for (const point of polygon) {
                const dataX = point[0];
                const dataY = point[1];
                if(x <= dataX && dataX <= x2 && y <= dataY && dataY <= y2){
                    ans.push(data);
                    isDataAdded = true;
                    break; // Exit from the points loop
                }
            }
            if (isDataAdded) {
                break; // Exit from the polygon loop
            }
        }
    }
    return ans;
}