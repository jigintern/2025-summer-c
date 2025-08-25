export async function findByDecade(kv: Deno.Kv, lte: number, gt: number){
    const items = kv.list({
		start: ["itemsDecades", lte],
		end: ["itemsDecades", gt]
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
    for(const i of retID){
        const data = JSON.parse(JSON.stringify(await findById(kv, i.value)))["value"];
        const con = data["coordinate"]
        const dataX = con["x"]
        const dataY = con["y"]
        if(x <= dataX && dataX <= x2 && y <= dataY && dataY <= y2){
            ans.push(JSON.stringify(data));
        }
    }
    console.log(x, y, x2, y2)
    return ans.join("\n");
}