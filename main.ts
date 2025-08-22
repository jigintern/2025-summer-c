// main.ts
// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { serveFile } from "https://deno.land/std@0.224.0/http/file_server.ts";

console.log("Server running at http://localhost:8000");

serve(async (req: Request) => {
    const url = new URL(req.url);

    // GETリクエストでルートパス('/')にアクセスされた場合、index.htmlを返す
    if (req.method === "GET" && url.pathname === "/") {
        // serveFileは適切なContent-Typeヘッダーを自動で設定してくれる
        return serveFile(req, "./public/index.html");
    }

    // POSTリクエストでルートパス('/')にアクセスされた場合、JSONを処理
    if (req.method === "POST" && url.pathname === "/") {
        try {
            const receivedJson = await req.json();
            console.log("✅ Received JSON from browser:", receivedJson);

            const responseJson = {
                status: "success",
                reply: `Hello, ${receivedJson.name}! Your message was received.`,
                timestamp: new Date().toISOString(),
            };

            const body = JSON.stringify(responseJson, null, 2);
            return new Response(body, {
                status: 200,
                headers: { "Content-Type": "application/json; charset=utf-8" },
            });

        } catch (error) {
            console.error("❌ Invalid JSON received:", error);
            return new Response(JSON.stringify({ status: "error", message: "Invalid JSON" }), {
                status: 400,
                headers: { "Content-Type": "application/json; charset=utf-8" },
            });
        }
    }
    if(req.method === "GET" && url.pathname === "/test") {
        return new Response(
            "test!"
        )
    }
    // それ以外のリクエストは404 Not Found
    return new Response("Not Found", { status: 404 });

}, { port: 8000 });