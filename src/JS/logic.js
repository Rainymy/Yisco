"use strict";
const path = require('path');
const fs = require('fs');
const electron = require('electron').remote;
const request = require('request').defaults({ encoding: null });
const ffmpeg = require('fluent-ffmpeg');
const directories = require('../addons/directory.js');
const directory = new directories();

let config;
try {
  // let readSream = fs.createReadStream(path.resolve(__dirname, '../config/config.json'));
  let readSream = fs.createReadStream(directory.default(".config/config.json"));
  readSream.on("data", (chunk) => {
    config = JSON.parse(chunk);
  });
} 
catch (e) { config = null; console.log(e); }


const hash = (a) => Math.random().toString(36).substring(2,(2 + a)||undefined);

function getExtension(url) {
  let regex = /(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&"'>]+)/gi;
  if (url === null || url.length < 1) { return ""; }
  
  if (regex.test(url)) { return ['youtube', url.match(regex)[0]]; }
  let index = url.lastIndexOf("/");
  if (index !== -1) {
      url = url.substring(index + 1); 
      // Keep path without its segments
  }
  index = url.indexOf("?");
  if (index !== -1) {
      url = url.substring(0, index); 
      // Remove query
  }
  index = url.indexOf("#");
  if (index !== -1) {
      url = url.substring(0, index); 
      // Remove fragment
  }
  index = url.lastIndexOf(".");
  return index !== -1
      ? url.substring(index + 1) // Only keep file extension
      : ""; // No extension found
}

function download() {
  let src = decodeURIComponent(document.getElementsByTagName('input').input.value);
  let isExtension = (() => {
    let ex = getExtension(src);
    if (typeof ex === 'object') {
      if (ex[0] === 'youtube') { return 'youtube'; }
    }
    return +getExtension(src).length >= 1;
  })();
  console.log(isExtension);
  
  if ( isExtension === true ) {
    const link = (input) => {
      let temp = hash() + '.' + getExtension(input);
      return {
        name: temp,
        path: directory.write(temp),
        destination: directory.write("../" + temp)
      }
    }
    let location;
    // initialize a request
    let response_stream = (() => {
      try { return request(src); } 
      catch (e) { return; }
    })();
    
    try {
      // request events
      response_stream.on('response', (response) => {
        if (response.statusCode === 200) {
          location = link(src);
          response_stream.pipe(fs.createWriteStream(location.path));
        }
      });
      
      response_stream.on('end', () => {
        fs.rename(location.path, location.destination, (err) => {
          if (err) { throw err; }
          try { downloadFinished(); } 
          catch (e) { console.log(e); }
          console.log("Done");
        });
        statusUpdate({text: "Done downloading", status: true, progress:100});
        console.log('Finished'); 
      });
      
      response_stream.on('error', (err) => { throw err; });      
    } catch (e) { console.log(e); }
  }
  else if (isExtension === 'youtube') {
    const ytdl = require('ytdl-core');
    ytdl(src, (e, i) => {
      ytdl.getInfo(i.video_id, { filter: format => format.container === 'mp4' }, 
      (er,ir) => {
        console.log(ir);
        let format = ytdl.chooseFormat(ir.formats, { quality: 'highestvideo' });
        if (format) {
          console.log('Format found!');
          let statusId;
          statusId = statusUpdate({text: "Downloading...", progress: "break"});
          console.log(format);
          let temp = {
            name: hash(), 
            ext: format.container, 
            video_name: (() => ir.title.split(" ").join('_')
                                      .split("/").join("∕")
                                      .split("\"").join("”")
                                      .split("|").join("I")
                                      .split("?").join("⁇")
                                      .split(":").join("⠃")
                                      .split("<").join("")
                                      .split(">").join("")
                                      .split("*").join("＊")
                                      .split("\\").join("√")
                                    )()
          };
          request(format.url)
            .pipe(fs.createWriteStream(directory.write(temp.name +'.'+ temp.ext)))
            .on('finish', () => {
          format = ytdl.chooseFormat(ir.formats, { quality: 'highestaudio' });
          console.log(format);
          let temp_1 = {
            name : hash(), 
            ext: format.container
          }
          request(format.url)
            .pipe(fs.createWriteStream(directory.write(temp_1.name +'.'+ temp_1.ext)))
            .on('finish', () => {
              let first,second,temp_2;
              
              fs.readdir(directory.write(), (err, files) => {
                if (err) { return console.error(err); }
                files.forEach((item, i) => {
                  if (item === (temp.name + '.' + temp.ext)) {
                    console.log(item);
                    statusUpdate({
                      text: "Downloading: " + item,
                      id: statusId,
                      progress: 0
                    });
                    first = directory.write(item);
                  }
                  if (item === (temp_1.name + '.' + temp_1.ext)) {
                    console.log(item);
                    statusUpdate({text: item, id: statusId});
                    second = directory.write(item);
                    temp_2 = hash() + ".mp3";
                    
                    let y = async (name) => {
                      try {
                        await ffmpeg('')
                          .input(second)
                          .output(directory.write(name))
                          .on("progress", (progress) => {
                            statusUpdate({
                              text: `Converting ${temp_1.name}.${temp_1.ext} => ${name}`,
                              id: statusId,
                              progress: 100
                            });
                          })
                          .on('end', (e,i) => {
                            if (e) { return console.error(e); }
                            console.log('finished');
                            statusUpdate({
                              text: "Audio & Video download/convert complete",
                              id: statusId,
                              progress: 100
                            });
                            second = convertComplete(second, temp_2);
                            let t = async () => {
                              await ffmpeg('')
                                .mergeAdd(first)
                                .mergeAdd(second)
                                .output(directory.save_path(`${temp.video_name}.mp4`))
                                .on('error', (err, stdout, stderr) => {
                                    return console.log('err: ', err);
                                })
                                .on('progress', (progress) => {
                                  statusUpdate({
                                    text: `Merging ${temp.name}.${temp.ext} & ${temp_2}`,
                                    format: false,
                                    progress: Math.round(progress.percent),
                                    id: statusId
                                  });
                                })
                                .on('end', (ee, ii) => {
                                  if (ee) { return console.error(ee); }
                                  console.log('Whole process complete');
                                  statusUpdate({
                                    text: `
                                    Merged: <b><i>${temp.name}.${temp.ext}</i></b> & 
                                    <i><b>${temp_2}</i></b> => 
                                    <i><b>${temp.video_name}</i></b>`,
                                    format: true,
                                    progress: 100,
                                    id: statusId
                                  });
                                  try { downloadFinished(); } 
                                  catch (e) { console.log(e); }
                                  convertComplete(first);
                                  convertComplete(second);
                                })
                                .run();
                            }
                            t();
                          })
                          .run();
                      } catch (e) {
                        statusUpdate({text: e, status: false});
                        return console.error(e);
                      }
                    }
                    y(temp_2);
                  }
                });
              });
              function convertComplete(file, replace) {
                try {
                  fs.unlinkSync(file); 
                  return directory.write(replace || "");
                } 
                catch (e) { return console.error(e); }
              }
            });
          });
        }
        else {
          console.log('Format not found!');
          statusUpdate({text: "Format not found!", status: false});
        }
      });
    });
  }
}

function logicOnload() {
  const hidefile = require('hidefile');
  fs.mkdir(directory.save_path(), { recursive: false }, (err) => {
    if (/(EEXIST)/g.test(err) === true) { isFile(); return 'EEXIST'; }
    else if (err) { return err; }
    // isFile();
  });
  
  const isFile = () => {
    const folder = path.resolve(path.join(directory.save_path(), '.download'));
    fs.mkdir(folder, { recursive: false }, (err) => {
      if (/(EEXIST)/g.test(err) === true) { return 'EEXIST'; }
      else if (err) { return err; }
      hidefile.hide(folder, (error, path) => {
        if (error) { return console.error(error); }
        return 'Success';
      });
    });
  }
}
module.exports = logicOnload;