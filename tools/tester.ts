import dummy from './testcase.json' with { type: "json" };
import { ulid } from "https://deno.land/x/ulid@v0.3.0/mod.ts";
import {GeoJSON} from "npm:@types/leaflet@1.9.20";

export async function dataAdd(kv: Deno.Kv) {
    for(const body of dummy){
        const id = body["id"] ?? ulid();
        await kv.set(["items",id], body);
    }
}

export async function dataDel(kv: Deno.Kv){
    const l = kv.list({prefix: []});
    for await (const item of l) {
        await kv.delete(item.key);
    }
}

export async function dataView(kv: Deno.Kv){
    const l = kv.list({prefix: ["items"]});
    for await (const item of l) {
        console.log(item);
    }
}