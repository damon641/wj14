var Sys = require('../../../../Boot/Sys');

module.exports = {

	checkRoomSeatAvilability: async function (data) {
		try {
			let self = this
			let room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Room not found",
					statusCode: 401
				};
			}

			return room;

		} catch (e) {
			console.log("Error: ", e);
		}
	},

	joinTournamentRoom: async function (player,roomId) {
		try {
			var room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(roomId);
			if (!room || !room.players) { // //Shiv!@#
				return {status: 'fail',	result: null,message: "Room not found",	statusCode: 401	};
			}

			// chek seat in players array
			let seatAvailable = false
			let playerCount = 0;
			let allSeatIndex = [];
			let seatIndex = 0;
				for (let i = 0; i < room.players.length; i++) {
					if (room.players[i].status != 'Left') { 
						playerCount++;
						allSeatIndex.push(room.players[i].seatIndex);
					}
				}

			if (playerCount < room.maxPlayers) {
				// let Find Free SeatIndex
				for (let k = 0; k < room.maxPlayers; k++) {
					if(!allSeatIndex.includes(k)){
						seatAvailable = true;
						 seatIndex = k;
						break;
					}
				}

			} 

			// When Fist User Wants to Push on Table.
			if(allSeatIndex.length == 0){
				seatAvailable = true;
				 seatIndex = 0;
			}

			console.log("------------------------------------------------------------")
			console.log("----------seatAvailable :",seatAvailable)
			console.log("------------------------------------------------------------")

			// if seat is available add player
			if (seatAvailable) {
			
			//	console.log("Added Player ->>>>>>>>>>.");
				await room.AddPlayer(player.id, player.socketId, player.username, player.avatar, player.appid, player.chips, seatIndex, player.autoBuyin);
			
				room = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);
				console.log("Room Updated");
				room  =  await Sys.Game.Reguler.Texas.Controllers.RoomProcess.broadcastPlayerInfo(room);
				console.log("Player Updated",room.players.length);
				return room;
			} else {
				console.log('Seat is not available.');
				return new Error('Seat is not available');
			}
		} catch (error) {
			Sys.Log.info('Error in j-oinTournamentRoom : ' + error);
			return new Error('Error in j-oinTournamentRoom Process',error);
		}
	},

	leftRoom: async function (data) {
		try {
			console.log("LeftRoom Data", data);
			if (!data.roomId) {
				return {
					status: 'fail',
					result: null,
					message: "Room Not Found",
					statusCode: 401
				};
			}
			var room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Room Not Found",
					statusCode: 401
				};
			}

			//check for user already present //
			// chek seat in players array
			let player = null;
			if (room && room.players && room.players.length > 0) {
				for (let i = 0; i < room.players.length; i++) {
					if (room.players[i].id == data.playerId && room.players[i].status != 'Left') {
						player = room.players[i];
						room.players[i].status = "Left";
						break;
					}
				}
			}
			if (player) {
				let playersCount = 0;
				if (room.game && room.game.status == 'Running' && player.folded === false) {
					room.removePlayer(player.id);
				}

				await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);
				console.log("Player Left ", player.id);
				await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('PlayerLeft', { 'playerId': player.id });
				let dataPlayer = await Sys.Game.Reguler.Texas.Services.PlayerServices.getById(player.id);
				if (dataPlayer) {
					//	console.log("Chips",dataPlayer.chips,player.chips);
					var chips = parseInt(dataPlayer.chips) + parseInt(player.chips);
					var playerUpdate = await Sys.Game.Reguler.Texas.Services.PlayerServices.update(player.id, { chips: chips });
					return {
						status: 'success',
						result: room.id,
						message: "Room Left Sccess",
						statusCode: 200
					};
				} else {
					return {
						status: 'fail',
						result: null,
						message: "Player not found",
						statusCode: 401
					};
				}
			} else {
				return {
					status: 'fail',
					result: null,
					message: "Player not found",
					statusCode: 401
				};
			}
		} catch (e) {
			console.log("Error:", e);
			return new Error(e);
		}
	},

	newRoundStarted: async function (room) {
		try {
			let self = this
			console.log("New round Started");
			// console.log("Room game======>", room.game);
			var room = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room)
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Room not found",
					statusCode: 401
				};
			}
 

			var data = {
				players: [],
				smallBlindPlayerId: room.getSmallBliendPlayer().id,
				bigBlindPlayerId: room.getBigBliendPlayer().id,
				dealerPlayerId: room.getDealer().id,
				smallBlindChips: parseInt(room.smallBlind),
				bigBlindChips: parseInt(room.bigBlind),
			}
			room.players.forEach(function (player) {
				data.players.push({
					playerId: player.id,
					cards: player.cards,
					chips : player.chips
				})
			});
			Sys.Timers[room.id] = setTimeout(async function (room) {
				console.log("Player Cards");
				await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('PlayerCards', data)
				Sys.Timers[room.id] = setTimeout(async function (room) {
					console.log("NextTurnPlayer Send", room.getCurrentPlayer().id);
					// await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('NextTurnPlayer', {
					// 	nextTurnPlayerId: room.getCurrentPlayer().id
					// })

					let timer = parseInt(Sys.Config.Texas.RegularTimer);
					console.log("Player Timer Send..... : ", timer);
					let buttonAction = room.getCurrentTurnButtonAction();
					Sys.Timers[room.id] = setInterval(async function (room) {
						
						await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('OnTurnTimer', {
							playerId: room.getCurrentPlayer().id,
							timer: timer,
							maxTimer: parseInt(Sys.Config.Texas.RegularTimer),
							buttonAction : buttonAction,
						});
						timer--;
						if (timer < 1) {
							clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
							Sys.Game.Reguler.Texas.Controllers.RoomProcess.playerDefaultAction(room.id);
						}
					}, 1000, room);

				}, (500 * room.players.length) + 2000, room);
			}, (1000 * parseInt(Sys.Config.Texas.waitBeforeCardDistribut)), room);
			return
		} catch (e) {
			console.log("Error:", e);
		}
	},

	newGameStarted: async function (room) {
		try {
			console.log("Game Started Brodcast");
			await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('GameStarted', {
				message: 'starting first round',
				gameId: room.game.id,
				gameNumber: `${room.tableNumber} ${room.game.gameNumber}`
			});
		} catch (e) {
			console.log("Error:", e);
		}
	},

	playerUpdateAutoBuyIn: async function (data) {
		try {

			let room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(data.roomId);
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
			room = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);
			return {};
		} catch (e) {
			console.log("Error:", e);
		}
	},

	playerAction: async function (data) {
		try {
			let room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(data.roomId);
			if (!room) {
				return {
					status: 'fail',
					result: null,
					message: "Room not found",
					statusCode: 401
				};
			}

			var currentPlayer = room.getCurrentPlayer();
			if (currentPlayer && (currentPlayer.id != data.playerId)) {
				return console.log('Its not your turn or your turn expired');
			}

			if (!room.game) {
				return { 	status: 'fail',	result: null,	message: "Game not found",	statusCode: 401	};
			}

			if (room.game.status == 'Running') {
				currentPlayer.defaultActionCount = 0;

				clearTimeout(Sys.Timers[room.id]);
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
						if (room.bet(data.playerId, parseInt(data.betAmount), data.hasRaised)) {
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

			clearTimeout(Sys.Timers[room.id])
			room = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);
			console.log('TurnFinished', Sys.Config.Texas.Regular)
			if (room.getCurrentPlayer()) {
				let turnBetData = room.getPreviousPlayerAction();
				await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('PlayerAction', {
					action: turnBetData,
					playerBuyIn: (turnBetData.playerId) ? room.getPlayerById(turnBetData.playerId).chips : 0,

				});
				// await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('NextTurnPlayer', {
				// 	nextTurnPlayerId: room.getCurrentPlayer().id
				// });

				let timer = parseInt(Sys.Config.Texas.RegularTimer);
				let buttonAction = room.getCurrentTurnButtonAction();
				console.log("Player Timer Send..... : ", timer);
				Sys.Timers[room.id] = setInterval(async function (room) {

					await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('OnTurnTimer', {
						playerId: room.getCurrentPlayer().id,
						timer: timer,
						maxTimer: parseInt(Sys.Config.Texas.RegularTimer),
						buttonAction : buttonAction,
					});
					timer--;
					if (timer < 1) {
						clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
						Sys.Game.Reguler.Texas.Controllers.RoomProcess.playerDefaultAction(room.id);
					}
				}, 1000, room);
			}
		} catch (e) {
			console.log("Error:", e);
		}
	},

	roundFinished: async function (room, sidePot) {
		try {
			room.timerStart = false; 
			clearTimeout(Sys.Timers[room.id]);
			console.log("room.game.pot 1 :", room.game.pot);
			room = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);

			let turnBetData = room.getPreviousPlayerAction();
			await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('PlayerAction', {
				action: turnBetData,
				playerBuyIn: (turnBetData.playerId) ? room.getPlayerById(turnBetData.playerId).chips : 0,
			});
			Sys.Timers[room.id] = setTimeout(async function (room) {
				await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('RoundComplete', {
					roundStarted: room.game.roundName,
					cards: room.game.board,
					potAmount: room.game.pot,
					PlayerSidePot : {
						sidePot : sidePot,
						mainPot : room.game.gameMainPot
					}
				});
				//Send Allplayer hand
				// room.players.forEach(async function (player) {
				// 	await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(player.socketId).emit('PlayerHandInfo', await Sys.Game.Reguler.Texas.Controllers.PlayerProcess.getHand(player, room.game.board));
				// })

				if (room.getCurrentPlayer()) {
					Sys.Timers[room.id] = setTimeout(async function (room) {
						// await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('NextTurnPlayer', {
						// 	nextTurnPlayerId: room.getCurrentPlayer().id
						// });
						console.log('NextTurnPlayer ->>>>>>')

						let timer = parseInt(Sys.Config.Texas.RegularTimer);
						let buttonAction = room.getCurrentTurnButtonAction();
					
						Sys.Timers[room.id] = setInterval(async function (room) {
							console.log("Player Timer Send 3 : ", timer);
							await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('OnTurnTimer', {
								playerId: room.getCurrentPlayer().id,
								timer: timer,
								maxTimer: parseInt(Sys.Config.Texas.RegularTimer),
								buttonAction : buttonAction,
			
							});
							timer--;
							if (timer < 1) {
								clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
								Sys.Game.Reguler.Texas.Controllers.RoomProcess.playerDefaultAction(room.id);
							}
						}, 1000, room);


					}, Sys.Config.Texas.waitAfterRoundComplete, room)

				}
			}, 1000, room)
		} catch (e) {
			console.log(" Error roundFinished :", e);
		}
	},

	gameFinished: async function (room, sidePot) {
		try {
			clearTimeout(Sys.Timers[room.id]);
			let waitTime = Sys.Config.Texas.waitAfterRoundComplete;

			if (room.game.gameRevertPoint.length > 0) { // Wait For Revert Point Animation Show.
				waitTime += 1000;
			}

			if (room.game.status == 'Finished AllIn') {
				waitTime += 1000;
			} 
			// Remove For issue.
			// else {
			// 	let turnBetData = room.getPreviousPlayerAction();
			// 	await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('PlayerAction', {
			// 		action: turnBetData,
			// 		playerBuyIn: (turnBetData.playerId) ? room.getPlayerById(turnBetData.playerId).chips : 0,

			// 	});
			// }
			room.game.status = 'Finished';
			room = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);
			console.log('<=> Game Finished Called ||  OMAHA GAME-NUMBER [' + room.game.gameNumber + '] ||');
			let dataObj = {
				roundStarted: room.game.roundName,
				cards: room.game.board,
				potAmount: room.game.pot
			};
			console.log('<=> Game Finished Round Complete Broadcast ||  OMAHA GAME-NUMBER [' + room.game.gameNumber + '] || RoundComplete : ', dataObj);

			await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('RoundComplete', {
				roundStarted: room.game.roundName,
				cards: room.game.board,
				potAmount: room.game.pot,
				PlayerSidePot : {
					sidePot : sidePot,
					mainPot : room.game.gameMainPot
				}
			});

			Sys.Timers[room.id] = setTimeout(async function (room) {
		 
				// Send Revert Point to Player 
				for (let h = 0; h < room.game.gameRevertPoint.length; h += 1) {
					if (room.game.gameRevertPoint[h].amount > 0) {
						let winplr = room.players[room.game.gameRevertPoint[h].playerIndex];
						let winAmount = room.game.gameRevertPoint[h].amount;
						winplr.chips += winAmount;

						let dataObj = {
							playerId: winplr.id,
							playerName: winplr.playerName,
							amount: winAmount,
							chips : winplr.chips,
							winnerSeatIndex: winplr.seatIndex,
							sidePotPlayerIndex: -1, // main Port index,
						};

						console.log('<=> Game RevertPoint Broadcast || OMAHA GAME-NUMBER [' + room.game.gameNumber + '] || RevertPoint : ');
						await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('RevertPoint', dataObj);
					}
				}


				Sys.Timers[room.id] = setTimeout(async function (room) {
			 
					// room = await Sys.Game.Reguler.Texas.Controllers.RoomProcess.calculateRake(room);
					dataObj = {
						winners: room.gameWinners
					};
					console.log('<=> Game Finished Broadcast || OMAHA GAME-NUMBER [' + room.game.gameNumber + '] || GameFinished : ', dataObj);

					await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('GameFinished', { winners: room.gameWinners });

					// start new game
					/**
					 * Save game histry to database
					 */
					console.log('<=> Game Start Saving Histry ||  OMAHA GAME-NUMBER [' + room.game.gameNumber + '] ||');

					let history = await Sys.Game.Reguler.Texas.Controllers.RoomProcess.saveGameToHistry(room);


					Sys.Timers[room.id] = setTimeout(async function (room) {
						 
						console.log('<=> Game ResetGame Broadcast ||  OMAHA GAME-NUMBER [] || ResetGame : ');
						await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('ResetGame', {});

						// // Check For Sit Out Next Hand. & Remove Player
						// for (let i = 0; i < room.players.length; i++) {
						// 	if(room.players[i].sitOutNextHand == true){
						// 		room.gameLosers.push(room.players[i]);
						// 		room.players[i].status = 'Left';
						// 	}
						// }


						room.gameLosers.forEach(async function (player) {
							//console.log("Game Loser Player Left :");
							//console.log('<=> Game PlayerLeft Broadcast ||  OMAHA GAME-NUMBER [] || PlayerLeft : ', player.id);
							await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('PlayerLeft', { 'playerId': player.id });
						})

						// remove lefted player also
						room.status = 'Finished';
						room.game = null;
						// Game Finished update fold/allin/talked value.
						for (var i = 0; i < room.players.length; i++) {
							room.players[i].folded = false;
							room.players[i].allIn = false;
							room.players[i].talked = false;
							room.players[i].cards.splice(0, room.players[i].cards.length);
						}
						room.timerStart = false; 
						room = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);
						Sys.Timers[room.id] = setTimeout(async function (room) {
							
								let	totalPlayers = 0;
								
								for (i = 0; i < room.players.length; i++) {
									if(room.players[i].status != 'Left'){
										totalPlayers++;
									}
								}

								room.status = "Finished";
								
								

								console.log('<===============================~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~>');
								console.log('<=> Ramain Player : <=>',totalPlayers);
								console.log('<=> room.tournament : <=>',room.tournament);
								console.log('<===============================~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~>');

								// Find Empty table
								let tournament = await Sys.Game.Reguler.Texas.Services.TournamentServices.getById(room.tournament);
								if (!tournament) {
									console.log('<=> tournament not Found: <=>');
									return {	status: 'fail',	result: null,message: "Tournament not found",	statusCode: 401	};
								}
								console.log('<=> tournament.rooms.length <=>',tournament.rooms.length);

								let mergeRoom = null;


								for(let i=0;i<tournament.rooms.length;i++){

									if(room.id != tournament.rooms[i]){

										let TourRoom = await Sys.Game.Reguler.Texas.Services.RoomServices.get(tournament.rooms[i]);
										console.log('Room :',TourRoom.id);

										if(TourRoom.status != 'Closed'){
											let	playingPlayers = 0;
											for (let j = 0; j < TourRoom.players.length; j++) {
												if(TourRoom.players[j].status != 'Left'){
													playingPlayers++;
												}
											}	
											
											console.log('Room Total Player :',playingPlayers);
											if(playingPlayers >= totalPlayers){
												if(parseInt(totalPlayers+playingPlayers) <= parseInt(TourRoom.maxPlayers)){
													mergeRoom = TourRoom.id;
													console.log('<Break :> Break :> Break :> Break ::>',mergeRoom);
													break;
												}
											}
										}

										
									}
								}

								// Merge room found So Merger Room & Close Anoter Table.
								if(mergeRoom){

									console.log('<**********************************************************>');
									console.log('<=> Room Found for Merge : <=>',mergeRoom);
									console.log('<**********************************************************>');

									room.status = "Closed"; // Colse Old Room
									
									// Update Room Status.
									Sys.Game.Reguler.Texas.Services.playerGameHistoryServices.updateRoomStatus(room.id,'Finished');

									
									for (i = 0; i < room.players.length; i++) {
										if(room.players[i].status != 'Left'){
											let playerObj = {
												id : room.players[i].id, 
												socketId : room.players[i].socketId, 
												username: room.players[i].playerName, 
												avatar : room.players[i].avatar,
												appid : room.players[i].appid, 
												chips : room.players[i].chips, 
												autoBuyin : room.players[i].autoBuyin
											}
											let mergerAdd = await Sys.Game.Reguler.Texas.Controllers.RoomProcess.joinTournamentRoom(playerObj,mergeRoom);
										}
									}

									console.log('<===============================>');
									console.log('<=> Room Closed [] <=>',room.id);
									console.log('<===============================>');
									await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('OnSwitchRoom', {
										roomId: mergeRoom
									});

 									room = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);
								}else{
 
									if(totalPlayers >= room.minPlayers){
										console.log('<=> Check Break Timer <=>');
										let current = new Date().getTime();
										var difference = current - room.breakTime;
										var minutesDifference = Math.floor(difference/1000/60);

										if(minutesDifference >= parseInt(Sys.Config.Texas.regulaerBreakStartIn)){
											room.breakTime =  new Date().getTime(); 
											let breakTime = parseInt(parseInt(Sys.Tournaments[tournament.id].breaks_time)* 60);
											Sys.Timers[room.id] = setInterval(async function (room) {
												console.log("Break Start :",breakTime);
												await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('OnBreak', {
													timer: breakTime,
													name: 'break'
												});
												breakTime--;
												if (breakTime < 1) {
													clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
													console.log('<===============================>');
													console.log('<=> After Timer New Game Starting [] <=>');
													console.log('<===============================>');
													room.StartGame();
												}
											}, 1000, room);

										}else{

											console.log('<===============================>');
											console.log('<=> New Game Starting [] <=>');
											console.log('<===============================>');
											room.StartGame();
										}



									}else{
										// Remove Player Which Have Status Left
										for (let i = 0; i < room.players.length; i++) {
											if (room.players[i].status == 'Left') {
												room.players.splice(i, 1);
											}
										}

										// Check Tournament All Table Finished.
										let runningTable = 0;
										for(let i=0;i<tournament.rooms.length;i++){
											console.log("Check Tournamet All Room Finished :",tournament.rooms[i])
											let roomStatus = await Sys.Game.Reguler.Texas.Services.RoomServices.get(tournament.rooms[i]);
											if(roomStatus.status != 'Closed'){
												runningTable++;
											}
											 
										}

										if(runningTable == 1){

											room.status = "Closed";
											room.game = null;

											// Room Status Finished.
											Sys.Game.Reguler.Texas.Services.playerGameHistoryServices.updateRoomStatus(room.id,'Finished');

											roomUpdated = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);
											console.log('<===============================>');
											console.log('<=> Tournament Finished ');
											console.log('<===============================>');

											let remainigPlayer = null;
											for (i = 0; i < room.players.length; i++) {
												if(room.players[i].status != 'Left'){
													remainigPlayer = room.players[i];
												}
											}
											if(remainigPlayer){
											
												let tournament = await Sys.Game.Reguler.Texas.Services.TournamentServices.getById(room.tournament);

												tournament.tournamentLosers.push(remainigPlayer.id);
												tournament = await Sys.Game.Reguler.Texas.Services.TournamentServices.updateTourData({_id :tournament.id },{tournamentLosers : tournament.tournamentLosers });

											}


											// Tournament Finished.
											await Sys.Game.Reguler.Texas.Controllers.TournamentProcess.finishTournament(room.id,room.tournament);



										}else{

										console.log('<===============================>');
										console.log('<=> Tournament Single Player in Table But Another Table have no Space So ... Wait For Another Table Finished..');
										console.log('<===============================>');


										}
 	

									}

								}
	
							
						}, parseInt(Sys.Config.Texas.waitAfterGameReset), room)

					}, (room.gameWinners.length * 3000) + parseInt(Sys.Config.Texas.waitBeforeGameReset), room)

				}, waitTime, room)

			}, 1000, room);

		} catch (e) {
			console.log("Error:", e);
		}
	},

	playerDefaultAction: async function (id) {
		try {
			console.log('playerDefaultAction called');
			clearTimeout(await Sys.Timers[id]);
			let room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(id);
			if (room.getCurrentPlayer()) {
				let currentPlayer = room.getCurrentPlayer()
				let maxBet, i;
				maxBet = 0;
				 
				console.log("room.game.bets :", room.game.bets);
				for (i = 0; i < room.game.bets.length; i += 1) {
					if (room.game.bets[i] > maxBet) {
						maxBet = room.game.bets[i];
					}
				}
				if (room.game.bets[room.currentPlayer] == maxBet) {
					room.check(currentPlayer.id,false);

				} else {

					currentPlayer.defaultActionCount += 1;

					room.call(currentPlayer.id,false);

					// For Tournamnet Player Dont Remove Player 
					// console.log("currentPlayer.defaultActionCount", currentPlayer.defaultActionCount);
					// if (currentPlayer.defaultActionCount >= 2) {
					// 	let query = { roomId: room.id, playerId: currentPlayer.id }
					// 	let leftRoomPlayer = await Sys.Game.Reguler.Texas.Controllers.RoomProcess.leftRoom(query);
					// 	console.log('Room Disconnect player lefted :', currentPlayer.playerName);
					// } else {
					// 	room.fold(currentPlayer.id);
					// }
				}
			}
		} catch (e) {
			console.log("Error", e);
		}
	},

	saveGameToHistry: async function (room) {
		try {
			console.log('Save game histry called');
			room.players.forEach(function (player) {
				room.game.players.push(player.toJson())
			})
			room.gameLosers.forEach(function (player) {
				room.game.players.push(player.toJson())
			})
			room.game.winners = room.gameWinners; // Just Push Winner.
			return await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);
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
				rakeByPercent = parseInt(room.game.pot * (room.rackPercent / 100))
			}
			if (rackAmount > rakeByPercent || rackAmount == 0) {
				rackAmount = rakeByPercent
			}
			rakeByPercent = ((rackAmount / room.game.pot) * 100)
			let adminChips = 0
			for (let i = 0; i < room.gameWinners.length; i++) {
				let commission = parseInt(room.gameWinners[i].chips * (rakeByPercent / 100));
				adminChips += commission;
				room.gameWinners[i].chips -= commission
				room.getPlayerById(room.gameWinners[i].playerId).chips -= commission
			}
			console.log('Admin User got : ' + adminChips + ' Chips')

			return await Sys.Game.Reguler.Texas.Services.RoomServices.update(room)


			// User.find().limit(1).exec(function (err, users) {
			// 	if (err) { return callback(err, room) }
			// 	if (users[0].chips) {
			// 		users[0].chips += adminChips
			// 	} else {
			// 		users[0].chips = 0
			// 		users[0].chips += adminChips
			// 	}
			// 	users[0].save(function (err) {
			// 		if (err) { return callback(err, room) }
			// 		load('Poker/RoomService').update(room, function (err, room) {
			// 			if (err) { return callback(err, room) }
			// 			return callback(null, room)
			// 		})
			// 	})
			// })
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
			let room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(data.roomId);
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
			room = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);
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
			let room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(data.roomId);
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
						console.log("Name Updated :",room.players[i].playerName);
						console.log("?????????????????????????????????????????????????????????/")
						room.players[i].sitOutNextBigBlind = data.actionValue;
					}
				}
			}
			room = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);
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
				if(room.players[i].status != 'Left'){


					let playerInfoObj = {
						id : room.players[i].id,
						status : room.players[i].status,
						username : room.players[i].playerName,
						chips : parseInt(room.players[i].chips),
						appId :room.players[i].appid,
						avatar :  room.players[i].appid,
						fb_avatar :  room.players[i].appid,
						folded : room.players[i].folded,
						allIn : room.players[i].allIn,
						cards : room.players[i].cards,
						seatIndex : room.players[i].seatIndex,
					};
					playerInfoDummy.push(playerInfoObj);
				//	console.log('<=> Send Room Players Broadcast || PlayerInfo :', room.players[i].playerName);
				//	console.log('<=> Send Room Players Broadcast || status :', room.players[i].status);

				}
			}

			let dealerPlayerId = '';
			let smallBlindPlayerId = '';
			let bigBlindPlayerId = '';
			if(room.status == 'Running'){
				dealerPlayerId = room.getDealer().id;
				smallBlindPlayerId = room.getSmallBliendPlayer().id;
				bigBlindPlayerId = room.getBigBliendPlayer().id;
			}
			await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('playerInfoList', {
				playerInfo: playerInfoDummy,
				dealerPlayerId : dealerPlayerId,
				smallBlindPlayerId : smallBlindPlayerId,
				bigBlindPlayerId : bigBlindPlayerId
			});
			return room;
		}
		catch (error) {
			console.log('Error in broadcastPlayerInfo : ' + error);
			return new Error('Error in broadcastPlayerInfo');
		}
	},
}
