const express = require('express')
const path = require('path')

const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
	res.render('index.html');
})

let clients = []
const WIDTH = 960;
const HEIGHT = 640;
const powerUp = [
	{x: 128, 			y: 128, 			w: 32, h: 32},
	{x: WIDTH - 160, 	y: 100, 			w: 32, h: 32},
	{x: (WIDTH / 2), 	y: HEIGHT - 480, 	w: 32, h: 32},
	{x: 50, 			y: HEIGHT - 140, 	w: 32, h: 32},
	{x: WIDTH - 82, 	y: HEIGHT - 140, 	w: 32, h: 32},
	{x: WIDTH / 2, 		y: HEIGHT - 140, 	w: 32, h: 32},
	{x: 240, 			y: HEIGHT - 200, 	w: 32, h: 32},
	{x: WIDTH - 272, 	y: HEIGHT - 200, 	w: 32, h: 32},
	{x: 240, 			y: HEIGHT - 400, 	w: 32, h: 32},
	{x: WIDTH - 272, 	y: HEIGHT - 400, 	w: 32, h: 32},
]
let hasPowerUp = false;
let random = Math.floor(Math.random() * 11);
let power = powerUp[random]

io.on('connection', socket => {
	clients.push(socket)
	console.log('Socket Connectado' + socket.id)

	console.log('Clients', clients.length)

	socket.on('sendPosition', data => {
		let player = data
		//console.log(data)
		socket.broadcast.emit('position', data);
		let sort = Math.floor(Math.random() * 100);
		if(sort === 7){
			if(!hasPowerUp){
				socket.broadcast.emit('powerUpSend', power)
				hasPowerUp = true;
			}
		}
	})

	socket.on('getPower', data => {
		random = Math.floor(Math.random() * 11);
		power = powerUp[random]
		hasPowerUp = false;

	})

	socket.on('shot', data => {
		console.log(data)
		data.hp -= 10;
		socket.broadcast.emit('position', data);
	})

	socket.on('disconnect', () => {
		console.log(`${socket.id} disconnecting`)
		var i = clients.indexOf(socket);
		clients.splice(i, 1);
	})
})

server.listen(3000, () => {
	console.log(`Servidor na porta 3000`)
});