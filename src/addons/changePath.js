function changeDefaultTo(location, value, elem=null) {
  const path = require('path');
  const fs = require('fs');
  const directory = new (require('../addons/directory.js'))();
  let jsonValue;
  try {
    // read JSON file
    let absolutePath = path.resolve(__dirname, location);
    let readStream = fs.createReadStream(absolutePath);
    readStream.on("data", (chunk) => jsonValue = JSON.parse(chunk));
    readStream.on("end", () => {
      jsonValue.user.save_path = value;
      let writeStream = fs.createWriteStream(absolutePath, { flag: "w" });
      writeStream.on("ready", () => {
        jsonValue.user.save_path = jsonValue.user.save_path.split("\\").join("/");
        writeStream.write(JSON.stringify(jsonValue));
        writeStream.end();
        if (elem) {
          elem.placeholder = directory.save_path();
          elem.title = elem.placeholder;
        }
        require('../JS/logic.js')();
      });
    });
  } 
  catch (e) { jsonValue = null; console.info("Invalid JSON file"); }
  return jsonValue;
}
module.exports = changeDefaultTo;