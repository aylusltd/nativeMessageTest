    var fs = require('fs');
    var util = require('util');
    var encoding = "utf8";
    var launch = new Date();
    var logFile = "C:\\Users\\Jason.Nichols\\Desktop\\Node\\log.txt"

    function fileLog(arg){
        var d = new Date();
        var e = d.toString() + " ";
        if(typeof arg != 'string'){
            arg = util.inspect(arg)
        }
        fs.appendFileSync(logFile, "    " + e + arg + "\n");
    }


    fileLog("Process Launched");

    try {
       
        process;

        fileLog("Process exists");
       

        process.stdin.on('readable', function() {
          var chunk = process.stdin.read();

          if (chunk !== null) {
            fileLog(chunk);
            process.stdout.write('{"data": "' + chunk +'"}');
          }
        });

        process.stdin.on('end', function() {
          fileLog("EOL")
          process.stdout.write('end');
        });

        fileLog("Resume")
        process.stdin.resume();
       

    }catch(e){
        fileLog(e);
    }

    fileLog("Leaving");