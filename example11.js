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
    
});


function handler(req, res){
    fs.readFile(__dirname + "/example11.html",
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
    board.analogRead(0, function(value){
       desiredValue = value; // continuous read of analog pin 0
    });
    board.analogRead(1, function(value) {
        actualValue = value; // continuous read of pin A1
	});
	 
    io.sockets.on("connection", function(socket) {
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