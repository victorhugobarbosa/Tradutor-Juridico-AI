const fs = require('fs');
const path = require('path');

// Minimal valid PDF binary string
const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources << /Font << /F1 5 0 R >> >>
>>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 24 Tf
100 700 Td
(Hello World Test PDF) Tj
ET
endstream
endobj
5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000157 00000 n
0000000300 00000 n
0000000394 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
492
%%EOF`;

async function testPdfUpload() {
    const filePath = path.join(__dirname, 'valid_test.pdf');

    // Write valid PDF
    fs.writeFileSync(filePath, pdfContent);
    console.log('Created valid_test.pdf');

    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('file', blob, 'valid_test.pdf');

    console.log('Uploading valid_test.pdf...');

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

    } catch (error) {
        console.error('Error during upload:', error);
    }
}

testPdfUpload();
