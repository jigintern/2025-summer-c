
getJson.onclick = async () => {
    const response = await fetch("http://localhost:8000/get-json");
    resp2.innerText = await response.text();
};

queryJson.onclick = async () => {
    let lte = document.getElementById('lte').value;
    let gt = document.getElementById('gt').value;
    const response = await fetch("http://localhost:8000/query-json?lte=" + lte + "&gt=" + gt);
    resp3.innerText = await response.text();
};
// postJson.onclick = async () => {
//     const response = await fetch("http://localhost:8000/post-json",{
//             method: "POST",
//             headers: {"Content-Type": "application/json"},
//             body:JSON.stringify(data)
//         }
//     )
//     resp.innerText = await response.text();
// }
