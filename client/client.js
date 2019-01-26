const fs = require("fs");
const io = require("socket.io-client");
const ss = require("socket.io-stream");
const socket = io.connect("http://localhost:3000");
const watch = require('watch');
const os = require('os').networkInterfaces();
const macaddress = require('node-macaddress');


socket.on("print_hello", function(){console.log("hello");})


/**
 * CHECK UPDATES FROM SERVER
 */

  //CREATE NEW FILE
  ss(socket).on("create_file", function (stream, data) {
    console.log(data);
    console.log(`creating new file with name ${data.name}`);
    var filename = path.basename("files/"+data.name);
    stream.pipe(fs.createWriteStream(filename));
  });
  //UPDATE EXISTING FILE
  ss(socket).on("update_file", function (stream, data) {
    let filename = data.name;
    console.log(data.name);

    //remove old file
    console.log(`removing file at path ${filename}`);

    fs.remove(filename).then(
      () => {
        console.log(`updating file at path ${filename}`);
        var newfile = path.basename("files/"+data.name);
        stream.pipe(fs.createWriteStream(newfile));
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
    fs.remove("files/"+data.name)
      .catch(err => {
        console.error(err)
      })
  });



//monitor checks for file changes
watch.createMonitor(__dirname, function (monitor) {
   monitor.files[__dirname + "files"+'.zshrc'];

   monitor.on("created", function (f, stat) {

       var stream = ss.createStream();
       console.log(`created event at location:${f}`);
       var p = f.split("/");
       var filename = p[p.length - 1];
       ss(socket).emit("create_file", stream, { name: filename});
       var readStream = fs.createReadStream(filename)


       const stats = fs.statSync(filename)
       const fileSizeInBytes = stats.size
       var d = new Date();
       var size = 0;
       var seconds = Math.round(d.getTime());
       readStream.on('data', function (chunk) {
           size += chunk.length;
           var currentTime = (Math.round(new Date().getTime()));
           console.log(`speed: ${ (chunk.length/1000) /( 8 * (currentTime - seconds)/1000)} mbpms`);
           seconds = currentTime;
       });
       readStream.pipe(stream);
   });
   monitor.on("changed", function (f, curr, prev) {
       var stream = ss.createStream();
       console.log(`changed event at location:${f}`);
       var p = f.split("/");
       var filename = p[p.length - 1];
       ss(socket).emit("update_file", stream, { name: filename });
       var readStream = fs.createReadStream(filename)
       readStream.pipe(stream);
   })
   monitor.on("removed", function (f, stat) {
       console.log(`removed event at location:${f}`);
       var p = f.split("/");
       var filename = p[p.length - 1];
       console.log(filename);
       ss(socket).emit("remove_file", { name: filename });
   })

   macaddress.all(function (err, all) {
     ss(socket).emit("login",Object.entries(all)[0][1].mac);
   });


   //console.log(fs.readFile('/etc/wpa_supplicant/wpa_supplicant.conf'));
   ss(socket).on("exit", function(){
     socket.disconnect();
   })
})