module.exports = function getAllFileNameFromFolder(location) {
  if (!location) { return null; }
  const fs = require('fs');
  const path = require('path');
  function isFile(somePath) {
    try {
      return fs.lstatSync(somePath).isFile();
    } catch (e) {
      if (e.code == "ENOENT") { console.log("File Does not exist"); }
      else { console.error(e); }
      return false;
    }
  }
  function extension(somePath) {
    let ext = path.extname(somePath);
    if (ext === ".ink") { return false; }
    else if (ext === ".zip") { return false; }
    else if (ext === ".rtf") { return false; }
    else if (ext === ".txt") { return false; }
    else if (ext === ".dll") { return false; }
    else if (ext === "") { return false; }
    else { return true; }
  }
  return (() => {
    return new Promise((resolve, reject) => {
      fs.readdir(location, { encoding :"utf-8" }, (err, files) => {
        if (err) { console.log(err); return reject(err); }
        const list = [];
        let place = (yes) => path.resolve(location, yes);
        files.forEach((item, i) => {
          if (item.match(".ink")) { return false; }
          if (extension(place(item)) && isFile(place(item))) {
            list.push({ name: item, path: place(item) });
          }
        });
        resolve(list);
      });
    });
  })();
}