var Sys = require('../../../../Boot/Sys');
const rolesArray = ['admin', 'master', 'agent', 'childAgent'];
let moment = require('moment');

module.exports = {

	checkRoomSeatAvilability: async function (socket, data) {
		try {
			let self = this
			let room = await Sys.Game.CashGame.Omaha.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Room not found",
					statusCode: 401
				};
			}
			for (let i = 0; i < room.players.length; i++) {
				if (room.players[i].id == data.playerId) {
					room.players[i].socketId = socket.id; // Update Socket Id if Old Player Found!.
				}
			}
			for (let i = 0; i < room.waitingPlayers.length; i++) {
				if (room.waitingPlayers[i].id == data.playerId) {
					room.waitingPlayers[i].socketId = socket.id; // Update Socket Id if Waiting Player Found!.
				}
			}

			return room;

		} catch (e) {
			console.log("Error: ", e);
		}
	},

	joinRoom: async function (player, data) {
		try {
			let self = this
			let waitForBigBlindCheckbox = false;
			let waitForBigBlindCheckboxValue = false;
			var room = await Sys.Game.CashGame.Omaha.Services.RoomServices.get(data.roomId);

			//console.log("1111 joinRoom room: ", room);

			if (!room || !room.players) { // //Shiv!@#
				return {
					status: 'fail',
					result: null,
					message: "Room not found",
					statusCode: 401
				};
			}
			console.log("Room Obtained");

			// chek seat in players array
			let seatAvailable = true;
			if (room.players.length > 0) {
				for (let i = 0; i < room.players.length; i++) {
					if (room.players[i].seatIndex == data.seatIndex && room.players[i].status != 'Left' && room.players[i].status != 'Ideal') {
						seatAvailable = false
						break;
					}
				}
			}
			if (room.waitingPlayers.length > 0 && seatAvailable == true) {
				for (let i = 0; i < room.waitingPlayers.length; i++) {
					if (room.waitingPlayers[i].seatIndex == data.seatIndex && room.waitingPlayers[i].status != 'Left' && room.waitingPlayers[i].status != 'Ideal') {
						seatAvailable = false
						break;
					}
				}
			}
			console.log("------------------------------------------------------------")
			console.log("----------seatAvailable :", seatAvailable)
			console.log("----------profilePicId :", parseFloat(player.profilePic))
			console.log("------------------------------------------------------------")

			//check if player alredy in array
			let oldPlayer = null;
			let isOldPlayerRemoved = false;
			if (room.players.length > 0) {
				for (let i = 0; i < room.players.length; i++) {
					if (room.players[i].id == player.id && room.players[i].status == 'Left') { // && room.players[i].status == 'Left' Remove by Me
						oldPlayer = room.players[i];
						console.log("Old Player Calculated 1");
						if(room.players.length < 2){
							oldPlayer.waitForBigBlindCheckbox = false;
							oldPlayer.waitForBigBlindCheckboxValue = false;
						}
						break;
					}
				}
			}

			if (room.waitingPlayers.length > 0 && oldPlayer == null) {
				for (let i = 0; i < room.waitingPlayers.length; i++) {
					if (room.waitingPlayers[i].id == player.id && room.waitingPlayers[i].status == 'Left') { 
						oldPlayer = room.waitingPlayers[i];
						console.log("Old Waiting Player Calculated 1");
						if(room.players.length < 2){
							oldPlayer.waitForBigBlindCheckbox = false;
							oldPlayer.waitForBigBlindCheckboxValue = false;
							room.players.push(oldPlayer);
						}
						break;
					}
				}
			}

			if (oldPlayer == null) {
				if (room.oldPlayers.length > 0) {
					for (let i = 0; i < room.oldPlayers.length; i++) {
						if (room.oldPlayers[i].id == player.id && room.oldPlayers[i].status == 'Left') { // && room.players[i].status == 'Left' Remove by Me
							oldPlayer = room.oldPlayers[i];
							console.log("Old Player Calculated 2");
							if(room.players.length < 2){
								oldPlayer.waitForBigBlindCheckbox = false;
								oldPlayer.waitForBigBlindCheckboxValue = false;
							}
							//let  playerChips = parseFloat(player.chips) - parseFloat(room.oldPlayers[i].chips)
							//await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(player.id, { chips: playerChips });
							console.log("player chipsss", player.chips, room.oldPlayers[i].chips)
							isOldPlayerRemoved = true;
							room.oldPlayers.splice(i,1);
							break;
						}
					}
				}
			}

			// if seat is available add player
			if (seatAvailable) {

				// if seatAvailable then remove players from other tables
				/*let allAvailableRamRooms = Sys.Rooms;
				let allRooms = await Sys.Game.CashGame.Omaha.Services.RoomServices.getAllRoom({});
				if(allRooms.length > 0){
				  for(let r = 0; r< allRooms.length; r++){
				  	let tId = allRooms[r]._id;
				  	console.log("check for rooms tid and roomId", tId, data.roomId)
				  	if(tId != data.roomId){
				  		let particularRoom = allAvailableRamRooms[tId];
				  		console.log("particular room", particularRoom)
				  		if(particularRoom){
				  			let removePlayers = particularRoom.players;
				  			console.log("player", removePlayers.length, removePlayers)
				  			if(removePlayers.length > 0){
				  			  for(let p =0; p < removePlayers.length; p++){
				  			  	if(removePlayers[p].id == player.id && removePlayers[p].status != 'Left'){
				  			  		console.log("player chips before player left",player.chips )
				  			  		let leftRoomPlayer = await Sys.Game.CashGame.Omaha.Controllers.RoomProcess.leftRoom({ roomId: tId, playerId: player.id });
									console.log('player lefted if in multiple table:', leftRoomPlayer);
				  			  		break;
				  			  	}
				  			  }
				  			}
				  		}
				  	}

				  }
				}*/

				let updatedPlayerChips = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(data.playerId);

				let chips = parseFloat(updatedPlayerChips.chips) - parseFloat(data.chips); // Shiv!@#

				let transactionData = {
					user_id: player.id,
					username: player.username,
					tableId: room.id,
					tableName: room.name,
					chips: data.chips,
					previousBalance: parseFloat(updatedPlayerChips.chips),
					afterBalance: chips,
					category: 'debit',
					type: 'entry',
					remark: 'Joined',
					isTournament: 'No',
					isGamePot: 'no'
				}

				console.log("omaha join player transactionData: ", transactionData);
				let date = new Date()
				let timestamp1 = date.getTime();
				let sessionId= player.uniqId + "-" + room.tableNumber+"-" +timestamp1
				await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);

				if (oldPlayer) {
					console.log("Old Player Found", oldPlayer)
					oldPlayer.chips = data.chips;
					oldPlayer.socketId = data.socketId;
					oldPlayer.seatIndex = data.seatIndex;
					oldPlayer.autoBuyin = data.autoBuyin;
					oldPlayer.avatar = parseFloat(player.profilePic);
					oldPlayer.status = 'Waiting';
					oldPlayer.sitOutNextHand = false;
					oldPlayer.sitOutNextBigBlind = false;
					oldPlayer.folded = false;
					oldPlayer.allIn = false;
					oldPlayer.talked = false;
					oldPlayer.defaultActionCount = 0;
					oldPlayer.idealTime = null;
					//oldPlayer.oldPlayerLeftTime = oldPlayer.oldPlayerLeftTime;
					oldPlayer.subscribeTime = new Date();
					oldPlayer.isAllinPlayersChipsAssigned = false;

					oldPlayer.isFold = false;
					oldPlayer.isCheck = false;
					oldPlayer.isCall = false;
					oldPlayer.longitude = player.longitude;
					oldPlayer.latitude = player.latitude;
					oldPlayer.playerName = player.username;
					oldPlayer.sessionId = sessionId;
					oldPlayer.uniqId = player.uniqId;
					oldPlayer.isAlreadyActed = false;
					console.log("ROOOM TIME BANK OMAHA",room.timeBank)
					console.log("CURRENT TIME OMAHA",moment(new Date()).format("YYYY-MM-DD HH:mm"))
					console.log("OLD TIME OMAHA",moment(new Date(oldPlayer.timeBankDate)).format("YYYY-MM-DD HH:mm"))
					console.log("ITS NEW DAY OMAHA",moment(moment(new Date()).format("YYYY-MM-DD HH:mm")).diff(moment(new Date(oldPlayer.timeBankDate)).format("YYYY-MM-DD HH:mm"),'days') > 0)
					if(moment(moment(new Date()).format("YYYY-MM-DD HH:mm")).diff(moment(new Date(oldPlayer.timeBankDate)).format("YYYY-MM-DD HH:mm"),'days') > 0){	
						oldPlayer.timeBank = room.timeBank;
						oldPlayer.timeBankDate = new Date();
					}
					if (isOldPlayerRemoved) {
						console.log("old player removed");
						if (room.players.length > 0) {
							const index = room.players.findIndex((e) => e.id === oldPlayer.id);
							const indexW = room.waitingPlayers.findIndex((e) => e.id === oldPlayer.id);
							if (index === -1 && indexW === -1) {
								console.log("old player not found so push it to array")
								let player = new Sys.Game.CashGame.Omaha.Entities.Player(oldPlayer.id, oldPlayer.socketId, oldPlayer.seatIndex, oldPlayer.playerName, oldPlayer.avatar, oldPlayer.fb_avatar, "Waiting", oldPlayer.chips, 0, oldPlayer.chips, false, false, false, [], oldPlayer.autoBuyin, 0, false, false, false, false, false, null, null, new Date(), false, false, false, 0,false, false, false, false, oldPlayer.longitude,oldPlayer.latitude,0, oldPlayer.waitForBigBlindCheckbox, oldPlayer.waitForBigBlindCheckboxValue,false,oldPlayer.uniqId,oldPlayer.sessionId,oldPlayer.isAlreadyActed,oldPlayer.timeBank,false,oldPlayer.timeBankDate);
								console.log("OLD PLAYER IS HERE1",player)
								//room.players.push(player);

								//SBBB-> If old player comes for playing game again 
								if(room.players.length > 1 && room.game != null && (room.game.status == 'Running' || room.game.status == 'Finished')){
									player.waitForBigBlindCheckbox = true;
									player.waitForBigBlindCheckboxValue = true;
									console.log("ROOM WAIT PLAYER 1")
									room.waitingPlayers.push(player);
								}else{
									console.log("ROOM  PLAYER 1")
									room.players.push(player);
								}
							}
						} else {
							console.log("old player not found so push it to array else condition")
							let player = new Sys.Game.CashGame.Omaha.Entities.Player(oldPlayer.id, oldPlayer.socketId, oldPlayer.seatIndex, oldPlayer.playerName, oldPlayer.avatar, oldPlayer.fb_avatar, "Waiting", oldPlayer.chips, 0, oldPlayer.chips, false, false, false, [], oldPlayer.autoBuyin, 0, false, false, false, false, false, null, null, new Date(), false, false, false, 0,false, false, false, false, oldPlayer.longitude,oldPlayer.latitude,0,oldPlayer.waitForBigBlindCheckbox,oldPlayer.waitForBigBlindCheckboxValue, false,oldPlayer.uniqId,oldPlayer.sessionId,oldPlayer.isAlreadyActed,oldPlayer.timeBank,false,oldPlayer.timeBankDate);
							console.log("OLD PLAYER IS HERE2",player)
							room.players.push(player);

							//SBBB-> If old player comes for playing game again 
							// if(room.players.length > 1 && room.game != null && (room.game.status == 'Running' || room.game.status == 'Finished')){
							// 	room.waitingPlayers.push(player);
							// }else{
							// 	room.players.push(player);
							// }
						}

					} else {
						console.log("check old player is in object or not, if not push it to array");
						if (room.players.length > 0) {
							const index = room.players.findIndex((e) => e.id === oldPlayer.id);
							const indexW = room.waitingPlayers.findIndex((e) => e.id === oldPlayer.id);
							if (index === -1 && indexW === -1) {
								console.log("old player not found so push it to array else");
								let player = new Sys.Game.CashGame.Omaha.Entities.Player(oldPlayer.id, oldPlayer.socketId, oldPlayer.seatIndex, oldPlayer.playerName, oldPlayer.avatar, oldPlayer.fb_avatar, "Waiting", oldPlayer.chips, 0, oldPlayer.chips, false, false, false, [], oldPlayer.autoBuyin, 0, false, false, false, false, false, null, null, new Date(), false, false, false, 0,false, false, false, false, oldPlayer.longitude,oldPlayer.latitude,0, oldPlayer.waitForBigBlindCheckbox, oldPlayer.waitForBigBlindCheckboxValue,false,oldPlayer.uniqId,oldPlayer.sessionId,false,oldPlayer.timeBank,false,oldPlayer.timeBankDate);
								console.log("OLD PLAYER IS HERE3",player)
								//room.players.push(player);
								
								//SBBB-> If old player comes for playing game again 
								if(room.players.length > 1 && room.game != null && (room.game.status == 'Running' || room.game.status == 'Finished')){
									player.waitForBigBlindCheckbox = true;
									player.waitForBigBlindCheckboxValue = true;
									console.log("ROOM WAIT PLAYER 2")
									room.waitingPlayers.push(player);
								}else{
									console.log("ROOM  PLAYER 2")
									room.players.push(player);
								}
							}
						}
					}
					let traNumber = + new Date()
					let sessionData={
						sessionId:sessionId,
						uniqId:oldPlayer.uniqId,
						username:oldPlayer.playerName,
						chips: oldPlayer.chips,
						previousBalance: parseFloat(updatedPlayerChips.chips),
						afterBalance: chips,
						type:"addChips",
						category:"debit",
						user_id:oldPlayer.id,
						transactionNumber: 'DE-' + traNumber,
						remark:"join game"
					}					
					await Sys.Game.CashGame.Omaha.Services.ChipsServices.insertData(sessionData)
				} else {
					let totalPlayingPlayers = 0;
					for (i = 0; i < room.players.length; i++) {
						if (room.players[i].status == 'Playing' && room.players[i].folded == false) {
							totalPlayingPlayers++;
						}
					}
					if(totalPlayingPlayers > 1 && room.game != null && (room.game.status == 'Running' || room.game.status == 'Finished')){
						waitForBigBlindCheckbox = true;
						waitForBigBlindCheckboxValue = true;

						let plrWait =	await room.waitingAddPlayer(player.id, data.socketId, player.username, parseFloat(player.profilePic), 0, data.chips, data.seatIndex, data.autoBuyin, new Date(),player.longitude,player.latitude,waitForBigBlindCheckbox,waitForBigBlindCheckboxValue,player.uniqId,sessionId,room.timeBank,new Date());

					}else{
						let plr =	await room.AddPlayer(player.id, data.socketId, player.username, parseFloat(player.profilePic), 0, data.chips, data.seatIndex, data.autoBuyin, new Date(),player.longitude,player.latitude,waitForBigBlindCheckbox,waitForBigBlindCheckboxValue,player.uniqId,sessionId,room.timeBank,new Date());
					}
					let traNumber = + new Date()
					let sessionData={
						sessionId:sessionId,
						uniqId:player.uniqId,
						username:player.username,
						user_id:player.id,
						chips: data.chips,
						previousBalance: parseFloat(updatedPlayerChips.chips),
						afterBalance: chips,
						remark:"join game add Chips",
						type:"addChips",
						transactionNumber: 'DE-' + traNumber,
						category:"debit"
					}
					
					await Sys.Game.CashGame.Omaha.Services.ChipsServices.insertData(sessionData)						
				}
				

				room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
				//console.log("roooommm", room)
				//console.log("Room Updated", room, oldPlayer);
				let updatedPlayerChipsTemp = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(data.playerId);
				let playerUpdate = await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(player.id, { chips: chips });
				//Shiv!@#
				// Add Player Chips Transection Here.


				console.log("Player Updated", room.players.length, updatedPlayerChips.chips);
				if (room.players.length > 0) {

					room = await Sys.Game.CashGame.Omaha.Controllers.RoomProcess.broadcastPlayerInfo(room);

					// Game Start
					let totalPlayers = 0
					room.players.forEach(function (player) {
						if (player.status != 'Left' && player.status != 'Ideal') {
							totalPlayers += 1;
						}
					})
					console.log('Player Length ->>>>>', totalPlayers);
					console.log('Status :: ', room.status)
					console.log('room.timerStart :: ', room.timerStart)
					// console.log('Minimum Player', room.minPlayers)
					console.log("pgame starting join room room status before", room.status);
					if (room.status != 'Running' && totalPlayers >= room.minPlayers) {
						if (room.game == null && room.timerStart == false) {
							room.timerStart = true; // When 12 Second Countdown Start.
							room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);

							//console.log("roomroomroomroomroom: ", room);

							await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('OnGameStartWait', { roomId: room.id })
							console.log('Game object not present 2');
							Sys.Timers[room.id] = setTimeout(function () {
								room.timerStart = false; // Reset Timer Variable
								clearTimeout(Sys.Timers[room.id]); // Clear Room Timer
								clearInterval(Sys.Timers[room.id]);
								console.log("Game Starting....");

								totalPlayers = 0;
								for (i = 0; i < room.players.length; i++) {
									if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal') {
										totalPlayers++;
									}
								}
								console.log('<===============================>');
								console.log('<=> Game Starting [] New <=>', totalPlayers);
								console.log("pgame starting join room room status", room.status);
								console.log('<===============================>');
								if (totalPlayers >= room.minPlayers && room.status != 'Running') {
									console.log("**************************************");
									console.log("room started from Join room")
									console.log("**************************************");
									room.timerStart = true;
									room.StartGame();
								} else {
									console.log('<=> Some Player Leave So not Start Game. <=>', totalPlayers);
								}

							}, Sys.Config.Texas.waitBeforeGameStart)
						}
					}

					return room;
				}

			} else {
				console.log('Seat is not available.');
				return new Error('Seat is not available');
			}
		} catch (error) {
			Sys.Log.info('Error in JoinRoom : ' + error);
			return new Error('Error in JoinRoom Process', error);
		}
	},

	leftRoom: async function (data) {
		try {
			console.log("LeftRoom Data", data);
			if (!data.roomId) {
				return { status: 'fail', result: null, message: "Room Not Found", statusCode: 401 };
			}
			var room = await Sys.Game.CashGame.Omaha.Services.RoomServices.get(data.roomId);
			if (!room) {
				return { status: 'fail', result: null, message: "Room Not Found", statusCode: 401 };
			}

			let waitingPlayerLeft =  await Sys.Game.CashGame.Omaha.Controllers.RoomProcess.leftRoomForWaitingPlayers(data);
			
			if(waitingPlayerLeft.status == 'success'){
				return waitingPlayerLeft;
			}
			/*if(room.game == 'Running'){
				if(room.getCurrentPlayer().id == data.playerId){
					await Sys.Game.CashGame.Omaha.Controllers.PlayerProcess.changePlayerTurn(room);
				}
			}*/
			//check for user already present //
			// chek seat in players array
			let player = null;
			let isAllinPlayerWhenLefted = false;
			let leftedPlayerIndexId;
			if (room && room.players && room.players.length > 0) {
				for (let i = 0; i < room.players.length; i++) {
					if (room.players[i].id == data.playerId && room.players[i].allIn == true) {
						room.players[i].isAllInLefted = true;
						room.players[i].idealTime = null;
						room.players[i].oldPlayerLeftTime = new Date();
						isAllinPlayerWhenLefted = true;

						room.players[i].sitOutNextHand = false;
						room.players[i].sitOutNextBigBlind = false;
						room.players[i].defaultActionCount = 0;

						player = room.players[i];
						leftedPlayerIndexId = i;
					}

					if (room.players[i].id == data.playerId && room.players[i].status != 'Left' && room.players[i].allIn == false) {

						//room.players[i].status = "Left";
						room.players[i].idealTime = null;
						room.players[i].oldPlayerLeftTime = new Date();
						if (room.players[i].allIn == true) {
							isAllinPlayerWhenLefted = true;
						}
						leftedPlayerIndexId = i;

						room.players[i].sitOutNextHand = false;
						room.players[i].sitOutNextBigBlind = false;
						room.players[i].defaultActionCount = 0;
						room.players[i].considerLeftedPlayer = true;

						player = room.players[i];
						break;
					}
				}
			}
			if (player) {

				let playersCount = 0;
				if (room.game && room.game.status == 'Running') {
					let totalPlayingPlayers = 0;
					for (i = 0; i < room.players.length; i++) {
						if (room.players[i].status == 'Playing' && room.players[i].folded == false) {
							totalPlayingPlayers++;
						}
					}
					console.log("totalplayers", totalPlayingPlayers)
					if (player.folded === false && player.status == 'Playing') {
						if (totalPlayingPlayers <= 1) {
							console.log("player left less than 1 player")
							clearTimeout(Sys.Timers[room.id]);
							room.removePlayer(player.id);
							/*room.game.status = 'ForceFinishedFolded';
							console.log("forcefinishFOldwd 29-4",room.game.status)*/
						} else {
							if (player.isAllInLefted == false) {
								console.log("player left gretaer than 1 player")
								room.removePlayer(player.id);
							}

						}
					}

				}else{
					console.log("player left game stuck issue", room.status)
					if(room.status == 'Running'){
						if (player.folded === false && player.status == 'Playing') {
							console.log("player left game stuck issue, remove player");
							//room.removePlayer(player.id);
							for (let i = 0; i < room.players.length; i++) {
								if (room.players[i].id == data.playerId) {
									room.players[i].status = "Left";
									room.players[i].folded = true;
									room.players[i].talked = true;
								}
							}
						}		
					}
				}

				if (player.status != 'Left' && player.allIn == false) {
					/*if (player.status == 'Waiting') {
						room.players[leftedPlayerIndexId].isSidepot = true;
					}*/
					room.players[leftedPlayerIndexId].status = "Left";
				}

				await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
				console.log("Player Left ", player.id);
				if (player.isAllInLefted == false) {
					await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('PlayerLeft', { 'playerId': player.id, roomId: room.id });
				}
				console.log("----leftedPlayerIndexId-----out", leftedPlayerIndexId);
				//let dataPlayer = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(player.id);
				//if (dataPlayer && isAllinPlayerWhenLefted == false) {
				if ( isAllinPlayerWhenLefted == false) {
					await Sys.Game.CashGame.Texas.Controllers.PlayerController.assignCashToPlayers(room, player.id, false);
					console.log("assignCashToPlayers called from leftRoom function");		
					/*console.log("Chips", dataPlayer.chips, player.chips);
					let chips = parseFloat(dataPlayer.chips) + parseFloat(player.chips) + parseFloat(player.extraChips);
					console.log("Chips", dataPlayer.chips, player.chips, chips);
					//room.players[leftedPlayerIndexId].extraChips = 0;
					var playerUpdate = await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(player.id, { chips: chips, extraChips: 0 });

					// added by K@Y
					let traNumber = + new Date()
					let sessionData={
						sessionId:player.sessionId,
						uniqId:player.uniqId,
						user_id:player.id,
						username:dataPlayer.username,
						chips: player.chips,
						previousBalance: parseFloat(dataPlayer.chips),
						afterBalance: chips,
						type:"leftChips",
						remark:"game left",
						transactionNumber: 'DEP-' + traNumber,
						category:"credit"
					}
					await Sys.Game.CashGame.Omaha.Services.ChipsServices.insertData(sessionData)
					let transactionData = {
						user_id: dataPlayer.id,
						username: dataPlayer.username,
						// gameId						:	room.game.id,
						chips: (parseFloat(player.chips) + parseFloat(player.extraChips)),
						previousBalance: parseFloat(dataPlayer.chips),
						afterBalance: parseFloat(chips),
						category: 'credit',
						type: 'leave',
						remark: 'Credit BuyIn Chips With Main Balance'
					}
					console.log("00000");
					// await Sys.Game.CashGame.Omaha.Services.ChipsServices.createTransaction(transactionData);

					var logGameId = "";
					var logGameNum = "";
					if(room.game != null){
						logGameId = room.game.id;
						logGameNum = room.game.gameNumber;
					}

					let transactionDataLeft = {
	                    user_id: dataPlayer.id,
	                    username: dataPlayer.username,
	                    gameId: logGameId,
	                    gameNumber: logGameNum,
	                    tableId: room.id,
	                    tableName: room.name,
	                    chips: (parseFloat(player.chips) + parseFloat(player.extraChips)),
	                    previousBalance: parseFloat(dataPlayer.chips),
	                    afterBalance: parseFloat(chips),
	                    category: 'credit',
	                    type: 'entry',
	                    remark: 'Left',
	                    isTournament: 'No',
	                    isGamePot: 'no'
	                }

	                console.log("omaha Player left transactionDataLeft: ", transactionDataLeft);
	                await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataLeft);

					console.log("player update on chips assign", playerUpdate, player.id)
					room.players[leftedPlayerIndexId].isAllinPlayersChipsAssigned = true;

					console.log("----leftedPlayerIndexId-----", leftedPlayerIndexId);
					room.players[leftedPlayerIndexId].extraChips = 0;

					console.log("room.players[i].isAllinPlayersChipsAssigned in playerleft", room.players[leftedPlayerIndexId].isAllinPlayersChipsAssigned, room.players[leftedPlayerIndexId].playerName)
					let updatedRoom = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);*/

					return { status: 'success', result: room.id, message: "Room Left Sccess", statusCode: 200 };
				} else {
					return { status: 'success', result: room.id, message: "Room Left Sccess", statusCode: 401 };
					// for all in player extrachips
					/*if(player.extraChips > 0){
						console.log("assign lefted player with allIn extra chips");
						let chips = parseFloat(dataPlayer.chips) + parseFloat(player.extraChips);
						let playerUpdate = await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(player.id, { chips: chips, extraChips: 0 });
						let traNumber = + new Date()
						let sessionData={
							sessionId:player.sessionId,
							uniqId:player.uniqId,
							user_id:player.id,
							username:dataPlayer.username,
							chips: player.extraChips,
							previousBalance: parseFloat(dataPlayer.chips),
							afterBalance: chips,
							type:"leftChips",
							remark:"game left",
							transactionNumber: 'DEP-' + traNumber,
							category:"credit"
						}
						await Sys.Game.CashGame.Omaha.Services.ChipsServices.insertData(sessionData)
						room.players[leftedPlayerIndexId].extraChips = 0;
					}
					return { status: 'fail', result: null, message: "Player not found", statusCode: 401 };*/
				}
			} else {
				console.log(" No Player Found -----#### ");
				return { status: 'fail', result: null, message: "Player not found", statusCode: 401 };
			}
		} catch (error) {
			console.log("Error:", error);
			return new Error("Error in Left Room");
		}
	},

	newRoundStarted: async function (room) {
		try {
			room.otherData.isCardDistributed = false;
			console.log("New round Started", room.players, room.game.gameNumber);
			// console.log("Room game======>", room.game);
			var room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room)
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Room not found",
					statusCode: 401
				};
			}

			let bigBlindPlayerList = [];
			for(let i=0;i<room.players.length;i++){
				if(room.players[i].waitForBigBlindCheckbox == true && room.players[i].waitForBigBlindCheckboxValue == false){
					bigBlindPlayerList.push({
					playerId : room.players[i].id,
					chips : parseFloat(room.game.bets[i]),
					playerChips : room.players[i].chips
				});
				}
			}
			console.log("BIG BLIND PLAYERS",bigBlindPlayerList)
			for (let i = 0; i < room.players.length; i++) {
				if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal' ) {
					room.players[i].waitForBigBlindCheckbox = false;
					room.players[i].waitForBigBlindCheckboxValue = false;
				}
			  }

			  if(room.players.length > 1){
				room.oldDealerIndex = room.players[room.dealerIndex].seatIndex;
				room.oldSmallBlindIndex = room.players[room.smallBlindIndex].seatIndex;
				room.oldBigBlindIndex = room.players[room.bigBlindIndex].seatIndex;
			}else{
				room.oldDealerIndex = null;
				room.oldSmallBlindIndex = null;
				room.oldBigBlindIndex = null;
			}

			  room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);

			// Send Game Boot Data.

			let bootGameData = {
				smallBlindPlayerId: room.getSmallBliendPlayer().id,
				smallBlindChips: parseFloat(room.game.bets[room.smallBlindIndex]),
				smallBlindPlayerChips: parseFloat(room.getSmallBliendPlayer().chips),
				bigBlindPlayerId: room.getBigBliendPlayer().id,
				bigBlindChips: parseFloat(room.game.bets[room.bigBlindIndex]),
				bigBlindPlayerChips: parseFloat(room.getBigBliendPlayer().chips),
				dealerPlayerId: room.getDealer().id,
				roomId: room.id,
				totalTablePotAmount: + parseFloat(room.game.bets.reduce((partial_sum, a) => partial_sum + a) + room.game.pot).toFixed(4),
				bigBlindPlayerList : bigBlindPlayerList
			}
			await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('OnGameBoot', bootGameData);



			Sys.Timers[room.id] = setTimeout(async function (room) {
				// Event for Cards Distribution.
				let playersCards = [];
				for (let i = 0; i < room.players.length; i++) {
					console.log("Status  :-", room.players[i].status, room.game.gameNumber);
					console.log("Name  :-", room.players[i].playerName, room.game.gameNumber);

					if (room.players[i].status == 'Playing') {
						console.log("playing player Name card distribute 1: ", room.players[i].playerName)
						playersCards.push({
							playerId: room.players[i].id,
							cards: ['BC', 'BC','BC','BC']
						});
					}
				}
				await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('OnPlayersCardsDistribution', { playersCards: playersCards, roomId: room.id })
				let flipAnimation = true;
				Sys.Timers[room.id] = setTimeout(async function (room) {
					// Send Player Cards in his Socket.
					for (let i = 0; i < room.players.length; i++) {
						console.log("playing player Name card distribute 2: ", room.players[i].status)
						if (room.players[i].status == 'Playing') {
							console.log("playing player Name card distribute 2: ", room.players[i].playerName)
							console.log("playing player Name card distribute room.players[i].socketId: ", room.players[i].socketId)
							console.log("playing player Name card distribute room.players[i].cards: ", room.players[i].cards)
							await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to([room.players[i].socketId]).emit('OnPlayerCards', {
								playerId: room.players[i].id,
								cards: room.players[i].cards,
								roomId: room.id,
								flipAnimation: flipAnimation
							})
						}

					}
					room.otherData.isCardDistributed = true;

					let timer = parseFloat(Sys.Config.Texas[room.otherData.gameSpeed]);
					let buttonAction = room.getCurrentTurnButtonAction();
					console.log(buttonAction);
					let totalPlayingPlayers = 0;
					for (i = 0; i < room.players.length; i++) {
						if (room.players[i].status == 'Playing' && room.players[i].folded == false) {
							totalPlayingPlayers++;
						}
					}
					console.log("Player Timer Send 1 buttonAction: ", buttonAction);
					if (totalPlayingPlayers > 1) {
						let isRunningBank = true;
						let	extraTimerOn = false;
						let maxTime = 0;
						Sys.Timers[room.id] = setInterval(async function (room) {
							console.log("Player Timer Send 1 : ", timer, room.game.gameNumber, room.getCurrentPlayer().isUseTimeBank);

							timer--;
							if(room.getCurrentPlayer().isUseTimeBank == true){
								if(room.getCurrentPlayer().timeBank > 0){
									room.getCurrentPlayer().timeBank = parseInt(room.getCurrentPlayer().timeBank) - 1;
								}else{
									room.getCurrentPlayer().timeBank = 0;
								}
							}
							if (timer < 0) {
								if(room.getCurrentPlayer().timeBank > 0){
									extraTimerOn = true;
									room.getCurrentPlayer().isUseTimeBank = true;
									timer = parseInt(timer) + parseInt(room.getCurrentPlayer().timeBank);
									maxTime = timer;
								}else{
									clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
									clearInterval(Sys.Timers[room.id]);
									room.players[room.currentPlayer].isAlreadyActed = true;
									console.log("room players in newRoundStarted", room.players); 
									Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
								}
								
							}else{
								if(room.getCurrentPlayer().isUseTimeBank == true && extraTimerOn != true){
									if(isRunningBank == true){
										timer = parseInt(timer) + parseInt(room.getCurrentPlayer().timeBank);
										isRunningBank = false;
										maxTime = timer;
									}
								}
								await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('OnTurnTimer', {
									playerId: room.getCurrentPlayer().id,
									timer: timer,
									maxTimer: (maxTime > 0) ? maxTime : parseFloat(Sys.Config.Texas[room.otherData.gameSpeed]),
									buttonAction: buttonAction,
									roomId: room.id,
									isLimitGame : (room.limit == 'limit' || room.limit == "Hi-Lo-limit") ?  true : false,
									timeBank: (room.getCurrentPlayer().isUseTimeBank == true) ? 0 : room.getCurrentPlayer().timeBank
								});
							}					
							
						}, 1000, room);
					}

				}, (500), room);  // open players cards quickly
				//}, (500 * room.players.length) , room);
			}, (1000 * parseFloat(Sys.Config.Texas.waitBeforeCardDistribut)), room);
			return
		} catch (e) {
			console.log("Error:", e);
		}
	},

	newGameStarted: async function (room) {
		try {
				console.log("Game Started Brodcast");
			await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('GameStarted', {
				message: 'starting first round',
				gameId: room.game.id,
				gameNumber: `${room.tableNumber} ${room.game.gameNumber}`,
				roomId: room.id
				//previousGameNumber : room.previousGameNumber,
				//previousGameId : room.previousGameId,
			});
		} catch (e) {
			console.log("Error:", e);
		}
	},


	playerUpdateAutoBuyIn: async function (data) {
		try {

			let room = await Sys.Game.CashGame.Omaha.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Player not found",
					statusCode: 401
				};
			}
			var currentPlayer = room.getPlayerById(data.playerId)
			if (!currentPlayer) {
				return {
					status: 'fail',
					result: null,
					message: "Player not in table",
					statusCode: 401
				};
			}
			currentPlayer.autoBuyin = data.autoBuyin
			room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
			return {};
		} catch (e) {
			console.log("Error:", e);
		}
	},

	playerAction: async function (data) {
		try {
			let room = await Sys.Game.CashGame.Omaha.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Room not found",
					statusCode: 401
				};
			}

			var currentPlayer = room.getCurrentPlayer();console.log("currentPlayer.isAlreadyActed", currentPlayer.isAlreadyActed);
			if ( ( currentPlayer && (currentPlayer.id != data.playerId) ) || ( currentPlayer.isAlreadyActed == true ) || ( room.game.roundName == 'Showdown' )) {
				return console.log('Its not your turn or your turn expired');
			}
			if (room.game.status == 'Running' && room.game.roundName != 'Showdown') {
				currentPlayer.defaultActionCount = 0;
				currentPlayer.idealTime = null;

				clearTimeout(Sys.Timers[room.id]);
				clearInterval(Sys.Timers[room.id]);
				if(room.getCurrentPlayer().isUseTimeBank == true){
					room.getCurrentPlayer().isUseTimeBank = false;
				}
				currentPlayer.isAlreadyActed = true;
				console.log("room players in turnFinished 1", room.players); 
				switch (data.action) {
					case Sys.Config.Texas.Check:
						if (room.check(data.playerId, data.hasRaised)) {
							return currentPlayer.turnBet;
						} else {
							return console.log('This is not your turn');
						}
						break
					case Sys.Config.Texas.Fold:
						if (room.fold(data.playerId, data.hasRaised)) {
							return currentPlayer.turnBet;
						} else {
							return console.log('This is not your turn');
						}
						break
					case Sys.Config.Texas.Call:
						if (room.call(data.playerId, data.hasRaised)) {
							return currentPlayer.turnBet;
						} else {
							return console.log('This is not your turn');
						}
						break
					case Sys.Config.Texas.Bet:
						if (room.bet(data.playerId, data.betAmount, data.hasRaised)) {
							return currentPlayer.turnBet;
						} else {
							return console.log('This is not your turn');
						}
						break
					case Sys.Config.Texas.AllIn:
						if (room.AllIn(data.playerId, data.hasRaised)) {
							return currentPlayer.turnBet;
						} else {
							return console.log('This is not your turn');
						}
						break
					default:
						return console.log('Selected action not found');
				}
			} else {
				return console.log('Game is not running');
			}
		}
		catch (e) {
			console.log("Error in playerAction :", e);
			return new Error(e);
		}
	},

	turnFinished: async function (room) {
		try {
			/* for (let i = 0; i < room.players.length; i++) {
				room.players[i].isAlreadyActed =false;
			} */
			console.log("isPreventMultipleTurn", room.otherData.isPreventMultipleTurn);
			if(room.otherData.isPreventMultipleTurn == true){
				console.log("in isPreventMultipleTurn");
				return false;
			}
			room.otherData.isPreventMultipleTurn = true;
			if (room.otherData.isCardDistributed == false) {

				clearTimeout(Sys.Timers[room.id]);
				clearInterval(Sys.Timers[room.id]);
				room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
				console.log('TurnFinished in without card distribution', parseFloat(Sys.Config.Texas[room.otherData.gameSpeed]))

				let playersCards = [];
				for (let i = 0; i < room.players.length; i++) {
					console.log("Status  :-", room.players[i].status, room.game.gameNumber);
					console.log("Name  :-", room.players[i].playerName, room.game.gameNumber);

					if (room.players[i].status == 'Playing') {
						console.log("playing player Name card distribute 1: ", room.players[i].playerName)
						playersCards.push({
							playerId: room.players[i].id,
							cards: ['BC', 'BC','BC','BC']
						});
					}
				}
				await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('OnPlayersCardsDistribution', { playersCards: playersCards, roomId: room.id })

				Sys.Timers[room.id] = setTimeout(async function (room) {
					// Send Player Cards in his Socket.
					for (let i = 0; i < room.players.length; i++) {
						if (room.players[i].status == 'Playing') {
							console.log("playing player Name card distribute 2: ", room.players[i].playerName)
							await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to([room.players[i].socketId]).emit('OnPlayerCards', {
								playerId: room.players[i].id,
								cards: room.players[i].cards,
								roomId: room.id
							})
						}

					}
					room.otherData.isCardDistributed = true;

					if (room.getCurrentPlayer()) {
						let turnBetData = room.getPreviousPlayerAction();
						await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('PlayerAction', {
							action: turnBetData,
							roomId: room.id,
							playerBuyIn: (turnBetData.playerId) ? parseFloat(room.getPlayerById(turnBetData.playerId).chips) : 0,
							totalTablePotAmount: + parseFloat(room.game.bets.reduce((partial_sum, a) => partial_sum + a) + room.game.pot).toFixed(4),
						});


						// await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('NextTurnPlayer', {
						// 	nextTurnPlayerId: room.getCurrentPlayer().id
						// });

						let timer = parseFloat(Sys.Config.Texas[room.otherData.gameSpeed]);
						let buttonAction = room.getCurrentTurnButtonAction();
						//console.log(buttonAction);

						let totalPlayingPlayers = 0;
						for (i = 0; i < room.players.length; i++) {
							room.players[i].isAlreadyActed =false;
							if (room.players[i].status == 'Playing' && room.players[i].folded == false) {
								totalPlayingPlayers++;
							}
						}
						console.log("totalplaying players", totalPlayingPlayers, room.players, room.game.gameNumber, room.game.status, room.status)
						console.log("Player Timer Send 2 buttonAction: ", buttonAction);
						if (totalPlayingPlayers > 1) {
							let isRunningBank = true;
							let extraTimerOn = false;
							let maxTime = 0;
							Sys.Timers[room.id] = setInterval(async function (room) {
								try {
									console.log("Player Timer Send 2 : ", timer, room.game.gameNumber);
									
									timer--;
									if(room.getCurrentPlayer().isUseTimeBank == true){
										if(room.getCurrentPlayer().timeBank > 0){
											room.getCurrentPlayer().timeBank = parseInt(room.getCurrentPlayer().timeBank) - 1;
										}else{
											room.getCurrentPlayer().timeBank = 0;
										}
									}
									if (timer < 0) {
										if(room.getCurrentPlayer().timeBank > 0){
											extraTimerOn = true;
											room.getCurrentPlayer().isUseTimeBank = true;
											timer = parseInt(timer) + parseInt(room.getCurrentPlayer().timeBank);
											maxTime = timer;
										}else{
											clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
											clearInterval(Sys.Timers[room.id]);
											room.players[room.currentPlayer].isAlreadyActed = true;
											console.log("room players in turnFinished 1", room.players); 
											Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
										}
									}else{
										if(room.getCurrentPlayer().isUseTimeBank == true && extraTimerOn != true){
											if(isRunningBank == true){
												timer = parseInt(timer) + parseInt(room.getCurrentPlayer().timeBank);
												isRunningBank = false;
												maxTime = timer;
											}
										}
										await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('OnTurnTimer', {
											playerId: room.getCurrentPlayer().id,
											timer: timer,
											roomId: room.id,
											maxTimer: (maxTime > 0) ? maxTime : parseFloat(Sys.Config.Texas[room.otherData.gameSpeed]),
											buttonAction: buttonAction,
											defaultButtons: room.getDefaultButtons(),
											isLimitGame : (room.limit == 'limit' || room.limit == "Hi-Lo-limit") ?  true : false,
											timeBank: (room.getCurrentPlayer().isUseTimeBank == true) ? 0 : room.getCurrentPlayer().timeBank
										});
									}			
									
								} catch (e) {
									console.log("Catched Error in RoomProcss.turnFinished :", e);
								}
							}, 1000, room);
						}

					}


				}, (250), room);  // open players cards quickly
				console.log("isPreventMultipleTurn in turnFinish if", room.otherData.isPreventMultipleTurn)
				room.otherData.isPreventMultipleTurn = false;
			} else {
				clearTimeout(Sys.Timers[room.id]);
				clearInterval(Sys.Timers[room.id]);
				room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
				console.log('TurnFinished', parseFloat(Sys.Config.Texas[room.otherData.gameSpeed]))
				if (room.getCurrentPlayer()) {
					let turnBetData = room.getPreviousPlayerAction();
					await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('PlayerAction', {
						action: turnBetData,
						roomId: room.id,
						playerBuyIn: (turnBetData.playerId) ? parseFloat(room.getPlayerById(turnBetData.playerId).chips) : 0,
						totalTablePotAmount: + parseFloat(room.game.bets.reduce((partial_sum, a) => partial_sum + a) + room.game.pot).toFixed(4),
					});
					// reset prebet options
					for (let p = 0; p < room.players.length; p++) {
						if (room.players[p].id == turnBetData.playerId) {
							room.players[p].isCheck = false;
							room.players[p].isFold = false;
							room.players[p].isCall = false;
						}
					}
					// await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('NextTurnPlayer', {
					// 	nextTurnPlayerId: room.getCurrentPlayer().id
					// });

					let timer = parseFloat(Sys.Config.Texas[room.otherData.gameSpeed]);
					let buttonAction = room.getCurrentTurnButtonAction();
					//console.log(buttonAction);

					let totalPlayingPlayers = 0;
					for (i = 0; i < room.players.length; i++) {
						room.players[i].isAlreadyActed =false;
						if (room.players[i].status == 'Playing' && room.players[i].folded == false) {
							totalPlayingPlayers++;
						}
					}
					console.log("totalplaying players", totalPlayingPlayers, room.players, room.game.gameNumber, room.game.status, room.status)
					console.log("Player Timer Send 2 buttonAction: ", buttonAction);
					if (totalPlayingPlayers > 1) {
						let isRunningBank = true;
						let extraTimerOn = false;
						let maxTime = 0;
						Sys.Timers[room.id] = setInterval(async function (room) {
							try {
								console.log("Player Timer Send 2 : ", timer, room.game.gameNumber);
								
								timer--;
								if(room.getCurrentPlayer().isUseTimeBank == true){
									if(room.getCurrentPlayer().timeBank > 0){
										room.getCurrentPlayer().timeBank = parseInt(room.getCurrentPlayer().timeBank) - 1;
									}else{
										room.getCurrentPlayer().timeBank = 0;
									}
								}
								// For Player Default Action
								let maxBet = parseFloat(room.getMaxBet(room.game.bets));
								let yourBet = parseFloat(room.game.bets[room.currentPlayer]);
								let playerChips = parseFloat(room.players[room.currentPlayer].chips);

								if (timer < 0) {
									if(room.getCurrentPlayer().timeBank > 0){
										extraTimerOn = true;
										room.getCurrentPlayer().isUseTimeBank = true;
										timer = parseInt(timer) + parseInt(room.getCurrentPlayer().timeBank);
										maxTime = timer;
									}else{
										clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
										clearInterval(Sys.Timers[room.id]);
										room.players[room.currentPlayer].isAlreadyActed = true;
										console.log("room players in turnFinished 2", room.players); 
										Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
									}
									
								}else if(room.getCurrentPlayer().isCheck == true){
									if (maxBet == yourBet) {
										//room.check(room.getCurrentPlayer().id);
										Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: 0,
										  	action: 2,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									} else {
										//room.fold(room.getCurrentPlayer().id);
										Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: 0,
										  	action: 6,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									}
								}else if(room.getCurrentPlayer().isCall == true){
									if (parseFloat(maxBet - yourBet) == 0) {
										//room.check(room.getCurrentPlayer().id);
										Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: 0,
										  	action: 2,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									}
									else if (playerChips <= parseFloat(maxBet - yourBet)) {
										//room.AllIn(room.getCurrentPlayer().id, false);
										Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: playerChips,
										  	action: 8,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									} else {
										//room.call(room.getCurrentPlayer().id, false);
										Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: (maxBet - yourBet),
										  	action: 4,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									}
								}else if(room.getCurrentPlayer().isFold == true){
									//room.fold(room.getCurrentPlayer().id);
									Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerAction({
										playerId: room.getCurrentPlayer().id,
									  	betAmount: 0,
									  	action: 6,
									  	roomId: room.id,
									  	hasRaised: false,
									  	productName: 'Byte Poker'
									});
								}else{
									if(room.players[room.currentPlayer].isAlreadyActed == false){
										if(room.getCurrentPlayer().isUseTimeBank == true && extraTimerOn != true){
											if(isRunningBank == true){
												timer = parseInt(timer) + parseInt(room.getCurrentPlayer().timeBank);
												isRunningBank = false;
												maxTime = timer;
											}
										}
										await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('OnTurnTimer', {
											playerId: room.getCurrentPlayer().id,
											timer: timer,
											roomId: room.id,
											maxTimer: (maxTime > 0) ? maxTime : room.turnTime || parseFloat(Sys.Config.Texas[room.otherData.gameSpeed]),
											buttonAction: buttonAction,
											defaultButtons: room.getDefaultButtons(),
											isLimitGame : (room.limit == 'limit' || room.limit == "Hi-Lo-limit") ?  true : false,
											timeBank: (room.getCurrentPlayer().isUseTimeBank == true) ? 0 : room.getCurrentPlayer().timeBank
										});
									}
								}


							} catch (e) {
								console.log("Catched Error in RoomProcss.turnFinished :", e);
							}
						}, 1000, room);
					}

				}
				console.log("isPreventMultipleTurn in turnFinish else", room.otherData.isPreventMultipleTurn)
				room.otherData.isPreventMultipleTurn = false;
			}


		} catch (e) {
			console.log("Error:", e);
		}
	},

	roundFinished: async function (room, sidePot) {
		try {
			console.log('<=> Round Finished ||  Omaha GAME-NUMBER [' + room.game.gameNumber + '] || Player SidePot : ', sidePot);
			//room.timerStart = false;
			clearTimeout(Sys.Timers[room.id]);
			clearInterval(Sys.Timers[room.id]);
			/* for (let i = 0; i < room.players.length; i++) {
				room.players[i].isAlreadyActed =false;
			} */
			console.log("Room Game POT :", room.game.pot, room.game.gameNumber, room.game.status, room.status);
			console.log("Room Game bets :", room.game.roundBets, room.game.gameNumber, room.game.status, room.status);
			room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
			console.log("round finished main pot", room.game.bets.reduce((partial_sum, a) => partial_sum + a))
			room.betCounter = 0;
			room.allInInLimit = false;
			console.log("betCounter",room.betCounter)
			let turnBetData = room.getPreviousPlayerAction();
			await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('PlayerAction', {
				action: turnBetData,
				roomId: room.id,
				playerBuyIn: (turnBetData.playerId) ? parseFloat(room.getPlayerById(turnBetData.playerId).chips) : 0,
				totalTablePotAmount: room.game.pot
			});
			console.log("roundfinished Roundcomplete broadcast", room.game.pot, room.game.gameMainPot, sidePot, room.game.gameNumber, room.game.status, room.status)
			// reset prebet options
			for (let p = 0; p < room.players.length; p++) {
				if (room.players[p].id == turnBetData.playerId) {
					room.players[p].isCheck = false;
					room.players[p].isFold = false;
					room.players[p].isCall = false;
				}
			}
			Sys.Timers[room.id] = setTimeout(async function (room) {
				await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('RoundComplete', {
					roundStarted: room.game.roundName,
					cards: room.game.board,
					potAmount: room.game.pot,
					PlayerSidePot: {
						sidePot: sidePot,
						mainPot: +(room.game.gameMainPot).toFixed(2)
					},
					roomId: room.id
				});

				for (let h = 0; h < room.game.gameRevertPoint.length; h += 1) {
					if (room.game.gameRevertPoint[h].amount > 0) {
						let winplr = room.players[room.game.gameRevertPoint[h].playerIndex];
						let winAmount = room.game.gameRevertPoint[h].amount;
						// rack update
						winplr.chips += winAmount;

						let dataObj = {
							playerId: winplr.id,
							playerName: winplr.playerName,
							amount: winAmount,
							chips: winplr.chips,
							winnerSeatIndex: winplr.seatIndex,
							sidePotPlayerIndex: -1, // main Port index,
							roomId: room.id
						};
						console.log("before revertpoint in turnfinish", dataObj, room.game.gameNumber, room.game.status, room.status)
						//Add revertpoint amount into player winningarray  @chetan
						for (let w = 0; w < room.gameWinners.length; w += 1) {
							if (room.game.gameRevertPoint[h].playerID == room.gameWinners[w].playerId) {
								room.gameWinners[w].chips += parseFloat(room.game.gameRevertPoint[h].amount);
							}
						}

						//console.log("revertpoint player", room.game.gameRevertPoint);
						//console.log("room winners", room.gameWinners);
						console.log("revert point win amount", winAmount, room.game.gameNumber);
						console.log("final wining amount sum", winplr.chips, room.game.gameNumber);
						console.log('<=> Game RevertPoint Broadcast || Omaha GAME-NUMBER [' + room.game.gameNumber + '] || RevertPoint : ', dataObj);
						await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('RevertPoint', dataObj);
					}
				}

				if (room.getCurrentPlayer()) {
					Sys.Timers[room.id] = setTimeout(async function (room) {

						// Form New Round Set Turn Bet in Raised Amount is BB
						Sys.Rooms[room.id].turnBet = { action: Sys.Config.Texas.Bet, playerId: room.players[room.currentPlayer].id, betAmount: 0, raisedAmount: room.bigBlind, hasRaised: false }
						console.log("<< New Roud Start.......  >>")
						console.log("<< Turn Bet ::", Sys.Rooms[room.id].turnBet)
						let timer = parseFloat(Sys.Config.Texas[room.otherData.gameSpeed]);
						let buttonAction = room.getCurrentTurnButtonAction();
						console.log(buttonAction);

						let totalPlayingPlayers = 0;
						for (i = 0; i < room.players.length; i++) {
							room.players[i].isAlreadyActed =false;
							if (room.players[i].status == 'Playing' && room.players[i].folded == false) {
								totalPlayingPlayers++;
							}
						}
						if (totalPlayingPlayers > 1) {
							let isRunningBank = true;
							let extraTimerOn = false;
							let maxTime = 0;
							console.log("Player Timer Send 3 roundFinish buttonAction: ", buttonAction);
							Sys.Timers[room.id] = setInterval(async function (room) {
								console.log("Player Timer Send 3 roundFinish: ", timer, room.game.gameNumber);
								
								timer--;
								if(room.getCurrentPlayer().isUseTimeBank == true){
									if(room.getCurrentPlayer().timeBank > 0){
										room.getCurrentPlayer().timeBank = parseInt(room.getCurrentPlayer().timeBank) - 1;
									}else{
										room.getCurrentPlayer().timeBank = 0;
									}
								}
								// For Player Default Action
								let maxBet = parseFloat(room.getMaxBet(room.game.bets));
								let yourBet = parseFloat(room.game.bets[room.currentPlayer]);
								let playerChips = parseFloat(room.players[room.currentPlayer].chips);

								if (timer < 0) {
									if(room.getCurrentPlayer().timeBank > 0){
										extraTimerOn = true;
										room.getCurrentPlayer().isUseTimeBank = true;
										timer = parseInt(timer) + parseInt(room.getCurrentPlayer().timeBank);
										maxTime = timer;
									}else{
										clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
										clearInterval(Sys.Timers[room.id]);
										room.players[room.currentPlayer].isAlreadyActed = true;
										console.log("room players in roundFinished", room.players); 
										Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
									}
								}else if(room.getCurrentPlayer().isCheck == true){
									if (maxBet == yourBet) {
										//room.check(room.getCurrentPlayer().id);
										Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: 0,
										  	action: 2,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									} else {
										//room.fold(room.getCurrentPlayer().id);
										Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: 0,
										  	action: 6,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									}
								}else if(room.getCurrentPlayer().isCall == true){
									if (parseFloat(maxBet - yourBet) == 0) {
										//room.check(room.getCurrentPlayer().id);
										Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: 0,
										  	action: 2,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									}
									else if (playerChips <= parseFloat(maxBet - yourBet)) {
										//room.AllIn(room.getCurrentPlayer().id, false);
										Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: playerChips,
										  	action: 8,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									} else {
										//room.call(room.getCurrentPlayer().id, false);
										Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerAction({
											playerId: room.getCurrentPlayer().id,
										  	betAmount: (maxBet - yourBet),
										  	action: 4,
										  	roomId: room.id,
										  	hasRaised: false,
										  	productName: 'Byte Poker'
										});
									}
								}else if(room.getCurrentPlayer().isFold == true){
									//room.fold(room.getCurrentPlayer().id);
									Sys.Game.CashGame.Omaha.Controllers.RoomProcess.playerAction({
										playerId: room.getCurrentPlayer().id,
									  	betAmount: 0,
									  	action: 6,
									  	roomId: room.id,
									  	hasRaised: false,
									  	productName: 'Byte Poker'
									});
								}else{
									if(room.players[room.currentPlayer].isAlreadyActed == false){
										if(room.getCurrentPlayer().isUseTimeBank == true && extraTimerOn != true){
											if(isRunningBank == true){
												timer = parseInt(timer) + parseInt(room.getCurrentPlayer().timeBank);
												isRunningBank = false;
												maxTime = timer;
											}
										}
										await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('OnTurnTimer', {
											playerId: room.getCurrentPlayer().id,
											timer: timer,
											roomId: room.id,
											maxTimer: (maxTime > 0) ? maxTime : room.turnTime || parseFloat(Sys.Config.Texas[room.otherData.gameSpeed]),
											buttonAction: buttonAction,
											defaultButtons: room.getDefaultButtons(),
											isLimitGame : (room.limit == 'limit' || room.limit == "Hi-Lo-limit") ?  true : false,
											timeBank: (room.getCurrentPlayer().isUseTimeBank == true) ? 0 : room.getCurrentPlayer().timeBank
										});
									}
									
								}

							}, 1000, room);
						}



					}, (Sys.Config.Texas.waitAfterRoundComplete / 2), room)
				}
			}, 250, room)
		} catch (e) {
			console.log(" Error roundFinished :", e);
		}
	},

	gameFinished: async function (room, sidePot) {
		try {
			clearTimeout(Sys.Timers[room.id]);
			clearInterval(Sys.Timers[room.id]);
			let waitTime = Sys.Config.Texas.waitAfterRoundComplete;

			if (room.game.gameRevertPoint.length > 0) { // Wait For Revert Point Animation Show.
				waitTime += 1000;
			}

			if (room.game.status == 'Finished AllIn') {
				waitTime += 1000;
			}

			var showCardsPlayerIds = [];
			if (room.players.length > 0) {
				for (var pl = 0; pl < room.players.length; pl++) {

					if (room.players[pl].status == "Playing" && room.players[pl].folded == false) {
						showCardsPlayerIds.push(room.players[pl].id);
					}
				}
			}
			console.log("after push player showCardsPlayerIds: ", showCardsPlayerIds);

			let originalGameStatus = room.game.status;
			if (room.game.status != 'Finished') {
				room.game.status = 'Finished';
				room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
				console.log('<=> Game Finished Called ||  Omaha GAME-NUMBER [' + room.game.gameNumber + '] ||');
				let dataObj = {
					roundStarted: room.game.roundName,
					cards: room.game.board,
					potAmount: room.game.pot
				};
				console.log('<=> Game Finished Round Complete Broadcast ||  Omaha GAME-NUMBER [' + room.game.gameNumber + '] || RoundComplete : ', dataObj);
				console.log("gamefinished Roundcomplete broadcast", room.game.pot, room.game.gameMainPot, sidePot, room.game.status, room.status)
				await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('RoundComplete', {
					roundStarted: room.game.roundName,
					cards: room.game.board,
					potAmount: room.game.pot,
					PlayerSidePot: {
						sidePot: sidePot,
						mainPot: +(room.game.gameMainPot).toFixed(2)
					},
					roomId: room.id
				});
			}

			let extraWaitTime = 500;
			if (originalGameStatus == 'ForceFinishedFolded') {
				extraWaitTime = 300;
			}
			//Sys.Timers[room.id] = setTimeout(async function (room, showCardsPlayerIds) {


				//Sys.Timers[room.id] = setTimeout(async function (room, showCardsPlayerIds) {

					let playersCards = [];

					// show player cards after aggressor
					if (originalGameStatus != 'Finished AllIn' && originalGameStatus != 'ForceFinishedFolded') {
						//1) decide aggressor
						console.log("aggressorIdArray", room.game.aggressorIdArray);
						if (room.game.aggressorIdArray.length > 0) {
							for (let a = (room.game.aggressorIdArray.length - 1); a >= 0; a--) {
								console.log("aggressorId", room.getPlayerById(room.game.aggressorIdArray[a]));
								let player = room.getPlayerById(room.game.aggressorIdArray[a]);
								console.log("aggressor player", player);
								if (player.status == "Playing") {
									room.game.aggressorIdArray = [player.id];
									playersCards.push({
										playerId: player.id,
										cards: player.cards
									});
									for (let i = 0; i < room.players.length; i++) {
										if (room.players[i].id == player.id) {
											room.players[i].isDisplayedCard = true;
											break;
										}
									}
									console.log("after aggressor assign", room.players)
									break;
								}
							}
							console.log("Afterr deciding aggressor", room.game.aggressorIdArray, room.game.aggressorIdArray.length);
						}


						if (room.game.aggressorIdArray.length <= 0) {
							//2) decide left of the dealer
							let playerFound = false;
							for (let i = room.smallBlindIndex; i < room.players.length; i += 1) {
								console.log("room.players in deciding left of the dealer", room.players[i].playerName, room.players[i].id, room.players[i].folded, room.players[i].allIn, room.players[i].status)
								if (room.players[i].folded === false && room.players[i].status === 'Playing') {
									room.players[i].isDisplayedCard = true;
									playersCards.push({
										playerId: room.players[i].id,
										cards: room.players[i].cards
									});
									console.log("left of the dealer", room.players[i].id);
									playerFound = true;
									break;
								}
							}
							if (playerFound == false) {
								console.log("player not found so search again ")
								console.log("dealer index", room.dealerIndex)
								for (let i = 0; i < room.dealerIndex; i += 1) {
									console.log("room.players in deciding left of the dealer", room.players[i].playerName, room.players[i].id, room.players[i].folded, room.players[i].allIn, room.players[i].status)
									if (room.players[i].folded === false && room.players[i].status === 'Playing') {
										room.players[i].isDisplayedCard = true;
										playersCards.push({
											playerId: room.players[i].id,
											cards: room.players[i].cards
										});
										console.log("left of the dealer", room.players[i].id);
										playerFound = true;
										break;
									}
								}
							}
						}
						console.log("playersCards before gameWinner", playersCards)

						//3) check for winnerarray
						console.log("gameWinners-----", room.gameWinners);
						for (let i = 0; i < room.players.length; i++) {
							console.log("game status", originalGameStatus);
							if (originalGameStatus != 'Finished AllIn') {
								for (let w = 0; w < room.gameWinners.length; w++) {
									if (room.players[i].status == 'Playing' && room.players[i].folded != true && room.gameWinners[w].playerId == room.players[i].id && playersCards.findIndex(k => k.playerId === room.players[i].id) == -1) {
										console.log("inside the gameWinners", room.players[i].id, room.players[i].playerName)
										room.players[i].isDisplayedCard = true;
										playersCards.push({
											playerId: room.players[i].id,
											cards: room.players[i].cards
										});
									}
								}

							}
						}

						console.log("GameFinishedPlayersCards", playersCards);
					}

					//send show cards broadcast

					//let showCardsPlayerIds = [];
					if (originalGameStatus != 'Finished AllIn') {

						/*if(originalGameStatus == 'ForceFinishedFolded'){
							for(let i=0; i < room.players.length; i++){
								//if(room.players[i].status == 'Playing' && room.players[i].id != room.otherData.lastFoldedPlayerId && room.players[i].folded == false){
								if(room.players[i].status == 'Playing' &&  room.lastFoldedPlayerIdArray.indexOf(room.players[i].id) == -1   && room.players[i].folded == false){
									gameWinnersPlayerIds.push(room.players[i].id);
								}
							}
						}else{
							for(let w = 0; w < room.gameWinners.length; w++){
								gameWinnersPlayerIds.push(room.gameWinners[w].playerId);
							}
						}

						console.log("show cards all game winners ids", gameWinnersPlayerIds);*/

						if (originalGameStatus == 'ForceFinishedFolded') {
							/*for(let i=0; i < room.players.length; i++){
								if(gameWinnersPlayerIds.indexOf(room.players[i].id) == -1 && room.players[i].status == 'Playing' && room.lastFoldedPlayerIdArray.indexOf(room.players[i].id) != -1 ){
									showCardsPlayerIds.push(room.players[i].id);
								}
							}*/
							/*for(let i=0; i < room.players.length; i++){
								if(room.players[i].status == 'Playing' && room.players[i].folded == false ){
									showCardsPlayerIds.push(room.players[i].id);
									break;
								}
							}*/
							//showCardsPlayerIds.push(room.otherData.lastFoldedPlayerId);
						} else {
							/*for(let i=0; i < room.players.length; i++){
								if( playersCards.findIndex(k => k.playerId === room.players[i].id ) == -1  && room.players[i].status == 'Playing' && room.players[i].folded == false){
									showCardsPlayerIds.push(room.players[i].id);
								}
							}*/
						}

						//console.log("show cards player ids and game id", showCardsPlayerIds, room.game.id);
						await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('GameFinishedPlayersCards', { playersCards: playersCards, roomId: room.id })
						//await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('DisplayShowCardButton', { playerIdList : showCardsPlayerIds, gameId:room.game.id, roomId: room.id });

					}

					var isRiverRound = 0;
					console.log("showCardsPlayerIds: ", showCardsPlayerIds);
					if (room.game.history.length > 0) {
						for (var h = (room.game.history.length - 1); h >= 0; h--) {
							if (room.game.history[h].gameRound == "River") {
								console.log("room.game.history[h]: ", room.game.history[h].playerAction);
								if (room.game.history[h].playerAction == 6) {
									var isRiverRound = 1;
									showCardsPlayerIds.push(room.game.history[h].playerId);
									break;
								} else {

								}
							}
						}
					}

					console.log("isRiverRound: ", isRiverRound);

					for (var gw = 0; gw < room.gameWinners.length; gw++) {
						if (showCardsPlayerIds.indexOf(room.gameWinners[gw].playerId) > -1) {
							var indexOfWinner = showCardsPlayerIds.indexOf(room.gameWinners[gw].playerId);
							showCardsPlayerIds.splice(indexOfWinner, 1);
						}
					}

					for (var ag = 0; ag < room.game.aggressorIdArray.length; ag++) {
						if (showCardsPlayerIds.indexOf(room.game.aggressorIdArray[ag]) > -1) {
							var indexOfWinner = showCardsPlayerIds.indexOf(room.game.aggressorIdArray[ag]);
							showCardsPlayerIds.splice(indexOfWinner, 1);
						}
					}

					console.log("final showcard array showCardsPlayerIds: ", showCardsPlayerIds);

					if (isRiverRound == 0) {
						//var showCardsPlayerIds = [];
					}

					console.log("gameFinished showCardsPlayerIds: ", showCardsPlayerIds);
					await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('DisplayShowCardButton', { playerIdList: showCardsPlayerIds, gameId: room.game.id, roomId: room.id });
					/*else{
						await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('DisplayShowCardButton', { playerIdList : room.lastFoldedPlayerIdArray, gameId:room.game.id, roomId: room.id });
					}*/


					// timeout condition for folded players

					if (originalGameStatus == 'ForceFinishedFolded') {
						waitTime = 1000;
					}
					Sys.Timers[room.id] = setTimeout(async function (room) {
						console.log("room currencyType", room.currencyType);

						var winnerPlayerIds = [];
						var winnerPlayerAmount = [];
						for (var c = 0; c < room.gameWinners.length; c++) {
							
							winnerPlayerIds.push(room.gameWinners[c].playerId);
							winnerPlayerAmount.push(room.gameWinners[c].amount);

							// let transactionDataWinData = {
							// 	user_id: room.gameWinners[c].playerId,
							// 	username: room.gameWinners[c].playerName,
							// 	gameId: room.game.id,
							// 	gameNumber: room.game.gameNumber,
							// 	chips: parseFloat(room.gameWinners[c].amount),
							// 	afterBalance: room.gameWinners[c].chips,
							// 	category: 'credit',
							// 	type: 'winner',
							// 	remark: 'Winner for game'
							// }
							// let winnerDetails={
							// 	user_id: room.gameWinners[c].playerId,
							// 	username: room.gameWinners[c].playerName,
							// 	chips: parseFloat(room.gameWinners[c].amount),
							// }
							// room.game.winnerDetails.push(winnerDetails);

							//await Sys.Game.CashGame.Omaha.Services.ChipsServices.createTransaction(transactionDataWinData);
						}

						console.log("winnerPlayerIds: ", winnerPlayerIds);
						console.log("winnerPlayerAmount: ", winnerPlayerAmount);
						//console.log("winnerPlayerAmount room: ", room);

						for (var rp = 0; rp<room.players.length; rp++){

							//if(room.players[rp].status === 'Playing'){
								var transactionData = await Sys.Game.CashGame.Omaha.Services.ChipsServices.getSingleData({user_id: room.players[rp].id,gameId: room.game.id});
								
								var winPlayerDetail = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id:room.players[rp].id});
								var totalBetAmount = room.game.roundBets[rp];
								console.log("room.players.id: ", room.players[rp].id);
								if(winnerPlayerIds.indexOf(room.players[rp].id) > -1 && parseFloat(totalBetAmount) > 0){
									var winnerIndex = winnerPlayerIds.indexOf(room.players[rp].id);
									
									var winnerAmount = 0;
									for(var wp=0; wp<winnerPlayerIds.length; wp++){
										if(winnerPlayerIds[wp] == room.players[rp].id){
											winnerAmount += winnerPlayerAmount[wp]
										}
									}

									console.log("winner Amount new: ", winnerAmount);
									
									/*if(transactionData != null){
									
										var newChips = (parseFloat(transactionData) + parseFloat(winnerPlayerAmount[winnerIndex]));

										console.log("newChips of game not available: ", newChips);

										await Sys.Game.CashGame.Omaha.Services.ChipsServices.updateTransactionData({user_id : room.players[rp].id, gameId : room.game.id},{afterBalance:parseFloat(newBalanceChips), chips:parseFloat(newChips).toFixed(4)});
									}else{*/

										console.log("parseFloat(totalBetAmount): ", parseFloat(totalBetAmount));
										console.log("parseFloat(winnerAmount): ", parseFloat(winnerAmount));


										var transactionDetail = await Sys.Game.CashGame.Omaha.Services.ChipsServices.getSingleData({user_id : room.players[rp].id, gameId : room.game.id});

										console.log("transactionDetail: ", transactionDetail);
										if(transactionDetail == null){
											let traNumber = + new Date()
											let transactionDataWinData = {									
												user_id: room.players[rp].id,
												username: room.players[rp].playerName,
												gameId: room.game.id,
												transactionNumber: 'DEP-' + traNumber,
												gameNumber: room.game.gameNumber,
												chips: parseFloat(winnerAmount),
												bet_amount: parseFloat(totalBetAmount),
												afterBalance:  parseFloat(room.players[rp].chips),
												previousBalance: (parseFloat(room.players[rp].chips) +  parseFloat(totalBetAmount))- parseFloat(winnerAmount),												category: 'credit',
												type: 'winner',
												remark: 'Winner for game finished',
												uniqId:room.players[rp].uniqId,
												sessionId:room.players[rp].sessionId
											} 
											await Sys.Game.CashGame.Omaha.Services.ChipsServices.insertData(transactionDataWinData);

											/*let transactionData = {
												user_id:room.players[rp].id,
												username: room.players[rp].playerName,
												gameId: room.game.id,
												gameNumber: room.game.gameNumber,
												tableId: room.id,
												tableName: room.name,
												chips: parseFloat(winnerAmount),
												previousBalance: (parseFloat(room.players[rp].chips) - parseFloat(winnerAmount)),
												afterBalance:  parseFloat(room.players[rp].chips),
												category: 'credit',
												type: 'winner',
												remark: 'winner for game',
												isTournament: 'No',
												isGamePot: 'no'
											}
											console.log("omaha Winner for game: ", transactionData);
											await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);*/

										}else{
											var newChips = parseFloat(transactionDetail.chips) + parseFloat(winnerAmount);
											let previousBalance = parseFloat(transactionDetail.previousBalance) - parseFloat(winnerAmount);
											console.log("transactionDetail exist newChips: ", newChips);
											console.log("transactionDetail exist previousBalance: ", previousBalance);
											await Sys.Game.CashGame.Omaha.Services.ChipsServices.updateTransactionData({_id :transactionDetail._id},{ previousBalance:parseFloat(previousBalance), chips:parseFloat(newChips).toFixed(2)});

										}

										let winnerDetails={
											user_id: room.players[rp].id,
											username: room.players[rp].playerName,
											bet_amount: parseFloat(totalBetAmount),
											chips: parseFloat(winnerAmount),
										}

										room.game.winnerDetails.push(winnerDetails);


									//}

									
								}else if(winnerPlayerIds.indexOf(room.players[rp].id) == -1 && parseFloat(totalBetAmount) > 0){
									if(transactionData == null){
										let traNumber = + new Date()
										let transactionDataWinData = {									
											user_id: room.players[rp].id,
											username: room.players[rp].playerName,
											gameId: room.game.id,
											gameNumber: room.game.gameNumber,
											chips: parseFloat(totalBetAmount),
											bet_amount: parseFloat(totalBetAmount),
											afterBalance: parseFloat(room.players[rp].chips),
											previousBalance:parseFloat(room.players[rp].chips) +  parseFloat(totalBetAmount),
											category: 'debit',
											type: 'lose',
											remark: 'Lose for game',
											transactionNumber: 'DE-' + traNumber,
											uniqId:room.players[rp].uniqId,
											sessionId:room.players[rp].sessionId
										};
										
										await Sys.Game.CashGame.Omaha.Services.ChipsServices.insertData(transactionDataWinData);

										/*let transactionData = {
											user_id:room.players[rp].id,
											username: room.players[rp].playerName,
											gameId: room.game.id,
											gameNumber: room.game.gameNumber,
											tableId: room.id,
											tableName: room.name,
											chips:  parseFloat(0),
											previousBalance:parseFloat(room.players[rp].chips),
											afterBalance: parseFloat(room.players[rp].chips),
											category: 'debit',
											type: 'lose',
											remark: 'Lose for game',
											isTournament: 'No',
											isGamePot: 'no'
										}
										console.log("omaha lose for game: ", transactionData);
										await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);*/

									}
								}
							//}
						}

						if (room.currencyType != 'chips') {
							room = await Sys.Game.CashGame.Omaha.Controllers.RoomProcess.rackDeduction(room);
						}
						console.log("Log before wining Game room.game.gameTotalChips",room.game.gameTotalChips);
						for (var c = 0; c < room.gameWinners.length; c++) {	
							console.log("rackAmount",room.gameWinners[c].rackAmount);
							let actualWinamountPlr= parseFloat(room.gameWinners[c].amount) - parseFloat(room.gameWinners[c].rackAmount)
							let tempGameTotalChips = room.game.gameTotalChips;
							if( tempGameTotalChips > 0 ){
								if( tempGameTotalChips >= actualWinamountPlr || ( actualWinamountPlr - tempGameTotalChips ) <= 0.1 ){
									room.game.gameTotalChips = parseFloat(parseFloat(room.game.gameTotalChips) - parseFloat(actualWinamountPlr)).toFixed(4);
								}else{
									console.log("we have a problem in room.game.gameTotalChips, so limit excessive amount from gameWinner amount",room.game.gameTotalChips,actualWinamountPlr,room.gameWinners[c].playerId,  room.game.gameNumber );
									let excessiveAmount = (actualWinamountPlr - tempGameTotalChips);
									
									let errorLog={
							          gameNumber:room.game.gameNumber,
							          gameId:room.game.id,
							          roomId:room.game.roomId,
							          pot:room.game.pot,
							          validationType: 'Assigned GameWinner amount after deduction',
							          excessAmount: +parseFloat(excessiveAmount).toFixed(4),
							          gameTotalChips:room.game.gameTotalChips,   
							        }
							        await Sys.Game.CashGame.Omaha.Services.ChipsServices.createErrorReportValidationLog(errorLog);

									room.gameWinners[c].chips -= excessiveAmount;
									for (let i = 0; i < room.players.length; i++) {
										if (room.players[i].id == room.gameWinners[c].playerId) {
											room.players[i].chips -= excessiveAmount;
											room.players[i].chips = +parseFloat(room.players[i].chips).toFixed(4);
											break;
										}
									}
									room.game.gameTotalChips = parseFloat(parseFloat(room.game.gameTotalChips) - parseFloat(actualWinamountPlr - excessiveAmount )).toFixed(4);									  
									
								}
							}else{
								let errorLog={
						          gameNumber:room.game.gameNumber,
						          gameId:room.game.id,
						          roomId:room.game.roomId,
						          pot:room.game.pot,
						          validationType: 'Prevent GameWinner',
						          excessAmount: +actualWinamountPlr.toFixed(4),
						          gameTotalChips:room.game.gameTotalChips,     
						        }
						        await Sys.Game.CashGame.Omaha.Services.ChipsServices.createErrorReportValidationLog(errorLog);
								console.log("we have a problem in room.game.gameTotalChips is Negative so we can not assign sidepots",room.game.gameTotalChips,actualWinamountPlr,room.gameWinners[c].playerId,  room.game.gameNumber  );
							}
							room.gameWinners[c].chips = +parseFloat(room.gameWinners[c].chips).toFixed(4);
						}
						if(room.game.gameTotalChips <= -0.01 || room.game.gameTotalChips >= 0.01){
							let errorLog={
								gameNumber:room.game.gameNumber,
								gameTotalChips:room.game.gameTotalChips,
								winners:room.game.winners,
								pot:room.game.pot,
								roomId:room.game.roomId,
								rakePercenage:room.game.rakePercenage,
								gameId:room.game.id,

							}
							console.log("error on game",errorLog);
							//await Sys.Game.CashGame.Omaha.Services.ChipsServices.createErrorLog(errorLog);
							Sys.Game.CashGame.Omaha.Services.ChipsServices.createErrorLog(errorLog);
						}
						console.log("Log after wining Game room.game.gameTotalChips",room.game.gameTotalChips);

						//console.log("room updated after rack feduction", room);
						dataObj = {
							winners: room.gameWinners
						};
						console.log('<=> Game Finished Broadcast || Omaha GAME-NUMBER [' + room.game.gameNumber + '] || GameFinished : ', dataObj);

						//room.previousGameId = room.game.id;
						//room.previousGameNumber = room.game.gameNumber;

						//await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('GameFinished', { winners: room.gameWinners, roomId: room.id, previousGameNumber : room.previousGameNumber, previousGameId : room.previousGameId });
						await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('GameFinished', { winners: room.gameWinners, roomId: room.id });
						// start new game
						/**
						 * Save game histry to database
						 */
						console.log('<=> Game Start Saving Histry ||  Omaha GAME-NUMBER [' + room.game.gameNumber + '] ||');

						//let history = await Sys.Game.CashGame.Omaha.Controllers.RoomProcess.saveGameToHistry(room);
						Sys.Game.CashGame.Omaha.Controllers.RoomProcess.saveGameToHistry(room);


						// timeout condition for folded players
						let gameWinningTime = (room.gameWinners.length * 300) + parseFloat(Sys.Config.Texas.waitBeforeGameReset)
						if (originalGameStatus == 'ForceFinishedFolded') {
							gameWinningTime = 500;
						}
						Sys.Timers[room.id] = setTimeout(async function (room) {

							console.log('<=> Game ResetGame Broadcast ||  Omaha GAME-NUMBER [] || ResetGame : ');
							await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('ResetGame', { roomId: room.id });

							// Check For Sit Out Next Hand. & Remove Player & Check For Bankcrupt
							for (let i = 0; i < room.players.length; i++) {
								if (room.players[i].sitOutNextHand == true) {
									room.gameLosers.push(room.players[i]);
									room.players[i].status = 'Ideal';
									//await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('PlayerLeft', { 'playerId': room.players[i].id, roomId: room.id });
									await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('onIdealPlayer', { 'playerId': room.players[i].id, status: true, roomId: room.id });
									// Big Blind Remove So Find New Big Blind Player.
									room.players[i].defaultActionCount = 3;
									room.players[i].idealTime = (room.players[i].idealTime == null) ? new Date().getTime() : room.players[i].idealTime;
									room.players[i].oldPlayerLeftTime = new Date();
								}


								// Check For Bankcrupt
								if (room.players[i].extraChips == 0 && room.players[i].chips == 0 && room.players[i].status != 'Left') {
									room.players[i].status = 'Ideal';
									room.players[i].idealTime = (room.players[i].idealTime == null) ? new Date().getTime() : room.players[i].idealTime;
									room.players[i].oldPlayerLeftTime = new Date();
								}
							}


							// oldPlayer

							for (let i = room.players.length - 1; i >= 0; i--) {
								if(room.players[i].status == 'Waiting' && room.players[i].waitForBigBlindCheckbox == true && room.players[i].waitForBigBlindCheckboxValue == true){
									room.waitingPlayers.push(room.players[i]);
									room.players.splice(i,1);
								}else{
									if (room.players[i].status == 'Left' || room.players[i].isAllInLefted == true) {
										let removedPlayerID = room.players[i].id;
										if (room.players[i].isAllInLefted == true) {
											room.players[i].status = 'Left';
											await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('PlayerLeft', { 'playerId': room.players[i].id, roomId: room.id });
										}
										room.players[i].sitOutNextHand = false;
										room.players[i].sitOutNextBigBlind = false;
										room.players[i].defaultActionCount = 0;
										room.players[i].isDisplayedCard = false;
										room.players[i].roundRaisedAmount = 0;
										room.players[i].oldPlayerLeftTime = new Date();
										room.players[i].considerLeftedPlayer = false;
										room.players[i].isAlreadyActed =false;
										console.log("Removed Name  : ", room.players[i].playerName, room.players[i].id)
										if (removedPlayerID == room.players[i].id && room.players[i].isAllinPlayersChipsAssigned == false && room.players[i].status == 'Left'){
											await Sys.Game.CashGame.Texas.Controllers.PlayerController.assignCashToPlayers(room, removedPlayerID, false);
											console.log("assignCashToPlayers called and now remove player from room");
										}
										/*let dataPlayer = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(room.players[i].id);
										console.log("room.players[i].isAllinPlayersChipsAssigned in game finish", room.players[i].isAllinPlayersChipsAssigned)
	
										if (dataPlayer && room.players[i].isAllinPlayersChipsAssigned == false && room.players[i].status == 'Left') {
											console.log("Chips", dataPlayer.chips, room.players[i].chips);
											
											let chips = 0;
											if(room.players[i].extraChips > 0) {console.log("extra chips of lefted player", room.players[i].id, room.players[i].extraChips);
												chips = parseFloat(dataPlayer.chips) + parseFloat(room.players[i].chips) + parseFloat(room.players[i].extraChips);
												let playerUpdate = await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(room.players[i].id, { chips: chips, extraChips: 0 });
												room.players[i].extraChips = 0;
											}else{
												chips = parseFloat(dataPlayer.chips) + parseFloat(room.players[i].chips);
												let playerUpdate = await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(room.players[i].id, { chips: chips });
											}
	
											// added by K@Y
											let transactionData = {
												user_id: room.players[i].id,
												username: room.players[i].playerName,
												gameId: room.game.id,
												chips: parseFloat(dataPlayer.chips),
												previousBalance: parseFloat(room.players[i].chips),
												afterBalance: chips,
												category: 'credit',
												type: 'leave room',
												remark: 'Old player left game'
											}
											
											//await Sys.Game.CashGame.Omaha.Services.ChipsServices.createTransaction(transactionData);
	
											let transactionDataLeft = {
												user_id: room.players[i].id,
												username: room.players[i].playerName,
												gameId: room.game.id,
												gameNumber: room.game.gameNumber,
												tableId: room.id,
												tableName: room.name,
												chips: parseFloat(room.players[i].chips),
												previousBalance: parseFloat(dataPlayer.chips),
												afterBalance: parseFloat(chips),
												category: 'credit',
												type: 'entry',
												remark: 'Left',
												isTournament: 'No',
												isGamePot: 'no'
											  }
											  console.log("omaha Player Left for game: ", transactionDataLeft);
											await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataLeft);
											let traNumber = + new Date()
											let sessionData={
												sessionId:room.players[i].sessionId,
												uniqId:room.players[i].uniqId,
												user_id:room.players[i].id,
												username:room.players[i].playerName,
												chips: room.players[i].chips,
												previousBalance: parseFloat(dataPlayer.chips),
												afterBalance: parseFloat(chips),
												type:"leftChips",
												remark:"game left",
												transactionNumber: 'DEP-' + traNumber,
												category:"credit"
											  }
											  await Sys.Game.CashGame.Texas.Services.ChipsServices.insertData(sessionData);	
											  console.log("Player Left for game: ", transactionDataLeft);
											await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataLeft);
											room.players[i].isAllinPlayersChipsAssigned = true;
										}*/
										if (removedPlayerID == room.players[i].id && room.players[i].status == 'Left' && room.players[i].isAllinPlayersChipsAssigned == true) {
											if (room.players[i].status == 'Left') {
												if (room.oldPlayers) {
													console.log("in firstttttt")
													const index = room.oldPlayers.findIndex((e) => e.id === room.players[i].id);
													if (index === -1) {
														room.oldPlayers.push(room.players[i].toJson());
													} else {
														room.oldPlayers[index] = room.players[i].toJson();
													}
												} else {
													console.log("in secondddd", room.players[i])
													room.oldPlayers.push(room.players[i].toJson());
												}
		
												room.players.splice(i, 1);
											} else {
												console.log("player status changed", room.players[i].id, room.players[i].status, room.game.gameNumber);
											}
										}	
	
									}
								}
								
								
							}

							if(room.waitingPlayers.length > 0){
							for (let j = room.waitingPlayers.length - 1; j >= 0; j--) {
								console.log("ROOM WAITING PLAYERS OMAHA",room.waitingPlayers)	
								if ( room.waitingPlayers[j] && room.waitingPlayers[j].status == 'Left') {
									
									room.waitingPlayers[j].sitOutNextHand = false;
									room.waitingPlayers[j].sitOutNextBigBlind = false;
									room.waitingPlayers[j].defaultActionCount = 0;
									room.waitingPlayers[j].isDisplayedCard = false;
									room.waitingPlayers[j].roundRaisedAmount = 0;
									room.waitingPlayers[j].oldPlayerLeftTime = new Date();
									room.waitingPlayers[j].considerLeftedPlayer = false;
									room.waitingPlayers[j].isAlreadyActed =false;
									room.waitingPlayers[j].waitForBigBlindCheckbox = false;
									room.waitingPlayers[j].waitForBigBlindCheckboxValue = false;
									console.log("Removed Name  : ", room.waitingPlayers[j].playerName, room.waitingPlayers[j].id)

									let dataPlayer = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(room.waitingPlayers[j].id);
									console.log("room.waitingPlayers[j].isAllinPlayersChipsAssigned in game finish", room.waitingPlayers[j].isAllinPlayersChipsAssigned)

									if (dataPlayer && room.waitingPlayers[j].isAllinPlayersChipsAssigned == false && room.waitingPlayers[j].status == 'Left') {
										console.log("Chips", dataPlayer.chips, room.waitingPlayers[j].chips);
										
										let chips = 0;
										if(room.waitingPlayers[j].extraChips > 0) {console.log("extra chips of lefted player", room.waitingPlayers[j].id, room.waitingPlayers[j].extraChips);
											chips = parseFloat(dataPlayer.chips) + parseFloat(room.waitingPlayers[j].chips) + parseFloat(room.waitingPlayers[j].extraChips);
											let playerUpdate = await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(room.waitingPlayers[j].id, { chips: chips, extraChips: 0 });
											room.waitingPlayers[j].extraChips = 0;
										}else{
											chips = parseFloat(dataPlayer.chips) + parseFloat(room.waitingPlayers[j].chips);
											let playerUpdate = await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(room.waitingPlayers[j].id, { chips: chips });
										}

										// added by K@Y
										let transactionData = {
											user_id: room.waitingPlayers[j].id,
											username: room.waitingPlayers[j].playerName,
											gameId: room.game.id,
											chips: parseFloat(dataPlayer.chips),
											previousBalance: parseFloat(room.waitingPlayers[j].chips),
											afterBalance: chips,
											category: 'credit',
											type: 'leave room',
											remark: 'Old player left game'
										}
										
										//await Sys.Game.CashGame.Omaha.Services.ChipsServices.createTransaction(transactionData);

										let transactionDataLeft = {
					                        user_id: room.waitingPlayers[j].id,
					                        username: room.waitingPlayers[j].playerName,
					                        gameId: room.game.id,
					                        gameNumber: room.game.gameNumber,
					                        tableId: room.id,
					                        tableName: room.name,
					                        chips: parseFloat(room.waitingPlayers[j].chips),
					                        previousBalance: parseFloat(dataPlayer.chips),
					                        afterBalance: parseFloat(chips),
					                        category: 'credit',
					                        type: 'entry',
					                        remark: 'Left',
					                        isTournament: 'No',
					                        isGamePot: 'no'
				                      	}
				                      	console.log("omaha Player Left for game: ", transactionDataLeft);
				                    	await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataLeft);

										room.waitingPlayers[j].isAllinPlayersChipsAssigned = true;
									}
									if (room.waitingPlayers[j].status == 'Left') {
										if (room.oldPlayers) {
											console.log("in firstttttt")
											const index = room.oldPlayers.findIndex((e) => e.id === room.waitingPlayers[j].id);
											if (index === -1) {
												room.oldPlayers.push(room.waitingPlayers[j].toJson());
											} else {
												room.oldPlayers[index] = room.waitingPlayers[j].toJson();
											}
										} else {
											console.log("in secondddd", room.waitingPlayers[j])
											room.oldPlayers.push(room.waitingPlayers[j].toJson());
										}

										room.waitingPlayers.splice(j, 1);
									} else {
										console.log("player status changed", room.waitingPlayers[j].id, room.waitingPlayers[j].status, room.game.gameNumber);
									}

								}
							}
						}
							await module.exports.removeOldPlayersFromRoom(room);
							// remove lefted player also
							room.status = 'Finished';
							room.tempStatus = "inTransit";
							room.game = null;
							// Game Finished update fold/allin/talked value.
							for (var i = 0; i < room.players.length; i++) {
								room.players[i].folded = false;
								room.players[i].allIn = false;
								room.players[i].talked = false;
								room.players[i].muck = false;
								room.players[i].isSidepot = false;
								//room.otherData.lastFoldedPlayerId = '';
								room.lastFoldedPlayerIdArray = [];
								room.otherData.isCardDistributed = false;
								room.otherData.isPreventMultipleTurn == false;
								room.players[i].isDisplayedCard = false;
								room.players[i].roundRaisedAmount = 0;
								room.players[i].cards.splice(0, room.players[i].cards.length);
								room.players[i].subscribeTime = new Date();

								room.players[i].isFold = false;
								room.players[i].isCheck = false;
								room.players[i].isCall = false;
								room.players[i].considerLeftedPlayer = false;
								room.players[i].isAlreadyActed =false;
							}
							room.timerStart = false;
							room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);

							// timeout condition for folded players
							let waitAfterGameReset = parseFloat(Sys.Config.Texas.waitAfterGameReset);
							if (originalGameStatus == 'ForceFinishedFolded') {
								waitAfterGameReset = 1000;
							}
							console.log("waitAfterGameReset", waitAfterGameReset)
							Sys.Timers[room.id] = setTimeout(async function (room) {

								let totalPlayers = 0;
								for (i = 0; i < room.players.length; i++) {
									if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal') {
										totalPlayers++;
									}
								}
								room.status = "Finished";
								room.tempStatus = "inTransit";
								//room.game = null;



								// open add chips popup if player has chips== 0 @chetan
								for (i = 0; i < room.players.length; i++) {
									if (room.players[i].status == 'Ideal' && room.players[i].chips == 0) {
										let minBuyIn = room.bigBlind;
										let maxBuyIn = 0;

										if (room.limit == 'limit') {
											maxBuyIn = room.players[i].chips; // No Limit in Max Buyin Game. // shubham
										} else if (room.limit == 'no_limit') {
											// No Limit
											maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
										} else {
											// Pot Limit
											maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
										}

										console.log("popup open for player ", room.players[i].id)
										//await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('OnOpenBuyInPanel', { 'playerId': room.players[i].id, roomId:room.id });
										await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.players[i].socketId).emit('OnOpenBuyInPanel', { 'playerId': room.players[i].id, roomId: room.id });

									}
								}


								console.log('<===============================>');
								console.log('<=> Ramain Player : <=>', totalPlayers);
								console.log('<===============================>');


								//Chirag 30-08-2019 code add to check if system under maintenance if not so game continue running and if under maintenance show game not running
								let m_start_date = moment(new Date(Sys.Setting.maintenance.maintenance_start_date)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format("YYYY-MM-DD HH:mm");
								let m_end_date = moment(new Date(Sys.Setting.maintenance.maintenance_end_date)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format("YYYY-MM-DD HH:mm");
								let current_date = moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format("YYYY-MM-DD HH:mm");
								//Chirag 30-08-2019 code add to check if system under maintenance if not so game continue running and if under maintenance show game not running

								console.log("m_start_date: ", m_start_date);
								console.log("m_end_date: ", m_end_date);
								console.log("current_date: ", current_date);

								if ( (current_date >= m_start_date && current_date <= m_end_date && Sys.Setting.maintenance.status == 'active') || Sys.Setting.maintenance.quickMaintenance == "active" ) {
									room.tempStatus = "Waiting";
									Sys.Game.Common.Controllers.RoomController.playerRemoveBySystem(room);
								} else {
									if (totalPlayers >= room.minPlayers && room.status != 'Running' && room.timerStart == false) {
										console.log('<===============================>');
										console.log('<=> New Game Starting [] <=>');
										console.log("pgame starting gameFinish room status", room.status);
										console.log("**************************************");
										console.log("game started from gameFinish")
										console.log("**************************************");
										console.log('<===============================>');
										room.tempStatus = "Waiting";
										room.timerStart = true;
										room.StartGame();
									} else {
										// Remove Player Which Have Status Left
										for (let i = 0; i < room.players.length; i++) {
											if (room.players[i].status == 'Left') {
												room.players.splice(i, 1);
											}
										}

										let totalWaitingPlayers = 0;
										for(let i = 0; i < room.waitingPlayers.length; i++){
											if(room.waitingPlayers[i].waitForBigBlindCheckbox == true){
												totalWaitingPlayers++;
											}
										}
										console.log("TOTAL WAITING PLAYERS",totalWaitingPlayers,room.players.length,room.players)
										
										if(totalWaitingPlayers > 0 && totalPlayers == 1){
											room.players.push(room.waitingPlayers[0]);
											room.waitingPlayers.splice(0,1);
											console.log("ROOM WAITING PLAYERS",room.waitingPlayers)
											room.tempStatus = "Waiting";
											room.timerStart = true;
											room.StartGame();
										}else if(totalWaitingPlayers > 0 && totalPlayers == 0){
											for(let i = 0; i < room.waitingPlayers.length; i++){
												room.waitingPlayers[i].waitForBigBlindCheckbox = false;
												room.waitingPlayers[i].waitForBigBlindCheckboxValue = false;
												room.players.push(room.waitingPlayers[i]);
											}
											room.waitingPlayers = [];
											room = await Sys.Game.CashGame.Omaha.Controllers.RoomProcess.broadcastPlayerInfo(room);
											for (i = 0; i < room.players.length; i++) {
												if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal') {
													totalPlayers++;
												}
											}
											console.log("ROOM PLAYERS & WAITING PLAYERS",room.players.length,totalPlayers,room.waitingPlayers.length)
											room.tempStatus = "Waiting";
											if(totalPlayers >= room.minPlayers){	
												room.timerStart = true;
												room.StartGame();
											}
										}else{
											//room.status = "waiting";
											//room.game = null;
											//roomUpdated = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
											room.tempStatus = "Waiting";
											console.log('<===============================>');
											console.log('<=> Not Minimum Player Found So Game not Starting ');
											console.log('<===============================>');
										}
									}

								}

							}, waitAfterGameReset, room)

						}, gameWinningTime, room)

					}, waitTime, room)

				//}, extraWaitTime, room, showCardsPlayerIds);

			//}, extraWaitTime, room, showCardsPlayerIds);

		} catch (e) {
			console.log("Error:", e);
		}
	},

	removeOldPlayersFromRoom: async function(room) {
		try{
			if(room.oldPlayers){console.log("oldplayers length", room.oldPlayers.length)
				for(let i=0; i < room.oldPlayers.length; i++){
					let oldPlayerLeftTimeDiff = moment.duration(moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).diff(moment(new Date(room.oldPlayers[i].oldPlayerLeftTime)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone))).asMinutes();
					if(oldPlayerLeftTimeDiff > Sys.Config.Texas.oldPlayerLeftTimeInMin ){
						console.log("remove player ", i, room.oldPlayers[i].id);
						room.oldPlayers.splice(i,1);
						i--;
					}
				}
			}
		}catch(e) {
			console.log("Error in removing oldplayer", e);
		} 
	},
	playerDefaultAction: async function (id) {
		try {
			console.log('playerDefaultAction called');
			clearTimeout(await Sys.Timers[id]);
			let room = await Sys.Game.CashGame.Omaha.Services.RoomServices.get(id);
			if (room.getCurrentPlayer()) {
				let currentPlayer = room.getCurrentPlayer()
				if(room.getCurrentPlayer().isUseTimeBank == true){
					room.getCurrentPlayer().isUseTimeBank = false;
				}
				let maxBet, i;
				maxBet = 0;
				console.log("room.game.bets :", room.game.bets);
				for (i = 0; i < room.game.bets.length; i += 1) {
					if (room.game.bets[i] > maxBet) {
						maxBet = room.game.bets[i];
					}
				}


				// first check for check action and then for fold or lefting the player
				if (room.game.bets[room.currentPlayer] == maxBet) {
					room.check(currentPlayer.id);
				} else {
					currentPlayer.defaultActionCount += 1;
					if (currentPlayer.defaultActionCount >= 3) {
						let query = { roomId: room.id, playerId: currentPlayer.id }
						currentPlayer.idealTime = null;
						let leftRoomPlayer = await Sys.Game.CashGame.Omaha.Controllers.RoomProcess.leftRoom(query);
						console.log('Room Disconnect player lefted :', currentPlayer.playerName);
					} else {
						// When Player is ideal, Fold theme
						await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('onIdealPlayer', { 'playerId': currentPlayer.id, status: true, roomId: room.id });
						currentPlayer.idealTime = (currentPlayer.idealTime == null) ? new Date().getTime() : currentPlayer.idealTime;
						currentPlayer.oldPlayerLeftTime = new Date();
						currentPlayer.status = 'Ideal';
						room.fold(currentPlayer.id);

					}
				}



			}
		} catch (e) {
			console.log("Error", e);
		}
	},

	saveGameToHistry: async function (room) {
		try {
			console.log('Save game histry called');
			room.players = [...new Set(room.players)];
			// console.log("room players when saving history", room.players);
			room.players.forEach(function (player) {
				room.game.players.push(player.toJson())
			})
			room.gameLosers.forEach(function (player) {
				room.game.players.push(player.toJson())
			})
			room.game.winners = room.gameWinners; // Just Push Winner.
			return await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
		} catch (e) {
			console.log("Error:", e);
		}
	},

	calculateRake: async function (room) {
		try {
			console.log('Calculating rake for game')
			let rackAmount = room.rackAmount;
			let rakeByPercent = 0
			if (room.rackPercent > 0) {
				rakeByPercent = parseFloat(room.game.pot * (room.rackPercent / 100))
			}
			if (rackAmount > rakeByPercent || rackAmount == 0) {
				rackAmount = rakeByPercent
			}
			rakeByPercent = ((rackAmount / room.game.pot) * 100)
			let adminChips = 0
			for (let i = 0; i < room.gameWinners.length; i++) {
				let commission = parseFloat(room.gameWinners[i].chips * (rakeByPercent / 100));
				adminChips += commission;
				room.gameWinners[i].chips -= parseFloat(commission)
				room.getPlayerById(room.gameWinners[i].playerId).chips -= commission
			}
			console.log('Admin User got : ' + adminChips + ' Chips')

			return await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room)

		} catch (e) {
			console.log("Error:", e);
		}
	},

	sitOutNextHand: async function (data) {
		console.log("=================================================================");
		console.log("sitOutNextHand->", data);
		console.log("=================================================================");
		try {
			if (!data.roomId) {
				return {
					status: 'fail',
					result: null,
					message: "Room Not Found",
					statusCode: 401
				};
			}
			let room = await Sys.Game.CashGame.Omaha.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Room Not Found",
					statusCode: 401
				};
			}

			if (room && room.players && room.players.length > 0) {
				for (let i = 0; i < room.players.length; i++) {
					if (room.players[i].id == data.playerId && room.players[i].status != 'Left') {
						room.players[i].sitOutNextHand = data.actionValue;
					}
				}
			}
			room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
			return {
				status: 'success',
				result: null,
				message: "Player Updated",
				statusCode: 200
			};
		} catch (error) {
			console.log("Error in SitOut:", error);
		}
	},

	sitOutNextBigBlind: async function (data) {
		console.log("=================================================================");
		console.log("sitOutNextBigBlind->", data);
		console.log("=================================================================");
		try {
			if (!data.roomId) {
				return {
					status: 'fail',
					result: null,
					message: "Room Not Found",
					statusCode: 401
				};
			}
			let room = await Sys.Game.CashGame.Omaha.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Room Not Found",
					statusCode: 401
				};
			}

			if (room && room.players && room.players.length > 0) {
				for (let i = 0; i < room.players.length; i++) {
					if (room.players[i].id == data.playerId && room.players[i].status != 'Left') {
						console.log("Name Updated :", room.players[i].playerName);
						console.log("?????????????????????????????????????????????????????????/")
						room.players[i].sitOutNextBigBlind = data.actionValue;
					}
				}
			}
			room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
			return {
				status: 'success',
				result: null,
				message: "Player Updated",
				statusCode: 200
			};
		} catch (error) {
			console.log("Error in SitOut:", error);
		}
	},

	broadcastPlayerInfo: async function (room) {
		try {
			let playerInfoDummy = [];
			// Just Send Player Info for Remainig Player
			for (var i = 0; i < room.players.length; i++) {
				if (room.players[i].status != 'Left') {
					console.log("room.players[i].avatar :", room.players[i].avatar)
					//console.log("bets", room.game);
					let bets = 0;
					if (room.game != null) {
						console.log("player roundbets", room.game.bets[i]);
						bets = room.game.bets[i];
					}
					let playerInfoObj = {
						id: room.players[i].id,
						status: room.players[i].status,
						username: room.players[i].playerName,
						chips: parseFloat(room.players[i].chips),
						appId: room.players[i].appid,
						avatar: room.players[i].avatar,
						fb_avatar: room.players[i].fb_avatar,
						folded: room.players[i].folded,
						allIn: room.players[i].allIn,
						seatIndex: room.players[i].seatIndex,
						idealPlayer: (parseFloat(room.players[i].defaultActionCount) > 0) ? true : false,
						betAmount: bets,
						longitude: room.players[i].longitude,
						latitude: room.players[i].latitude,
						waitForBigBlindData:{
							waitForBigBlindCheckbox : room.players[i].waitForBigBlindCheckbox, 
							waitForBigBlindCheckboxValue : room.players[i].waitForBigBlindCheckboxValue
							}
					};
					if (room.players[i].status != 'Ideal' && (room.players[i].status != 'Playing' || (room.players[i].folded == true) || room.status != 'Running')) {
						playerInfoObj.idealPlayer = false;
					}
					playerInfoDummy.push(playerInfoObj);
				}
			}
			for (var i = 0; i < room.waitingPlayers.length; i++) {
				if (room.waitingPlayers[i].status != 'Left') {
					console.log("room.waitingPlayers[i].avatar :", room.waitingPlayers[i].avatar)
					//console.log("bets", room.game);
					
					let playerInfoObj = {
						id: room.waitingPlayers[i].id,
						status: room.waitingPlayers[i].status,
						username: room.waitingPlayers[i].playerName,
						chips: parseFloat(room.waitingPlayers[i].chips),
						appId: room.waitingPlayers[i].appid,
						avatar: room.waitingPlayers[i].avatar,
						fb_avatar: room.waitingPlayers[i].fb_avatar,
						folded: room.waitingPlayers[i].folded,
						allIn: room.waitingPlayers[i].allIn,
						seatIndex: room.waitingPlayers[i].seatIndex,
						idealPlayer: (parseFloat(room.waitingPlayers[i].defaultActionCount) > 0) ? true : false,
						betAmount: 0,
						longitude: room.waitingPlayers[i].longitude,
						latitude: room.waitingPlayers[i].latitude,
						waitForBigBlindData:{
							waitForBigBlindCheckbox : room.waitingPlayers[i].waitForBigBlindCheckbox, 
							waitForBigBlindCheckboxValue : room.waitingPlayers[i].waitForBigBlindCheckboxValue
							}
	
					};
					console.log("plrobj",playerInfoObj)
					if (room.waitingPlayers[i].status != 'Ideal' && (room.waitingPlayers[i].status != 'Playing' || (room.waitingPlayers[i].folded == true) || room.status != 'Running')) {
						playerInfoObj.idealPlayer = false;
					}
					playerInfoDummy.push(playerInfoObj);
				}
			}
			console.log("while sending broadcast roomdata broadcast", playerInfoDummy);
			let dealerPlayerId = '';
			let sidePot = [];
			let gameMainPot = [];
			// let smallBlindPlayerId = '';
			// let bigBlindPlayerId = '';

			if (room.status == 'Running') {
				dealerPlayerId = room.getDealer().id;
				sidePot = room.game.gamePot;
				gameMainPot = room.game.gameMainPot;
				//smallBlindPlayerId = room.getSmallBliendPlayer().id;
				//bigBlindPlayerId = room.getBigBliendPlayer().id;
			}
			await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('playerInfoList', {
				playerInfo: playerInfoDummy,
				dealerPlayerId: dealerPlayerId,
				roomId: room.id,
				PlayerSidePot: {
					sidePot : sidePot,
					mainPot : gameMainPot
				}
				// smallBlindPlayerId : smallBlindPlayerId,
				// bigBlindPlayerId : bigBlindPlayerId
			});
			return room;
		}
		catch (error) {
			console.log('Error in broadcastPlayerInfo : ' + error);
			return new Error('Error in broadcastPlayerInfo');
		}
	},


	// rack distribution
	rackDeductionUpdate: async function (roomId,roomName,playerId, gameId, won, rackPercent, totalRack, rackFrom, rackTo, rackFromId, rackToId, gameNumber) {
		try {
		console.log("playerId, gameId, won, rackPercent, totalRack, rackFrom, rackTo, rackFromId, rackToId, gameNumber");
			console.log(playerId, gameId, won, rackPercent, totalRack, rackFrom, rackTo, rackFromId, rackToId, gameNumber);
			
			let rackToAfter_balance=0;
			let rackToBefore_balance=0;
			if (rackTo == 'admin') {
				let admin = await Sys.App.Services.UserServices.getSingleUserData({ _id: rackToId });
				if (admin != null && admin != undefined) {
					// if(rackToId==req.session.details.id){
					// 	req.session.details.rake_chips = parseFloat(req.session.details.rake_chips) + parseFloat(totalRack);
					// }
					/*if(admin.rake_chips){
						var adminChips = parseFloat(admin.rake_chips) + parseFloat(totalRack);
					}
					console.log("Admin chips--", admin.chips);
					console.log("adminChips", admin.chips);*/
					//await Sys.App.Services.UserServices.updateUserData({ _id: rackToId }, { rake_chips: parseFloat(adminChips).toFixed(4) })
					/* await Sys.App.Services.UserServices.updateUserData({ _id: rackToId }, { rake_chips: (parseFloat((admin.rake_chips + totalRack)).toFixed(4)) })
					console.log("updated admin rake", totalRack);
					rackToAfter_balance= admin.rake_chips + totalRack
					rackToBefore_balance= admin.rake_chips */
					let updatedUser = await Sys.App.Services.UserServices.findOneAndUpdate({ _id: rackToId }, { $inc: { rake_chips: +totalRack.toFixed(4) }} );console.log("updatedUser in rake", updatedUser);
					console.log("updated admin rake", totalRack);
					rackToAfter_balance= updatedUser.rake_chips + totalRack
					rackToBefore_balance= updatedUser.rake_chips

				}
			} else {
				let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: rackToId });
				if(agent.rake_chips == undefined){
					agent.rake_chips = 0.00;
				}
				// if(rackToId==req.session.details.id){
				// 	req.session.details.rake_chips = parseFloat(req.session.details.rake_chips) + parseFloat(totalRack);
				// }
				
				/*if(agent.rake_chips){
					var agentChips = parseFloat(agent.rake_chips) + parseFloat(totalRack);
				}else{
					var agentChips = parseFloat(agent.rake_chips) + parseFloat(totalRack);
				}

				console.log("agentChips: ", agentChips);*/
				
				//await Sys.App.Services.agentServices.updateAgentData({ _id: rackToId }, { rake_chips:  parseFloat(agentChips).toFixed(4)})
				/* await Sys.App.Services.agentServices.updateAgentData({ _id: rackToId }, { rake_chips: (parseFloat((agent.rake_chips + totalRack)).toFixed(4)) })
				console.log("updated agent rake", totalRack);
				rackToAfter_balance=  agent.rake_chips + totalRack
				rackToBefore_balance= agent.rake_chips; */
				let updatedAgent = await Sys.App.Services.agentServices.findOneAndUpdate({ _id: rackToId }, { $inc: { rake_chips: +totalRack.toFixed(4) }} );console.log("updatedAgent in rake", updatedAgent);
				console.log("updated agent rake", totalRack);
				rackToAfter_balance= updatedAgent.rake_chips + totalRack
				rackToBefore_balance= updatedAgent.rake_chips;  
				
			}
			let traNumber = + new Date()										
			let inserdata = await Sys.App.Services.RackHistoryServices.insertData({
				'player': playerId,
				'game': gameId,
				'gameNumber': gameNumber,
				'rackFromId': rackFromId,
				'rackToId': rackToId,
				'rackFrom': rackFrom,
				'rackTo': rackTo,
				'won': eval(parseFloat(won).toFixed(4)),
				'rackPercent': rackPercent,
				transactionNumber: 'DEP-' + traNumber,
				'totalRack': eval(parseFloat(totalRack).toFixed(4)),
				'createdAt': new Date(),
				'rackToAfter_balance':rackToAfter_balance.toFixed(4),
				'rackToBefore_balance':rackToBefore_balance.toFixed(4),
				'rakeChips':true,
				'type':"rake"
			});
		} catch (e) {
			console.log("Error in RackDeduction Update", e);
		}
	},
	// rack distribution for vatsal end 

	/*rackDeduction: async function(room){
	  try{
	  	console.log("rack called");
	  	for (let i = 0; i < room.gameWinners.length; i++) {
	  		room.gameWinners[i].amount = eval( parseFloat(room.gameWinners[i].amount).toFixed(4) );
	  		console.log("*******************Rack**********************")
	  		console.log("playerId",room.gameWinners[i].playerId );
	  		console.log("game id",room.game.id)
	  		console.log("won amount", room.gameWinners[i].amount)
				console.log("*******************Rack***********************")

				let allAgentsRole = ['player'];
				let rack = await Sys.Setting; //get Application rack

				let totalRackDeductionWinner = eval( parseFloat( ( parseFloat(room.gameWinners[i].amount) * parseFloat(Sys.Setting.rakePercenage) ) /100 ).toFixed(4) );
				let adminRack = rack.rakePercenage;
				console.log("totsl rsck deduction", totalRackDeductionWinner, rack)
				room.gameWinners[i].chips -= parseFloat(totalRackDeductionWinner);
				//room.gameWinners[i].chips = parseFloat(room.gameWinners[i].chips)
				console.log("Winners Chips after rack Deduction",room.gameWinners[i].playerId, room.gameWinners[i].chips )
				Sys.Log.info('-----------Game Id-----------: ' + room.game.id);
				Sys.Log.info('Winners Chips after rack Deduction : ' + room.gameWinners[i].playerId + 'winning final:' + room.gameWinners[i].chips );

				room.getPlayerById(room.gameWinners[i].playerId).chips -= parseFloat( totalRackDeductionWinner );

				let playerCount = 0;
				for(let rp = 0; rp < room.players.length; rp++){
					if(room.players[rp].status == 'Playing' && room.players[rp].folded == false){
						playerCount++;
					}
				}

				for(let rp = 0; rp < room.players.length; rp++){
					if(room.players[rp].status == 'Playing' && room.players[rp].folded == false){
						totalRackDeduction = eval( parseFloat( (totalRackDeductionWinner / playerCount) ).toFixed(4) );
						let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id: room.players[rp].id});
						console.log("inside rack",player.username, player.agentRole, player.agentId);
						if(player.agentId != '' && player.agentId != null && player.agentId != undefined){
							let agentRoleId = rolesArray.indexOf(player.agentRole);
							let allAgents = [player.agentId];
							let allAgentsFromToIds = [room.players[rp].id,player.agentId];

							for(let rd=agentRoleId; rd >= 0; rd--){
								if(rd == 0){
									let master = await Sys.App.Services.agentServices.getSingleAgentData({_id: allAgents[allAgents.length-1]});

									allAgentsRole.push('admin');

									await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, room.gameWinners[i].amount, adminRack, totalRackDeduction, allAgentsRole[allAgentsRole.length-2], allAgentsRole[allAgentsRole.length-1], allAgentsFromToIds[allAgentsFromToIds.length-2], allAgentsFromToIds[allAgentsFromToIds.length-1], room.game.gameNumber);
								}
								else{
									let agent = await Sys.App.Services.agentServices.getSingleAgentData({_id: allAgents[allAgents.length-1]});
									allAgents.push(agent.parentId);

									allAgentsRole.push(agent.role + ' ( ' + agent.email + ')');

									let tempRackDeduction = eval( parseFloat( ( totalRackDeduction * (100 - agent.commission) )/100 ).toFixed(4) );
									totalRackDeduction = totalRackDeduction - tempRackDeduction;

									adminRack = agent.commission;

									await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, room.gameWinners[i].amount,  (100- agent.commission) , tempRackDeduction, allAgentsRole[allAgentsRole.length-2], allAgentsRole[allAgentsRole.length-1], allAgentsFromToIds[allAgentsFromToIds.length-2], allAgentsFromToIds[allAgentsFromToIds.length-1], room.game.gameNumber);
									allAgentsFromToIds.push(agent.parentId);
								}
							}
						}
						else{
							console.log("Agent not available");
							if(room.gameWinners[i].playerId == room.players[rp].id ){
								let playerAgent = await Sys.App.Services.UserServices.getSingleUserData({});
							console.log("admin rack agent", playerAgent)

							let playerEmail='player ( ' + player.email + ')'
							await module.exports.rackDeductionUpdate( room.players[rp].id, room.game.id, room.gameWinners[i].amount, adminRack, totalRackDeductionWinner, playerEmail , 'admin', room.players[rp].id, playerAgent._id, room.game.gameNumber);
							}

						}
					}
					allAgentsRole = ['player'];
				}
	  	}
	  	return await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room)


	    //res.send(player);
	  }catch(e){
	    console.log("Error in Rack Deduction",e);
	  }
	},*/

	/*rackDeduction: async function(room){
	  try{
	  	console.log("rack called");
	  	let totalRackOfTheGame = 0;

	  	let rack = await Sys.Setting;
	  	let adminRack = rack.rakePercenage;
	  	for (let i = 0; i < room.gameWinners.length; i++) {

	  		room.gameWinners[i].amount = eval( parseFloat(room.gameWinners[i].amount).toFixed(4) );
	  		console.log("*******************Rack**********************")
	  		console.log("playerId",room.gameWinners[i].playerId );
	  		console.log("game id",room.game.id, room.game.gameNumber)
	  		console.log("won amount", room.gameWinners[i].amount)
			console.log("*******************Rack***********************")


			let totalRackDeductionWinner = eval( parseFloat( ( parseFloat(room.gameWinners[i].amount) * parseFloat(Sys.Setting.rakePercenage) ) /100 ).toFixed(4) );
			//let adminRack = rack.rakePercenage;
			console.log("totsl rsck deduction", totalRackDeductionWinner, rack, room.gameWinners[i].chips)

			for(let j = i; j < room.gameWinners.length; j++){
				if(room.gameWinners[i].playerId == room.gameWinners[j].playerId){
					room.gameWinners[j].chips -= parseFloat(totalRackDeductionWinner);
				}

			}
			console.log("after deduction chips winner array", room.gameWinners);
			//room.gameWinners[i].chips -= parseFloat(totalRackDeductionWinner);

			console.log("Winners Chips after rack Deduction",room.gameWinners[i].playerId, room.gameWinners[i].chips )
			Sys.Log.info('-----------Game Id-----------: ' + room.game.id, room.game.gameNumber);
			Sys.Log.info('Winners Chips after rack Deduction : ' + room.gameWinners[i].playerId + 'winning final:' + room.gameWinners[i].chips );


			room.getPlayerById(room.gameWinners[i].playerId).chips -= parseFloat( totalRackDeductionWinner );

			totalRackOfTheGame += totalRackDeductionWinner;
	  	}
	  	console.log("Totalrackofthegame", totalRackOfTheGame, room.game.gameNumber);
	  	console.log("room.game.roundBets", room.game.roundBets, room.game.gameNumber);
	  	console.log("Game POT :",room.game.gamePot, room.game.gameNumber);
	  	console.log("gameMainPot :",room.game.gameMainPot, room.game.gameNumber);
		console.log("Game REvert Point :", room.game.gameRevertPoint, room.game.gameNumber);
	  	if(totalRackOfTheGame > 0){
	  		let totalOfRoundBets = 0;
	  		let allAgentsRole = ['player'];

	  		let tempRoundBets = room.game.roundBets.slice();
	  		console.log("tempRoundBets 2", tempRoundBets)
	  		tempRoundBets.sort(function (a, b) {
	  		  return a - b;
	  		});
	  		console.log("sorted tempRoundBets", tempRoundBets, tempRoundBets[(tempRoundBets.length)-1] , tempRoundBets[(tempRoundBets.length) -2])
	  		if(tempRoundBets[(tempRoundBets.length)-1] > tempRoundBets[(tempRoundBets.length )-2] ){
	  			console.log("indexOFFFF", room.game.roundBets.indexOf( tempRoundBets[(tempRoundBets.length)-1] ), "test",  tempRoundBets[(tempRoundBets.length)-1])
				room.game.roundBets[ room.game.roundBets.indexOf( tempRoundBets[(tempRoundBets.length)-1] ) ] = tempRoundBets[(tempRoundBets.length) -2];
	  			tempRoundBets[(tempRoundBets.length)-1] = tempRoundBets[(tempRoundBets.length) -2];
				//room.game.roundBets[(room.game.roundBets.length) -1] = tempRoundBets[(tempRoundBets.length) -2];

	  		}
	  		console.log("roundbetss", room.game.roundBets);
	  		totalOfRoundBets = parseFloat( ( tempRoundBets.reduce((a, b) => a + b, 0) ).toFixed(4) );

	  		console.log("sorted tempRoundBets aftercalculation", tempRoundBets)
	  		console.log("totalofrounsbets", totalOfRoundBets)
	  		for (let rp = 0; rp < room.players.length; rp++) {
	  			if( (room.players[rp].status === 'Playing' ) || ( room.players[rp].folded == true && room.players[rp].talked == true )  || ( room.players[rp].status === 'Left' && room.players[rp].talked == true ) ||  ( room.players[rp].status === 'Ideal' && room.players[rp].talked == true ) ){
	  				console.log("player name and roundbets",room.players[rp].playerName,  room.game.roundBets[rp]);

	  				totalRackDeduction = parseFloat( ( ( room.game.roundBets[rp] / totalOfRoundBets )* totalRackOfTheGame ).toFixed(4) ) ;
	  				console.log("totalRackDeduction", room.players[rp].playerName,totalRackDeduction )
	  				let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id: room.players[rp].id});
	  				console.log("inside rack",player.username, player.agentRole, player.agentId);
	  				if(player.agentId != '' && player.agentId != null && player.agentId != undefined){
	  					let agentRoleId = rolesArray.indexOf(player.agentRole);
	  					let allAgents = [player.agentId];
	  					let allAgentsFromToIds = [room.players[rp].id,player.agentId];
	  					console.log("consoleee", agentRoleId, allAgents, allAgentsFromToIds)
	  					for(let rd=agentRoleId; rd >= 0; rd--){
	  						if(rd == 0){console.log("in first")
	  							let master = await Sys.App.Services.agentServices.getSingleAgentData({_id: allAgents[allAgents.length-1]});

	  							allAgentsRole.push('admin');

	  							await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, room.game.roundBets[rp], adminRack, totalRackDeduction, allAgentsRole[allAgentsRole.length-2], allAgentsRole[allAgentsRole.length-1], allAgentsFromToIds[allAgentsFromToIds.length-2], allAgentsFromToIds[allAgentsFromToIds.length-1], room.game.gameNumber);
	  						}
	  						else{ console.log("in second")
	  							let agent = await Sys.App.Services.agentServices.getSingleAgentData({_id: allAgents[allAgents.length-1]});
	  							allAgents.push(agent.parentId);

	  							allAgentsRole.push(agent.role + ' ( ' + agent.email + ')');

	  							let tempRackDeduction = eval( parseFloat( ( totalRackDeduction * (100 - agent.commission) )/100 ).toFixed(4) );
	  							console.log("tempRackDeduction", tempRackDeduction)
	  							totalRackDeduction = totalRackDeduction - tempRackDeduction;

	  							adminRack = agent.commission;

	  							await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, room.game.roundBets[rp],  (100- agent.commission) , tempRackDeduction, allAgentsRole[allAgentsRole.length-2], allAgentsRole[allAgentsRole.length-1], allAgentsFromToIds[allAgentsFromToIds.length-2], allAgentsFromToIds[allAgentsFromToIds.length-1], room.game.gameNumber);
	  							allAgentsFromToIds.push(agent.parentId);
	  						}
	  					}
	  				}
	  				else{
	  					console.log("Agent not available");
	  					let playerAgent = await Sys.App.Services.UserServices.getSingleUserData({});
	  					console.log("admin rack agent", playerAgent)
	  					let playerEmail='player ( ' + player.email + ')'
	  					await module.exports.rackDeductionUpdate( room.players[rp].id, room.game.id, totalOfRoundBets, adminRack, totalRackDeduction, playerEmail , 'admin', room.players[rp].id, playerAgent._id, room.game.gameNumber);

	  				}

	  			}else{

	  			}
	  		    allAgentsRole = ['player'];
	  		}
	  	}

	  	return await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room)


	    //res.send(player);
	  }catch(e){
	    console.log("Error in Rack Deduction",e);
	  }
	},*/

	// rackDeduction: async function(room){
	//   try{
	//   	console.log("rack called");
	//   	console.log("rack called room.game.status: ", room.game.status);
	//   	console.log("rack called room.gameWinners: ", room.gameWinners);
	//   	let totalRackOfTheGame = 0;

	// 	//START: Preflop round all player fold not rake dueduct from player
	//   	var foldPlyCount = 0;
	//   	if(room.game.history.length > 0){
	//   		for(var h=0; h<room.game.history.length; h++){
	//   			if(room.game.history[h].gameRound == "Preflop"){
	//   				if(room.game.history[h].playerAction == 6){
	//   					foldPlyCount += 1;
	//   				}else if(room.game.history[h].playerAction != 0 && room.game.history[h].playerAction != 1){
	//   					foldPlyCount -= 1;
	//   				}
	//   			}
	//   		}
	//   	}
	// 	//END: Preflop round all player fold not rake dueduct from player

	//   	console.log("rack called foldPlyCount: ", foldPlyCount);
	//   	if(foldPlyCount == 0 || (foldPlyCount != (parseFloat(room.players.length)-1))){
	//   		console.log("rack diduct")

	//   		let rack = await Sys.Setting;
	// 	  	let adminRack = rack.rakePercenage;
	// 	  	for (let i = 0; i < room.gameWinners.length; i++) {
	// 	  		/*let commission = parseFloat(room.gameWinners[i].chips * (rakeByPercent / 100));
	// 	  		adminChips += commission;
	// 	  		room.gameWinners[i].chips -= commission
	// 	  		room.getPlayerById(room.gameWinners[i].playerId).chips -= commission*/
	// 	  		room.gameWinners[i].amount = eval( parseFloat(room.gameWinners[i].amount).toFixed(4) );
	// 	  		console.log("*******************Rack**********************")
	// 	  		console.log("playerId",room.gameWinners[i].playerId );
	// 	  		console.log("game id",room.game.id, room.game.gameNumber)
	// 	  		console.log("won amount", room.gameWinners[i].amount)
	// 			console.log("*******************Rack***********************")

	// 				//let allAgentsRole = ['player'];
	// 				//let rack = await Sys.Setting; //get Application rack

	// 			let totalRackDeductionWinner = eval( parseFloat( ( parseFloat(room.gameWinners[i].amount) * parseFloat(Sys.Setting.rakePercenage) ) /100 ).toFixed(4) );
	// 			//let adminRack = rack.rakePercenage;
	// 			console.log("totsl rsck deduction", totalRackDeductionWinner, rack, room.gameWinners[i].chips)

	// 			for(let j = i; j < room.gameWinners.length; j++){
	// 				if(room.gameWinners[i].playerId == room.gameWinners[j].playerId){
	// 					room.gameWinners[j].chips -= parseFloat(totalRackDeductionWinner);
	// 				}

	// 			}
	// 			console.log("after deduction chips winner array", room.gameWinners);
	// 			//room.gameWinners[i].chips -= parseFloat(totalRackDeductionWinner);

	// 			console.log("Winners Chips after rack Deduction",room.gameWinners[i].playerId, room.gameWinners[i].chips )
	// 			Sys.Log.info('-----------Game Id-----------: ' + room.game.id, room.game.gameNumber);
	// 			Sys.Log.info('Winners Chips after rack Deduction : ' + room.gameWinners[i].playerId + 'winning final:' + room.gameWinners[i].chips );

	// 			console.log("room.game.gameRevertPoint[i]: ", room.game.gameRevertPoint[i]);

	// 			//START: 12-08-2019 Rake deduction amount from win amount of winner
	// 			/*for(var rp =0; rp<room.game.gameRevertPoint.length; rp++){
	// 				if(room.game.gameRevertPoint[rp].playerID == room.gameWinners[i].playerId){
	// 					room.game.gameRevertPoint[rp].amount -= parseFloat( totalRackDeductionWinner );
	// 				}
	// 			}*/
	// 			//END: 12-08-2019 Rake deduction amount from win amount of winner

	// 			room.getPlayerById(room.gameWinners[i].playerId).chips -= parseFloat( totalRackDeductionWinner );
	// 			totalRackOfTheGame += totalRackDeductionWinner;
	// 	  	}

	// 	}else{
	//   		console.log("rack not diduct")
	//   	}


	//   	console.log("Totalrackofthegame", totalRackOfTheGame, room.game.gameNumber);
	//   	console.log("room.game.roundBets", room.game.roundBets, room.game.gameNumber);
	//   	console.log("Game POT :",room.game.gamePot, room.game.gameNumber);
	//   	console.log("gameMainPot :",room.game.gameMainPot, room.game.gameNumber);
	// 	console.log("Game REvert Point :", room.game.gameRevertPoint, room.game.gameNumber);

	//   	if(totalRackOfTheGame > 0){
	//   		let totalOfRoundBets = 0;
	//   		let allAgentsRole = ['player'];

	//   		let tempRoundBets = room.game.roundBets.slice();
	//   		console.log("tempRoundBets 2", tempRoundBets)
	//   		tempRoundBets.sort(function (a, b) {
	//   		  return a - b;
	//   		});
	//   		console.log("sorted tempRoundBets", tempRoundBets, tempRoundBets[(tempRoundBets.length)-1] , tempRoundBets[(tempRoundBets.length) -2])
	//   		if(tempRoundBets[(tempRoundBets.length)-1] > tempRoundBets[(tempRoundBets.length )-2] ){
	//   			console.log("indexOFFFF", room.game.roundBets.indexOf( tempRoundBets[(tempRoundBets.length)-1] ), "test",  tempRoundBets[(tempRoundBets.length)-1])
	// 			room.game.roundBets[ room.game.roundBets.indexOf( tempRoundBets[(tempRoundBets.length)-1] ) ] = tempRoundBets[(tempRoundBets.length) -2];
	//   			tempRoundBets[(tempRoundBets.length)-1] = tempRoundBets[(tempRoundBets.length) -2];
	// 			//room.game.roundBets[(room.game.roundBets.length) -1] = tempRoundBets[(tempRoundBets.length) -2];

	//   		}
	//   		console.log("roundbetss", room.game.roundBets);
	//   		totalOfRoundBets = parseFloat( ( tempRoundBets.reduce((a, b) => a + b, 0) ).toFixed(4) );

	//   		console.log("sorted tempRoundBets aftercalculation", tempRoundBets)
	//   		console.log("totalofrounsbets", totalOfRoundBets)
	//   		for (let rp = 0; rp < room.players.length; rp++) {
	//   			if( (room.players[rp].status === 'Playing' ) || ( room.players[rp].folded == true && room.players[rp].talked == true )  || ( room.players[rp].status === 'Left' && room.players[rp].talked == true ) ||  ( room.players[rp].status === 'Ideal' && room.players[rp].talked == true ) ){
	//   				console.log("player name and roundbets",room.players[rp].playerName,  room.game.roundBets[rp]);

	//   				totalRackDeduction = parseFloat( ( ( room.game.roundBets[rp] / totalOfRoundBets )* totalRackOfTheGame ).toFixed(4) ) ;
	//   				console.log("totalRackDeduction", room.players[rp].playerName,totalRackDeduction )

	//   				if(totalRackDeduction > 0){
	//   					let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id: room.players[rp].id});
	//   					console.log("inside rack",player.username, player.agentRole, player.agentId);
	//   					if(player.agentId != '' && player.agentId != null && player.agentId != undefined){
	//   						let agentRoleId = rolesArray.indexOf(player.agentRole);
	//   						let allAgents = [player.agentId];
	//   						let allAgentsFromToIds = [room.players[rp].id,player.agentId];
	//   						console.log("consoleee", agentRoleId, allAgents, allAgentsFromToIds)


	//   						let allAgentsRackArray = [];
	//   						let finalAllAgentsRackArray = [];
	//   						for(let rd=agentRoleId; rd >= 0; rd--){
	//   							if(rd != 0){
	//   								let agent = await Sys.App.Services.agentServices.getSingleAgentData({_id: allAgents[allAgents.length-1]});
	//   								allAgents.push(agent.parentId);
	//   								allAgentsRackArray.push(agent.commission)
	//   							}
	//   						}

	//   						console.log("allAgentRackArray", allAgentsRackArray);
	//   						allAgentsRackArray.unshift( ( 100 - allAgentsRackArray.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) ) );

	//   						finalAllAgentsRackArray = allAgentsRackArray.reverse();
	//   						//reverseArray.push(0);
	//   						console.log("reversed array with finalAllAgentsRackArray", finalAllAgentsRackArray)


	//   						/*if(reverseArray.length >= 3){
	//   						  for(let i= 0; i < ( reverseArray.length - 1); i++)
	//   						  {
	//   						    console.log(i);
	//   						    finalAllAgentsRackArray.push( reverseArray[i] - reverseArray[i +1] );
	//   						  }
	//   						}else{
	//   						  finalAllAgentsRackArray.push( reverseArray[0] );
	//   						}


	//   						finalAllAgentsRackArray.unshift( (100 - reverseArray[0]) );
	//   						console.log("finalAllAnetArray", finalAllAgentsRackArray);*/

	//   						//let finalAllAgentsRackArrayReverse = finalAllAgentsRackArray.reverse();
	//   						//console.log("finalAllAgentsRackArrayReverse", finalAllAgentsRackArrayReverse)


	//   						allAgents = [player.agentId];

	//   						for(let rd=agentRoleId; rd >= 0; rd--){
	//   							if(rd == 0){console.log("in first")
	//   								let master = await Sys.App.Services.agentServices.getSingleAgentData({_id: allAgents[allAgents.length-1]});

	//   								allAgentsRole.push('admin');
	//   								console.log("rack deduction percentage admin", finalAllAgentsRackArray[rd])
	//   								let tempRackDeduction = eval( parseFloat( ( totalRackDeduction * finalAllAgentsRackArray[rd] )/100 ).toFixed(4) );
	//   								console.log("tempRackDeduction admin", tempRackDeduction);
	//   								console.log("tempRackDeduction admin", tempRackDeduction);
	//   								console.log("tempRackDeduction admin rackFrom: ", allAgentsRole[allAgentsRole.length-2]);
	//   								console.log("tempRackDeduction admin rackTo: ", allAgentsRole[allAgentsRole.length-1]);
	//   								console.log("tempRackDeduction admin rackFromId: ", allAgentsFromToIds[allAgentsFromToIds.length-2]);
	//   								console.log("tempRackDeduction admin rackToId: ", allAgentsFromToIds[allAgentsFromToIds.length-1]);

	//   								await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, room.game.roundBets[rp], finalAllAgentsRackArray[rd], tempRackDeduction, allAgentsRole[allAgentsRole.length-2], allAgentsRole[allAgentsRole.length-1], allAgentsFromToIds[allAgentsFromToIds.length-2], allAgentsFromToIds[allAgentsFromToIds.length-1], room.game.gameNumber);
	//   							}
	//   							else{ console.log("in second")
	//   								let agent = await Sys.App.Services.agentServices.getSingleAgentData({_id: allAgents[allAgents.length-1]});
	//   								allAgents.push(agent.parentId);

	//   								allAgentsRole.push(agent.role + ' ( ' + agent.email + ')');

	//   								//let tempRackDeduction = eval( parseFloat( ( totalRackDeduction * (100 - agent.commission) )/100 ).toFixed(4) );
	//   								console.log("rack deduction percentage", finalAllAgentsRackArray[rd])
	//   								let tempRackDeduction = eval( parseFloat( ( totalRackDeduction * finalAllAgentsRackArray[rd] )/100 ).toFixed(4) );
	//   								console.log("tempRackDeduction", tempRackDeduction)
	//   								//totalRackDeduction = totalRackDeduction - tempRackDeduction;

	//   								//adminRack = agent.commission;

	//   								await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, room.game.roundBets[rp],  finalAllAgentsRackArray[rd] , tempRackDeduction, allAgentsRole[allAgentsRole.length-2], allAgentsRole[allAgentsRole.length-1], allAgentsFromToIds[allAgentsFromToIds.length-2], allAgentsFromToIds[allAgentsFromToIds.length-1], room.game.gameNumber);
	//   								allAgentsFromToIds.push(agent.parentId);
	//   							}
	//   						}
	//   					}
	//   					else{
	//   						console.log("Agent not available");
	//   						let playerAgent = await Sys.App.Services.UserServices.getSingleUserData({});
	//   						console.log("admin rack agent", playerAgent)
	//   						let playerEmail='player ( ' + player.email + ')'
	//   						await module.exports.rackDeductionUpdate( room.players[rp].id, room.game.id, totalOfRoundBets, adminRack, totalRackDeduction, playerEmail , 'admin', room.players[rp].id, playerAgent._id, room.game.gameNumber);
	//   					}
	//   				}
	//   			}else{

	//   			}
	//   		    allAgentsRole = ['player'];
	//   		}
	//   	}

	//   	//START 21-08-2019 total rake deduction amount send back new code
	//   		/*var roomUpdate = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
	//   		var returnData = {'totalRackOfTheGame':totalRackOfTheGame, 'room':roomUpdate}
	//   		return returnData;*/
	//   	//END 21-08-2019 total rake deduction amount send back new code

	//   	//START 21-08-2019 total rake deduction amount send back old code
	//   		return await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room)
	//   	//END 21-08-2019 total rake deduction amount send back old code

	//     //res.send(player);
	//   }catch(e){
	//     console.log("Error in Rack Deduction",e);
	//   }
	// },

	//Date: 20-9 before rake cap
	/*rackDeduction: async function (room) {
		try {
			console.log("rack called ");
			let totalRackOfTheGame = 0;
			
			let deductRack = true;
			if (room.game.board.length == 0) {
				deductRack = false;
			}
			//END: Preflop round all player fold not rake dueduct from player

			console.log("deduct rack or not: ", deductRack);
			if (deductRack) {
				let rack = await Sys.Setting;
				let adminRack = rack.rakePercenage;
				for (let i = 0; i < room.gameWinners.length; i++) {
					
					room.gameWinners[i].amount = eval(parseFloat(room.gameWinners[i].amount).toFixed(4));
					console.log("*******************Rack**********************")
					console.log("playerId", room.gameWinners[i].playerId);
					console.log("game id", room.game.id, room.game.gameNumber)
					console.log("won amount", room.gameWinners[i].amount)
					console.log("*******************Rack***********************")

					

					let totalRackDeductionWinner = eval(parseFloat((parseFloat(room.gameWinners[i].amount) * parseFloat(Sys.Setting.rakePercenage)) / 100).toFixed(4));
					room.gameWinners[i].rackAmount = totalRackDeductionWinner;
					//let adminRack = rack.rakePercenage;
					console.log("totsl rsck deduction", totalRackDeductionWinner, rack, room.gameWinners[i].chips)

					for (let j = i; j < room.gameWinners.length; j++) {
						if (room.gameWinners[i].playerId == room.gameWinners[j].playerId) {
							room.gameWinners[j].chips -= parseFloat(totalRackDeductionWinner);
						}

					}

					//var afterBalance = parseFloat(room.gameWinners[i].chips) - parseFloat(room.gameWinners[i].amount);

					console.log("room.gameWinners[i].chips:  ", room.gameWinners[i].chips);

					var winPlayerDetail = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id:room.gameWinners[i].playerId});
					console.log("winPlayerDetail: ", winPlayerDetail);

					if(winPlayerDetail != null){
						var transactionDetail = await Sys.Game.CashGame.Omaha.Services.ChipsServices.getSingleData({user_id : room.gameWinners[i].playerId, gameId : room.game.id});
						console.log("rake deduction transactionDetail: ", transactionDetail);
						console.log("newBalanceChips: ", newBalanceChips);
						if(transactionDetail != null){

							var newafterBalance = parseFloat(transactionDetail.afterBalance) -  parseFloat(totalRackDeductionWinner);
							var newChips = parseFloat(transactionDetail.chips) -  parseFloat(totalRackDeductionWinner);
							
							console.log("newafterBalance: ", newafterBalance);
							console.log("newChips: ", newChips);
							
							await Sys.Game.CashGame.Omaha.Services.ChipsServices.updateTransactionData({user_id : room.gameWinners[i].playerId, gameId : room.game.id},{afterBalance:parseFloat(newafterBalance).toFixed(4), chips:parseFloat(newChips).toFixed(4)});
						}
						
					}

					let transactionData = {
			          	user_id           : room.gameWinners[i].playerId,
			          	username          : room.gameWinners[i].playerName,
			          	gameId            : room.game.id,
			          	gameNumber        : room.game.gameNumber,
			          	chips             : totalRackDeductionWinner,
			          	afterBalance      : room.gameWinners[i].chips,
			          	category          : 'debit',
			          	type              : 'rake',
			          	remark            : 'Player Rake'
			        }

			        console.log("transactionData: ", transactionData);

			        //await Sys.Game.CashGame.Omaha.Services.ChipsServices.createTransaction(transactionData);

					console.log("after deduction chips winner array", room.gameWinners);
					//room.gameWinners[i].chips -= parseFloat(totalRackDeductionWinner);

					console.log("Winners Chips after rack Deduction", room.gameWinners[i].playerId, room.gameWinners[i].chips)
					Sys.Log.info('-----------Game Id-----------: ' + room.game.id, room.game.gameNumber);
					Sys.Log.info('Winners Chips after rack Deduction : ' + room.gameWinners[i].playerId + 'winning final:' + room.gameWinners[i].chips);


					room.getPlayerById(room.gameWinners[i].playerId).chips -= parseFloat(totalRackDeductionWinner);

					totalRackOfTheGame += totalRackDeductionWinner;
				}
			} else {
				console.log("dont cut rake");
			}

			console.log("Totalrackofthegame", totalRackOfTheGame, room.game.gameNumber);
			console.log("room.game.roundBets", room.game.roundBets, room.game.gameNumber);
			console.log("Game POT :", room.game.gamePot, room.game.gameNumber);
			console.log("gameMainPot :", room.game.gameMainPot, room.game.gameNumber);
			console.log("Game REvert Point :", room.game.gameRevertPoint, room.game.gameNumber);	

			if (totalRackOfTheGame > 0) {
				//binita and vatsal code start
				let gameBet = [];
				let total = 0;
				let totalBetAmount = room.game.roundBets.reduce((a, b) => a + b, 0)
				let arr = []
				room.gameWinners.map(z => {
					arr.push(z.playerId)
				})
				arr= [...new Set(arr)]
				room.gameWinners
				for (let index = 0; index < room.game.roundBets.length; index++) {
					let gamePlayers = {}
					
					gamePlayers.playerId = room.players[index].id
					gamePlayers.chips = room.players[index].chips
					gamePlayers.rakeAmount = room.game.roundBets[index] / totalBetAmount * totalRackOfTheGame;
					
					gameBet.push(gamePlayers)
				}
				if (room.gameWinners) {
					let insertData = await Sys.Game.CashGame.Omaha.Services.PlayerTransectionHistoryService.insertPlayerTransectionHistrory(
						{
							gameId: room.game.id,
							gameNumber: room.game.gameNumber,
							gameBetPlayer: gameBet,
							rack: Sys.Setting.rakePercenage,
							winPlayerDetails: room.gameWinners,
							totalRackDeductionWinner: totalRackOfTheGame,
							type: 'rake',
							remark: "rake cut"
						}
					);
				}
				//binita and vatsal code end
				let totalOfRoundBets = 0;
				let allAgentsRole = ['player'];

				let tempRoundBets = room.game.roundBets.slice();
				console.log("tempRoundBets 2", tempRoundBets)
				tempRoundBets.sort(function (a, b) {
					return a - b;
				});
				console.log("sorted tempRoundBets", tempRoundBets, tempRoundBets[(tempRoundBets.length) - 1], tempRoundBets[(tempRoundBets.length) - 2])
				if (tempRoundBets[(tempRoundBets.length) - 1] > tempRoundBets[(tempRoundBets.length) - 2]) {
					console.log("indexOFFFF", room.game.roundBets.indexOf(tempRoundBets[(tempRoundBets.length) - 1]), "test", tempRoundBets[(tempRoundBets.length) - 1])
					room.game.roundBets[room.game.roundBets.indexOf(tempRoundBets[(tempRoundBets.length) - 1])] = tempRoundBets[(tempRoundBets.length) - 2];
					tempRoundBets[(tempRoundBets.length) - 1] = tempRoundBets[(tempRoundBets.length) - 2];
					//room.game.roundBets[(room.game.roundBets.length) -1] = tempRoundBets[(tempRoundBets.length) -2];

				}
				console.log("roundbetss", room.game.roundBets);
				totalOfRoundBets = parseFloat((tempRoundBets.reduce((a, b) => a + b, 0)).toFixed(4));

				console.log("sorted tempRoundBets aftercalculation", tempRoundBets)
				console.log("totalofrounsbets", totalOfRoundBets)
				var rakeDistribution=[];
				for (let rp = 0; rp < room.players.length; rp++) {
					if ((room.players[rp].status === 'Playing') || (room.players[rp].folded == true && room.players[rp].talked == true) || (room.players[rp].status === 'Left' && room.players[rp].talked == true) || (room.players[rp].status === 'Ideal' && room.players[rp].talked == true)) {
						console.log("player name and roundbets", room.players[rp].playerName, room.game.roundBets[rp]);

						totalRackDeduction = parseFloat(((room.game.roundBets[rp] / totalOfRoundBets) * totalRackOfTheGame).toFixed(4));
						console.log("totalRackDeduction", room.players[rp].playerName, totalRackDeduction)

						if (totalRackDeduction > 0) {
							let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: room.players[rp].id });
							console.log("inside rack", player.username, player.agentRole, player.agentId);
							if (player.agentId != '' && player.agentId != null && player.agentId != undefined) {
								let agentRoleId = rolesArray.indexOf(player.agentRole);
								let allAgents = [player.agentId];
								let allAgentsFromToIds = [room.players[rp].id, player.agentId];
								console.log("consoleee", agentRoleId, allAgents, allAgentsFromToIds)


								let allAgentsRackArray = [];
								let finalAllAgentsRackArray = [];
								for (let rd = agentRoleId; rd >= 0; rd--) {
									if (rd != 0) {
										let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });
										allAgents.push(agent.parentId);
										allAgentsRackArray.push(agent.commission)
									}
								}

								console.log("allAgentRackArray", allAgentsRackArray);
								//allAgentsRackArray.push( ( 100 - allAgentsRackArray[allAgentsRackArray.length-1] ) );
								let reverseArray = allAgentsRackArray.reverse();
								reverseArray.push(0);
								console.log("reversed array", reverseArray)


								if (reverseArray.length >= 3) {
									for (let i = 0; i < (reverseArray.length - 1); i++) {
										console.log(i);
										finalAllAgentsRackArray.push(reverseArray[i] - reverseArray[i + 1]);
									}
								} else {
									finalAllAgentsRackArray.push(reverseArray[0]);
								}


								finalAllAgentsRackArray.unshift((100 - reverseArray[0]));
								console.log("finalAllAnetArray", finalAllAgentsRackArray);

								//let finalAllAgentsRackArrayReverse = finalAllAgentsRackArray.reverse();
								//console.log("finalAllAgentsRackArrayReverse", finalAllAgentsRackArrayReverse)


								allAgents = [player.agentId];

								for (let rd = agentRoleId; rd >= 0; rd--) {
									if (rd == 0) {
										console.log("in first")
										let master = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });
										
										allAgentsRole.push('admin');
										console.log("rack deduction percentage admin", finalAllAgentsRackArray[rd])
										let tempRackDeduction = eval(parseFloat((totalRackDeduction * finalAllAgentsRackArray[rd]) / 100).toFixed(4));
										console.log("tempRackDeduction admin", tempRackDeduction);

										let data={}
										data.playerId=room.players[rp].id
										data.totalRake=tempRackDeduction
										data.agentId=allAgentsFromToIds[allAgentsFromToIds.length - 1]
										data.role=allAgentsRole[allAgentsRole.length - 1]
										data.email="admin"
										data.rackPercent=finalAllAgentsRackArray[rd]
										room.game.rakeDistribution.push(data);

										await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, room.game.roundBets[rp], finalAllAgentsRackArray[rd], tempRackDeduction, allAgentsRole[allAgentsRole.length - 2], allAgentsRole[allAgentsRole.length - 1], allAgentsFromToIds[allAgentsFromToIds.length - 2], allAgentsFromToIds[allAgentsFromToIds.length - 1], room.game.gameNumber);
									}
									else {
										console.log("in second")
										let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });
										allAgents.push(agent.parentId);

										allAgentsRole.push(agent.role + ' ( ' + agent.email + ')');

										//let tempRackDeduction = eval( parseFloat( ( totalRackDeduction * (100 - agent.commission) )/100 ).toFixed(4) );
										console.log("rack deduction percentage", finalAllAgentsRackArray[rd])
										let tempRackDeduction = eval(parseFloat((totalRackDeduction * finalAllAgentsRackArray[rd]) / 100).toFixed(4));
										console.log("tempRackDeduction", tempRackDeduction)
										//totalRackDeduction = totalRackDeduction - tempRackDeduction;
										//adminRack = agent.commisiasion;
										let data={}
										data.playerId=room.players[rp].id
										data.totalRake=tempRackDeduction
										data.agentId= allAgentsFromToIds[allAgentsFromToIds.length - 1]
										data.role=agent.role
										data.email=agent.email
										data.rackPercent=finalAllAgentsRackArray[rd]
										room.game.rakeDistribution.push(data);
										await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, room.game.roundBets[rp], finalAllAgentsRackArray[rd], tempRackDeduction, allAgentsRole[allAgentsRole.length - 2], allAgentsRole[allAgentsRole.length - 1], allAgentsFromToIds[allAgentsFromToIds.length - 2], allAgentsFromToIds[allAgentsFromToIds.length - 1], room.game.gameNumber);
										allAgentsFromToIds.push(agent.parentId);
									}
								}
							}
							else {
								console.log("Agent not available");
								let playerAgent = await Sys.App.Services.UserServices.getSingleUserData({});
								console.log("admin rack agent", playerAgent)
								let playerEmail = 'player ( ' + player.email + ')'
								let data={}
										data.playerId=room.players[rp].id
										data.totalRake=totalRackDeduction
										data.agentId= allAgentsFromToIds[allAgentsFromToIds.length - 1]
										data.role="player"
										data.email=playerEmail
										data.rackPercent=adminRack
										room.game.rakeDistribution.push(data);
								await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, totalOfRoundBets, adminRack, totalRackDeduction, playerEmail, 'admin', room.players[rp].id, playerAgent._id, room.game.gameNumber);

							}
						}


					} else {

					}
					allAgentsRole = ['player'];
				}
				// room.game.rakeDistribution.push(rakeDistribution);
			}

			return await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room)


			//res.send(player);
		} catch (e) {
			console.log("Error in Rack Deduction", e);
		}
	}*/

	// rake cap
	// rackDeduction: async function (room) {
	// 	try {
	// 		console.log("rack called ");
	// 		let totalRackOfTheGame = 0;
	// 		//START: Preflop round all player fold not rake dueduct from player
	// 		/*var foldPlyCount = 0;
	// 		if(room.game.history.length > 0){
	// 			for(var h=0; h<room.game.history.length; h++){
	// 				if(room.game.history[h].gameRound == "Preflop"){
	// 					if(room.game.history[h].playerAction == 6){
	// 						foldPlyCount += 1;
	// 					}else if(room.game.history[h].playerAction != 0 && room.game.history[h].playerAction != 1){
	// 						foldPlyCount -= 1;
	// 					}
	// 				}
	// 			}
	// 		}*/
	// 		let deductRack = true;
	// 		if (room.game.board.length == 0) {
	// 			deductRack = false;
	// 		}
	// 		//END: Preflop round all player fold not rake dueduct from player

	// 		console.log("deduct rack or not: ", deductRack);
	// 		if (deductRack) {
	// 			let rack = await Sys.Setting;
	// 			let adminRack = rack.rakePercenage;

	// 			// rake cap
	// 			let stack = room.smallBlind + "/" + room.bigBlind;
	// 			console.log("stackkkk", stack)
	// 			let capData = await Sys.Game.CashGame.Omaha.Services.ChipsServices.getCapByData({stack: stack});
	// 			console.log("capData", capData);
	// 			if(capData.length > 0){
	// 				let playingPlayers =  room.otherData.playingPlayer;
	// 				console.log("playing player", playingPlayers);
					
	// 				let totalWinningAmount = 0;
	// 				for (let i = 0; i < room.gameWinners.length; i++){
	// 					totalWinningAmount += room.gameWinners[i].amount;
	// 				}
	// 				if(totalWinningAmount > 0){
	// 					room.game.rakeCap=[]
	// 					totalRackOfTheGame = parseFloat((parseFloat(totalWinningAmount) * parseFloat(capData[0].rake)) / 100) ;
	// 					console.log("totalRackOfTheGame", totalRackOfTheGame);
	// 					let rakeCapAmount = 0;
	// 					if(playingPlayers == 2){
	// 						rakeCapAmount = capData[0].player2Cap;
	// 					}else if(playingPlayers > 2 && playingPlayers <= 4){
	// 						rakeCapAmount = capData[0].player3Cap;
	// 					}else{
	// 						rakeCapAmount = capData[0].player5Cap;
	// 					}
	// 					console.log("rakeCapAmount", rakeCapAmount);

	// 					if(totalRackOfTheGame > rakeCapAmount){
	// 						totalRackOfTheGame = rakeCapAmount;
	// 					}
	// 					console.log("totalRackOfTheGame After", totalRackOfTheGame);
	// 					capData[0].totalRackOfGame=totalRackOfTheGame
	// 					room.game.rakeCap.push(capData[0])

	// 					if(totalRackOfTheGame > 0){
	// 						for (let i = 0; i < room.gameWinners.length; i++) {
								
	// 							room.gameWinners[i].amount = parseFloat(room.gameWinners[i].amount);
	// 							console.log("*******************Rack**********************")
	// 							console.log("playerId", room.gameWinners[i].playerId);
	// 							console.log("game id", room.game.id, room.game.gameNumber)
	// 							console.log("won amount", room.gameWinners[i].amount)
	// 							console.log("*******************Rack***********************")

	// 							let totalRackDeductionWinner = parseFloat( (parseFloat(room.gameWinners[i].amount) * parseFloat(totalRackOfTheGame)) / totalWinningAmount ) ;
	// 							room.gameWinners[i].rackAmount = totalRackDeductionWinner;
	// 							console.log("totsl rsck deduction", totalRackDeductionWinner, rack, room.gameWinners[i].chips)

	// 							for (let j = i; j < room.gameWinners.length; j++) {
	// 								if (room.gameWinners[i].playerId == room.gameWinners[j].playerId) {
	// 									room.gameWinners[j].chips -= parseFloat(totalRackDeductionWinner);
	// 								}

	// 							}

	// 							console.log("room.gameWinners[i].chips:  ", room.gameWinners[i].chips);

	// 							var winPlayerDetail = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id:room.gameWinners[i].playerId});
	// 							console.log("winPlayerDetail: ", winPlayerDetail);

	// 							if(winPlayerDetail != null){
	// 								var transactionDetail = await Sys.Game.CashGame.Texas.Services.ChipsServices.getSingleData({user_id : room.gameWinners[i].playerId, gameId : room.game.id});
									
	// 								console.log("rake deduction transactionDetail: ", transactionDetail);
	// 								console.log("inPlayerDetail.balance_chips: ", winPlayerDetail.balance_chips);

	// 								var newBalanceChips = parseFloat(winPlayerDetail.balance_chips) -  parseFloat(totalRackDeductionWinner);
	// 								console.log("newBalanceChips: ", newBalanceChips);
	// 								await Sys.App.Services.PlayerServices.updatePlayerData({_id: room.gameWinners[i].playerId},{balance_chips:parseFloat(newBalanceChips)});

	// 								if(transactionDetail != null){

	// 									var newafterBalance = parseFloat(transactionDetail.afterBalance) -  parseFloat(totalRackDeductionWinner);
	// 									var newChips = parseFloat(transactionDetail.chips) -  parseFloat(totalRackDeductionWinner);
										
	// 									console.log("newafterBalance: ", newafterBalance);
	// 									console.log("newChips: ", newChips);
										
	// 									await Sys.Game.CashGame.Texas.Services.ChipsServices.updateTransactionData({user_id : room.gameWinners[i].playerId, gameId : room.game.id},{afterBalance:parseFloat(newafterBalance), chips:parseFloat(newChips)});
	// 								}
									
	// 							}

	// 							let transactionData = {
	// 					          	user_id           : room.gameWinners[i].playerId,
	// 					          	username          : room.gameWinners[i].playerName,
	// 					          	gameId            : room.game.id,
	// 					          	gameNumber        : room.game.gameNumber,
	// 					          	chips             : totalRackDeductionWinner,
	// 					          	afterBalance      : room.gameWinners[i].chips,
	// 					          	category          : 'debit',
	// 					          	type              : 'rake',
	// 					          	remark            : 'Player Rake'
	// 					        }

	// 							console.log("transactionData: ", transactionData);
	// 							console.log("after deduction chips winner array", room.gameWinners);
	// 							console.log("Winners Chips after rack Deduction", room.gameWinners[i].playerId, room.gameWinners[i].chips)
	// 							Sys.Log.info('-----------Game Id-----------: ' + room.game.id, room.game.gameNumber);
	// 							Sys.Log.info('Winners Chips after rack Deduction : ' + room.gameWinners[i].playerId + 'winning final:' + room.gameWinners[i].chips);

	// 							var gamePortData = await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.getSingleData({isGamePot: 'no',type: 'winner', user_id: room.gameWinners[i].playerId, gameId: room.game.id});
	// 					        if(gamePortData != null){

	// 						        var currentTotalChips = (parseFloat(gamePortData.afterBalance) - parseFloat(totalRackDeductionWinner));

	// 						        let transactionDataPot = {
	// 						            user_id: room.gameWinners[i].playerId,
	// 						            username: room.gameWinners[i].playerName,
	// 						            gameId: room.game.id,
	// 						            gameNumber: room.game.gameNumber,
	// 						            tableId: room.id,
	// 						            tableName: room.name,
	// 						            chips:  parseFloat(totalRackDeductionWinner),
	// 						            previousBalance: parseFloat(gamePortData.afterBalance),
	// 						            afterBalance: parseFloat(currentTotalChips),
	// 						            category: 'debit',
	// 						            type: 'rake',
	// 						            remark: 'Rake Deduct',
	// 						            isTournament: 'No',
	// 						            isGamePot: 'no'
	// 						        }
	// 						        console.log("omaha rake deduct transactionDataPot: ", transactionDataPot);
	// 						        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataPot);

	// 					        }
	// 							room.getPlayerById(room.gameWinners[i].playerId).chips -= parseFloat(totalRackDeductionWinner);
								
	// 						}
	// 					}
						
	// 				}		

	// 			}else{
	// 				for (let i = 0; i < room.gameWinners.length; i++) {
	// 					/*let commission = parseFloat(room.gameWinners[i].chips * (rakeByPercent / 100));
	// 					adminChips += commission;
	// 					room.gameWinners[i].chips -= commission
	// 					room.getPlayerById(room.gameWinners[i].playerId).chips -= commission*/
	// 					room.gameWinners[i].amount = parseFloat(room.gameWinners[i].amount);
	// 					console.log("*******************Rack**********************")
	// 					console.log("playerId", room.gameWinners[i].playerId);
	// 					console.log("game id", room.game.id, room.game.gameNumber)
	// 					console.log("won amount", room.gameWinners[i].amount)
	// 					console.log("*******************Rack***********************")

	// 					//let allAgentsRole = ['player'];
	// 					//let rack = await Sys.Setting; //get Application rack

	// 					let totalRackDeductionWinner = parseFloat((parseFloat(room.gameWinners[i].amount) * parseFloat(Sys.Setting.rakePercenage)) / 100);
	// 					let ExtraRackDeduction = parseFloat( (parseFloat(room.gameWinners[i].amount) * parseFloat(Sys.Setting.adminExtraRakePercentage)) / 100) ;
	// 					room.gameWinners[i].rackAmount = totalRackDeductionWinner + ExtraRackDeduction;

	// 					let adminData = await Sys.App.Services.UserServices.getSingleUserData();
	// 					await Sys.App.Services.UserServices.updateUserData({ _id: adminData.id }, { extraRakeChips: (parseFloat((adminData.extraRakeChips + ExtraRackDeduction)).toFixed(4)) })
	// 					//let adminRack = rack.rakePercenage;
	// 					console.log("totsl rsck deduction", totalRackDeductionWinner,ExtraRackDeduction, rack, room.gameWinners[i].chips)

	// 					for (let j = i; j < room.gameWinners.length; j++) {
	// 						if (room.gameWinners[i].playerId == room.gameWinners[j].playerId) {
	// 							room.gameWinners[j].chips -= parseFloat(totalRackDeductionWinner + ExtraRackDeduction);
	// 						}

	// 					}

	// 					//var afterBalance = parseFloat(room.gameWinners[i].chips) - parseFloat(room.gameWinners[i].amount);

	// 					console.log("room.gameWinners[i].chips:  ", room.gameWinners[i].chips);

	// 					var winPlayerDetail = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id:room.gameWinners[i].playerId});
	// 					console.log("winPlayerDetail: ", winPlayerDetail);

	// 					if(winPlayerDetail != null){
	// 						var transactionDetail = await Sys.Game.CashGame.Texas.Services.ChipsServices.getSingleData({user_id : room.gameWinners[i].playerId, gameId : room.game.id});
							
	// 						console.log("rake deduction transactionDetail: ", transactionDetail);
	// 						console.log("inPlayerDetail.balance_chips: ", winPlayerDetail.balance_chips);

	// 						var newBalanceChips = parseFloat(winPlayerDetail.balance_chips) -  parseFloat(totalRackDeductionWinner + ExtraRackDeduction);
	// 						console.log("newBalanceChips: ", newBalanceChips);
	// 						await Sys.App.Services.PlayerServices.updatePlayerData({_id: room.gameWinners[i].playerId},{balance_chips:parseFloat(newBalanceChips)});

	// 						if(transactionDetail != null){

	// 							var newafterBalance = parseFloat(transactionDetail.afterBalance) -  parseFloat(totalRackDeductionWinner + ExtraRackDeduction);
	// 							var newChips = parseFloat(transactionDetail.chips) -  parseFloat(totalRackDeductionWinner + ExtraRackDeduction);
								
	// 							console.log("newafterBalance: ", newafterBalance);
	// 							console.log("newChips: ", newChips);
								
	// 							await Sys.Game.CashGame.Omaha.Services.ChipsServices.updateTransactionData({user_id : room.gameWinners[i].playerId, gameId : room.game.id},{afterBalance:parseFloat(newafterBalance), chips:parseFloat(newChips)});
	// 						}
							
	// 					}

	// 					let transactionData = {
	// 			          	user_id           : room.gameWinners[i].playerId,
	// 			          	username          : room.gameWinners[i].playerName,
	// 			          	gameId            : room.game.id,
	// 			          	gameNumber        : room.game.gameNumber,
	// 			          	chips             : totalRackDeductionWinner,
	// 			          	afterBalance      : room.gameWinners[i].chips,
	// 			          	category          : 'debit',
	// 			          	type              : 'rake',
	// 			          	remark            : 'Player Rake'
	// 			        }

	// 			        console.log("transactionData: ", transactionData);

	// 			        //await Sys.Game.CashGame.Omaha.Services.ChipsServices.createTransaction(transactionData);

	// 					console.log("after deduction chips winner array", room.gameWinners);
	// 					//room.gameWinners[i].chips -= parseFloat(totalRackDeductionWinner);

	// 					console.log("Winners Chips after rack Deduction", room.gameWinners[i].playerId, room.gameWinners[i].chips)
	// 					Sys.Log.info('-----------Game Id-----------: ' + room.game.id, room.game.gameNumber);
	// 					Sys.Log.info('Winners Chips after rack Deduction : ' + room.gameWinners[i].playerId + 'winning final:' + room.gameWinners[i].chips);


	// 					room.getPlayerById(room.gameWinners[i].playerId).chips -= parseFloat(totalRackDeductionWinner + ExtraRackDeduction);
	// 					var gamePortData = await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.getSingleData({isGamePot: 'no', type: 'winner', user_id: room.gameWinners[i].playerId, gameId: room.game.id});
	// 			        if(gamePortData != null){

	// 				        var currentTotalChips = (parseFloat(gamePortData.afterBalance) - parseFloat(totalRackDeductionWinner + ExtraRackDeduction));

	// 				        let transactionDataPot = {
	// 				            user_id: room.gameWinners[i].playerId,
	// 				            username: room.gameWinners[i].playerName,
	// 				            gameId: room.game.id,
	// 				            gameNumber: room.game.gameNumber,
	// 				            tableId: room.id,
	// 				            tableName: room.name,
	// 				            chips:  parseFloat(totalRackDeductionWinner),
	// 				            previousBalance: parseFloat(gamePortData.afterBalance),
	// 				            afterBalance: parseFloat(currentTotalChips),
	// 				            category: 'debit',
	// 				            type: 'rake',
	// 				            remark: 'Rake Deduct',
	// 				            isTournament: 'No',
	// 				            isGamePot: 'no'
	// 				        }
	// 				        console.log("omaha rake deduct transactionDataPot: ", transactionDataPot);
	// 				        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataPot);
	// 			        }

	// 					totalRackOfTheGame += totalRackDeductionWinner + ExtraRackDeduction;
	// 				}
	// 			}


				
				
	// 		} else {
	// 			console.log("dont cut rake");
	// 		}

	// 		console.log("Totalrackofthegame", totalRackOfTheGame, room.game.gameNumber);
	// 		console.log("room.game.roundBets", room.game.roundBets, room.game.gameNumber);
	// 		console.log("Game POT :", room.game.gamePot, room.game.gameNumber);
	// 		console.log("gameMainPot :", room.game.gameMainPot, room.game.gameNumber);
	// 		console.log("Game REvert Point :", room.game.gameRevertPoint, room.game.gameNumber);	

	// 		if (totalRackOfTheGame > 0) {
	// 			//binita and vatsal code start
	// 			let gameBet = [];
	// 			let total = 0;
	// 			let totalBetAmount = room.game.roundBets.reduce((a, b) => a + b, 0)
	// 			let arr = []
	// 			room.gameWinners.map(z => {
	// 				arr.push(z.playerId)
	// 			})
	// 			arr= [...new Set(arr)]
	// 			room.gameWinners
	// 			for (let index = 0; index < room.game.roundBets.length; index++) {
	// 				let gamePlayers = {}
					
	// 				gamePlayers.playerId = room.players[index].id
	// 				gamePlayers.chips = room.players[index].chips
	// 				gamePlayers.rakeAmount = room.game.roundBets[index] / totalBetAmount * totalRackOfTheGame;
	// 				/*if(!arr.includes(id)){
	// 					gamePlayers.totalBat = room.game.roundBets[index]
	// 				}else{
	// 					room.gameWinners.find(function (element) { 
	// 						if(element.playerId == gamePlayers.playerId){
	// 							gamePlayers.totalBat += room.game.roundBets[index]-gamePlayers.rakeAmount-element.amount;
	// 						} }) 
						
	// 				}*/
	// 				gameBet.push(gamePlayers)
	// 			}
	// 			if (room.gameWinners) {
	// 				let insertData = await Sys.Game.CashGame.Omaha.Services.PlayerTransectionHistoryService.insertPlayerTransectionHistrory(
	// 					{
	// 						gameId: room.game.id,
	// 						gameNumber: room.game.gameNumber,
	// 						gameBetPlayer: gameBet,
	// 						rack: Sys.Setting.rakePercenage,
	// 						winPlayerDetails: room.gameWinners,
	// 						totalRackDeductionWinner: totalRackOfTheGame,
	// 						type: 'rake',
	// 						remark: "rake cut"
	// 					}
	// 				);
	// 			}
	// 			//binita and vatsal code end
	// 			let totalOfRoundBets = 0;
	// 			let allAgentsRole = ['player'];

	// 			let tempRoundBets = room.game.roundBets.slice();
	// 			console.log("tempRoundBets 2", tempRoundBets)
	// 			tempRoundBets.sort(function (a, b) {
	// 				return a - b;
	// 			});
	// 			console.log("sorted tempRoundBets", tempRoundBets, tempRoundBets[(tempRoundBets.length) - 1], tempRoundBets[(tempRoundBets.length) - 2])
	// 			if (tempRoundBets[(tempRoundBets.length) - 1] > tempRoundBets[(tempRoundBets.length) - 2]) {
	// 				console.log("indexOFFFF", room.game.roundBets.indexOf(tempRoundBets[(tempRoundBets.length) - 1]), "test", tempRoundBets[(tempRoundBets.length) - 1])
	// 				room.game.roundBets[room.game.roundBets.indexOf(tempRoundBets[(tempRoundBets.length) - 1])] = tempRoundBets[(tempRoundBets.length) - 2];
	// 				tempRoundBets[(tempRoundBets.length) - 1] = tempRoundBets[(tempRoundBets.length) - 2];
	// 				//room.game.roundBets[(room.game.roundBets.length) -1] = tempRoundBets[(tempRoundBets.length) -2];

	// 			}
	// 			console.log("roundbetss", room.game.roundBets);
	// 			totalOfRoundBets = parseFloat((tempRoundBets.reduce((a, b) => a + b, 0)).toFixed(4));

	// 			console.log("sorted tempRoundBets aftercalculation", tempRoundBets)
	// 			console.log("totalofrounsbets", totalOfRoundBets)
	// 			var rakeDistribution=[];
	// 			for (let rp = 0; rp < room.players.length; rp++) {
	// 				if ((room.players[rp].status === 'Playing') || (room.players[rp].folded == true && room.game.roundBets[rp] > 0) || (room.players[rp].considerLeftedPlayer == true && room.game.roundBets[rp] > 0) || (room.players[rp].status === 'Left' && room.game.roundBets[rp] > 0) || (room.players[rp].status === 'Ideal' && room.game.roundBets[rp] > 0)) {
	// 					console.log("player name and roundbets", room.players[rp].playerName, room.game.roundBets[rp]);

	// 					let totalRackDeduction = parseFloat(((room.game.roundBets[rp] / totalOfRoundBets) * totalRackOfTheGame));
	// 					console.log("totalRackDeduction", room.players[rp].playerName, totalRackDeduction)

	// 					if (totalRackDeduction > 0) {
	// 						let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: room.players[rp].id });
	// 						console.log("inside rack", player.username, player.agentRole, player.agentId);
	// 						if (player.agentId != '' && player.agentId != null && player.agentId != undefined) {
	// 							let agentRoleId = rolesArray.indexOf(player.agentRole);
	// 							let allAgents = [player.agentId];
	// 							let allAgentsFromToIds = [room.players[rp].id, player.agentId];
	// 							console.log("consoleee", agentRoleId, allAgents, allAgentsFromToIds)


	// 							let allAgentsRackArray = [];
	// 							let finalAllAgentsRackArray = [];
	// 							for (let rd = agentRoleId; rd >= 0; rd--) {
	// 								if (rd != 0) {
	// 									let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });
	// 									allAgents.push(agent.parentId);
	// 									allAgentsRackArray.push(agent.commission)
	// 								}
	// 							}

	// 							console.log("allAgentRackArray", allAgentsRackArray);
	// 							//allAgentsRackArray.push( ( 100 - allAgentsRackArray[allAgentsRackArray.length-1] ) );
	// 							let reverseArray = allAgentsRackArray.reverse();
	// 							reverseArray.push(0);
	// 							console.log("reversed array", reverseArray)


	// 							if (reverseArray.length >= 3) {
	// 								for (let i = 0; i < (reverseArray.length - 1); i++) {
	// 									console.log(i);
	// 									finalAllAgentsRackArray.push(reverseArray[i] - reverseArray[i + 1]);
	// 								}
	// 							} else {
	// 								finalAllAgentsRackArray.push(reverseArray[0]);
	// 							}


	// 							finalAllAgentsRackArray.unshift((100 - reverseArray[0]));
	// 							console.log("finalAllAnetArray", finalAllAgentsRackArray);

	// 							//let finalAllAgentsRackArrayReverse = finalAllAgentsRackArray.reverse();
	// 							//console.log("finalAllAgentsRackArrayReverse", finalAllAgentsRackArrayReverse)


	// 							allAgents = [player.agentId];

	// 							for (let rd = agentRoleId; rd >= 0; rd--) {
	// 								if (rd == 0) {
	// 									console.log("in first")
	// 									let master = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });
										
	// 									allAgentsRole.push('admin');
	// 									console.log("rack deduction percentage admin", finalAllAgentsRackArray[rd], totalRackDeduction)
	// 									let tempRackDeduction = parseFloat((totalRackDeduction * finalAllAgentsRackArray[rd]) / 100);
	// 									console.log("tempRackDeduction admin", tempRackDeduction);

	// 									let data={}
	// 									data.playerId=room.players[rp].id
	// 									data.totalRake=tempRackDeduction
	// 									data.agentId=allAgentsFromToIds[allAgentsFromToIds.length - 1]
	// 									data.role=allAgentsRole[allAgentsRole.length - 1]
	// 									data.email="admin"
	// 									data.rackPercent=finalAllAgentsRackArray[rd]
	// 									room.game.rakeDistribution.push(data);
	// 									room.game.gameTotalChips = parseFloat(parseFloat(room.game.gameTotalChips) - parseFloat(tempRackDeduction));
	// 									await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, room.game.roundBets[rp], finalAllAgentsRackArray[rd], tempRackDeduction, allAgentsRole[allAgentsRole.length - 2], allAgentsRole[allAgentsRole.length - 1], allAgentsFromToIds[allAgentsFromToIds.length - 2], allAgentsFromToIds[allAgentsFromToIds.length - 1], room.game.gameNumber);
	// 								}
	// 								else {
	// 									console.log("in second")
	// 									let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });
	// 									allAgents.push(agent.parentId);

	// 									allAgentsRole.push(agent.role + ' ( ' + agent.email + ')');

	// 									//let tempRackDeduction = eval( parseFloat( ( totalRackDeduction * (100 - agent.commission) )/100 ).toFixed(4) );
	// 									console.log("rack deduction percentage", finalAllAgentsRackArray[rd], totalRackDeduction)
	// 									let tempRackDeduction = parseFloat((totalRackDeduction * finalAllAgentsRackArray[rd]) / 100);
	// 									console.log("tempRackDeduction", tempRackDeduction)
	// 									//totalRackDeduction = totalRackDeduction - tempRackDeduction;
	// 									//adminRack = agent.commisiasion;
	// 									let data={}
	// 									data.playerId=room.players[rp].id
	// 									data.totalRake=tempRackDeduction
	// 									data.agentId= allAgentsFromToIds[allAgentsFromToIds.length - 1]
	// 									data.role=agent.role
	// 									data.email=agent.email
	// 									data.rackPercent=finalAllAgentsRackArray[rd]
	// 									room.game.rakeDistribution.push(data);
	// 									room.game.gameTotalChips = parseFloat(parseFloat(room.game.gameTotalChips) - parseFloat(tempRackDeduction));
	// 									await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, room.game.roundBets[rp], finalAllAgentsRackArray[rd], tempRackDeduction, allAgentsRole[allAgentsRole.length - 2], allAgentsRole[allAgentsRole.length - 1], allAgentsFromToIds[allAgentsFromToIds.length - 2], allAgentsFromToIds[allAgentsFromToIds.length - 1], room.game.gameNumber);
	// 									allAgentsFromToIds.push(agent.parentId);
	// 								}
	// 							}
	// 						}
	// 						else {
	// 							console.log("Agent not available");
	// 							let playerAgent = await Sys.App.Services.UserServices.getSingleUserData({});
	// 							console.log("admin rack agent", playerAgent)
	// 							let playerEmail = 'player ( ' + player.email + ')'
	// 							let data={}
	// 									data.playerId=room.players[rp].id
	// 									data.totalRake=totalRackDeduction
	// 									data.agentId= allAgentsFromToIds[allAgentsFromToIds.length - 1]
	// 									data.role="player"
	// 									data.email=playerEmail
	// 									data.rackPercent=adminRack
	// 									room.game.rakeDistribution.push(data);
	// 									room.game.gameTotalChips = parseFloat(parseFloat(room.game.gameTotalChips) - parseFloat(totalRackDeduction));
	// 							await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, totalOfRoundBets, adminRack, totalRackDeduction, playerEmail, 'admin', room.players[rp].id, playerAgent._id, room.game.gameNumber);

	// 						}
	// 					}


	// 				} else {

	// 				}
	// 				allAgentsRole = ['player'];
	// 			}
	// 			// room.game.rakeDistribution.push(rakeDistribution);
	// 		}

	// 		return await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room)


	// 		//res.send(player);
	// 	} catch (e) {
	// 		console.log("Error in Rack Deduction", e);
	// 	}
	// }


	rackDeduction: async function (room) {
		try {
			console.log("rack called ");
			let totalRackOfTheGame = 0;
			let ExtraRackDeduction = 0;
			//START: Preflop round all player fold not rake dueduct from player
			/*var foldPlyCount = 0;
			if(room.game.history.length > 0){
				for(var h=0; h<room.game.history.length; h++){
					if(room.game.history[h].gameRound == "Preflop"){
						if(room.game.history[h].playerAction == 6){
							foldPlyCount += 1;
						}else if(room.game.history[h].playerAction != 0 && room.game.history[h].playerAction != 1){
							foldPlyCount -= 1;
						}
					}
				}
			}*/
			let deductRack = true;
			if (room.game.board.length == 0) {
				deductRack = false;
			}
			//END: Preflop round all player fold not rake dueduct from player

			console.log("deduct rack or not: ", deductRack);
			if (deductRack) {
				let rack = await Sys.Setting;
				let adminRack = rack.rakePercenage;
				
				// rake cap
				let stack = room.smallBlind + "/" + room.bigBlind;
				console.log("stackkkk", stack)
				let capData = await Sys.Game.CashGame.Omaha.Services.ChipsServices.getCapByData({stack: stack});
				console.log("capData", capData);
				if(capData.length > 0){
					let playingPlayers =  room.otherData.playingPlayer;
					
					console.log("playing player", playingPlayers);
					
					let totalWinningAmount = 0;
					for (let i = 0; i < room.gameWinners.length; i++){
						totalWinningAmount += room.gameWinners[i].amount;
					}
					if(totalWinningAmount > 0){
						room.game.rakeCap=[]
						totalRackOfTheGame = parseFloat((parseFloat(totalWinningAmount) * parseFloat(capData[0].rake)) / 100) ;
						console.log("totalRackOfTheGame", totalRackOfTheGame);
						
						let rakeCapAmount = 0;
						if(playingPlayers == 2){
							rakeCapAmount = capData[0].player2Cap;
						}else if(playingPlayers > 2 && playingPlayers <= 4){
							rakeCapAmount = capData[0].player3Cap;
						}else{
							rakeCapAmount = capData[0].player5Cap;
						}
						console.log("rakeCapAmount", rakeCapAmount);

						if(totalRackOfTheGame > rakeCapAmount){
							totalRackOfTheGame = rakeCapAmount;
						}
						console.log("totalRackOfTheGame After", totalRackOfTheGame);
						capData[0].totalRackOfGame=totalRackOfTheGame
						room.game.rakeCap.push(capData[0])
						
						if(totalRackOfTheGame > 0){
							for (let i = 0; i < room.gameWinners.length; i++) {
								
								room.gameWinners[i].amount = parseFloat(room.gameWinners[i].amount);
								console.log("*******************Rack**********************")
								console.log("playerId", room.gameWinners[i].playerId);
								console.log("game id", room.game.id, room.game.gameNumber)
								console.log("won amount", room.gameWinners[i].amount)
								console.log("*******************Rack***********************")

								let totalRackDeductionWinner = parseFloat( (parseFloat(room.gameWinners[i].amount) * parseFloat(totalRackOfTheGame)) / totalWinningAmount ) ;
								ExtraRackDeduction = parseFloat( (parseFloat(room.gameWinners[i].amount) * parseFloat(Sys.Setting.adminExtraRakePercentage)) / 100) ;
								room.gameWinners[i].rackAmount = totalRackDeductionWinner + ExtraRackDeduction;
								room.game.gameTotalChips = parseFloat(parseFloat(room.game.gameTotalChips) - parseFloat(ExtraRackDeduction));
								let adminData = await Sys.App.Services.UserServices.getSingleUserData();
								//await Sys.App.Services.UserServices.updateUserData({ _id: adminData.id }, { extraRakeChips: (parseFloat((adminData.extraRakeChips + ExtraRackDeduction)).toFixed(4)) })
								await Sys.App.Services.UserServices.findOneAndUpdate({ _id: adminData.id }, { $inc: { extraRakeChips: +ExtraRackDeduction.toFixed(4) }} );
								let traNumber = + new Date()										
								let inserdata = await Sys.App.Services.RackHistoryServices.insertData({
									'player': room.gameWinners[i].playerId,
									'game': room.game.id,
									'gameNumber': room.game.gameNumber,
									'rackFromId': room.gameWinners[i].playerId,
									'rackToId': adminData.id,
									'rackFrom': "player",
									'rackTo': "admin",
									'rackPercent': Sys.Setting.adminExtraRakePercentage,
									'totalRack': eval(parseFloat(ExtraRackDeduction).toFixed(4)),
									'createdAt': new Date(),
									transactionNumber: 'DEP-' + traNumber,
									'rackToAfter_balance':adminData.extraRakeChips + ExtraRackDeduction,
									'rackToBefore_balance':adminData.extraRakeChips,
									'adminChips':true,
									'type':"rake"
								});
								let data={}
								data.playerId="Admin Chips"
								data.totalRake=ExtraRackDeduction
								data.agentId=adminData.id
								data.role="admin"
								data.level=1
								data.email="admin"
								data.rackPercent=Sys.Setting.adminExtraRakePercentage
								data.adminChips=true
								room.game.rakeDistribution.push(data);
		
								console.log("totsl rsck deduction", totalRackDeductionWinner,ExtraRackDeduction, rack, room.gameWinners[i].chips)

								for (let j = i; j < room.gameWinners.length; j++) {
									if (room.gameWinners[i].playerId == room.gameWinners[j].playerId) {
										room.gameWinners[j].chips -= parseFloat(totalRackDeductionWinner + ExtraRackDeduction);
									}

								}

								console.log("room.gameWinners[i].chips:  ", room.gameWinners[i].chips);

								var winPlayerDetail = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id:room.gameWinners[i].playerId});
								console.log("winPlayerDetail: ", winPlayerDetail);

								if(winPlayerDetail != null){
									var transactionDetail = await Sys.Game.CashGame.Omaha.Services.ChipsServices.getSingleData({user_id : room.gameWinners[i].playerId, gameId : room.game.id});
									
									console.log("rake deduction transactionDetail: ", transactionDetail);
									if(transactionDetail != null){

										var newafterBalance = parseFloat(transactionDetail.afterBalance) -  parseFloat(totalRackDeductionWinner + ExtraRackDeduction);
										var newChips = parseFloat(transactionDetail.chips) -  parseFloat(totalRackDeductionWinner + ExtraRackDeduction);
										
										console.log("newafterBalance: ", newafterBalance);
										console.log("newChips: ", newChips);
										
										await Sys.Game.CashGame.Omaha.Services.ChipsServices.updateTransactionData({user_id : room.gameWinners[i].playerId, gameId : room.game.id},{afterBalance:parseFloat(newafterBalance), chips:parseFloat(newChips)});
									}
									
								}

								let transactionData = {
						          	user_id           : room.gameWinners[i].playerId,
						          	username          : room.gameWinners[i].playerName,
						          	gameId            : room.game.id,
						          	gameNumber        : room.game.gameNumber,
						          	chips             : totalRackDeductionWinner,
						          	afterBalance      : room.gameWinners[i].chips,
						          	category          : 'debit',
						          	type              : 'rake',
						          	remark            : 'Player Rake'
						        }

								console.log("transactionData: ", transactionData);
								console.log("after deduction chips winner array", room.gameWinners);
								console.log("Winners Chips after rack Deduction", room.gameWinners[i].playerId, room.gameWinners[i].chips)
								Sys.Log.info('-----------Game Id-----------: ' + room.game.id, room.game.gameNumber);
								Sys.Log.info('Winners Chips after rack Deduction : ' + room.gameWinners[i].playerId + 'winning final:' + room.gameWinners[i].chips);

								var gamePortData = await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.getSingleData({isGamePot: 'no',type: 'winner', user_id: room.gameWinners[i].playerId, gameId: room.game.id});
						        if(gamePortData != null){

							        var currentTotalChips = (parseFloat(gamePortData.afterBalance) - parseFloat(totalRackDeductionWinner + ExtraRackDeduction));

							        let transactionDataPot = {
							            user_id: room.gameWinners[i].playerId,
							            username: room.gameWinners[i].playerName,
							            gameId: room.game.id,
							            gameNumber: room.game.gameNumber,
							            tableId: room.id,
							            tableName: room.name,
							            chips:  parseFloat(totalRackDeductionWinner),
							            previousBalance: parseFloat(gamePortData.afterBalance),
							            afterBalance: parseFloat(currentTotalChips),
							            category: 'debit',
							            type: 'rake',
							            remark: 'Rake Deduct',
							            isTournament: 'No',
							            isGamePot: 'no'
							        }
							        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataPot);
						        }
								
								room.getPlayerById(room.gameWinners[i].playerId).chips -= parseFloat(totalRackDeductionWinner + ExtraRackDeduction);
								
							}
						}
						
					}		

				}else{
					for (let i = 0; i < room.gameWinners.length; i++) {
						/*let commission = parseFloat(room.gameWinners[i].chips * (rakeByPercent / 100));
						adminChips += commission;
						room.gameWinners[i].chips -= commission
						room.getPlayerById(room.gameWinners[i].playerId).chips -= commission*/
						room.gameWinners[i].amount = parseFloat(room.gameWinners[i].amount);
						console.log("*******************Rack**********************")
						console.log("playerId", room.gameWinners[i].playerId);
						console.log("game id", room.game.id, room.game.gameNumber)
						console.log("won amount", room.gameWinners[i].amount)
						console.log("*******************Rack***********************")

						//let allAgentsRole = ['player'];
						//let rack = await Sys.Setting; //get Application rack

						let totalRackDeductionWinner = parseFloat( (parseFloat(room.gameWinners[i].amount) * parseFloat(Sys.Setting.rakePercenage)) / 100) ;
						ExtraRackDeduction = parseFloat( (parseFloat(room.gameWinners[i].amount) * parseFloat(Sys.Setting.adminExtraRakePercentage)) / 100) ;
						room.gameWinners[i].rackAmount = totalRackDeductionWinner + ExtraRackDeduction;
						room.game.gameTotalChips = parseFloat(parseFloat(room.game.gameTotalChips) - parseFloat(ExtraRackDeduction));
						let adminData = await Sys.App.Services.UserServices.getSingleUserData();
						//await Sys.App.Services.UserServices.updateUserData({ _id: adminData.id }, { extraRakeChips: (parseFloat((adminData.extraRakeChips + ExtraRackDeduction)).toFixed(4)) })
						await Sys.App.Services.UserServices.findOneAndUpdate({ _id: adminData.id }, { $inc: { extraRakeChips: +ExtraRackDeduction.toFixed(4) }} );
						//let adminRack = rack.rakePercenage;
						let traNumber = + new Date()										
						let inserdata = await Sys.App.Services.RackHistoryServices.insertData({
							'player': room.gameWinners[i].playerId,
							'game': room.game.id,
							'gameNumber': room.game.gameNumber,
							'rackFromId': room.gameWinners[i].playerId,
							'rackToId': adminData.id,
							'rackFrom': "player",
							'rackTo': "admin",
							'rackPercent': Sys.Setting.adminExtraRakePercentage,
							'totalRack': eval(parseFloat(ExtraRackDeduction).toFixed(4)),
							'createdAt': new Date(),
							transactionNumber: 'DEP-' + traNumber,
							'rackToAfter_balance':adminData.extraRakeChips + ExtraRackDeduction,
							'rackToBefore_balance':adminData.extraRakeChips,
							'adminChips':true,
							'type':"rake"
						});
						let data={}
						data.playerId="Admin Chips"
						data.totalRake=ExtraRackDeduction
						data.agentId=adminData.id
						data.role="admin"
						data.level=1
						data.email="admin"
						data.rackPercent=Sys.Setting.adminExtraRakePercentage
						data.adminChips=true
						room.game.rakeDistribution.push(data);
						console.log("totsl rsck deduction", totalRackDeductionWinner,ExtraRackDeduction, rack, room.gameWinners[i].chips)

						for (let j = i; j < room.gameWinners.length; j++) {
							if (room.gameWinners[i].playerId == room.gameWinners[j].playerId) {
								room.gameWinners[j].chips -= parseFloat(totalRackDeductionWinner + ExtraRackDeduction);
							}

						}

						//var afterBalance = parseFloat(room.gameWinners[i].chips) - parseFloat(room.gameWinners[i].amount);

						console.log("room.gameWinners[i].chips:  ", room.gameWinners[i].chips);

						var winPlayerDetail = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id:room.gameWinners[i].playerId});
						console.log("winPlayerDetail: ", winPlayerDetail);

						if(winPlayerDetail != null){
							var transactionDetail = await Sys.Game.CashGame.Omaha.Services.ChipsServices.getSingleData({user_id : room.gameWinners[i].playerId, gameId : room.game.id});
							
							console.log("rake deduction transactionDetail: ", transactionDetail);

							// console.log("newBalanceChips: ", newBalanceChips);


							if(transactionDetail != null){

								var newafterBalance = parseFloat(transactionDetail.afterBalance) -  parseFloat(totalRackDeductionWinner +ExtraRackDeduction);
								var newChips = parseFloat(transactionDetail.chips) -  parseFloat(totalRackDeductionWinner + ExtraRackDeduction);
								
								console.log("newafterBalance: ", newafterBalance);
								console.log("newChips: ", newChips);
								
								await Sys.Game.CashGame.Omaha.Services.ChipsServices.updateTransactionData({user_id : room.gameWinners[i].playerId, gameId : room.game.id},{afterBalance:parseFloat(newafterBalance), chips:parseFloat(newChips)});
							}
							
						}

						let transactionData = {
				          	user_id           : room.gameWinners[i].playerId,
				          	username          : room.gameWinners[i].playerName,
				          	gameId            : room.game.id,
				          	gameNumber        : room.game.gameNumber,
				          	chips             : totalRackDeductionWinner,
				          	afterBalance      : room.gameWinners[i].chips,
				          	category          : 'debit',
				          	type              : 'rake',
				          	remark            : 'Player Rake'
				        }

				        console.log("transactionData: ", transactionData);

				        //await Sys.Game.CashGame.Omaha.Services.ChipsServices.createTransaction(transactionData);

						console.log("after deduction chips winner array", room.gameWinners);
						//room.gameWinners[i].chips -= parseFloat(totalRackDeductionWinner);

						console.log("Winners Chips after rack Deduction", room.gameWinners[i].playerId, room.gameWinners[i].chips)
						Sys.Log.info('-----------Game Id-----------: ' + room.game.id, room.game.gameNumber);
						Sys.Log.info('Winners Chips after rack Deduction : ' + room.gameWinners[i].playerId + 'winning final:' + room.gameWinners[i].chips);


						room.getPlayerById(room.gameWinners[i].playerId).chips -= parseFloat(totalRackDeductionWinner + ExtraRackDeduction);

						var gamePortData = await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.getSingleData({isGamePot: 'no', type: 'winner', user_id: room.gameWinners[i].playerId, gameId: room.game.id});
				        if(gamePortData != null){

					        var currentTotalChips = (parseFloat(gamePortData.afterBalance) - parseFloat(totalRackDeductionWinner + ExtraRackDeduction));

					        let transactionDataPot = {
					            user_id: room.gameWinners[i].playerId,
					            username: room.gameWinners[i].playerName,
					            gameId: room.game.id,
					            gameNumber: room.game.gameNumber,
					            tableId: room.id,
					            tableName: room.name,
					            chips:  parseFloat(totalRackDeductionWinner),
					            previousBalance: parseFloat(gamePortData.afterBalance),
					            afterBalance: parseFloat(currentTotalChips),
					            category: 'debit',
					            type: 'rake',
					            remark: 'Rake Deduct',
					            isTournament: 'No',
					            isGamePot: 'no'
					        }
					        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataPot);
				        }

						totalRackOfTheGame += totalRackDeductionWinner ;
					}
				}


				
				
			} else {
				console.log("dont cut rake");
			}

			console.log("Totalrackofthegame", totalRackOfTheGame, room.game.gameNumber);
			console.log("room.game.roundBets", room.game.roundBets, room.game.gameNumber);
			console.log("Game POT :", room.game.gamePot, room.game.gameNumber);
			console.log("gameMainPot :", room.game.gameMainPot, room.game.gameNumber);
			console.log("Game REvert Point :", room.game.gameRevertPoint, room.game.gameNumber);	

			if (totalRackOfTheGame > 0) {
				//binita and vatsal code start
				let gameBet = [];
				let total = 0;
				let totalBetAmount = room.game.roundBets.reduce((a, b) => a + b, 0)
				let arr = []
				room.gameWinners.map(z => {
					arr.push(z.playerId)
				})
				arr= [...new Set(arr)]
				room.gameWinners
				for (let index = 0; index < room.game.roundBets.length; index++) {
					let gamePlayers = {}
					
					gamePlayers.playerId = room.players[index].id
					gamePlayers.chips = room.players[index].chips
					gamePlayers.rakeAmount = room.game.roundBets[index] / totalBetAmount * totalRackOfTheGame;
					/*if(!arr.includes(id)){
						gamePlayers.totalBat = room.game.roundBets[index]
					}else{
						room.gameWinners.find(function (element) { 
							if(element.playerId == gamePlayers.playerId){
								gamePlayers.totalBat += room.game.roundBets[index]-gamePlayers.rakeAmount-element.amount;
							} }) 
						
					}*/
					gameBet.push(gamePlayers)
				}
				if (room.gameWinners) {
					let insertData = await Sys.Game.CashGame.Omaha.Services.PlayerTransectionHistoryService.insertPlayerTransectionHistrory(
						{
							gameId: room.game.id,
							gameNumber: room.game.gameNumber,
							gameBetPlayer: gameBet,
							rack: Sys.Setting.rakePercenage,
							winPlayerDetails: room.gameWinners,
							totalRackDeductionWinner: totalRackOfTheGame + ExtraRackDeduction,
							type: 'rake',
							remark: "rake cut"
						}
					);
				}
				//binita and vatsal code end
				let totalOfRoundBets = 0;
				let allAgentsRole = ['player'];

				// check for revertpoint and sidepot and get totalOfRoundBets 5/2/2020
				if(room.game.otherData.gameRevertPoint.length >= 1 && room.game.gamePot.length >= 1){		
					let sidepotPId=room.game.gamePot[room.game.gamePot.length -1].sidePotPlayerID;
					let sidepotPIndex;
					for(let s=0; s < room.players.length; s++){
						if(sidepotPId == room.players[s].id){
							sidepotPIndex = s;
							break;
						}
					}
					let maximumSidepotAmount = room.game.roundBets[sidepotPIndex];
					console.log("maximumSidepotAmount", maximumSidepotAmount,sidepotPIndex, sidepotPId);

					for(let t= 0; t <room.game.roundBets.length; t++){
						if(room.game.roundBets[t] > maximumSidepotAmount){
							room.game.roundBets[t] = maximumSidepotAmount;
						}
					}
					console.log("room.game.roundBets processed", room.game.roundBets, maximumSidepotAmount);
						
					totalOfRoundBets = parseFloat((room.game.roundBets.reduce((a, b) => a + b, 0)).toFixed(4));

					console.log("totalofrounsbets", totalOfRoundBets);					
				}else{
					let tempRoundBets = room.game.roundBets.slice();
					console.log("tempRoundBets 2", tempRoundBets)
					tempRoundBets.sort(function (a, b) {
						return a - b;
					});
					console.log("sorted tempRoundBets", tempRoundBets, tempRoundBets[(tempRoundBets.length) - 1], tempRoundBets[(tempRoundBets.length) - 2])
					if (tempRoundBets[(tempRoundBets.length) - 1] > tempRoundBets[(tempRoundBets.length) - 2]) {
						console.log("indexOFFFF", room.game.roundBets.indexOf(tempRoundBets[(tempRoundBets.length) - 1]), "test", tempRoundBets[(tempRoundBets.length) - 1])
						room.game.roundBets[room.game.roundBets.indexOf(tempRoundBets[(tempRoundBets.length) - 1])] = tempRoundBets[(tempRoundBets.length) - 2];
						tempRoundBets[(tempRoundBets.length) - 1] = tempRoundBets[(tempRoundBets.length) - 2];
						//room.game.roundBets[(room.game.roundBets.length) -1] = tempRoundBets[(tempRoundBets.length) -2];

					}
					console.log("roundbetss", room.game.roundBets);
					totalOfRoundBets = parseFloat((tempRoundBets.reduce((a, b) => a + b, 0)).toFixed(4));

					console.log("sorted tempRoundBets aftercalculation", tempRoundBets);
					console.log("totalofrounsbets", totalOfRoundBets);
				}
				// check for revertpoint and sidepot and get totalOfRoundBets 5/2/2020

				/*let tempRoundBets = room.game.roundBets.slice();
				console.log("tempRoundBets 2", tempRoundBets)
				tempRoundBets.sort(function (a, b) {
					return a - b;
				});
				console.log("sorted tempRoundBets", tempRoundBets, tempRoundBets[(tempRoundBets.length) - 1], tempRoundBets[(tempRoundBets.length) - 2])
				if (tempRoundBets[(tempRoundBets.length) - 1] > tempRoundBets[(tempRoundBets.length) - 2]) {
					console.log("indexOFFFF", room.game.roundBets.indexOf(tempRoundBets[(tempRoundBets.length) - 1]), "test", tempRoundBets[(tempRoundBets.length) - 1])
					room.game.roundBets[room.game.roundBets.indexOf(tempRoundBets[(tempRoundBets.length) - 1])] = tempRoundBets[(tempRoundBets.length) - 2];
					tempRoundBets[(tempRoundBets.length) - 1] = tempRoundBets[(tempRoundBets.length) - 2];
					//room.game.roundBets[(room.game.roundBets.length) -1] = tempRoundBets[(tempRoundBets.length) -2];

				}
				console.log("roundbetss", room.game.roundBets);
				totalOfRoundBets = parseFloat((tempRoundBets.reduce((a, b) => a + b, 0)).toFixed(4));

				console.log("sorted tempRoundBets aftercalculation", tempRoundBets)
				console.log("totalofrounsbets", totalOfRoundBets)*/


				var rakeDistribution=[];
				for (let rp = 0; rp < room.players.length; rp++) {
					if ((room.players[rp].status === 'Playing') || (room.players[rp].folded == true && room.game.roundBets[rp] > 0) || (room.players[rp].considerLeftedPlayer == true && room.game.roundBets[rp] > 0) || (room.players[rp].status === 'Left' && room.game.roundBets[rp] > 0) || (room.players[rp].status === 'Ideal' && room.game.roundBets[rp] > 0)) {
						console.log("player name and roundbets", room.players[rp].playerName, room.game.roundBets[rp]);

						let totalRackDeduction = parseFloat( ( (room.game.roundBets[rp] / totalOfRoundBets) * totalRackOfTheGame) );
						console.log("totalRackDeduction", room.players[rp].playerName, totalRackDeduction)

						if (totalRackDeduction > 0) {
							let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: room.players[rp].id });
							console.log("inside rack", player.username, player.agentRole, player.agentId);
							if (player.agentId != '' && player.agentId != null && player.agentId != undefined) {
								//let agentRoleId = rolesArray.indexOf(player.agentRole);
								let agentRoleId= {};
								if(player.agentRole == 'admin'){
									agentRoleId.level =1;
								}else{
									agentRoleId = await Sys.App.Services.agentServices.getSingleAgentData({ _id: player.agentId }, {level: 1});
								}
								
								let allAgents = [player.agentId];
								let allAgentsFromToIds = [room.players[rp].id, player.agentId];
								console.log("consoleee", allAgents, allAgentsFromToIds, agentRoleId)


								let allAgentsRackArray = [];
								let finalAllAgentsRackArray = [];
								for (let rd = agentRoleId.level; rd > 0; rd--) {
									if (rd != 1) {
										let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] }, {parentId: 1, commission: 1});
										console.log("agent in agentRoleId.level", agent);
										allAgents.push(agent.parentId);
										allAgentsRackArray.push(agent.commission)
									}
								}

								console.log("allAgentRackArray", allAgentsRackArray, allAgents);
								//allAgentsRackArray.push( ( 100 - allAgentsRackArray[allAgentsRackArray.length-1] ) );
								let reverseArray = allAgentsRackArray.reverse();
								reverseArray.push(0);
								console.log("reversed array", reverseArray)


								if (reverseArray.length >= 3) {
									for (let i = 0; i < (reverseArray.length - 1); i++) {
										console.log(i);
										finalAllAgentsRackArray.push(reverseArray[i] - reverseArray[i + 1]);
									}
								} else {
									finalAllAgentsRackArray.push(reverseArray[0]);
								}


								finalAllAgentsRackArray.unshift((100 - reverseArray[0]));
								console.log("finalAllAnetArray", finalAllAgentsRackArray);

								//let finalAllAgentsRackArrayReverse = finalAllAgentsRackArray.reverse();
								//console.log("finalAllAgentsRackArrayReverse", finalAllAgentsRackArrayReverse)


								allAgents = [player.agentId];
								console.log("all agents 111", allAgents, agentRoleId.level);
								for (let rd = (agentRoleId.level -1); rd >= 0; rd--) {
									if (rd == 0) {
										console.log("in first")
										let master = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });
										
										allAgentsRole.push('admin');
										console.log("rack deduction percentage admin", finalAllAgentsRackArray[rd], totalRackDeduction)
										let tempRackDeduction = parseFloat((totalRackDeduction * finalAllAgentsRackArray[rd]) / 100) ;
										console.log("tempRackDeduction admin", tempRackDeduction);

										let data={}
										data.playerId=room.players[rp].id
										data.totalRake=tempRackDeduction
										data.agentId=allAgentsFromToIds[allAgentsFromToIds.length - 1]
										data.role=allAgentsRole[allAgentsRole.length - 1]
										data.email="admin"
										data.level=1
										data.rackPercent=finalAllAgentsRackArray[rd]
										room.game.rakeDistribution.push(data);
										room.game.gameTotalChips = parseFloat(parseFloat(room.game.gameTotalChips) - parseFloat(tempRackDeduction));
										await module.exports.rackDeductionUpdate(room.id,room.name,room.players[rp].id, room.game.id, room.game.roundBets[rp], finalAllAgentsRackArray[rd], tempRackDeduction, allAgentsRole[allAgentsRole.length - 2], allAgentsRole[allAgentsRole.length - 1], allAgentsFromToIds[allAgentsFromToIds.length - 2], allAgentsFromToIds[allAgentsFromToIds.length - 1], room.game.gameNumber);
									}
									else {
										console.log("in second", allAgents[allAgents.length - 1])
										let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });
										allAgents.push(agent.parentId);

										allAgentsRole.push(agent.role + ' ( ' + agent.email + ')');

										//let tempRackDeduction = eval( parseFloat( ( totalRackDeduction * (100 - agent.commission) )/100 ).toFixed(4) );
										console.log("rack deduction percentage", finalAllAgentsRackArray[rd], totalRackDeduction)
										let tempRackDeduction = parseFloat((totalRackDeduction * finalAllAgentsRackArray[rd]) / 100) ;
										console.log("tempRackDeduction", tempRackDeduction)
										//totalRackDeduction = totalRackDeduction - tempRackDeduction;
										//adminRack = agent.commisiasion;
										let data={}
										data.playerId=room.players[rp].id
										data.totalRake=tempRackDeduction
										data.agentId= allAgentsFromToIds[allAgentsFromToIds.length - 1]
										data.role=agent.role
										data.level=Number(agent.level)
										data.email=agent.email
										data.rackPercent=finalAllAgentsRackArray[rd]
										room.game.rakeDistribution.push(data);
										room.game.gameTotalChips = parseFloat(parseFloat(room.game.gameTotalChips) - parseFloat(tempRackDeduction));
										await module.exports.rackDeductionUpdate(room.id,room.name,room.players[rp].id, room.game.id, room.game.roundBets[rp], finalAllAgentsRackArray[rd], tempRackDeduction, allAgentsRole[allAgentsRole.length - 2], allAgentsRole[allAgentsRole.length - 1], allAgentsFromToIds[allAgentsFromToIds.length - 2], allAgentsFromToIds[allAgentsFromToIds.length - 1], room.game.gameNumber);
										allAgentsFromToIds.push(agent.parentId);
									}
								}
							}
							else {
								console.log("Agent not available");
								let playerAgent = await Sys.App.Services.UserServices.getSingleUserData({});
								console.log("admin rack agent", playerAgent)
								let playerEmail = 'player ( ' + player.email + ')'
								let data={}
										data.playerId=room.players[rp].id
										data.totalRake=totalRackDeduction
										data.agentId= allAgentsFromToIds[allAgentsFromToIds.length - 1]
										data.role="player"
										data.email=playerEmail
										data.level=0
										data.agentRole="player"
										data.rackPercent=adminRack
										room.game.rakeDistribution.push(data);
										room.game.gameTotalChips = parseFloat(parseFloat(room.game.gameTotalChips) - parseFloat(totalRackDeduction));
								await module.exports.rackDeductionUpdate(room.id,room.name,room.players[rp].id, room.game.id, totalOfRoundBets, adminRack, totalRackDeduction, playerEmail, 'admin', room.players[rp].id, playerAgent._id, room.game.gameNumber);

							}
						}


					} else {

					}
					allAgentsRole = ['player'];
				}
				// room.game.rakeDistribution.push(rakeDistribution);
			}

			return await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room)


			//res.send(player);
		} catch (e) {
			console.log("Error in Rack Deduction", e);
		}
	},

	/* SBBB ADDITIONAL FUCNTIONALITY*/
	leftRoomForWaitingPlayers: async function (data) {
		try {
			console.log("LeftRoom Waiting player Data", data);
			if (!data.roomId) {
				return { status: 'fail', result: null, message: "Room Not Found", statusCode: 401 };
			}
			var room = await Sys.Game.CashGame.Omaha.Services.RoomServices.get(data.roomId);
			if (!room) {
				return { status: 'fail', result: null, message: "Room Not Found", statusCode: 401 };
			}
			/*if(room.game == 'Running'){
				if(room.getCurrentPlayer().id == data.playerId){
					await Sys.Game.CashGame.Omaha.Controllers.PlayerProcess.changePlayerTurn(room);
				}
			}*/
			//check for user already present //
			// chek seat in players array
			let player = null;
			let isAllinPlayerWhenLefted = false;
			let leftedPlayerIndexId;
			if (room && room.waitingPlayers && room.waitingPlayers.length > 0) {
				for (let i = 0; i < room.waitingPlayers.length; i++) {
					if (room.waitingPlayers[i].id == data.playerId && room.waitingPlayers[i].status != 'Left' && room.waitingPlayers[i].allIn == false) {
						room.waitingPlayers[i].idealTime = null;
						room.waitingPlayers[i].oldPlayerLeftTime = new Date();
						if (room.waitingPlayers[i].allIn == true) {
							isAllinPlayerWhenLefted = true;
						}
						leftedPlayerIndexId = i;

						room.waitingPlayers[i].sitOutNextHand = false;
						room.waitingPlayers[i].sitOutNextBigBlind = false;
						room.waitingPlayers[i].defaultActionCount = 0;
						room.waitingPlayers[i].considerLeftedPlayer = true;
						player = room.waitingPlayers[i];
						break;
					}
				}
			}
			if (player) {

				if (player.status != 'Left' && player.allIn == false) {
					if (player.status == 'Waiting') {
						room.waitingPlayers[leftedPlayerIndexId].isSidepot = true;
					}
					room.waitingPlayers[leftedPlayerIndexId].status = "Left";
				}

				await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
				console.log("Player Left ", player.id);
				if (player.isAllInLefted == false) {
					await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('PlayerLeft', { 'playerId': player.id, roomId: room.id });
				}
				console.log("----leftedPlayerIndexId-----out", leftedPlayerIndexId);
				let dataPlayer = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(player.id);
				if (dataPlayer && isAllinPlayerWhenLefted == false) {
					console.log("Chips", dataPlayer.chips, player.chips);
					let chips = parseFloat(dataPlayer.chips) + parseFloat(player.chips) + parseFloat(player.extraChips);
					console.log("Chips", dataPlayer.chips, player.chips, chips);
					
					var playerUpdate = await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(player.id, { chips: chips, extraChips: 0 });

					// added by K@Y
					let traNumber = + new Date()
					let sessionData={
						sessionId:player.sessionId,
						uniqId:player.uniqId,
						user_id:player.id,
						username:dataPlayer.username,
						chips: player.chips,
						previousBalance: parseFloat(dataPlayer.chips),
						afterBalance: chips,
						type:"leftChips",
						remark:"game left",
						transactionNumber: 'DEP-' + traNumber,
						category:"credit"
					}
					await Sys.Game.CashGame.Omaha.Services.ChipsServices.insertData(sessionData)
					let transactionData = {
						user_id: dataPlayer.id,
						username: dataPlayer.username,
						// gameId						:	room.game.id,
						chips: (parseFloat(player.chips) + parseFloat(player.extraChips)),
						previousBalance: parseFloat(dataPlayer.chips),
						afterBalance: parseFloat(chips),
						category: 'credit',
						type: 'leave',
						remark: 'Credit BuyIn Chips With Main Balance'
					}
					// await Sys.Game.CashGame.Omaha.Services.ChipsServices.createTransaction(transactionData);

					var logGameId = "";
					var logGameNum = "";
					if(room.game != null){
						logGameId = room.game.id;
						logGameNum = room.game.gameNumber;
					}

					let transactionDataLeft = {
	                    user_id: dataPlayer.id,
	                    username: dataPlayer.username,
	                    gameId: logGameId,
	                    gameNumber: logGameNum,
	                    tableId: room.id,
	                    tableName: room.name,
	                    chips: (parseFloat(player.chips) + parseFloat(player.extraChips)),
	                    previousBalance: parseFloat(dataPlayer.chips),
	                    afterBalance: parseFloat(chips),
	                    category: 'credit',
	                    type: 'entry',
	                    remark: 'Left',
	                    isTournament: 'No',
	                    isGamePot: 'no'
	                }

	                console.log("Player left transactionDataLeft: ", transactionDataLeft);
	                await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataLeft);

					console.log("player update on chips assign", playerUpdate, player.id)
					room.waitingPlayers[leftedPlayerIndexId].isAllinPlayersChipsAssigned = true;

					console.log("----leftedPlayerIndexId-----", leftedPlayerIndexId);
					room.waitingPlayers[leftedPlayerIndexId].extraChips = 0;

					console.log("room.waitingPlayers[i].isAllinPlayersChipsAssigned in playerleft", room.waitingPlayers[leftedPlayerIndexId].isAllinPlayersChipsAssigned, room.waitingPlayers[leftedPlayerIndexId].playerName)
					let updatedRoom = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);

					return { status: 'success', result: room.id, message: "Room Left Sccess", statusCode: 200 };
				} else {
					// for all in player extrachips
					if(player.extraChips > 0){
						console.log("assign lefted player with allIn extra chips");
						let chips = parseFloat(dataPlayer.chips) + parseFloat(player.extraChips);
						let playerUpdate = await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(player.id, { chips: chips, extraChips: 0 });
						room.waitingPlayers[leftedPlayerIndexId].extraChips = 0;
					}
					
					return { status: 'fail', result: null, message: "Player not found", statusCode: 401 };
				}
			} else {
				console.log(" No Player Found -----#### ");
				return { status: 'fail', result: null, message: "Player not found", statusCode: 401 };
			}
		} catch (error) {
			console.log("Error:", error);
			return new Error("Error in Left Room");
		}
	},
}
