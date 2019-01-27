const fs = require("fs-extra");
const io = require("socket.io-client");
const ss = require("socket.io-stream");
const socket = io.connect("http://localhost:3000");
const watch = require('watch');
const os = require('os').networkInterfaces();
const macaddress = require('node-macaddress');
const path = require("path")

var monitor = null;
start_monitor();

/**
 * CHECK UPDATES FROM SERVER
 */

//CREATE NEW FILE
socket.on("receive_new_file", function (data) {
  console.log("data name in client is:" + data.name);
  var filename = data.name;

  ss(socket).emit("request_file", { name: filename })
});

//UPDATE FILE
ss(socket).on("new_file", async function (stream, filename) {
  await monitor.stop();
  console.log("new_file command arrived");
  
  await stream.pipe(fs.createWriteStream("files/" + filename));
  await sleep(1000);
  await start_monitor();
})

//REMOVE FILE
socket.on("remove_file", function (data) {
  console.log(`removing new file with name ${data.name}`);
  fs.remove("./files/"+data.name)
    .catch(err => {
      console.error(err)
    })
});


//monitor checks for file changes
function start_monitor() {
  return new Promise(resolve => {
    watch.createMonitor(__dirname + "/files", function (m) {
      monitor = m;
      console.log(__dirname);

      monitor.files[__dirname + "/files" + '.zshrc'];

      monitor.on("created", async function (f, stat) {
        var stream = ss.createStream();
        console.log(`created event at location:${f}`);
        var p = f.split("/");
        var filename = p[p.length - 1];
        ss(socket).emit("create_file", stream, { name: filename });
        var readStream = fs.createReadStream("files/" + filename)
        await readStream.pipe(stream);
      });

      monitor.on("changed",async function (f, curr, prev) {

        var stream = ss.createStream();
        console.log(`changed event at location:${f}`);
        var filename = path.basename(f)
        ss(socket).emit("update_file", stream, { name: filename });
        var readStream = fs.createReadStream("files/"+filename)
        await readStream.pipe(stream)
      })
      
      monitor.on("removed", function (f, stat) {
        console.log(`removed event at location:${f}`);
        var filename = path.basename(f)
        console.log(filename);
        ss(socket).emit("remove_file", { name: filename });
      })
    })


    macaddress.all(function (err, all) {
      ss(socket).emit("login", Object.entries(all)[0][1].mac);
    });


    //console.log(fs.readFile('/etc/wpa_supplicant/wpa_supplicant.conf'));
    ss(socket).on("exit", function () {
      socket.disconnect();
    })
  })
}






function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}