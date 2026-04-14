//import fetch from "node-fetch";
import "dotenv/config";
const API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
    const res = await fetch(
        "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" + API_KEY,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: "Analyse ce feedback étudiant et donne sentiment + résumé : Le professeur explique mal mais il est gentil.",
                            },
                        ],
                    },
                ],
            }),
        }
    );

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
    console.log("API KEY:", process.env.GEMINI_API_KEY);
}

testGemini();