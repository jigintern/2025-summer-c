/// <reference lib="deno.unstable" />
import {serveDir} from 'jsr:@std/http/file-server';
import console from 'node:console';
import {join} from 'jsr:@std/path';
import {bundle} from 'jsr:@deno/emit';
import denoConfig from './deno.json' with {type: 'json'};

const publicRoot = join(Deno.cwd(), 'public');
import { ulid } from "https://deno.land/x/ulid@v0.3.0/mod.ts";

Deno.serve(async (req) => {
	const pathname = new URL(req.url).pathname;
    const kv = await Deno.openKv();
	if (req.method === 'POST' && pathname === '/post-json') {
        const body = await req.json();
        console.log(body)
        const id = ulid();
        kv.set(["items",1], body);
		return new Response(body);
	}

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

	if (req.method === 'GET' && pathname === '/welcome-message') {
		return new Response('jigインターンへようこそ！');
	}
    if (req.method === 'GET' && pathname === '/get-json') {
        const items = await kv.get(["items",1]);
        return new Response(JSON.stringify(items));
    }

	return serveDir(req, {
		fsRoot: 'public',
		urlRoot: '',
		showDirListing: true,
		enableCors: true,
	});
});