/// <reference lib="deno.unstable" />
import {serveDir} from 'jsr:@std/http/file-server';
import {MapDataItem} from './types/map.ts';
import {query} from './backend/backend.ts';

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
