const fs = require("fs");
const crypto = require("crypto");

const folderPath = "./assets/images";
const outputFilePath = "./assets/pizzasList.json";

fs.readdir(folderPath, (error, files) => {
  if (error) {
    console.error("Failed to read folder:", error);
    return;
  }

  const hashes = {};

  files.forEach((file) => {
    const filePath = `${folderPath}/${file}`;
    const id = file.split("_")[1];

    fs.readFile(filePath, (error, data) => {
      if (error) {
        console.error(`Failed to read file ${file}:`, error);
        return;
      }

      const hash = crypto.createHash("md5").update(data).digest("hex");
      hashes[hash] = {
        id,
        hashes: [],
        lowest: "",
      };

      if (Object.keys(hashes).length === files.length) {
        writeHashesToFile(hashes, outputFilePath);
      }
    });
  });
});

function writeHashesToFile(hashes, filePath) {
  fs.writeFile(filePath, JSON.stringify(hashes, null, 2), (error) => {
    if (error) {
      console.error(`Failed to write file ${filePath}:`, error);
      return;
    }

    console.log(`Hashes saved to ${filePath}`);
  });
}
