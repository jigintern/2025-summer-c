import { ulid } from "https://deno.land/x/ulid@v0.3.0/mod.ts";
import {find} from "./database.ts";
import {serveDir} from 'jsr:@std/http/file-server';
import {dataAdd, dataDel, dataView} from "./tester.ts";
import {ItemData} from "../types/schema.ts";

export async function query(kv: Deno.Kv, req: Request) {

    // dataAdd(kv);
    // dataDel(kv);
    // dataView(kv);

    const pathname = new URL(req.url).pathname;
    if (req.method === 'GET' && pathname === '/welcome-message') {
        return new Response('jigインターンへようこそ！');
    }

    if (req.method === 'POST' && pathname === '/post-json') {
        const bod = await req.json();
        const body : ItemData = bod as ItemData;
        const id = ulid();
        kv.set(["items",id], body);
        let yearesr = 1;
        let yearesl = 0;
        try{
            yearesr = body["decade"]["gt"];
            yearesl = body["decade"]["lte"] === -1 ? yearesr - 50 : body["decade"]["lte"];
        }catch (e) {}
        for (let i = yearesl; i < yearesr; i+=10) {
            const id2 = ulid();
            kv.set(["itemsDecades",i,id2], id);
        }
        return Response.json(body);
    }

    if (req.method === 'GET' && pathname === '/get-json') {
        const items = await kv.list({prefix: ["items"]});
        let ret = "";
        for await (const item of items) {
            ret += JSON.stringify(item) + "\n";
        }
        return new Response(ret);
    }

    if (req.method === 'GET' && pathname === '/query-json') {
        const res = new URL(req.url).searchParams;
        const yearGet = res.get("year") ?? "-1";
        const year = parseInt(yearGet)
        const x = res.get("x") ?? "0";
        const y = res.get("y") ?? "0";
        const x2 = res.get("x2") ?? "1";
        const y2 = res.get("y2") ?? "1";
        const ret = await find(kv, year, parseFloat(x),parseFloat(y),parseFloat(x2),parseFloat(y2));
        return Response.json(ret);
    }

    return serveDir(req, {
        fsRoot: 'public',
        urlRoot: '',
        showDirListing: true,
        enableCors: true,
    });

}