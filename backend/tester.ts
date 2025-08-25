import dummy from './testcase.json' with { type: "json" };
import { ulid } from "https://deno.land/x/ulid@v0.3.0/mod.ts";

export async function dataAdd(kv: Deno.Kv) {
    for(const body of dummy){
        const id = ulid();
        kv.set(["items",id], body);
        let yearesr = body["decade"]["gt"];
        let yearesl = body["decade"]["lte"] === -1 ? yearesr-50 : body["decade"]["lte"];
        for (let i = yearesl; i < yearesr; i+=10) {
            const id2 = ulid();
            await kv.set(["itemsDecades",i,id2], id);
        }
    }
}

export async function dataDel(kv: Deno.Kv){
    const l = kv.list({prefix: ["itemsDecades"]});
    for await (const item of l) {
        await kv.delete(item.key);
    }

    const l2 = kv.list({prefix: ["items"]});
    for await (const item of l2) {
        await kv.delete(item.key);
    }
}

export async function dataView(kv: Deno.Kv){
    const l = kv.list({prefix: ["items"]});
    for await (const item of l) {
        console.log(item);
    }

}