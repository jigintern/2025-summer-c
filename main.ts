import {serveDir} from 'jsr:@std/http/file-server';
import console from 'node:console';
import {join} from 'jsr:@std/path';
import {bundle} from 'jsr:@deno/emit';
import denoConfig from './deno.json' with {type: 'json'};

const publicRoot = join(Deno.cwd(), 'public');

Deno.serve(async (req) => {
	const pathname = new URL(req.url).pathname;
	console.log(pathname);

	// .tsをトランスパイルするブロック
	if (pathname.endsWith('.ts')) { // URLの末尾が.tsなら
		const tsPath = join(publicRoot, pathname); // public/<ファイルパス>を得る
		try {
			// トランスパイルして結果のコードを得る
			const { code } = await bundle(tsPath, {
				importMap: denoConfig,
			});

			// トランスパイルした結果のコードを返す
			return new Response(code, {
				headers: {
					'Content-Type': 'application/javascript; charset=utf-8',
					'Cache-Control': 'public, max-age=31536000, immutable',
				},
			});
		} catch (error) { // トランスパイル時にエラーが発生した際
			console.error('Error bundling TypeScript file:', error);
			return new Response('Internal Server Error', { status: 500 });
		}
	}
    
	if (req.method === 'GET' && pathname === '/welcome-message') {
		return new Response('jigインターンへようこそ！');
	}

	return serveDir(req, {
		fsRoot: 'public',
		urlRoot: '',
		showDirListing: true,
		enableCors: true,
	});
});