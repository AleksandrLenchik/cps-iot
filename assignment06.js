var http = require("http").createServer(handler);
var io = require("socket.io").listen(http);
var fs = require("fs");//variable for file system
var firmata = require("firmata");

var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connecting to Arduino");
    console.log("Enabling analog Pin 0");
    board.pinMode(0, board.MODES.ANALOG); // analog pin 0
    console.log("Enabling analog Pin 1");
    board.pinMode(1, board.MODES.ANALOG); // analog pin 1
    console.log("Activation of Pin 8");
    board.pinMode(8, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
    console.log("Activation of Pin 13");
    board.pinMode(13, board.MODES.OUTPUT);
    console.log("Activation of Pin 9");
    board.pinMode(9, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
    
});


function handler(req, res){
    fs.readFile(__dirname + "/Assignment06.html",
    function (err, data) {
        if (err) {
            res.writeHead(500,{"Content-Type": "text/plain"});
            return res.end("Error loading HTML page.");
        }
        res.writeHead(200);
        res.end(data);
    });
    
}


http.listen(8080);// server will listen on port 8080

var desiredValue = 0; // desired value var
var actualValue = 0;


board.on("ready", function(){
        board.analogRead(0, function(value){//read
       desiredValue = value; // continuous read of analog pin 0
    });
    board.analogRead(1, function(value) {
        actualValue = value; // continuous read of pin A1
	});
	 
    io.sockets.on("connection", function(socket) {
        
        
        socket.on("commandToArduino", function(commandNo){
        if (commandNo == "0") {
             board.digitalWrite(8, board.LOW); // write LOW on pin 8 red
             board.digitalWrite(13, board.HIGH); // write LOW on pin 13
             board.digitalWrite(9, board.LOW); // write LOW on pin 9 yellow
        }
        if (commandNo == "1") {
          board.digitalWrite(8, board.LOW); // write LOW on pin 8 red
          board.digitalWrite(13, board.LOW); // write LOW on pin 13 green
          board.digitalWrite(9, board.HIGH); // write LOW on pin 9
        }
        if (commandNo == "2") {
            board.digitalWrite(8, board.HIGH); // write LOW on pin 8 red
            board.digitalWrite(13, board.LOW); // write LOW on pin 13 green
            board.digitalWrite(9, board.LOW); // write LOW on pin 9 yellow
        }
            });
        
        
        
        
        socket.emit("messageToClient", "Server connected, board ready.");
       setInterval(sendValues, 40, socket); // na 40ms we send message to client
        
    });// end of sockets.on connection
    


});// end of board.on ready

function sendValues (socket) {
    socket.emit("clientReadValues",
   {
        "desiredValue": desiredValue,
        "actualValue": actualValue
   });
};