/// <reference lib="deno.unstable" />
import {serveDir} from 'jsr:@std/http/file-server';
import console from 'node:console';
import {join} from 'jsr:@std/path';
import {bundle} from 'jsr:@deno/emit';
import denoConfig from './deno.json' with {type: 'json'};
import dummy from './testcase.json' with { type: "json" }

const publicRoot = join(Deno.cwd(), 'public');
import { ulid } from "https://deno.land/x/ulid@v0.3.0/mod.ts";

Deno.serve(async (req) => {
	const pathname = new URL(req.url).pathname;
    const kv = await Deno.openKv();
	// .tsをトランスパイルするブロック
	if (pathname.endsWith('.ts')) { // URLの末尾が.tsなら
		const tsPath = join(publicRoot, pathname); // public/<ファイルパス>を得る
		try {
			// トランスパイルして結果のコードを得る
			const { code } = await bundle(tsPath, {
				importMap: denoConfig,
			});

			// トランスパイルした結果のコードを返す
			// Determine cache duration based on environment
			const env = Deno.env.get('DENO_ENV') || 'development';
			const cacheControl =
				env === 'production'
					? 'public, max-age=31536000, immutable'
					: 'no-cache, no-store, must-revalidate';
			return new Response(code, {
				headers: {
					'Content-Type': 'application/javascript; charset=utf-8',
					'Cache-Control': cacheControl,
				},
			});
		} catch (error) { // トランスパイル時にエラーが発生した際
			const errorMessage = error && error.message ? error.message : String(error);
			return new Response(
				`TypeScript bundling error: ${errorMessage}`,
				{ status: 500 }
			);
		}
	}

    if (req.method === 'POST' && pathname === '/post-json') {
        const body = await req.json();
        console.log(body)
        const id = ulid();
        kv.set(["items",id], body);
        let yearesr = body["decade"]["gt"];
        let yearesl = body["decade"]["lte"] === -1 ? yearesr-50 : body["decade"]["lte"];
        for (let i = yearesl; i < yearesr; i+=10) {
            const id2 = ulid();
            kv.set(["itemsDecades",i,id2], id);
        }
        return new Response(body);
    }

    if (req.method === 'GET' && pathname === '/welcome-message') {
		return new Response('jigインターンへようこそ！');
	}
    if (req.method === 'GET' && pathname === '/get-json') {
        const items = await kv.list({prefix: ["items"]});
        let ret = "";
        for await (const item of items) {
            ret += JSON.stringify(item) + "\n";
        }
        return new Response(ret);
    }

    // if (req.method === 'GET' && pathname === '/query-json') {
    //     let lteGet = new URL(req.url).searchParams.get("lte");
    //     let gtGet = new URL(req.url).searchParams.get("gt");
    //     const lte = lteGet === null ? 1900 : parseInt(lteGet)
    //     const gt = gtGet === null ? 2020 : parseInt(gtGet)
    //     // const x = new URL(req.url).searchParams.get("x");
    //     // const y = new URL(req.url).searchParams.get("y");
    //     // const x2 = new URL(req.url).searchParams.get("x2");
    //     // const y2 = new URL(req.url).searchParams.get("y2");
    //     const items = await kv.list({
    //         start: ["itemsDecades",lte],
    //         end: ["itemsDecades",gt]
    //     });
    //     let ret = "";
    //     for await (const item of items) {
    //         ret += JSON.stringify(item) + "\n";
    //     }
    //     return new Response(ret);
    // }

    return serveDir(req, {
		fsRoot: 'public',
		urlRoot: '',
		showDirListing: true,
		enableCors: true,
	});
});