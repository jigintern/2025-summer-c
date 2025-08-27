import {ItemData} from "../types/schema.ts";
export async function findByDecade(kv: Deno.Kv, gte: number, lt: number){
    if(gte === -1){
        const items = kv.list({
            prefix: ["itemsDecades"],
        })
        const ret: any[] = [];
        for await (const item of items) {
            ret.push(item);
        }
        return ret;
    }
    const items = kv.list({
		start: ["itemsDecades", gte],
		end: ["itemsDecades", lt]
	});
    const ret: any[] = [];
    for await (const item of items) {
        ret.push(item);
    }
    return ret;
}

export async function findById(kv: Deno.Kv, id: string){
    return await kv.get(["items", id]);
}

export async function find(kv: Deno.Kv, year: number, x: number, y: number, x2: number, y2: number){
    const retID = await findByDecade(kv, year, year+10);
    let ans : any[]  = []
    for await (const i of retID){
        const dat = await findById(kv, i.value);
        const data : ItemData = dat["value"] as ItemData;
        const con = data["geometry"]["geometry"]["coordinates"];
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