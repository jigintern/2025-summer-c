/// <reference lib="deno.unstable" />
import {serveDir} from 'jsr:@std/http/file-server';
import {join} from 'jsr:@std/path';
import * as esbuild from 'esbuild';
import {denoPlugin} from '@deno/esbuild-plugin';
import {bundle} from 'jsr:@deno/emit';
import denoConfig from './deno.json' with {type: 'json'};
import {find} from './backend/database.ts';
import {query} from './backend/backend.ts';

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
