module.exports = function directories() {
  const path = require('path');
  const fs = require('fs');
  let config;
  const reader = (location) => {
    let filePath = path.resolve(__dirname, location);
    try { return JSON.parse(fs.readFileSync(filePath)); } 
    catch (e) {
      new Promise(async (resolve, reject) => {
        await fs.mkdir(path.resolve(filePath, "../"), { recursive: false }, (err) => {
          if (Object.prototype.toString.call(err) === "[object Error]") {
            resolve("File already exists."); 
          }
          if (err) {
            reject(err); 
          }
          resolve("Folder created");
        });
      });
      return new Promise((resolve, reject) => {
        let wrtieStream = fs.createWriteStream(filePath);
        wrtieStream.on("finish", () => {
          resolve("File Created");
        })
        wrtieStream.on("error", (err) => {
          reject("ERROR: " + err);
        })
        wrtieStream.write(JSON.stringify({ user: { save_path: this.default() } }));
        wrtieStream.end();
      });
    }
  }
  this.home = () => require('os').homedir() || process.env.HOME;
  this.save_path = (a = "") => {
    let config = reader(this.default(".config/config.json"));
    try {
      if (!config.user.save_path) { return this.default(a); }
      return path.resolve(config.user.save_path, a);
    } 
    catch (e) { return this.default(a); }
  }
  this.default = (a = "") => {
    return path.resolve(path.join(this.home(),'/ilp', a));
  }
  this.write = (b = "") => {
    return path.resolve(path.join(this.save_path() , ".download" , b));
  }
}