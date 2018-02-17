const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');  // for parsing data sent in a post request
const { spawn } = require('child_process'); // for executing system commands
const command = require('node-cmd');
const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/public',express.static( path.join(__dirname,'./public')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname,"./src/index.html")));

app.post('/login', (req, res) => {
  let passcode = "d0b4e54ddd9f0982db522becb8041071";
  if(req.body.passcode == passcode) {
    res.sendFile(path.join(__dirname, "./src/pcRemote.html"));
  } else {
    res.sendFile(path.join(__dirname, "./src/index.html"));
  }
});

app.post('/commandExecuter', (req, res) => {
  switch(req.body.command) {
    case "brightness":
      run(`brightness ${req.body.value}`);  // b'coz node spawn failed to execute this command
      break;

    case "reboot":
      run("reboot");
      break;

    case "lock":
      execute("rundll32.exe", ["user32.dll", "LockWorkStation"]);
      break;
    
    case "on_monitor":
      
    case "off_monitor":
      run("toggle_monitor_brightness");
      break;
    
    case "toggle_mute":
      execute("nircmd.exe", ["mutesysvolume", "2"]);
      break;

    case "shutdown":
      run("poweroff");
      break;

    case "volume":
      let value = Math.floor( (req.body.value / 100) * 65535); // 65535 steps for volume in nircmd 
      execute("nircmd.exe", ["setsysvolume", `${value}`]);
      break;
    
    case "play_pause":
      run("keystroke 179");
      break;
    
    case "previous":
      run("keystroke 177");
      break;
    
    case "next":
      run("keystroke 176");
      break;
  }
  res.send("command will be executed");
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));

function execute(cmd, args) {
  const command = spawn(cmd, args);

  command.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  command.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  command.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

function run(cmd) {
  command.get(
      cmd,
      function(err, data, stderr){
        console.log(data);
      }
  );
}