import fs from 'fs';
import pdfParse from 'pdf-parse';

async function test() {
    try {
        const dataBuffer = fs.readFileSync('test.pdf');
        const data = await pdfParse(dataBuffer);
        console.log('Success!');
        console.log('Text:', data.text);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
