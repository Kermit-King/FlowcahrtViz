/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");

async function test() {
  const filePath = "node_modules/pdf-parse/test/data/04-valid.pdf";
  const fileStream = fs.readFileSync(filePath);
  const blob = new Blob([fileStream], { type: "application/pdf" });

  const formData = new FormData();
  formData.append("file", blob, "04-valid.pdf");

  try {
    console.log("Sending request to http://localhost:3000/api/parse-curriculum...");
    const response = await fetch("http://localhost:3000/api/parse-curriculum", {
      method: "POST",
      body: formData,
    });
    
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
