import {ItemData} from "../types/schema.ts";

export async function findById(kv: Deno.Kv, id: string){
    return await kv.get(["items", id]);
}

export async function find(kv: Deno.Kv, year: number, x: number, y: number, x2: number, y2: number){
    let ans : any[] = [];
    const dataList = await kv.list({
        prefix: ["items"],
    })
    let datas : any[] = [];
    for await (const item of dataList) {
        datas.push(item["value"] as ItemData);
    }
    for await (const data of datas){
        const con = data["geometry"]["geometry"]["coordinates"];
        if(year !== -1 && (data["decade"]["gt"] > year || data["decade"]["lte"] < year)){
            console.log("continue")
            continue;
        }
        con.forEach((co: any) => {
            co.forEach((c: any) => {
                const dataX = c[0];
                const dataY = c[1];
                if(x <= dataX && dataX <= x2 && y <= dataY && dataY <= y2){
                    ans.push(data);
                    return;
                }
            });
        });
    }
    return ans;
}