var io = require("socket.io").listen(3000);
var ss = require("socket.io-stream");
var path = require("path");
var fs = require("fs-extra");
var fsr = require("fs");



io.on("connection", function(socket) {
  ss(socket).on("login", function(addr){
  console.log(addr)
  fsr.stat('macs.txt', function(err,stat)
  {
    if(err == null)
    {
      fsr.readFile('macs.txt', function (err, data)
      {
        if(data.indexOf(addr) < 0)
        {
          ss(socket).emit("exit");
        }
      });
    }
    else if(err.code === 'ENOENT')
    {
      fsr.writeFile('macs.txt', addr + "\n");
    }
    else
    {
      ss(socket).emit("exit");
    }
  });
});
  console.log("connected");
    //CREATE NEW FILE
  ss(socket).on("create_file", function(stream, data) {





    console.log(data);
    console.log(`creating new file with name ${data.name}`);
    var filename = path.basename(data.name);
    stream.pipe(fs.createWriteStream(filename));
  });
  //UPDATE EXISTING FILE
  ss(socket).on("update_file", function(stream, data) {
      let filename = data.name;
      console.log(data.name);

    //remove old file
    console.log(`removing file at path ${filename}`);

    fs.remove(filename).then(
      () => {
        console.log(`updating file at path ${filename}`);
        var newfile = path.basename(data.name);
        stream.pipe(fs.createWriteStream(newfile));
      }
    )
    .catch(err => {
      console.log("error!");
      console.error(err)
    })
  });
  //REMOVE FILE
  ss(socket).on("remove_file", function(data) {
    console.log(`removing new file with name ${data.name}`);
    fs.remove(data.name)
    .catch(err => {
    console.error(err)
    })
  });
});
