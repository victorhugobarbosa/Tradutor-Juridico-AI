const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    try {
        // Note: The SDK doesn't have a direct listModels method exposed easily on the client 
        // in the same way as the REST API, but we can try to use the model to generate content 
        // and see if we can get a better error or just try a known working model like 'gemini-1.0-pro'.

        // Actually, let's just try to hit the REST API directly to list models.
        const key = process.env.GOOGLE_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        console.log("Models:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
