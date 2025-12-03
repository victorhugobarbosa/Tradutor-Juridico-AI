const fs = require('fs');
const pdf = require('pdf-parse');

async function test() {
    const dataBuffer = fs.readFileSync('test.pdf');
    try {
        const data = await pdf(dataBuffer);
        console.log('Success!');
        console.log('Text:', data.text.substring(0, 50));
    } catch (e) {
        console.log('Error:', e);
    }
}

test();
