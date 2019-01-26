var io = require("socket.io").listen(3000);
var ss = require("socket.io-stream");
var path = require("path");
var fs = require("fs-extra");
var fsr = require("fs");
const watch = require('watch');
var connected_sockets = [];

io.on("connection", function (socket) {

  connected_sockets.push(socket);
  
  /*var code;
  var users;
 
  ss(socket).on("codeGeneration", function(numberOfusers){
    code=Math.random(10000);
    users=numberOfusers;
  })
 
  ss(socket).on("joinRequest", function(addr,inputCode){
    if(inputCode==code)
    {
      fsr.appendFile('macs.txt', addr);
    }
    else {
        ss(socket).emit("exit");
    }
  });*/


  ss(socket).on("login", function (addr) {
    console.log(addr)
    fsr.stat('macs.txt', function (err, stat) {
      if (err == null) {
        fsr.readFile('macs.txt', function (err, data) {
          if (data.indexOf(addr) < 0) {
            ss(socket).emit("exit");
          }
        });
      }
      else if (err.code === 'ENOENT') {
        fsr.writeFile('macs.txt', addr + "\n", function (err) {
          if (err) {
            return console.log(err);
          }
          console.log("The file was saved!");
        });
      }
      else {
        ss(socket).emit("exit");
      }
    });
  });
  console.log("connected");
  //CREATE NEW FILE
  ss(socket).on("create_file", async function (stream, data) {
    
    console.log(`creating new file with name ${"files/" + data.name}`);
    var filename = "files/"+data.name
    console.log(filename);
    await stream.pipe(fs.createWriteStream(filename));

        console.log(connected_socket.id, socket.id);

        var stream = ss.createStream();
        ss(connected_socket).broadcast.emit("receive", stream, { name: filename });
        var readStream = fs.createReadStream(filename)
        readStream.pipe(stream);
  });
  //UPDATE EXISTING FILE
  ss(socket).on("update_file", function (stream, data) {
    let filename = "./files/" + data.name;
    //remove old file
    console.log(`removing file at path ${filename}`);

    fs.remove(filename).then(
      () => {
        console.log(`updating file at path ${filename}`);
        stream.pipe(fs.createWriteStream(filename));
      }
    )
      .catch(err => {
        console.log("error!");
        console.error(err)
      })
  });
  //REMOVE FILE
  ss(socket).on("remove_file", function (data) {
    console.log(`removing new file with name ${data.name}`);
    fs.remove("./files/" + data.name)
      .catch(err => {
        console.error(err)
      })
  });
});




/**
 * FILE SYSTEM FROM SERVER TO CLIENTS
 */
/*
watch.createMonitor(__dirname + "/files", function (monitor) {
  console.log(__dirname);

  monitor.files[__dirname + "/files" + '.zshrc'];

  monitor.on("created", function (f, stat) {

    connected_sockets.forEach((socket) => {

      var stream = ss.createStream();
      console.log(`created event at location:${f}`);
      var filename = path.basename(f)
      ss(socket).emit("create_file", stream, { name: filename });
      var readStream = fs.createReadStream("files/" + filename)
      readStream.pipe(stream);
    })
  });
  monitor.on("changed", function (f, curr, prev) {
    connected_sockets.forEach((socket) => {

      var stream = ss.createStream();
      console.log(`changed event at location:${f}`);
      var filename = path.basename(f)
      ss(socket).emit("update_file", stream, { name: filename });
      var readStream = fs.createReadStream("files/" + filename)
      readStream.pipe(stream)
    })
  })
  monitor.on("removed", function (f, stat) {
    connected_sockets.forEach((socket) => {
      console.log(`removed event at location:${f}`);
      var filename = path.basename(f)
      console.log(filename);
      ss(socket).emit("remove_file", { name: filename });
    })
  })
})

*/