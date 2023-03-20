const fs = require("fs");
const path = require("path");

const directoryPath = "./assets/output";

fs.readdir(directoryPath, (error, files) => {
  if (error) {
    console.error(error);
    return;
  }

  let index = 0;

  const next = () => {
    if (index < files.length) {
      const fileName = files[index];
      const filePath = path.join(directoryPath, fileName);

      fs.stat(filePath, (error, stats) => {
        if (error) {
          console.error(error);
          return;
        }

        if (stats.isFile()) {
          const newName = `cryptopizza_${index}.png`;

          fs.rename(filePath, path.join(directoryPath, newName), (error) => {
            if (error) {
              console.error(error);
            } else {
              console.log(`File '${fileName}' renamed to '${newName}'`);
            }

            index++;
            next();
          });
        } else {
          index++;
          next();
        }
      });
    }
  };

  next();
});
