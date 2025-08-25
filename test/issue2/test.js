queryJson.onclick = async () => {
    let year = document.getElementById('year').value;
    let x = document.getElementById('x').value;
    let y = document.getElementById('y').value;
    let x2 = document.getElementById('x2').value;
    let y2 = document.getElementById('y2').value;
    resp2.innerText = "aaaa";
    const response = await fetch("http://localhost:8000/query-json?year=" + year + "&x=" + x + "&y=" + y + "&x2=" + x2 + "&y2=" + y2, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
    });
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
