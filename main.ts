/// <reference lib="deno.unstable" />
import {serveDir} from 'jsr:@std/http/file-server';
import {join} from 'jsr:@std/path';
import {MapDataItem} from './types/map.ts';
import {query} from './backend/backend.ts';

const publicRoot = join(Deno.cwd(), 'public');

let mapData: MapDataItem[] = [];

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

	// TypeScript ファイル処理（プロダクション専用：事前ビルド済みJSファイルのみ配信）
	if (pathname.endsWith('.ts')) {
		const jsPath = pathname.replace('.ts', '.js');
		const jsFilePath = join(publicRoot, jsPath);
		
		try {
			const jsContent = await Deno.readTextFile(jsFilePath);
			return new Response(jsContent, {
				headers: {
					'Content-Type': 'application/javascript; charset=utf-8',
					'Cache-Control': 'public, max-age=31536000, immutable',
				},
			});
		} catch (error) {
			console.error(`Pre-built JS file not found: ${jsFilePath}`);
			return new Response(`Pre-built JavaScript file not found: ${jsPath}. Run 'deno task build:all' to generate bundle files.`, {
				status: 404,
			});
		}
	}

    // 特定のAPIエンドポイントのみバックエンド処理
    if (pathname === '/welcome-message' || 
        pathname === '/post-json' || 
        pathname === '/query-json') {
        return await query(kv, req);
    }
    
	return serveDir(req, {
		fsRoot: 'public',
		urlRoot: '',
		showDirListing: true,
		enableCors: true,
	});
});