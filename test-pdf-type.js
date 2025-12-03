const fs = require('fs');
const pdfLib = require('pdf-parse');

async function test() {
    const dataBuffer = fs.readFileSync('test.pdf');

    try {
        console.log('Trying new pdfLib.PDFParse(new Uint8Array(buffer)).getText()...');
        const uint8Array = new Uint8Array(dataBuffer);
        const instance = new pdfLib.PDFParse(uint8Array);
        const text = await instance.getText();
        console.log('Success!');
        console.log('Text:', text.substring(0, 50));
    } catch (e) {
        console.log('Failed:', e.message);
        console.error(e);
    }
}

test();
