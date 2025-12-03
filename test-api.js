
async function testApiWithCookies() {
    let cookie = "";
    for (let i = 1; i <= 5; i++) {
        console.log(`\nRequest ${i}...`);
        const headers = { "Content-Type": "application/json" };
        if (cookie) headers["Cookie"] = cookie;

        const response = await fetch("http://localhost:3000/api/analyze", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ text: "Contrato de teste." }),
        });

        console.log("Status:", response.status);

        // Update cookie
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
            cookie = setCookie.split(";")[0]; // Simple extraction
        }

        const data = await response.json();
        if (response.status === 429) {
            console.log("Rate Limit Hit:", data.error);
        }
    }
}

testApiWithCookies();
