/// <reference lib="deno.unstable" />
import {serveDir} from 'jsr:@std/http/file-server';
import {join} from 'jsr:@std/path';
import * as esbuild from 'esbuild';
import {denoPlugin} from '@deno/esbuild-plugin';
import {bundle} from 'jsr:@deno/emit';
import denoConfig from './deno.json' with {type: 'json'};
import dummy from './backend/testcase.json' with { type: "json" };
import {find, findByDecade} from './backend/database.ts';

const publicRoot = join(Deno.cwd(), 'public');
import { ulid } from "https://deno.land/x/ulid@v0.3.0/mod.ts";

Deno.serve(async (req) => {
	const pathname = new URL(req.url).pathname;
    const kv = await Deno.openKv();
	// .tsをバンドルしてjsに変換するブロック
	if (pathname.endsWith('.ts')) {
		const tsPath = join(publicRoot, pathname);
		try {
			const result = await esbuild.build({
				entryPoints: [tsPath],
				plugins: [denoPlugin()],
				bundle: true,
				write: false,
				format: 'esm',
			});

			const code = result.outputFiles[0].text;

			// 環境に応じてキャッシュの有効期限を設定する
			const env = Deno.env.get('DENO_ENV') || 'development';
			const cacheControl = env === 'production'
				? 'public, max-age=31536000, immutable'
				: 'no-cache, no-store, must-revalidate';

			return new Response(code, {
				headers: {
					'Content-Type': 'application/javascript; charset=utf-8',
					'Cache-Control': cacheControl,
				},
			});
		} catch (error) {
			const errorMessage = error && error instanceof Error
				? error.message
				: String(error);
			console.error('esbuild build error:', error);
			return new Response(`TypeScript bundling error: ${errorMessage}`, {
				status: 500,
			});
		}
	}

	if (req.method === 'GET' && pathname === '/welcome-message') {
		return new Response('jigインターンへようこそ！');
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

    if (req.method === 'GET' && pathname === '/get-json') {
        const items = await kv.list({prefix: ["items"]});
        let ret = "";
        for await (const item of items) {
            ret += JSON.stringify(item) + "\n";
        }
        return new Response(ret);
    }

    if (req.method === 'GET' && pathname === '/query-json') {
        const yearGet = new URL(req.url).searchParams.get("year") ?? "1900";
        const year = parseInt(yearGet)
        console.log(year)
        const x = new URL(req.url).searchParams.get("x") ?? "0";
        const y = new URL(req.url).searchParams.get("y") ?? "0";
        const x2 = new URL(req.url).searchParams.get("x2") ?? "1";
        const y2 = new URL(req.url).searchParams.get("y2") ?? "1";
        const ret = await find(kv, year, parseFloat(x),parseFloat(y),parseFloat(x2),parseFloat(y2));
        return new Response(ret);
    }

    return serveDir(req, {
		fsRoot: 'public',
		urlRoot: '',
		showDirListing: true,
		enableCors: true,
	});
});
