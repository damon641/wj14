var Sys = require('../../../../Boot/Sys');

module.exports = {
	
	roomInfo: async function (socket, data){
		try {
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room || room.length == 0) {
				return {
					status: 'fail',
					result: null,
					message: "Table not found",
					statusCode: 404
				};
			}
			let result = {
				"id": room.id,
				"tableNumber": room.tableNumber,
				"name": room.name,
				"smallBlind": parseFloat(room.smallBlind),
				"bigBlind": parseFloat(room.bigBlind),
				"minPlayers": parseFloat(room.minPlayers),
				"maxPlayers": parseFloat(room.maxPlayers),
				"minBuyIn": parseFloat(room.minBuyIn),
				"maxBuyIn": parseFloat(room.maxBuyIn),
				"type": room.type,
				"gameLimit": room.gameLimit,
				"joinedPlayer": []
			}
			room.players.forEach(function (player) {
				if (player.status != 'Left') {
					result.joinedPlayer.push(player.id)
				}
			});
			return {
				status: 'success',
				message: "table detail",
				result: result
			};
		}
		catch (e) {
			console.log("Error in roomInfo : ", e);
			return new Error(e);
		}
	},

	subscribeRoom: async function (socket, data){
		try {
			console.log("Subscribe Room is called");
			var player = await Sys.Game.Sng.Texas.Services.PlayerServices.getById(data.playerId);
			let room = await Sys.Game.Sng.Texas.Controllers.RoomProcess.checkRoomSeatAvilability(socket,data);
			if (!room || room == undefined) {
				return {
					status: 'fail',
					result: null,
					message: "Data not found",
					statusCode: 404
				};
			}
			socket.join(room.id); // Subscribe Room.
			let result = {}
			let gameNumber = '';
			if (room.game && room.status == 'Running') {
				//let sidePot = await room.game.getSidePotAmount(room);
				let sidePot = room.game.gamePot;
				console.log("sidepot and gamepot updates", sidePot);
				  /** Start ::: Custom code for Side Pot Two Player (code is Petch) */

				  let playersLength = 0;
				  for (let i = 0; i < room.players.length; i += 1) {
				    if(room.players[i].status != 'Ideal' && room.players[i].status != 'Left'){
				      playersLength += 1;
				    }
				  }
				  console.log("::: SidePot Length :",sidePot.length )
				  if(playersLength == 2 && sidePot.length > 0 ){
				    console.log("/************************************/")
				    console.log("::: SidePot :",sidePot)
				    console.log(":::  sidePot[0].sidePotAmount  :", sidePot[0].sidePotAmount )
				    console.log("::: room.game.gameMainPot :",room.game.gameMainPot)

				    //room.game.gameMainPot = + parseFloat( parseFloat(room.game.gameMainPot) + parseFloat(sidePot[0].sidePotAmount) );
				    //sidePot = [];
				    console.log("::: SidePot :",sidePot)

				    console.log("::: room.game.gameMainPot :",room.game.gameMainPot)
				    console.log("/************************************/")
				
				  }
				/** End ::: Custom code for Side Pot Two Player (code is Petch) */
				result.history = room.game.history
				result.currentRound = room.game.roundName
				result.cards = room.game.board
				result.potAmount = room.game.pot
				result.PlayerSidePot = {
					sidePot : sidePot,
					mainPot : room.game.gameMainPot
				}
				result.totalTablePotAmount = room.game.gameMainPot;
				if( (sidePot != undefined || sidePot != null) && sidePot.length > 0 ){console.log("inside sidepot", sidePot)
					result.totalTablePotAmount = + parseFloat( sidePot.reduce((partial_sum, a) => parseFloat(partial_sum) + parseFloat(a.sidePotAmount) , 0 ) + room.game.gameMainPot ).toFixed(4);
				}
				console.log("result.totalTablePotAmount", result.totalTablePotAmount)
				//result.totalTablePotAmount = room.game.bets.reduce((partial_sum, a) => partial_sum + a) + room.game.pot;
				gameNumber = room.game.gameNumber;
				

			} else {
				result.history = []
				result.currentRound = ''
				result.cards = []
				result.potAmount = 0
				result.PlayerSidePot = {sidepot:[],mainPot: 0}
				result.totalTablePotAmount = 0
			}
			socket.myData = {};

			room = await Sys.Game.Sng.Texas.Controllers.RoomProcess.broadcastPlayerInfo(room);

			if(room.game){
				let playersCards = [];
				for(let i=0; i < room.players.length; i++){
					if(room.players[i].status == 'Playing' && room.players[i].folded == false){
						playersCards.push({
							playerId : room.players[i].id,
							cards : ['BC','BC']
						});
					}
				}
				await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to([socket.id]).emit('OnSubscibePlayersCards', { playersCards : playersCards, roomId:room.id });


				// Send Player Cards in his Socket.
				for(let i=0; i < room.players.length; i++){
					console.log("####################3Socket ID ################:-",socket.id);
					console.log("####################room.players[i].status :-",room.players[i].status);
					console.log("#################### cards:-",room.players[i].cards);
					if(room.players[i].id == data.playerId && room.players[i].status == 'Playing' && room.players[i].cards.length == 2 && room.players[i].folded == false){
						await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to([socket.id]).emit('OnPlayerCards',{
							playerId : room.players[i].id,
							cards : room.players[i].cards,
							roomId: room.id
						})
					}
				}

			}

			// 
			let minBuyIn = 0;
			let maxBuyIn = 0;
			//console.log("Limit Type : ",room.limit);
			if(room.limit == 'limit'){
				// Limit Game
				minBuyIn = parseFloat(parseFloat(room.bigBlind) * 10); // minimun Buy in Amount 
				maxBuyIn = 0; // No Limit in Max Buyin Game.
			}else if(room.limit == 'no_limit'){
				// No Limit
				minBuyIn = parseFloat(parseFloat(room.smallBlind) * 40);
				maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
			}else{
				// Pot Limit
				minBuyIn = parseFloat(parseFloat(room.smallBlind) * 40);
				maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
			}

			// Check Player Chips Here.
			/* if(player.chips < minBuyIn){
				return {
					status: 'fail',
					result: null,
					message: 'Player Have Low Chips'
				};
			 }*/
			console.log("room.limit :",room.limit);

			// prebet options
			let defaultButtons = {
				playerId : data.playerId,
				sitOutNextHand : false ,
				sitOutNextBigBlind :  false,
				isFold :  false,
				isCheck :  false,
				isCall :  false,
			};
			for (let i = 0; i < room.players.length; i++) {
				if (room.players[i].id == player.id && room.players[i].status != 'Left' && room.players[i].status != 'Ideal') { // && room.players[i].status == 'Left' Remove by Me
					defaultButtons = {
					  playerId : room.players[i].id,
					  sitOutNextHand :  room.players[i].sitOutNextHand,
					  sitOutNextBigBlind :  room.players[i].sitOutNextBigBlind,
					  isFold :  room.players[i].isFold,
					  isCheck :  room.players[i].isCheck,
					  isCall :  room.players[i].isCall,
					};
					break;
				}
			}
			 await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to([socket.id]).emit('OnSubscribeRoom', {
				roomId : room.id,
				tableNumber : room.game ? `${room.tableNumber} ${room.game.gameNumber}` : '',
				gameHistory: result,
				turnTime: parseFloat(Sys.Config.Texas.RegularTimer),
				limitType : room.limit,
				minBuyIn : minBuyIn,
				maxBuyIn : maxBuyIn,
				smallBlindChips: parseFloat(room.smallBlind),
				bigBlindChips: parseFloat(room.bigBlind),
				gameId: room.game ? room.game.id : '',
				//previousGameNumber : room.previousGameNumber,
				//previousGameId : room.previousGameId,
			});
			// End
			return {
				status: 'success',
				result: {
					roomId : room.id,
					tableNumber : `${room.tableNumber} ${gameNumber}`,
					gameHistory: result,
					turnTime: parseFloat(Sys.Config.Texas.RegularTimer),
					limitType : room.limit,
					minBuyIn : minBuyIn,
					maxBuyIn : maxBuyIn,
					smallBlindChips: parseFloat(room.smallBlind),
					bigBlindChips: parseFloat(room.bigBlind),
					isTournament: true,
					defaultButtons: defaultButtons,
				},
				message: 'Player subscribed successfuly.'
			};
		}
		catch (e) {
			console.log("Error in subscribeRoom : ", e);
			return new Error(e);
		}
	},

	playerOnline: async function (socket, data){
		try {
			console.log("PlayerOnline Room is called",data);
	 
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {status: 'fail',	result: null,	message: "Room not found",statusCode: 401	};
			}

			for(let i = 0; i< room.players.length; i++){
				if(room.players[i].id == data.playerId && room.players[i].status != 'Left'){
					console.log("onIdealPlayer called", data.playerId)
					//room.players[i].status = 'Waiting';
					room.players[i].isIdeal = false;
					await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('onIdealPlayer', { 'playerId': room.players[i].id,status : false, roomId:room.id });
				}
			}

			return {
				status: 'success',
				result: data.playerId,
				message: 'Player Live now'
			};
		 
		}
		catch (e) {
			console.log("Error in playerOnline : ", e);
			return new Error(e);
		}
	},

	playerMuckAction: async function (socket, data){
		try {
			console.log("playerMuckAction Room is called");
	 
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {status: 'fail',	result: null,	message: "Room not found",statusCode: 401	};
			}

			for(let i=0; i< room.players.length; i++){
				if(room.players[i].id == data.playerId && room.players[i].status != 'Left'){
					room.players[i].muck = data.action;
				}
			}
			 
			return {
				status: 'success',
				result: data.playerId,
				message: 'Player Muck Option Done'
			};
		 
		}
		catch (e) {
			console.log("Error in playerMuckAction : ", e);
			return new Error(e);
		}
	},

	playersCards: async function (socket, data){
		try {
			console.log("reconnectGame Room is called");
		
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {status: 'fail',	result: null,	message: "Room not found",statusCode: 401	};
			}

			// Check Player Found!
			let cards = [];
			for(let i=0; i< room.players.length; i++){
				if(room.players[i].id == data.playerId && room.players[i].status == 'Playing'){
					cards = room.players[i].cards;
				}
			}
		 
			return {
				status: 'success',
				result: {
					 cards : cards
				},
				message: 'Player Cards.'
			};
		}
		catch (e) {
			console.log("Error in playersCards : ", e);
			return new Error(e);
		}
	},
	
	reconnectGame: async function (socket, data){
		try {
			console.log("Reconnect Room socket ID ############################: ",socket.id);
			console.log("reconnectGame Room is called");
			// var player = await Sys.Game.Sng.Texas.Services.PlayerServices.getById(data.playerId);
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {status: 'fail',	result: null,	message: "Room not found",statusCode: 401	};
			}

			// Check Player Found!
			let playerFound = false;
			for(let i=0; i< room.players.length; i++){
				if(room.players[i].id == data.playerId && room.players[i].status != 'Left'){
					playerFound = true;
					room.players[i].socketId = socket.id; // Update Player Socket.
				}
			}

			if(!playerFound){
				return {
					status: 'fail',
					result: null,
					message: 'Opps Game Not Running!'
				};
			}

			room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
			socket.join(room.id); // Subscribe Room.

			let result = {}
			if (room.game && room.status == 'Running') {
				let sidePot = room.game.gamePot;

				result.history = room.game.history
				result.currentRound = room.game.roundName
				result.cards = room.game.board
				result.potAmount = room.game.pot
				result.PlayerSidePot = {
					sidePot : sidePot,
					mainPot : room.game.gameMainPot
				}
				result.totalTablePotAmount = room.game.gameMainPot;
				if( (sidePot != undefined || sidePot != null) && sidePot.length > 0 ){console.log("inside sidepot", sidePot)
					result.totalTablePotAmount = + parseFloat( sidePot.reduce((partial_sum, a) => parseFloat(partial_sum) + parseFloat(a.sidePotAmount) , 0 ) + room.game.gameMainPot ).toFixed(4);
				}
				console.log("result.totalTablePotAmount", result.totalTablePotAmount)
			} else {
				result.history = []
				result.currentRound = ''
				result.cards = []
				result.potAmount = 0
				result.PlayerSidePot = { sidepot:[], mainPot: 0 }
				result.totalTablePotAmount = 0
			}
			socket.myData = {};
			
			console.log("Reconnect Game ........ Reset Game ContentBrodcast Send.")
			await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(socket.id).emit('ResetGame', {roomId: room.id});

			room = await Sys.Game.Sng.Texas.Controllers.RoomProcess.broadcastPlayerInfo(room);

			if(room.game){
				let playersCards = [];
				for(let i=0; i < room.players.length; i++){
					if(room.players[i].status == 'Playing'){
						playersCards.push({
							playerId : room.players[i].id,
							cards : ['BC','BC']
						});
					}
				}
				await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to([socket.id]).emit('OnSubscibePlayersCards', { playersCards : playersCards, roomId:room.id });


				// Send Player Cards in his Socket.
				for(let i=0; i < room.players.length; i++){
					console.log("####################3Socket ID ################:-",socket.id);
					console.log("####################room.players[i].status :-",room.players[i].status);
					console.log("#################### cards:-",room.players[i].cards);
					if(room.players[i].id == data.playerId && room.players[i].status == 'Playing'){
						await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to([socket.id]).emit('OnPlayerCards',{
							playerId : room.players[i].id,
							cards : room.players[i].cards,
							roomId: room.id
						})
					}
				}
			}
			// 
			let minBuyIn = 0;
			let maxBuyIn = 0;
			//console.log("Limit Type : ",room.limit);
			if(room.limit == 'limit'){
				// Limit Game
				minBuyIn = parseFloat(parseFloat(room.bigBlind) * 10); // minimun Buy in Amount 
				maxBuyIn = 0; // No Limit in Max Buyin Game.
			}else if(room.limit == 'no_limit'){
				// No Limit
				minBuyIn = parseFloat(parseFloat(room.smallBlind) * 40);
				maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
			}else{
				// Pot Limit
				minBuyIn = parseFloat(parseFloat(room.smallBlind) * 40);
				maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
			}

		

			 console.log("room.limit :",room.limit)
			 await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to([socket.id]).emit('OnSubscribeRoom', {
				roomId : room.id,
				tableNumber : room.game ? `${room.tableNumber} ${room.game.gameNumber}` : '',
				gameHistory: result,
				turnTime: parseFloat(Sys.Config.Texas.RegularTimer),
				limitType : room.limit,
				minBuyIn : minBuyIn,
				maxBuyIn : maxBuyIn,
				smallBlindChips: parseFloat(room.smallBlind),
				bigBlindChips: parseFloat(room.bigBlind),
				gameId: room.game ? room.game.id : '',
				//previousGameNumber : room.previousGameNumber,
				//previousGameId : room.previousGameId,
			});
			// End
			return {
				status: 'success',
				result: {
					roomId : room.id,
					tableNumber : room.game ? `${room.tableNumber} ${room.game.gameNumber}` : '',
					gameHistory: result,
					turnTime: parseFloat(Sys.Config.Texas.RegularTimer),
					limitType : room.limit,
					minBuyIn : minBuyIn,
					maxBuyIn : maxBuyIn,
					smallBlindChips: parseFloat(room.smallBlind),
					bigBlindChips: parseFloat(room.bigBlind),
				},
				message: 'Player subscribed successfuly.'
			};
		}
		catch (e) {
			console.log("Error in subscribeRoom : ", e);
			return new Error(e);
		}
	},

	unSubscribeRoom: async function (socket, data) {
		try {
			console.log("unSubscribeRoom data : ", socket.id, data);
			socket.leave(data.roomId);
			return {
				status: 'success',
				message: 'Player unsubscribed successfuly.',
				result: null
			};
		}
		catch (e) {
			console.log("Error in unSubscribeRoom : ", e);
			return new Error(e);
		}
	},

	joinRoom: async function (socket, data){
		try {
			console.log("Join Room:",data);

			var player = await Sys.Game.Sng.Texas.Services.PlayerServices.getById(data.playerId);
			data.socketId = socket.id;
			//Shiv!@# Add PlAYER check

			if (player.chips < data.chips) {
				return {
					status: 'fail',
					message: 'Insufficient chips.'
				};
			}
			var room = null;
			room = await Sys.Game.Sng.Texas.Controllers.RoomProcess.joinRoom(player, data);
			if(room instanceof Error){
				return { status: 'fail', result: null, message: room.message, statusCode: 401 }
			}
		 
			// Add roomID and playerID to Player Socket Data
			socket.myData = {};
			socket.myData.playerID = data.playerId;
			socket.myData.roomID = room.id;
			socket.myData.gameType = 'texas';
			console.log("Socket While join room : ", socket.id, socket.myData);


			if(room.game){
				let playersCards = [];
				for(let i=0; i < room.players.length; i++){
					if(room.players[i].status == 'Playing'){
						playersCards.push({
							playerId : room.players[i].id,
							cards : ['BC','BC']
						});
					}
				}
				await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to([socket.id]).emit('OnSubscibePlayersCards', { playersCards : playersCards, roomId:room.id })
			}




			return {
				status: 'success',
				message: "Player Room Joind successfuly.",
				result: {
					roomId: room.id,
					turnTime: parseFloat(parseFloat(Sys.Config.Texas.Regular) / 1000)
				}
			};
		}
		catch (error) {
			console.log('Error in JoinRoom : ', error);
			return new Error('Error in JoinRoom', error);
		}
	},

	leaveRoom: async function (socket, data) {
		try {
			
			return {
					status: 'success',
					message: 'Player Leave successfuly.',
					result: null
			};

			/*let responce = await Sys.Game.Sng.Texas.Controllers.RoomProcess.leftRoom(data);

			if(!responce){
				return { status: 'fail', result: null, message: "Something Went Wrong", statusCode: 401 }
			}

			if(responce instanceof Error){
				return { status: 'fail', result: null, message: room.message, statusCode: 401 }
			}

			if(responce.status == 'success'){
				socket.leave(data.roomId); // Unsubsribe
				return {
					status: 'success',
					message: 'Player Leave successfuly.',
					result: null
				};
			}
			else{
				return {
					status: 'success',
					message: responce.message,
					result: null
				};
			}*/
		}
		catch (e) {
			console.log("Error in leaveRoom : ", e);
			return new Error(e);
		}
	},

	sitOutNextHand: async function (socket, data){
		try {
			let responce = await Sys.Game.Sng.Texas.Controllers.RoomProcess.sitOutNextHand(data);
			return { status: 'success', result: null, message: responce.message, statusCode: 200 }
		}
		catch (e) {
			console.log('Error in JoinRoom : ', e);
			return new Error(e);
		}
	},

	sitOutNextBigBlind: async function (socket, data){
		try {
			let responce = await Sys.Game.Sng.Texas.Controllers.RoomProcess.sitOutNextBigBlind(data);
			return { status: 'success', result: null, message: responce.message, statusCode: 200 }
		}
		catch (e) {
			console.log('Error in JoinRoom : ', e);
			return new Error(e);
		}
	},

	getPlayerReBuyInChips: async function (socket, data){
		try {
			console.log("getPlayerReBuyInChips Room is called");
			var player = await Sys.Game.Sng.Texas.Services.PlayerServices.getById(data.playerId);
			if(!player){
				return { 	status: 'fail',	result: null, message: "Player Not found!",statusCode: 404	};
			}
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room || room == undefined) {
				return { 	status: 'fail',	result: null, message: "Room Not found!",statusCode: 404	};
			}
			let gamePlayer = null;
			for(let i=0; i < room.players.length; i++){
				if(room.players[i].id == data.playerId && room.players[i].status != 'Left'){
					gamePlayer = room.players[i];
				}
			}
			
			if(gamePlayer == null){
				return { status: 'fail', result: null, message: "Player Not found!",statusCode: 404	};
			}

		 
			// 
			let minBuyIn = room.bigBlind;
			let maxBuyIn = 0;
 
			if(room.limit == 'limit'){
				// Limit Game
				// maxBuyIn = 0; // No Limit in Max Buyin Game.
				maxBuyIn = player.chips; // No Limit in Max Buyin Game. // shubham
			}else if(room.limit == 'no_limit'){
				// No Limit
				maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
			}else{
				// Pot Limit
				maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
			}
			console.log("maxbuyin", maxBuyIn);
			console.log("gameplayer", gamePlayer);
			console.log("entrychips", gamePlayer.entryChips);
			console.log("extra chips", gamePlayer.extraChips)
			/*if(maxBuyIn != 0){
				maxBuyIn = (maxBuyIn - parseFloat(parseFloat(gamePlayer.entryChips)+parseFloat(gamePlayer.extraChips)));
			}*/

			/*if(gamePlayer.entryChips <  maxBuyIn){
				maxBuyIn = (maxBuyIn - parseFloat(parseFloat(gamePlayer.entryChips)+parseFloat(gamePlayer.extraChips)));
			}else{
				return {
					status: 'fail',
					result: null,
					message: 'You have already used Maximum Buy in amount.'
				};
			}*/
			//check player adding chips had 0 chips or not
			if(gamePlayer.chips <= 0){
				minBuyIn = parseFloat(parseFloat(room.smallBlind) * 40);
				console.log("player had 0 chips so add minbuy in", minBuyIn)
			} 

			//Check Player Chips Here. 
			 if(player.chips < minBuyIn){
				return {
					status: 'fail',
					result: null,
					message: 'Player Have Low Chips'
				};
			 }
			 
			 maxBuyIn = (player.chips < maxBuyIn )? player.chips : maxBuyIn ;	 
			
			// End
			return {
				status: 'success',
				result: {
					roomId : room.id,
					minBuyIn : minBuyIn,
					maxBuyIn : Math.floor(maxBuyIn),
					playerChips: player.chips
				},
				message: 'Player Re-BuyIn Chips.'
			};
		}
		catch (e) {
			console.log("Error in Re-BuyIn Chips : ", e);
			return new Error(e);
		}
	},

	playerAddChips: async function (socket, data){
		try {
			console.log("playerAddChips Room is called");
			var message='Chips will be added at the begining of the next hand';
			var player = await Sys.Game.Sng.Texas.Services.PlayerServices.getById(data.playerId);
			if(!player){
				return { 	status: 'fail',	result: null, message: "Player Not found!",statusCode: 404	};
			}
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room || room == undefined) {
				return { 	status: 'fail',	result: null, message: "Room Not found!",statusCode: 404	};
			}
			if(player.chips < parseFloat(data.chips)){
				return {
					status: 'fail',
					result: null,
					message: 'Player Have Low Chips'
				};
			 }

			let gamePlayer = null;
			for(let i=0; i < room.players.length; i++){
				if(room.players[i].id == data.playerId && room.players[i].status != 'Left'){
					gamePlayer = room.players[i];

					console.log("room.players[i].status :",room.players[i].status)


					if(room.players[i].status == 'Ideal'){
						room.players[i].status = 'Waiting';
						room.players[i].folded = true;
					}

					console.log("############## room.players[i].status :",room.players[i].status)
					room.players[i].extraChips = parseFloat(room.players[i].extraChips) + parseFloat(data.chips);
					if(room.players[i].status != 'Playing' || (room.players[i].folded == true) || room.status != 'Running' ){
						room.players[i].chips = parseFloat(room.players[i].chips) + parseFloat(room.players[i].extraChips); // Add Rebuyin Chips to Orignal Account.
						room.players[i].entryChips = parseFloat(room.players[i].entryChips) + parseFloat(room.players[i].extraChips);
						room.players[i].extraChips = 0;
						
						
						room = await Sys.Game.Sng.Texas.Controllers.RoomProcess.broadcastPlayerInfo(room);
						message = ''
						await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('onIdealPlayer', { 'playerId': room.players[i].id,status : false, roomId: room.id });
					}
				}

			}
			
			if(gamePlayer == null){
				return { status: 'fail', result: null, message: "Player Not found!",statusCode: 404	};
			}
				room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
			let chips = parseFloat(player.chips) - parseFloat(data.chips);
			let playerUpdate = await Sys.Game.Sng.Texas.Services.PlayerServices.update(player.id, { chips: chips }); // Update Player Chips
			// start game if already not running state @chetan
			let totalPlayers = 0;
			for (i = 0; i < room.players.length; i++) {
				if(room.players[i].status != 'Left' && room.players[i].status != 'Ideal'){
					totalPlayers++;
				}
			}
			
			if (room.status != 'Running' && totalPlayers >= room.minPlayers) {
				if (room.game == null && room.timerStart == false) {
					clearTimeout(Sys.Timers[room.id]); // Clear Room Timer
					room.StartGame();
				}
			}
			// End
			return {
				status: 'success',
				result: {
					roomId : room.id
				},
				message: message
			};
		}
		catch (e) {
			console.log("Error in Re-BuyIn Chips : ", e);
			return new Error(e);
		}
	},

	showMyCards: async function (socket, data){
		try {
			if( data.gameId ){
				var player = await Sys.Game.Sng.Texas.Services.PlayerServices.getById(data.playerId);
				console.log("show card player", player);
				if(!player){
					return { 	status: 'fail',	result: null, message: "Player Not found!",statusCode: 404	};
				}
				let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
				if (!room || room == undefined) {
					return { 	status: 'fail',	result: null, message: "Room Not found!",statusCode: 404	};
				}
				/*let game = await Sys.Game.Sng.Texas.Services.GameServices.getSingleGameData({_id: data.gameId});
				if (!game || game == undefined) {
					return { 	status: 'fail',	result: null, message: "Game Not found!",statusCode: 404	};
				}
				let playerCards = ['BC','BC'];
				for(let g= 0; g < game.players.length; g++){
					if(game.players[g].id == data.playerId){
						playerCards = game.players[g].cards;
						break;
					}
				}
				if(game.players.length == 0){*/
					console.log("show cards players", Sys.Rooms[data.roomId].players )
					for(let g= 0; g < Sys.Rooms[data.roomId].players.length; g++){
						if(Sys.Rooms[data.roomId].players[g].id == data.playerId){
							playerCards = Sys.Rooms[data.roomId].players[g].cards;
							break;
						}
					}
				//}
				console.log("show my cards card", playerCards)
				await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('ShowCardResult', { playerId : data.playerId, cards:playerCards, roomId: room.id });
				return {
					status: 'success',
					result: {
						gameId : data.gameId ,
						cards: playerCards
					},
				};
			}else{
				console.log("gameID ie empty", data.roomID, data.playerId);
				Sys.Log.info("gameID ie empty", data.roomID, data.playerId);
				return {
					status: 'success',
				};
			}
			
		}
		catch (e) {
			console.log("Error in showMyCards : ", e);
			return new Error(e);
		}
	},

	defaultActionSelection: async function (socket, data){
		try {
			let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return { status: 'fail',result: null,message: "Table not found", statusCode: 404 };
			}

			for(let i=0; i< room.players.length; i++){
				if(room.players[i].id == data.playerId && room.players[i].status != 'Left' && room.players[i].status != 'Ideal'){

					if(data.option == 'isFold'){
						room.players[i].isFold = true;
						room.players[i].isCheck = false;
						room.players[i].isCall = false;
					}

					if(data.option == 'removeIsFold'){
						room.players[i].isFold 	= false;
						room.players[i].isCheck = false;
						room.players[i].isCall	= false;
					}



					if(data.option == 'isCheck'){
						room.players[i].isFold = false;
						room.players[i].isCheck = true;
						room.players[i].isCall = false;
					}

					if(data.option == 'removeIsCheck'){
						room.players[i].isFold = false;
						room.players[i].isCheck = false;
						room.players[i].isCall = false;
					}


					if(data.option == 'isCall'){
						room.players[i].isFold = false;
						room.players[i].isCheck = false;
						room.players[i].isCall = true;
					}
					if(data.option == 'removeIsCall'){
						room.players[i].isFold = false;
						room.players[i].isCheck = false;
						room.players[i].isCall = false;
					}


				}
			}

			return {
				status: 'success',
				result: data.playerId,
				message: 'Player Default Action  Done'
			};

		}
		catch (error) {
			console.log("Error in defaultActionSelection : ",error);
			return new Error(error);
		}
	},





	// playersCards: async function (socket, data){
	// 	try {
	// 		console.log("reconnectGame Room is called");
		
	// 		let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
	// 		if (!room) {
	// 			return {status: 'fail',	result: null,	message: "Room not found",statusCode: 401	};
	// 		}

	// 		// Check Player Found!
	// 		let cards = [];
	// 		for(let i=0; i< room.players.length; i++){
	// 			if(room.players[i].id == data.playerId && room.players[i].status == 'Playing'){
	// 				cards = room.players[i].cards;
	// 			}
	// 		}
		 
	// 		return {
	// 			status: 'success',
	// 			result: {
	// 				 cards : cards
	// 			},
	// 			message: 'Player Cards.'
	// 		};
	// 	}
	// 	catch (e) {
	// 		console.log("Error in playersCards : ", e);
	// 		return new Error(e);
	// 	}
	// },
}
