// for(const body of dummy){
//     const id = ulid();
//     kv.set(["items",id], body);
//     let yearesr = body["decade"]["gt"];
//     let yearesl = body["decade"]["lte"] === -1 ? yearesr-50 : body["decade"]["lte"];
//     for (let i = yearesl; i < yearesr; i+=10) {
//         const id2 = ulid();
//         kv.set(["itemsDecades",i,id2], id);
//     }
// }

// const l = kv.list({prefix: ["itemsDecades"]});
// for await (const item of l) {
//     kv.delete(item.key);
// }
