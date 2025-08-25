/// <reference lib="deno.unstable" />
import {serveDir} from 'jsr:@std/http/file-server';
import {join} from 'jsr:@std/path';
import * as esbuild from 'esbuild';
import {denoPlugin} from '@deno/esbuild-plugin';
import {MapDataItem} from './types/map.ts';
import {query} from './backend/backend.ts';

const publicRoot = join(Deno.cwd(), 'public');

let mapData: MapDataItem[] = []; //
Deno.serve(async (req) => {
	const kv = await Deno.openKv();

	const pathname = new URL(req.url).pathname;

	// /api
	if (req.method === 'POST' && pathname === '/api/save-data') {
		try {
			const body = await req.json();
			if (Array.isArray(body)) {
				mapData = body;
			}
			return new Response(JSON.stringify({ status: 'ok' }), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err) {
			const errmsg = err instanceof Error ? err.message : String(err);
			return new Response(
				JSON.stringify({ error: errmsg }),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}
	}

	if (req.method === 'GET' && pathname === '/api/load-data') {
		return new Response(JSON.stringify(mapData), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

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

    // バックエンド処理
    if(req.method === "GET" || req.method === "POST"){
        return await query(kv, req);
    }
    
	return serveDir(req, {
		fsRoot: 'public',
		urlRoot: '',
		showDirListing: true,
		enableCors: true,
	});
});
