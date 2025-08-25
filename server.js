"use strict";

import { serveDir } from "@std/http";

let mapData = [];

// サーバー起動
Deno.serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // デバッグ用ログ
  console.log("リクエスト:", pathname);

  // APIエンドポイント
  if (req.method === "GET" && pathname === "/welcome-message") {
    return new Response("jig.jpインターンへようこそ！👍");
  }

  if (req.method === "POST" && pathname === "/api/save-data") {
    try {
      const body = await req.json();
      if (Array.isArray(body)) {
        mapData = body;
      }
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  if (req.method === "GET" && pathname === "/api/load-data") {
    return new Response(JSON.stringify(mapData), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // 静的ファイルを返す (publicフォルダにindex.htmlなどを置く)
  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});
