import {ItemData} from "../types/schema.ts";

export async function findById(kv: Deno.Kv, id: string){
    const data = await kv.get(["items", id]);
    return data["value"];
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
            continue;
        }
        let ok:boolean = false;
        for (let i = 0; i < con.length; i++) {
            const co = con[i];
            for (let j = 0; j < co.length; j++) {
                const c = co[j];
                const dataX = c[0];
                const dataY = c[1];
                if(x <= dataX && dataX <= x2 && y <= dataY && dataY <= y2){
                    ans.push(data);
                    ok = true;
                    break;
                }
            }
            if(ok){
                break;
            }
        }
    }
    return ans;
}