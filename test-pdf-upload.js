const fs = require('fs');
const path = require('path');

async function testPdfUpload() {
    const filePath = path.join(__dirname, 'test.pdf');

    if (!fs.existsSync(filePath)) {
        console.error('Error: test.pdf not found!');
        return;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('file', blob, 'test.pdf');

    console.log('Uploading test.pdf...');

    try {
        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: formData,
        });

        console.log(`Status: ${response.status}`);

        const text = await response.text();
        try {
            const data = JSON.parse(text);
            console.log('Response Data:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Response Text (Not JSON):', text);
        }

        // Check headers for Set-Cookie to verify rate limit logic might be touching cookies
        // Note: fetch in Node might not handle cookies automatically like a browser, 
        // but the server should still try to set them.
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            console.log('Set-Cookie Header:', setCookie);
        }

    } catch (error) {
        console.error('Error during upload:', error);
    }
}

testPdfUpload();
