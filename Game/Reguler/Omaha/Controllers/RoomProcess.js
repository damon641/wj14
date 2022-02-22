var Sys = require('../../../../Boot/Sys');
const rolesArray = ['admin', 'master', 'agent', 'childAgent'];

module.exports = {

    checkRoomSeatAvilability: async function(data) {
        try {
            let self = this
            let room = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(data.roomId);
            if (!room) {
                return {
                    status: 'fail',
                    result: null,
                    message: "Room not found",
                    statusCode: 401
                };
            }
            /*for(let i=0; i < room.players.length; i++){
            	if(room.players[i].id == data.playerId){
            		room.players[i].socketId = socket.id; // Update Socket Id if Old Player Found!.
            	}
            }*/

            return room;

        } catch (e) {
            console.log("Error: ", e);
        }
    },

    joinTournamentRoom: async function(player, roomId) {
        try {
            var room = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(roomId);
            //console.log("room object when joining or merging player", room)
            if (!room || !room.players) { // //Shiv!@#
                return { status: 'fail', result: null, message: "Room not found", statusCode: 401 };
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
            console.log("allSeatInde mergerRoom".allSeatIndex);
            if (playerCount < room.maxPlayers) {
                // let Find Free SeatIndex
                for (let k = 0; k < room.maxPlayers; k++) {
                    if (!allSeatIndex.includes(k)) {
                        seatAvailable = true;
                        seatIndex = k;
                        break;
                    }
                }

            }

            // When Fist User Wants to Push on Table.
            if (allSeatIndex.length == 0) {
                seatAvailable = true;
                seatIndex = 0;
            }

            console.log("------------------------------------------------------------")
            console.log("----------seatAvailable :", seatAvailable)
            console.log("------------------------------------------------------------")

            // if seat is available add player
            if (seatAvailable) {

                console.log("Added Player while merging room ->>>>>>>>>>.", seatIndex, player.username);
                await room.AddPlayer(player.id, player.socketId, player.username, player.profilePic, player.appid, player.chips, seatIndex, player.autoBuyin, player.isIdeal);
                //console.log("before room update", room)
                room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
                console.log("Room Updated");
                room = await Sys.Game.Reguler.Omaha.Controllers.RoomProcess.broadcastPlayerInfo(room);
                //console.log("Player Updated",room.players.length);

                if (room.game) {
                    let playersCards = [];
                    for (let i = 0; i < room.players.length; i++) {
                        if (room.players[i].status == 'Playing' && room.players[i].folded == false) {
                            playersCards.push({
                                playerId: room.players[i].id,
                                cards: ['BC', 'BC', 'BC', 'BC']
                            });
                        }
                    }
                    await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to([player.socketId]).emit('OnSubscibePlayersCards', { playersCards: playersCards, roomId: room.id });


                    // Send Player Cards in his Socket.
                    for (let i = 0; i < room.players.length; i++) {
                        console.log("####################3Socket ID ################:-", room.players[i].socketId);
                        console.log("####################room.players[i].status :-", room.players[i].status);
                        console.log("#################### cards:-", room.players[i].cards);
                        if (room.players[i].id == player.id && room.players[i].status == 'Playing' && room.players[i].cards.length == 4 && room.players[i].folded == false) {
                            await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to([room.players[i].socketId]).emit('OnPlayerCards', {
                                playerId: room.players[i].id,
                                cards: room.players[i].cards,
                                roomId: room.id
                            })
                        }
                    }

                }

                return room;
            } else {
                console.log('Seat is not available.');
                return new Error('Seat is not available');
            }
        } catch (error) {
            Sys.Log.info('Error in j-oinTournamentRoom : ' + error);
            return new Error('Error in j-oinTournamentRoom Process', error);
        }
    },

    /*joinRoom: async function (player, data) {
    	try {
    		let self = this
    		var room = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(data.roomId);
    		if (!room || !room.players) { // //Shiv!@#
    			return {
    				status: 'fail',
    				result: null,
    				message: "Room not found",
    				statusCode: 401
    			};
    		}
    		console.log("Room Obtained");

    		//check if player alredy in array
    		let oldPlayer = null;
    		if (room.players.length > 0) {
    			for (let i = 0; i < room.players.length; i++) {
    				if (room.players[i].id == player.id) { // && room.players[i].status == 'Left' Remove by Me
    					oldPlayer = room.players[i]
    					break;
    				}
    			}
    		}
    		console.log("Old Player Calculated")

    		// chek seat in players array
    		let seatAvailable = true;
    		if (room.players.length > 0) {
    			for (let i = 0; i < room.players.length; i++) {
    				if (room.players[i].seatIndex == data.seatIndex && room.players[i].status != 'Left' && room.players[i].status != 'Ideal' ) {
    					seatAvailable = false
    					break;
    				}
    			}
    		}
    		console.log("------------------------------------------------------------")
    		console.log("----------seatAvailable :",seatAvailable)
    		console.log("----------profilePicId :", parseFloat(player.profilePic))
    		console.log("------------------------------------------------------------")

    		// if seat is available add player
    		if (seatAvailable) {
    			let chips = parseFloat(player.chips) - parseFloat(data.chips); // Shiv!@#
    			if (oldPlayer) {
    				console.log("Old Player Found")
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
	
    			}else{
    				//console.log("Added Player ->>>>>>>>>>.");
    				await room.AddPlayer(player.id, data.socketId, player.username, parseFloat(player.profilePic), 0, data.chips, data.seatIndex, data.autoBuyin);
    			}


    			room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
    			console.log("Room Updated");
    			let playerUpdate = await Sys.Game.Reguler.Omaha.Services.PlayerServices.update(player.id, { chips: chips });
    			//Shiv!@#
    			// Add Player Chips Transection Here.


    			console.log("Player Updated",room.players.length);
    			if (room.players.length > 0) {

    				room  =  await Sys.Game.Reguler.Omaha.Controllers.RoomProcess.broadcastPlayerInfo(room);

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
    				if (room.status != 'Running' && totalPlayers >= room.minPlayers) {
    					if (room.game == null && room.timerStart == false) {
    						room.timerStart = true; // When 12 Second Countdown Start.
    						room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
    						await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnGameStartWait',{})
    						console.log('Game object not present 2');
    						Sys.Timers[room.id] = setTimeout(function () {
    							room.timerStart = false; // Reset Timer Variable
    							clearTimeout(Sys.Timers[room.id]); // Clear Room Timer
    							console.log("Game Starting....");

    							totalPlayers = 0;
    							for (i = 0; i < room.players.length; i++) {
    								if(room.players[i].status != 'Left' && room.players[i].status != 'Ideal'){
    									totalPlayers++;
    								}
    							}
    							console.log('<===============================>');
    							console.log('<=> Game Starting [] New <=>',totalPlayers);
    							console.log('<===============================>');
    							if(totalPlayers >= room.minPlayers){
    								room.StartGame();
    							}else{
    								console.log('<=> Some Player Leave So not Start Game. <=>',totalPlayers);
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
    		return new Error('Error in JoinRoom Process',error);
    	}
    },*/

    leftRoom: async function(data) {
        try {
            console.log("LeftRoom Data", data);
            if (!data.roomId) {
                return { status: 'fail', result: null, message: "Room Not Found", statusCode: 401 };
            }
            var room = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(data.roomId);
            if (!room) {
                return { status: 'fail', result: null, message: "Room Not Found", statusCode: 401 };
            }

            //check for user already present //
            // chek seat in players array
            let player = null;
            if (room && room.players && room.players.length > 0) {
                for (let i = 0; i < room.players.length; i++) {

                    if (room.players[i].id == data.playerId && room.players[i].status != 'Left') {
                        player = room.players[i];
                        room.players[i].status = "Left";
                        room.players[i].idealTime = null;
                        break;
                    }
                }
            }
            if (player) {

                /*let playersCount = 0;
                if (room.game && room.game.status == 'Running' && player.folded === false) {
                	room.removePlayer(player.id);
                	let	totalPlayers = 0;
                	for (i = 0; i < room.players.length; i++) {
                		if(room.players[i].status != 'Left' && room.players[i].status != 'Ideal'){ 
                			totalPlayers++;
                		}
                	}
                	console.log("totalplayers", totalPlayers)
                	if(totalPlayers <= 1){
                		clearTimeout(Sys.Timers[room.id]);
                		room.game.status = 'ForceFinishedFolded';
                		console.log("forcefinishFOldwd 29-4",room.game.status)
                		room.removePlayer(player.id);
                	}else{
                		room.removePlayer(player.id);
                	}
                }*/

                if (room.game && room.game.status == 'Running' && player.folded === false) {
                    room.removePlayer(player.id);
                }

                await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
                console.log("Player Left ", player.id);
                await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('PlayerLeft', { 'playerId': player.id, roomId: room.id });
                let dataPlayer = await Sys.Game.Reguler.Omaha.Services.PlayerServices.getById(player.id);
                if (dataPlayer) {

                    //var chips = parseFloat(dataPlayer.chips) + parseFloat(player.chips);
                    // Remove Room Id Form Rooms 
                    /*if (dataPlayer.rooms.indexOf(room.id) != -1) {
                    	dataPlayer.rooms.splice(dataPlayer.rooms.indexOf(room.id),1);
                    }*/
                    /*await Sys.Game.Reguler.Omaha.Services.PlayerServices.update(player.id, { chips: chips,rooms : dataPlayer.rooms });
                    await Sys.Game.Reguler.Omaha.Services.playerGameHistoryServices.updatePlayerStatus(player.id,'Finished');
                    room  =  await Sys.Game.Reguler.Omaha.Controllers.RoomProcess.broadcastPlayerInfo(room);*/

                    return { status: 'success', result: room.id, message: "Room Left Sccess", statusCode: 200 };
                } else {
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

    newRoundStarted: async function(room) {
        try {
            console.log("New round Started", room.game.gameNumber);
            // console.log("Room game======>", room.game);
            var room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room)
            if (!room) {
                return {
                    status: 'fail',
                    result: null,
                    message: "Room not found",
                    statusCode: 401
                };
            }

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
                totalTablePotAmount: +parseFloat(room.game.bets.reduce((partial_sum, a) => partial_sum + a) + room.game.pot).toFixed(4),

            }
            await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnGameBoot', bootGameData);



            Sys.Timers[room.id] = setTimeout(async function(room) {
                // Event for Cards Distribution.
                let playersCards = [];
                for (let i = 0; i < room.players.length; i++) {
                    console.log("Status  :-", room.players[i].status, room.game.gameNumber);
                    console.log("Name  :-", room.players[i].playerName, room.game.gameNumber);

                    if (room.players[i].status == 'Playing') {
                        playersCards.push({
                            playerId: room.players[i].id,
                            cards: ['BC', 'BC', 'BC', 'BC']
                        });
                    }
                }
                await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnPlayersCardsDistribution', { playersCards: playersCards, roomId: room.id })
                    //console.log("all players", room.players);
                let flipAnimation = true;
                Sys.Timers[room.id] = setTimeout(async function(room) {
                    // Send Player Cards in his Socket.

                    for (let i = 0; i < room.players.length; i++) {
                        if (room.players[i].status == 'Playing') {
                            console.log("Status broadcast cards:-", room.players[i].cards, room.game.gameNumber);
                            console.log("Name broadcast card :-", room.players[i].playerName, room.game.gameNumber);
                            console.log("player socketId", room.players[i].socketId, room.game.gameNumber)
                            await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnPlayerCards', {
                                playerId: room.players[i].id,
                                cards: room.players[i].cards,
                                roomId: room.id,
                                flipAnimation: flipAnimation
                            })
                        }

                    }


                    let timer = parseFloat(Sys.Config.Texas.RegularTimer);
                    let buttonAction = room.getCurrentTurnButtonAction();
                    console.log(buttonAction);
                    let totalPlayingPlayers = 0;
                    for (i = 0; i < room.players.length; i++) {
                        if (room.players[i].status == 'Playing' && room.players[i].folded == false) {
                            totalPlayingPlayers++;
                        }
                    }
                    // check for two players and dont assign turn if chips zero
                    console.log("current player stats", room.getCurrentPlayer(), room.game.gameNumber);
                    console.log("room max Bet", room.getMaxBet(room.game.bets));
                    console.log("room currentPlayer", room.currentPlayer)
                    console.log("my last bet", room.game.bets[room.currentPlayer])
                    let tempCurrentPlayer = room.currentPlayer;
                    //if(totalPlayingPlayers == 2 && ( room.getCurrentPlayer().chips <= 0 || await Sys.Game.Reguler.Omaha.Controllers.PlayerProcess.checkForEndOfRound(room) === true ) ){

                    if (totalPlayingPlayers == 2 && await Sys.Game.Reguler.Omaha.Controllers.PlayerProcess.checkForEndOfRound(room) === true) {
                        Sys.Timers[room.id] = setTimeout(async function(room) {
                            console.log("Player Timer Send 4 when two players and forcefinsihallin: ", room.game.gameNumber);
                            await Sys.Game.Reguler.Omaha.Controllers.PlayerProcess.progress(room);

                        }, 1000, room);

                        return false;
                    } else {
                        room.currentPlayer = tempCurrentPlayer;
                    }
                    console.log("room currentPlayer after conditional check", room.currentPlayer)
                        // check for two players and dont assign turn if chips zero	
                    if (totalPlayingPlayers > 1) {
                        if (room.getCurrentPlayer().isIdeal == true) {
                            Sys.Timers[room.id] = setTimeout(async function(room) {
                                Sys.Timers[room.id] = setInterval(async function(room) {
                                    console.log("Player Timer Send 1 : ", timer, room.game.gameNumber);
                                    if (room.getCurrentPlayer().isIdeal == true) {
                                        clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
                                        clearInterval(Sys.Timers[room.id]);
                                        room.players[room.currentPlayer].isAlreadyActed = true;
                                        Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
                                    } else {

                                        timer--;
                                        if (timer < 0) {
                                            clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
                                            clearInterval(Sys.Timers[room.id]);
                                            room.players[room.currentPlayer].isAlreadyActed = true;
                                            console.log("room players in newRoundStarted", room.players);
                                            Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
                                        } else {
                                            await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnTurnTimer', {
                                                playerId: room.getCurrentPlayer().id,
                                                timer: timer,
                                                maxTimer: parseFloat(Sys.Config.Texas.RegularTimer),
                                                buttonAction: buttonAction,
                                                roomId: room.id,
                                                isLimitGame: (room.limit == 'limit' || room.limit == "Hi-Lo-limit") ? true : false
                                            });
                                        }

                                        /*await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnTurnTimer', {
                                        	playerId: room.getCurrentPlayer().id,
                                        	timer: timer,
                                        	maxTimer: parseFloat(Sys.Config.Texas.RegularTimer),
                                        	buttonAction : buttonAction,
                                        	roomId: room.id,
                                        });
                                        timer--;
                                        if (timer < -1) {
                                        	clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
                                        	Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
                                        }*/
                                    }

                                }, 1000, room);
                            }, (1000), room);
                        } else {
                            Sys.Timers[room.id] = setInterval(async function(room) {
                                console.log("Player Timer Send 1 : ", timer, room.game.gameNumber);

                                timer--;
                                if (timer < 0) {
                                    clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
                                    clearInterval(Sys.Timers[room.id]);
                                    room.players[room.currentPlayer].isAlreadyActed = true;
                                    console.log("room players in newRoundStarted", room.players);
                                    Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
                                } else {
                                    await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnTurnTimer', {
                                        playerId: room.getCurrentPlayer().id,
                                        timer: timer,
                                        maxTimer: parseFloat(Sys.Config.Texas.RegularTimer),
                                        buttonAction: buttonAction,
                                        roomId: room.id,
                                        isLimitGame: (room.limit == 'limit' || room.limit == "Hi-Lo-limit") ? true : false
                                    });
                                }

                                /*if(room.getCurrentPlayer().isIdeal == true){
                                	clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
                                	Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
                                }else{
                                	await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnTurnTimer', {
                                		playerId: room.getCurrentPlayer().id,
                                		timer: timer,
                                		maxTimer: parseFloat(Sys.Config.Texas.RegularTimer),
                                		buttonAction : buttonAction,
                                		roomId: room.id,
                                	});
                                	timer--;
                                	if (timer < -1) {
                                		clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
                                		Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
                                	}
                                }*/

                            }, 1000, room);
                        }

                    }

                }, (500), room);
            }, (1000 * parseFloat(Sys.Config.Texas.waitBeforeCardDistribut)), room);
            return
        } catch (e) {
            console.log("Error:", e);
        }
    },

    newGameStarted: async function(room) {
        try {
            console.log("Game Started Brodcast");
            await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('GameStarted', {
                message: 'starting first round',
                gameId: room.game.id,
                gameNumber: `${room.tableNumber} ${room.game.gameNumber}`,
                roomId: room.id
            });
        } catch (e) {
            console.log("Error:", e);
        }
    },

    playerUpdateAutoBuyIn: async function(data) {
        try {

            let room = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(data.roomId);
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
            room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
            return {};
        } catch (e) {
            console.log("Error:", e);
        }
    },

    playerAction: async function(data) {
        try {
            let room = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(data.roomId);
            if (!room) {
                return {
                    status: 'fail',
                    result: null,
                    message: "Room not found",
                    statusCode: 401
                };
            }

            var currentPlayer = room.getCurrentPlayer();
            console.log("currentPlayer.isAlreadyActed", currentPlayer.isAlreadyActed);
            if ((currentPlayer && (currentPlayer.id != data.playerId)) || (currentPlayer.isAlreadyActed == true)) {
                return console.log('Its not your turn or your turn expired');
            }
            if (room.game.status == 'Running') {
                currentPlayer.defaultActionCount = 0;
                currentPlayer.idealTime = null;

                clearTimeout(Sys.Timers[room.id]);
                clearInterval(Sys.Timers[room.id]);
                currentPlayer.isAlreadyActed = true;
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
        } catch (e) {
            console.log("Error in playerAction :", e);
            return new Error(e);
        }
    },

    turnFinished: async function(room) {
        try {
            for (let i = 0; i < room.players.length; i++) {
                room.players[i].isAlreadyActed = false;
            }

            clearTimeout(Sys.Timers[room.id]);
            clearInterval(Sys.Timers[room.id]);
            room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
            console.log('TurnFinished', Sys.Config.Texas.Regular, room.game.gameNumber)
            if (room.getCurrentPlayer()) {
                let turnBetData = room.getPreviousPlayerAction();
                await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('PlayerAction', {
                    action: turnBetData,
                    roomId: room.id,
                    playerBuyIn: (turnBetData.playerId) ? parseFloat(room.getPlayerById(turnBetData.playerId).chips) : 0,
                    totalTablePotAmount: +parseFloat(room.game.bets.reduce((partial_sum, a) => partial_sum + a) + room.game.pot).toFixed(4),
                });
                // reset prebet options
                for (let p = 0; p < room.players.length; p++) {
                    if (room.players[p].id == turnBetData.playerId) {
                        room.players[p].isCheck = false;
                        room.players[p].isFold = false;
                        room.players[p].isCall = false;
                    }
                }
                // await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('NextTurnPlayer', {
                // 	nextTurnPlayerId: room.getCurrentPlayer().id
                // });

                let timer = parseFloat(Sys.Config.Texas.RegularTimer);
                let buttonAction = room.getCurrentTurnButtonAction();
                //console.log(buttonAction);

                let totalPlayingPlayers = 0;
                for (i = 0; i < room.players.length; i++) {
                    if (room.players[i].status == 'Playing' && room.players[i].folded == false) {
                        totalPlayingPlayers++;
                    }
                }
                console.log("totalplaying players", totalPlayingPlayers, room.players, room.game.gameNumber)
                if (totalPlayingPlayers > 1) {
                    Sys.Timers[room.id] = setInterval(async function(room) {
                        console.log("Player Timer Send 2 : ", timer, room.game.gameNumber);
                        if (room.getCurrentPlayer().isIdeal == true) {
                            clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
                            clearInterval(Sys.Timers[room.id]);
                            room.players[room.currentPlayer].isAlreadyActed = true;
                            Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
                        } else {

                            timer--;
                            // For Player Default Action
                            let maxBet = parseFloat(room.getMaxBet(room.game.bets));
                            let yourBet = parseFloat(room.game.bets[room.currentPlayer]);
                            let playerChips = parseFloat(room.players[room.currentPlayer].chips);

                            if (timer < 0) {
                                clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
                                clearInterval(Sys.Timers[room.id]);
                                room.players[room.currentPlayer].isAlreadyActed = true;
                                console.log("room players in turnFinished 2", room.players);
                                Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
                            } else if (room.getCurrentPlayer().isCheck == true) {
                                if (maxBet == yourBet) {
                                    //room.check(room.getCurrentPlayer().id);
                                    Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerAction({
                                        playerId: room.getCurrentPlayer().id,
                                        betAmount: 0,
                                        action: 2,
                                        roomId: room.id,
                                        hasRaised: false,
                                        productName: 'White Poker'
                                    });
                                } else {
                                    //room.fold(room.getCurrentPlayer().id);
                                    Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerAction({
                                        playerId: room.getCurrentPlayer().id,
                                        betAmount: 0,
                                        action: 6,
                                        roomId: room.id,
                                        hasRaised: false,
                                        productName: 'White Poker'
                                    });
                                }
                            } else if (room.getCurrentPlayer().isCall == true) {
                                if (parseFloat(maxBet - yourBet) == 0) {
                                    //room.check(room.getCurrentPlayer().id);
                                    Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerAction({
                                        playerId: room.getCurrentPlayer().id,
                                        betAmount: 0,
                                        action: 2,
                                        roomId: room.id,
                                        hasRaised: false,
                                        productName: 'White Poker'
                                    });
                                } else if (playerChips <= parseFloat(maxBet - yourBet)) {
                                    //room.AllIn(room.getCurrentPlayer().id, false);
                                    Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerAction({
                                        playerId: room.getCurrentPlayer().id,
                                        betAmount: playerChips,
                                        action: 8,
                                        roomId: room.id,
                                        hasRaised: false,
                                        productName: 'White Poker'
                                    });
                                } else {
                                    //room.call(room.getCurrentPlayer().id, false);
                                    Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerAction({
                                        playerId: room.getCurrentPlayer().id,
                                        betAmount: (maxBet - yourBet),
                                        action: 4,
                                        roomId: room.id,
                                        hasRaised: false,
                                        productName: 'White Poker'
                                    });
                                }
                            } else if (room.getCurrentPlayer().isFold == true) {
                                //room.fold(room.getCurrentPlayer().id);
                                Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerAction({
                                    playerId: room.getCurrentPlayer().id,
                                    betAmount: 0,
                                    action: 6,
                                    roomId: room.id,
                                    hasRaised: false,
                                    productName: 'White Poker'
                                });
                            } else {
                                await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnTurnTimer', {
                                    playerId: room.getCurrentPlayer().id,
                                    timer: timer,
                                    roomId: room.id,
                                    maxTimer: parseFloat(Sys.Config.Texas.RegularTimer),
                                    buttonAction: buttonAction,
                                    defaultButtons: room.getDefaultButtons(),
                                    isLimitGame: (room.limit == 'limit' || room.limit == "Hi-Lo-limit") ? true : false
                                });
                            }

                            /*await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnTurnTimer', {
                            	playerId: room.getCurrentPlayer().id,
                            	timer: timer,
                            	maxTimer: parseFloat(Sys.Config.Texas.RegularTimer),
                            	buttonAction : buttonAction,
                            	roomId: room.id,
                            	defaultButtons: room.getDefaultButtons(),
                            });
                            timer--;
                            if (timer < -1) {
                            	clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
                            	Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
                            }else {
                            	// For Player Default Action
                            	let maxBet = parseFloat(room.getMaxBet(room.game.bets));
                            	let yourBet = parseFloat(room.game.bets[room.currentPlayer]);
                            	let playerChips = parseFloat(room.players[room.currentPlayer].chips);

                            	if (room.getCurrentPlayer().isCheck == true) {
                            		if (maxBet == yourBet) {
                            			room.check(room.getCurrentPlayer().id);
                            		} else {
                            			room.fold(room.getCurrentPlayer().id);
                            		}
                            	}

                            	if (room.getCurrentPlayer().isCall == true) {
                            		if (parseFloat(maxBet - yourBet) == 0) {
                            			room.check(room.getCurrentPlayer().id);
                            		}
                            		else if (playerChips <= parseFloat(maxBet - yourBet)) {
                            			room.AllIn(room.getCurrentPlayer().id, false);
                            		} else {
                            			room.call(room.getCurrentPlayer().id, false);
                            		}
                            	}

                            	if (room.getCurrentPlayer().isFold == true) {
                            		room.fold(room.getCurrentPlayer().id);
                            	}

                            }*/
                        }

                    }, 1000, room);
                }
            }
        } catch (e) {
            console.log("Error:", e);
        }
    },

    roundFinished: async function(room, sidePot) {
        try {
            console.log('<=> Round Finished ||  Omaha GAME-NUMBER [' + room.game.gameNumber + '] || Player SidePot : ', sidePot);
            room.timerStart = false;
            clearTimeout(Sys.Timers[room.id]);
            clearInterval(Sys.Timers[room.id]);
            for (let i = 0; i < room.players.length; i++) {
                room.players[i].isAlreadyActed = false;
            }
            console.log("Room Game POT :", room.game.pot, room.game.gameNumber);
            console.log("Room Game bets :", room.game.roundBets, room.game.gameNumber);
            room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
            console.log("round finished main pot", room.game.bets.reduce((partial_sum, a) => partial_sum + a))
            room.betCounter = 0;
            room.allInInLimit = false;
            console.log("betCounter", room.betCounter)
            let turnBetData = room.getPreviousPlayerAction();
            await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('PlayerAction', {
                action: turnBetData,
                roomId: room.id,
                playerBuyIn: (turnBetData.playerId) ? parseFloat(room.getPlayerById(turnBetData.playerId).chips) : 0,
                totalTablePotAmount: room.game.pot
            });
            console.log("roundfinished Roundcomplete broadcast", room.game.pot, room.game.gameMainPot, sidePot)
                // reset prebet options
            for (let p = 0; p < room.players.length; p++) {
                if (room.players[p].id == turnBetData.playerId) {
                    room.players[p].isCheck = false;
                    room.players[p].isFold = false;
                    room.players[p].isCall = false;
                }
            }
            Sys.Timers[room.id] = setTimeout(async function(room) {
                await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('RoundComplete', {
                    roundStarted: room.game.roundName,
                    cards: room.game.board,
                    potAmount: room.game.pot,
                    PlayerSidePot: {
                        sidePot: sidePot,
                        mainPot: +(room.game.gameMainPot).toFixed(2)
                    },
                    roomId: room.id,
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
                            amount: parseFloat(winAmount),
                            chips: parseFloat(winplr.chips),
                            winnerSeatIndex: winplr.seatIndex,
                            sidePotPlayerIndex: -1, // main Port index,
                            roomId: room.id,
                        };

                        //Add revertpoint amount into player winningarray  @chetan
                        for (let w = 0; w < room.gameWinners.length; w += 1) {
                            if (room.game.gameRevertPoint[h].playerID == room.gameWinners[w].playerId) {
                                room.gameWinners[w].chips += parseFloat(room.game.gameRevertPoint[h].amount);
                                console.log("check long value revertpoint", room.gameWinners[w].chips, typeof(room.gameWinners[w].chips))
                            }
                        }

                        //console.log("revertpoint player", room.game.gameRevertPoint);
                        //console.log("room winners", room.gameWinners);
                        console.log("revert point win amount", winAmount, room.game.gameNumber);
                        console.log("final wining amount sum", winplr.chips, room.game.gameNumber);
                        console.log('<=> Game RevertPoint Broadcast || Omaha GAME-NUMBER [' + room.game.gameNumber + '] || RevertPoint : ', dataObj);
                        await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('RevertPoint', dataObj);
                    }
                }

                if (room.getCurrentPlayer()) {
                    Sys.Timers[room.id] = setTimeout(async function(room) {

                        // Form New Round Set Turn Bet in Raised Amount is BB
                        Sys.Rooms[room.id].turnBet = { action: Sys.Config.Texas.Bet, playerId: room.players[room.currentPlayer].id, betAmount: 0, raisedAmount: room.bigBlind, hasRaised: false }
                        console.log("<< New Roud Start.......  >>")
                        console.log("<< Turn Bet ::", Sys.Rooms[room.id].turnBet)
                        let timer = parseFloat(Sys.Config.Texas.RegularTimer);
                        let buttonAction = room.getCurrentTurnButtonAction();
                        console.log(buttonAction);

                        let totalPlayingPlayers = 0;
                        for (i = 0; i < room.players.length; i++) {
                            if (room.players[i].status == 'Playing' && room.players[i].folded == false) {
                                totalPlayingPlayers++;
                            }
                        }
                        if (totalPlayingPlayers > 1) {
                            Sys.Timers[room.id] = setInterval(async function(room) {
                                console.log("Player Timer Send 3 : ", timer, room.game.gameNumber);

                                timer--;
                                // For Player Default Action
                                let maxBet = parseFloat(room.getMaxBet(room.game.bets));
                                let yourBet = parseFloat(room.game.bets[room.currentPlayer]);
                                let playerChips = parseFloat(room.players[room.currentPlayer].chips);

                                if (timer < 0) {
                                    clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
                                    clearInterval(Sys.Timers[room.id]);
                                    room.players[room.currentPlayer].isAlreadyActed = true;
                                    console.log("room players in roundFinished", room.players);
                                    Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
                                } else if (room.getCurrentPlayer().isCheck == true) {
                                    if (maxBet == yourBet) {
                                        //room.check(room.getCurrentPlayer().id);
                                        Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerAction({
                                            playerId: room.getCurrentPlayer().id,
                                            betAmount: 0,
                                            action: 2,
                                            roomId: room.id,
                                            hasRaised: false,
                                            productName: 'White Poker'
                                        });
                                    } else {
                                        //room.fold(room.getCurrentPlayer().id);
                                        Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerAction({
                                            playerId: room.getCurrentPlayer().id,
                                            betAmount: 0,
                                            action: 6,
                                            roomId: room.id,
                                            hasRaised: false,
                                            productName: 'White Poker'
                                        });
                                    }
                                } else if (room.getCurrentPlayer().isCall == true) {
                                    if (parseFloat(maxBet - yourBet) == 0) {
                                        //room.check(room.getCurrentPlayer().id);
                                        Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerAction({
                                            playerId: room.getCurrentPlayer().id,
                                            betAmount: 0,
                                            action: 2,
                                            roomId: room.id,
                                            hasRaised: false,
                                            productName: 'White Poker'
                                        });
                                    } else if (playerChips <= parseFloat(maxBet - yourBet)) {
                                        //room.AllIn(room.getCurrentPlayer().id, false);
                                        Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerAction({
                                            playerId: room.getCurrentPlayer().id,
                                            betAmount: playerChips,
                                            action: 8,
                                            roomId: room.id,
                                            hasRaised: false,
                                            productName: 'White Poker'
                                        });
                                    } else {
                                        //room.call(room.getCurrentPlayer().id, false);
                                        Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerAction({
                                            playerId: room.getCurrentPlayer().id,
                                            betAmount: (maxBet - yourBet),
                                            action: 4,
                                            roomId: room.id,
                                            hasRaised: false,
                                            productName: 'White Poker'
                                        });
                                    }
                                } else if (room.getCurrentPlayer().isFold == true) {
                                    //room.fold(room.getCurrentPlayer().id);
                                    Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerAction({
                                        playerId: room.getCurrentPlayer().id,
                                        betAmount: 0,
                                        action: 6,
                                        roomId: room.id,
                                        hasRaised: false,
                                        productName: 'White Poker'
                                    });
                                } else {
                                    await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnTurnTimer', {
                                        playerId: room.getCurrentPlayer().id,
                                        timer: timer,
                                        roomId: room.id,
                                        maxTimer: parseFloat(Sys.Config.Texas.RegularTimer),
                                        buttonAction: buttonAction,
                                        defaultButtons: room.getDefaultButtons(),
                                        isLimitGame: (room.limit == 'limit' || room.limit == "Hi-Lo-limit") ? true : false
                                    });
                                }

                                /*if(room.getCurrentPlayer().isIdeal == true){
                                	clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
                                	Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
                                }else{
                                	await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnTurnTimer', {
                                		playerId: room.getCurrentPlayer().id,
                                		timer: timer,
                                		maxTimer: parseFloat(Sys.Config.Texas.RegularTimer),
                                		buttonAction : buttonAction,
                                		roomId: room.id,
                                		defaultButtons: room.getDefaultButtons(),
                                	});
                                	timer--;
                                	if (timer < -1) {
                                		clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
                                		Sys.Game.Reguler.Omaha.Controllers.RoomProcess.playerDefaultAction(room.id);
                                	}else {
                                		// For Player Default Action
                                		let maxBet = parseFloat(room.getMaxBet(room.game.bets));
                                		let yourBet = parseFloat(room.game.bets[room.currentPlayer]);
                                		let playerChips = parseFloat(room.players[room.currentPlayer].chips);

                                		if (room.getCurrentPlayer().isCheck == true) {
                                			if (maxBet == yourBet) {
                                				room.check(room.getCurrentPlayer().id);
                                			} else {
                                				room.fold(room.getCurrentPlayer().id);
                                			}
                                		}

                                		if (room.getCurrentPlayer().isCall == true) {
                                			if (parseFloat(maxBet - yourBet) == 0) {
                                				room.check(room.getCurrentPlayer().id);
                                			}
                                			else if (playerChips <= parseFloat(maxBet - yourBet)) {
                                				room.AllIn(room.getCurrentPlayer().id, false);
                                			} else {
                                				room.call(room.getCurrentPlayer().id, false);
                                			}
                                		}

                                		if (room.getCurrentPlayer().isFold == true) {
                                			room.fold(room.getCurrentPlayer().id);
                                		}

                                	}
                                }*/

                            }, 1000, room);
                        }
                    }, (Sys.Config.Texas.waitAfterRoundComplete / 2), room)
                }
            }, 1000, room)
        } catch (e) {
            console.log(" Error roundFinished :", e);
        }
    },

    gameFinished: async function(room, sidePot) {
        try {
            clearTimeout(Sys.Timers[room.id]);
            clearInterval(Sys.Timers[room.id]);
            let waitTime = Sys.Config.Texas.waitAfterRoundComplete;
            let tournament = await Sys.Game.Reguler.Texas.Services.TournamentServices.getById(room.tournament);
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
            // else {
            // 	let turnBetData = room.getPreviousPlayerAction();
            // 	await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('PlayerAction', {
            // 		action: turnBetData,
            // 		playerBuyIn: (turnBetData.playerId) ? room.getPlayerById(turnBetData.playerId).chips : 0,

            // 	});
            // }
            let originalGameStatus = room.game.status;
            if (room.game.status != 'Finished') {
                room.game.status = 'Finished';
                room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
                console.log('<=> Game Finished Called ||  Omaha GAME-NUMBER [' + room.game.gameNumber + '] ||');
                let dataObj = {
                    roundStarted: room.game.roundName,
                    cards: room.game.board,
                    potAmount: room.game.pot
                };
                console.log('<=> Game Finished Round Complete Broadcast ||  Omaha GAME-NUMBER [' + room.game.gameNumber + '] || RoundComplete : ', dataObj);
                console.log("gamefinished Roundcomplete broadcast", room.game.pot, room.game.gameMainPot, sidePot)
                await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('RoundComplete', {
                    roundStarted: room.game.roundName,
                    cards: room.game.board,
                    potAmount: room.game.pot,
                    PlayerSidePot: {
                        sidePot: sidePot,
                        mainPot: +(room.game.gameMainPot).toFixed(2)
                    },
                    roomId: room.id,
                });
            }

            let extraWaitTime = 1000;
            if (originalGameStatus == 'ForceFinishedFolded') {
                extraWaitTime = 250;
            }
            Sys.Timers[room.id] = setTimeout(async function(room, showCardsPlayerIds) {

                // Send Revert Point to Player
                /*for (let h = 0; h < room.game.gameRevertPoint.length; h += 1) {
                	if (room.game.gameRevertPoint[h].amount > 0) {
                		let winplr = room.players[room.game.gameRevertPoint[h].playerIndex];
                		let winAmount = room.game.gameRevertPoint[h].amount;
                		// rack update

                		winplr.chips += winAmount;

                		let dataObj = {
                			playerId: winplr.id,
                			playerName: winplr.playerName,
                			amount: winAmount,
                			chips : winplr.chips,
                			winnerSeatIndex: winplr.seatIndex,
                			sidePotPlayerIndex: -1, // main Port index,
                		};

                		//Add revertpoint amount into player winningarray  @chetan
                		for(let w = 0; w < room.gameWinners.length; w += 1){
                			if(room.game.gameRevertPoint[h].playerID == room.gameWinners[w].playerId){
                				room.gameWinners[w].chips += room.game.gameRevertPoint[h].amount;
                			}
                		}
                		
                		//console.log("revertpoint player", room.game.gameRevertPoint);
                		//console.log("room winners", room.gameWinners);
                		console.log("revert point win amount",winAmount );
                		console.log("final wining amount sum", winplr.chips);
                		console.log('<=> Game RevertPoint Broadcast || Omaha GAME-NUMBER [' + room.game.gameNumber + '] || RevertPoint : ', dataObj);
                		await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('RevertPoint', dataObj);
                	}
                }*/


                Sys.Timers[room.id] = setTimeout(async function(room, showCardsPlayerIds) {
                    // Send All Players Cards. Declare Winner
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
                        await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('GameFinishedPlayersCards', { playersCards: playersCards, roomId: room.id })
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
                    await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('DisplayShowCardButton', { playerIdList: showCardsPlayerIds, gameId: room.game.id, roomId: room.id });
                    /*else{
                    	await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('DisplayShowCardButton', { playerIdList : room.lastFoldedPlayerIdArray, gameId:room.game.id, roomId: room.id });
                    }*/


                    // timeout condition for folded players

                    if (originalGameStatus == 'ForceFinishedFolded') {
                        waitTime = 1000;
                    }

                    Sys.Timers[room.id] = setTimeout(async function(room) {

                        var winnerPlayerIds = [];
                        var winnerPlayerAmount = [];
                        for (var c = 0; c < room.gameWinners.length; c++) {
                            winnerPlayerIds.push(room.gameWinners[c].playerId);
                            winnerPlayerAmount.push(room.gameWinners[c].amount);
                        }

                        for (var rp = 0; rp < room.players.length; rp++) {
                            var transactionData = await Sys.Game.CashGame.Texas.Services.ChipsServices.getSingleData({ user_id: room.players[rp].id, gameId: room.game.id });
                            var totalBetAmount = room.game.roundBets[rp];
                            if (winnerPlayerIds.indexOf(room.players[rp].id) > -1 && parseFloat(totalBetAmount) > 0) {
                                var winnerAmount = 0;
                                for (var wp = 0; wp < winnerPlayerIds.length; wp++) {
                                    if (winnerPlayerIds[wp] == room.players[rp].id) {
                                        winnerAmount += winnerPlayerAmount[wp]
                                    }
                                }

                                console.log("winner Amount new: ", winnerAmount);
                                console.log("parseFloat(totalBetAmount): ", parseFloat(totalBetAmount));
                                console.log("parseFloat(winnerAmount): ", parseFloat(winnerAmount));
                                var transactionDetail = await Sys.Game.CashGame.Texas.Services.ChipsServices.getSingleData({ user_id: room.players[rp].id, gameId: room.game.id });
                                console.log("transactionDetail: ", transactionDetail);
                                if (transactionDetail == null) {
                                    let traNumber = +new Date()
                                    let transactionDataWinData = {
                                        user_id: room.players[rp].id,
                                        transactionNumber: 'DEP-' + traNumber,
                                        username: room.players[rp].playerName,
                                        gameId: room.game.id,
                                        gameNumber: room.game.gameNumber,
                                        chips: parseFloat(winnerAmount),
                                        bet_amount: parseFloat(totalBetAmount),
                                        afterBalance: parseFloat(room.players[rp].chips),
                                        previousBalance: (parseFloat(room.players[rp].chips) + parseFloat(totalBetAmount)) - parseFloat(winnerAmount),
                                        category: 'credit',
                                        type: 'winner',
                                        remark: 'Winner for game finished',
                                        uniqId: room.players[rp].uniqId,
                                        // sessionId:room.players[rp].sessionId
                                        sessionId: tournament.playersSestionIds[tournament.players.indexOf(room.players[rp].id)],

                                    }
                                    await Sys.Game.CashGame.Texas.Services.ChipsServices.insertData(transactionDataWinData);
                                    let transactionData = {
                                        user_id: room.players[rp].id,
                                        username: room.players[rp].playerName,
                                        gameId: room.game.id,
                                        gameNumber: room.game.gameNumber,
                                        tableId: room.id,
                                        tableName: room.name,
                                        chips: parseFloat(winnerAmount),
                                        previousBalance: (parseFloat(room.players[rp].chips) - parseFloat(winnerAmount)),
                                        afterBalance: parseFloat(room.players[rp].chips),
                                        category: 'credit',
                                        type: 'winner',
                                        remark: 'winner for game',
                                        isTournament: 'No',
                                        isGamePot: 'no'
                                    }
                                    console.log("Winner for game: ", transactionData);
                                    await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);
                                } else {
                                    var newChips = parseFloat(transactionDetail.chips) + parseFloat(winnerAmount);
                                    let previousBalance = parseFloat(transactionDetail.previousBalance) - parseFloat(winnerAmount);
                                    console.log("transactionDetail exist newChips: ", newChips);
                                    console.log("transactionDetail exist previousBalance: ", previousBalance);
                                    await Sys.Game.CashGame.Texas.Services.ChipsServices.updateTransactionData({ _id: transactionDetail._id }, { previousBalance: parseFloat(previousBalance), chips: parseFloat(newChips).toFixed(2) });
                                }
                            } else if (winnerPlayerIds.indexOf(room.players[rp].id) == -1 && parseFloat(totalBetAmount) > 0) {
                                if (transactionData == null) {
                                    let traNumber = +new Date()
                                    let transactionDataWinData = {
                                        user_id: room.players[rp].id,
                                        username: room.players[rp].playerName,
                                        gameId: room.game.id,
                                        gameNumber: room.game.gameNumber,
                                        chips: parseFloat(totalBetAmount),
                                        bet_amount: parseFloat(totalBetAmount),
                                        afterBalance: parseFloat(room.players[rp].chips),
                                        previousBalance: parseFloat(room.players[rp].chips) + parseFloat(totalBetAmount),
                                        category: 'debit',
                                        type: 'lose',
                                        remark: 'Lose for game',
                                        transactionNumber: 'DE-' + traNumber,
                                        uniqId: room.players[rp].uniqId,
                                        sessionId: tournament.playersSestionIds[tournament.players.indexOf(room.players[rp].id)]
                                    };

                                    await Sys.Game.CashGame.Texas.Services.ChipsServices.insertData(transactionDataWinData);
                                    let transactionData = {
                                        user_id: room.players[rp].id,
                                        username: room.players[rp].playerName,
                                        gameId: room.game.id,
                                        gameNumber: room.game.gameNumber,
                                        tableId: room.id,
                                        tableName: room.name,
                                        chips: parseFloat(0),
                                        previousBalance: parseFloat(room.players[rp].chips),
                                        afterBalance: parseFloat(room.players[rp].chips),
                                        category: 'debit',
                                        type: 'lose',
                                        remark: 'Lose for game',
                                        isTournament: 'No',
                                        isGamePot: 'no'
                                    }
                                    console.log("lose for game: ", transactionData);
                                    await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);
                                }
                            }
                        }

                        //room = await Sys.Game.Reguler.Omaha.Controllers.RoomProcess.rackDeduction(room);
                        //console.log("room updated after rack feduction", room);
                        dataObj = {
                            winners: room.gameWinners
                        };
                        console.log('<=> Game Finished Broadcast || Omaha GAME-NUMBER [' + room.game.gameNumber + '] || GameFinished : ', dataObj);

                        await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('GameFinished', { winners: room.gameWinners, roomId: room.id });

                        room.updateAt = new Date().valueOf();
                        // start new game
                        /**
                         * Save game histry to database
                         */
                        console.log('<=> Game Start Saving Histry ||  Omaha GAME-NUMBER [' + room.game.gameNumber + '] ||');

                        let history = await Sys.Game.Reguler.Omaha.Controllers.RoomProcess.saveGameToHistry(room);



                        // timeout condition for folded players
                        let gameWinningTime = (room.gameWinners.length * 300) + parseFloat(Sys.Config.Texas.waitBeforeGameReset)
                        if (originalGameStatus == 'ForceFinishedFolded') {
                            gameWinningTime = 300;
                        }
                        Sys.Timers[room.id] = setTimeout(async function(room) {

                            console.log('<=> Game ResetGame Broadcast ||  Omaha GAME-NUMBER [] || ResetGame : ');
                            await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('ResetGame', { roomId: room.id });

                            // Check For Sit Out Next Hand. & Remove Player & Check For Bankcrupt
                            for (let i = 0; i < room.players.length; i++) {
                                /*if(room.players[i].sitOutNextHand == true){
                                	room.gameLosers.push(room.players[i]);
                                	room.players[i].status = 'Ideal';
                                	//await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('PlayerLeft', { 'playerId': room.players[i].id, roomId: room.id });
                                	await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('onIdealPlayer', { 'playerId': room.players[i].id,status : true });
                                	// Big Blind Remove So Find New Big Blind Player.
                                	room.players[i].defaultActionCount = 3;
                                	room.players[i].idealTime = (room.players[i].idealTime == null) ? new Date().getTime() : room.players[i].idealTime;
                                }*/


                                // Check For Bankcrupt
                                if (room.players[i].chips == 0) {
                                    //room.players[i].status = 'Ideal';
                                    //room.players[i].idealTime = (room.players[i].idealTime == null) ? new Date().getTime() : room.players[i].idealTime;
                                    room.gameLosers.push(room.players[i]);
                                    console.log('<=> Player ' + room.players[i].playerName + ' is going Bankrupt ???????????????????????????????????????????????????????????????????????????????????????');
                                    // room.players.splice(i, 1);
                                    room.players[i].status = 'Left';

                                    let dataPlayer = await Sys.Game.Reguler.Texas.Services.PlayerServices.getById(room.players[i].id);
                                    var afterLeftChips = (parseFloat(dataPlayer.chips) + room.players[i].chips);

                                    let transactionData = {
                                        user_id: room.players[i].id,
                                        username: room.players[i].playerName,
                                        gameId: room.game.id,
                                        gameNumber: room.game.gameNumber,
                                        tableId: room.id,
                                        tableName: room.name,
                                        chips: parseFloat(room.players[i].chips),
                                        previousBalance: parseFloat(dataPlayer.chips),
                                        afterBalance: parseFloat(afterLeftChips),
                                        category: 'debit',
                                        type: 'entry',
                                        remark: 'Fold',
                                        isTournament: 'Yes',
                                        isGamePot: 'no'
                                    }

                                    console.log("omaha tournament player chips zero transactionData: ", transactionData);
                                    await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);

                                    await Sys.Game.Reguler.Omaha.Services.playerGameHistoryServices.updatePlayerStatus(room.players[i].id, 'Finished');
                                    await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('PlayerLeft', { 'playerId': room.players[i].id, roomId: room.id });
                                    let tournament = await Sys.Game.Reguler.Omaha.Services.TournamentServices.getById(room.tournament);

                                    tournament.tournamentLosers.push(room.players[i].id);
                                    tournament = await Sys.Game.Reguler.Omaha.Services.TournamentServices.updateTourData({ _id: tournament.id }, { tournamentLosers: tournament.tournamentLosers });
                                }
                            }






                            /*	room.gameLosers.forEach(async function (player) {
                            		//console.log("Game Loser Player Left :");
                            		console.log('<=> Game PlayerLeft Broadcast ||  Omaha GAME-NUMBER [] || PlayerLeft : ', player.id);
                            		await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('PlayerLeft', { 'playerId': player.id, roomId:room.id });
                            	})*/

                            // remove lefted player also
                            room.status = 'Finished';
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
                                room.players[i].isDisplayedCard = false;
                                room.players[i].roundRaisedAmount = 0;
                                room.players[i].cards.splice(0, room.players[i].cards.length);

                                room.players[i].isFold = false;
                                room.players[i].isCheck = false;
                                room.players[i].isCall = false;
                                room.players[i].considerLeftedPlayer = false;
                                room.players[i].isAlreadyActed = false;
                            }
                            room.timerStart = false;
                            room.turnBet = {};
                            room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);

                            // timeout condition for folded players
                            let waitAfterGameReset = parseFloat(Sys.Config.Texas.waitAfterGameReset) + 1000;
                            if (originalGameStatus == 'ForceFinishedFolded') {
                                waitAfterGameReset = 1000;
                            }
                            Sys.Timers[room.id] = setTimeout(async function(room) {

                                let totalPlayers = 0;
                                for (i = 0; i < room.players.length; i++) {
                                    if (room.players[i].status != 'Left') {
                                        totalPlayers++;
                                    }
                                }
                                room.status = "Finished";
                                //room.game = null;



                                // open add chips popup if player has chips== 0 @chetan
                                /*for (i = 0; i < room.players.length; i++) {
                                	if(room.players[i].status == 'Ideal' && room.players[i].chips == 0 && parseFloat(room.players[i].extraChips) == 0 ){ 
                                		let minBuyIn = room.bigBlind;
                                		let maxBuyIn = 0;
                                		
                                		if(room.limit == 'limit'){
                                			maxBuyIn = room.players[i].chips; // No Limit in Max Buyin Game. // shubham
                                		}else if(room.limit == 'no_limit'){
                                			// No Limit
                                			maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
                                		}else{
                                			// Pot Limit
                                			maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
                                		}
                                		
                                		if(room.players[i].entryChips <  maxBuyIn){
                                			//maxBuyIn = (maxBuyIn - parseFloat(parseFloat(room.players[i].entryChips)+parseFloat(gamePlayer.extraChips)));
                                			// broadcast to open add chips popup
                                			console.log("popup open for player ", room.players[i].id)
                                			//await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnOpenBuyInPanel', { 'playerId': room.players[i].id, roomId:room.id });
                                			await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.players[i].socketId).emit('OnOpenBuyInPanel', { 'playerId': room.players[i].id, roomId:room.id });
                                		}else{
                                			return {
                                				status: 'fail',
                                				result: null,
                                				message: 'You have already used Maximum Buy in amount.'
                                			};
                                		}

                                	}
                                }*/


                                console.log('<===============================>');
                                console.log('<=> Ramain Player : <=>', totalPlayers);
                                console.log('<===============================>');


                                // Find Empty table
                                let tournament = await Sys.Game.Reguler.Omaha.Services.TournamentServices.getById(room.tournament);
                                if (!tournament) {
                                    console.log('<=> tournament not Found: <=>');
                                    return { status: 'fail', result: null, message: "Tournament not found", statusCode: 401 };
                                }
                                console.log('<=> tournament.rooms.length <=>', tournament.rooms.length);
                                console.log('<=> before merger roomId <=>', room.id);
                                let mergeRoom = null;

                                for (let i = 0; i < tournament.rooms.length; i++) {

                                    if (room.id != tournament.rooms[i] && mergeRoom == null) {

                                        let TourRoom = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(tournament.rooms[i]);
                                        console.log('Room :', TourRoom.id);

                                        if (TourRoom.status != 'Closed') {
                                            let playingPlayers = 0;
                                            for (let j = 0; j < TourRoom.players.length; j++) {
                                                if (TourRoom.players[j].status != 'Left') {
                                                    playingPlayers++;
                                                }
                                            }

                                            console.log('Room Total Player :', playingPlayers);
                                            console.log('=========================> :', parseFloat(totalPlayers + playingPlayers));



                                            if (parseFloat(totalPlayers + playingPlayers) <= parseFloat(TourRoom.maxPlayers)) {
                                                mergeRoom = TourRoom.id;
                                                console.log('<Break :> Break :> Break :> Break ::>', mergeRoom, room.id);
                                                break;
                                            }


                                            // if(playingPlayers >= totalPlayers){  // Remove for Testing
                                            // 	if(parseFloat(totalPlayers+playingPlayers) <= parseFloat(TourRoom.maxPlayers)){
                                            // 		mergeRoom = TourRoom.id;
                                            // 		console.log('<Break :> Break :> Break :> Break ::>',mergeRoom);

                                            // 		break;
                                            // 	}
                                            // }else{
                                            // 	if(parseFloat(totalPlayers+playingPlayers) <= parseFloat(TourRoom.maxPlayers)){
                                            // 		mergeRoom = TourRoom.id;
                                            // 		console.log('###### ######### Break',mergeRoom);

                                            // 		break;
                                            // 	}
                                            // }
                                        }


                                    }
                                }










                                // //console.log("before merge rooms", tournament.rooms)
                                // let tournamentRoomsIdsArray = [];
                                // for(let i=0;i<tournament.rooms.length;i++){
                                // 	let TourRoom = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(tournament.rooms[i]);
                                // 	if(TourRoom.status != 'Closed'){
                                // 		let	playingPlayers = 0;
                                // 		for (let j = 0; j < TourRoom.players.length; j++) {
                                // 			if(TourRoom.players[j].status != 'Left'){
                                // 				playingPlayers++;
                                // 			}
                                // 		}	
                                // 		tournamentRoomsIdsArray.push({'totalPlayer':playingPlayers, 'roomId':TourRoom.id  })
                                // 		//console.log('Room Total Player :',playingPlayers);		
                                // 	}
                                // }
                                // //console.log("before merge rooms with players", tournamentRoomsIdsArray)
                                // tournamentRoomsIdsArray.sort(function (a, b) {
                                //   return a.totalPlayer - b.totalPlayer;
                                // });
                                // //console.log("After merge rooms with players and sorting", tournamentRoomsIdsArray)

                                // for(let i=0;i<tournamentRoomsIdsArray.length;i++){

                                // 	if(room.id != tournamentRoomsIdsArray[i].roomId){

                                // 		let TourRoom = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(tournamentRoomsIdsArray[i].roomId);
                                // 		console.log('Room :',TourRoom.id);

                                // 		if(TourRoom.status != 'Closed'){
                                // 			let	playingPlayers = 0;
                                // 			for (let j = 0; j < TourRoom.players.length; j++) {
                                // 				if(TourRoom.players[j].status != 'Left'){
                                // 					playingPlayers++;
                                // 				}
                                // 			}	

                                // 			console.log('Room Total Player :',playingPlayers);
                                // 			if(playingPlayers >= totalPlayers){
                                // 				if(parseFloat(totalPlayers+playingPlayers) <= parseFloat(TourRoom.maxPlayers)){
                                // 					mergeRoom = TourRoom.id;
                                // 					console.log('<Break :> Break :> Break :> Break ::>',mergeRoom);
                                // 					break;
                                // 				}
                                // 			}
                                // 		}


                                // 	}
                                // }







                                /*for(let i=0;i<tournament.rooms.length;i++){

                                	if(room.id != tournament.rooms[i]){

                                		let TourRoom = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(tournament.rooms[i]);
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
                                				if(parseFloat(totalPlayers+playingPlayers) <= parseFloat(TourRoom.maxPlayers)){
                                					mergeRoom = TourRoom.id;
                                					console.log('<Break :> Break :> Break :> Break ::>',mergeRoom);
                                					break;
                                				}
                                			}
                                		}

                                		
                                	}
                                }*/

                                // Merge room found So Merger Room & Close Anoter Table.
                                if (mergeRoom) {

                                    console.log('<**********************************************************>');
                                    console.log('<=> Room Found for Merge : <=>', mergeRoom);
                                    console.log('<**********************************************************>');

                                    room.status = "Closed"; // Colse Old Room

                                    // Update Room Status.
                                    Sys.Game.Reguler.Omaha.Services.playerGameHistoryServices.updateRoomStatus(room.id, 'Finished');


                                    for (i = 0; i < room.players.length; i++) {
                                        if (room.players[i].status != 'Left') {
                                            let playerObj = {
                                                id: room.players[i].id,
                                                socketId: room.players[i].socketId,
                                                username: room.players[i].playerName,
                                                avatar: room.players[i].avatar,
                                                appid: room.players[i].appid,
                                                chips: room.players[i].chips,
                                                autoBuyin: room.players[i].autoBuyin,
                                                isIdeal: room.players[i].isIdeal,
                                            }
                                            console.log("merged player", room.players[i].playerName, room.players[i].chips)
                                            await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(mergeRoom).emit('OnTournamentTableBreakMessage', {
                                                roomId: mergeRoom,
                                                message: ''
                                            })
                                            let finalRoom = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(mergeRoom);
                                            finalRoom.roomStatusCheckOnBreak = false;
                                            let joinTourna = await Sys.Game.Reguler.Omaha.Controllers.RoomProcess.joinTournamentRoom(playerObj, mergeRoom);
                                        }
                                    }

                                    console.log('<===============================>');
                                    console.log('<=> Room Closed [] <=>', room.id);
                                    console.log('<===============================>');
                                    await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnSwitchRoom', {
                                        newRoomId: mergeRoom,
                                        roomId: room.id,
                                    });

                                    room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);

                                    let mergerRoom = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(mergeRoom);
                                    if (!mergerRoom || mergerRoom == undefined) {
                                        return { status: 'fail', result: null, message: "Room Not found!", statusCode: 404 };
                                    }


                                    let playingPlayers = 0;
                                    for (let j = 0; j < mergerRoom.players.length; j++) {
                                        if (mergerRoom.players[j].status != 'Left') {
                                            playingPlayers++;
                                        }
                                    }


                                    console.log('<=>[ Merger  ] <=>', room.status);
                                    //console.log("room.game",room.game)

                                    if (mergerRoom.status != 'Running' && mergerRoom.status != 'Closed' && mergerRoom.game == null && playingPlayers >= mergerRoom.minPlayers) {

                                        clearTimeout(Sys.Timers[mergerRoom.id]); // Clear Turn Timer
                                        console.log('<===============================>');

                                        console.log('<=>[ Tournament Table Finished Merger Room Start ] <=>');
                                        console.log('<===============================>');
                                        mergerRoom.StartGame();
                                    }



                                } else {

                                    if (totalPlayers >= room.minPlayers) {
                                        console.log('<=> Check Break Timer <=>');
                                        let current = new Date().getTime();
                                        var difference = current - room.breakTime;
                                        var minutesDifference = Math.floor(difference / 1000 / 60);

                                        if (minutesDifference >= parseFloat(Sys.Config.Texas.regulaerBreakStartIn)) {
                                            room.breakTime = new Date().getTime();
                                            let breakTime = parseFloat(parseFloat(Sys.Tournaments[tournament.id].breaks_time) * 60);
                                            let OtherRoom = [];
                                            for (let i = 0; i < tournament.rooms.length; i++) {

                                                TrRoom = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(tournament.rooms[i]);
                                                OtherRoom.push(TrRoom)


                                            }
                                            console.log("ROOM STATUS", OtherRoom)
                                            for (let i = OtherRoom.length - 1; i >= 0; i--) {
                                                if (OtherRoom[i].status == 'Closed') {
                                                    OtherRoom.splice(i, 1);
                                                }
                                            }
                                            console.log("ROOM STATUS2222", OtherRoom)
                                            console.log("CHECK STATUS OF ROOM", OtherRoom.every((val, i, arr) => val.status === arr[0].status))

                                            console.log("ALL ROOM TIME CHECK", OtherRoom.map((val) => val.updateAt && val.id))
                                            let compareTime = OtherRoom.reduce(function(prev, current) {
                                                return (prev.updateAt > current.updateAt) ? prev : current
                                            });

                                            if (OtherRoom.every((val, i, arr) => val.status === arr[0].status)) {
                                                if (compareTime.id == room.id) {
                                                    Sys.Timers[room.id] = setInterval(async function(room) {
                                                        console.log("Break Start :", breakTime);
                                                        //Sys.Game.Reguler.Omaha.Controllers.TournamentProcess.stopBlindTimer(tournament,breakTime);
                                                        Sys.Game.Reguler.Omaha.Controllers.TournamentProcess.stopBlindTimer(tournament);
                                                        room.breakTimeCheck = true;
                                                        OtherRoom.map((val) => val.roomStatusCheckOnBreak = false);
                                                        OtherRoom.forEach(async function(allRooms) {
                                                            console.log("ALL ROOMS", allRooms.id);
                                                            await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(allRooms.id).emit('OnBreak', {
                                                                timer: breakTime,
                                                                name: 'break',
                                                                roomId: allRooms.id
                                                            });
                                                        });

                                                        breakTime--;
                                                        if (breakTime < 1) {
                                                            clearTimeout(Sys.Timers[room.id]); // Clear Turn Timer
                                                            console.log("ROOM ID", tournament)
                                                            let roomIds = [];
                                                            for (let i = 0; i < tournament.rooms.length; i++) {
                                                                roomIds.push(tournament.rooms[i]);
                                                            }
                                                            //Sys.Game.Reguler.Omaha.Controllers.TournamentProcess.startBlindTimer(tournament,roomIds,room.otherData.timerCheck,room.otherData.blindTimerCheck);
                                                            Sys.Game.Reguler.Omaha.Controllers.TournamentProcess.startBlindTimer(tournament, roomIds);
                                                            room.breakTimeCheck = false;
                                                            console.log('<===============================>');
                                                            console.log('<=> After Timer New Game Starting [] <=>');
                                                            console.log('<===============================>');
                                                            OtherRoom.forEach(async function(room, index) {
                                                                setTimeout(async() => {
                                                                    room.StartGame();
                                                                    room.breakTime = new Date().getTime();
                                                                }, 500 * index);
                                                            });

                                                        }

                                                    }, 1000, room);
                                                }

                                            } else {
                                                if (room.status == 'Finished') {
                                                    await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('OnTournamentTableBreakMessage', {
                                                        roomId: room.id,
                                                        message: 'Please wait for break time other rooms game is still running'
                                                    })
                                                    room.roomStatusCheckOnBreak = true;
                                                }
                                            }



                                        } else {

                                            console.log('<===============================>');
                                            console.log('<=> New Game Starting [] <=>');
                                            console.log('<===============================>');
                                            room.StartGame();
                                        }



                                    } else {
                                        // Remove Player Which Have Status Left
                                        for (let i = 0; i < room.players.length; i++) {
                                            if (room.players[i].status == 'Left') {
                                                room.players.splice(i, 1);
                                            }
                                        }

                                        // Check Tournament All Table Finished.
                                        let runningTable = 0;
                                        for (let i = 0; i < tournament.rooms.length; i++) {
                                            //console.log("Check Tournamet All Room Finished :",tournament.rooms[i])
                                            let roomStatus = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(tournament.rooms[i]);
                                            if (roomStatus.status != 'Closed') {
                                                runningTable++;
                                            }

                                        }

                                        if (runningTable == 1) {

                                            room.status = "Closed";
                                            room.game = null;

                                            // Room Status Finished.
                                            Sys.Game.Reguler.Omaha.Services.playerGameHistoryServices.updateRoomStatus(room.id, 'Finished');

                                            roomUpdated = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
                                            console.log('<===============================>');
                                            console.log('<=> Tournament Finished ');
                                            console.log('<===============================>');

                                            let remainigPlayer = null;
                                            for (i = 0; i < room.players.length; i++) {
                                                if (room.players[i].status != 'Left') {
                                                    remainigPlayer = room.players[i];
                                                }
                                            }
                                            if (remainigPlayer) {

                                                let tournament = await Sys.Game.Reguler.Omaha.Services.TournamentServices.getById(room.tournament);

                                                tournament.tournamentLosers.push(remainigPlayer.id);
                                                tournament = await Sys.Game.Reguler.Omaha.Services.TournamentServices.updateTourData({ _id: tournament.id }, { tournamentLosers: tournament.tournamentLosers });

                                            }


                                            // Tournament Finished.
                                            await Sys.Game.Reguler.Omaha.Controllers.TournamentProcess.finishTournament(room.id, room.tournament);



                                        } else {

                                            console.log('<===============================>');
                                            console.log('<=> Tournament Single Player in Table But Another Table have no Space So ... Wait For Another Table Finished..');
                                            console.log('<===============================>');


                                        }


                                    }

                                }


                            }, waitAfterGameReset, room)

                        }, gameWinningTime, room)

                    }, waitTime, room)

                }, extraWaitTime, room, showCardsPlayerIds);

            }, extraWaitTime, room, showCardsPlayerIds);

        } catch (e) {
            console.log("Error:", e);
        }
    },

    playerDefaultAction: async function(id) {
        try {
            console.log('playerDefaultAction called');
            clearTimeout(await Sys.Timers[id]);
            let room = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(id);
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

                //await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('onIdealPlayer', { 'playerId': currentPlayer.id,status : true });
                //currentPlayer.defaultActionCount += 1;
                //currentPlayer.idealTime = (currentPlayer.idealTime == null) ? new Date().getTime() : currentPlayer.idealTime;

                // only fold the player dont check for defaultActionCount means player continuously plays the game
                //room.fold(currentPlayer.id);


                /*if (currentPlayer.defaultActionCount >= 2) {
                	let query = { roomId: room.id, playerId: currentPlayer.id }
                	currentPlayer.idealTime = null;
                	let leftRoomPlayer = await Sys.Game.Reguler.Omaha.Controllers.RoomProcess.leftRoom(query);
                	console.log('Room Disconnect player lefted :', currentPlayer.playerName);
                } else {
                	// When Player is ideal, Fold theme
                	//currentPlayer.status = 'Ideal';
                	room.fold(currentPlayer.id);
                	let tournament = await Sys.Game.Reguler.Omaha.Services.TournamentServices.getById(room.tournament);
                	tournament.tournamentLosers.push(currentPlayer.id);
                	tournament = await Sys.Game.Reguler.Omaha.Services.TournamentServices.updateTourData({_id :tournament.id },{tournamentLosers : tournament.tournamentLosers });
                	// if (room.game.bets[room.currentPlayer] == maxBet) {
                	// 	room.check(currentPlayer.id);
                	// } else {
                	// 	room.fold(currentPlayer.id);
                	// }
                }*/


                // first check for check action and then for fold or lefting the player
                if (room.game.bets[room.currentPlayer] == maxBet) {
                    room.check(currentPlayer.id);
                } else {
                    // When Player is ideal, Fold theme
                    await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('onIdealPlayer', { 'playerId': currentPlayer.id, status: true, roomId: room.id });
                    //currentPlayer.status = 'Ideal';
                    currentPlayer.isIdeal = true;
                    room.fold(currentPlayer.id);
                }

            }
        } catch (e) {
            console.log("Error", e);
        }
    },

    saveGameToHistry: async function(room) {
        try {
            console.log('Save game histry called');
            room.players = [...new Set(room.players)];
            // console.log("room players when saving history", room.players);
            room.players.forEach(function(player) {
                room.game.players.push(player.toJson())
            })
            room.gameLosers.forEach(function(player) {
                room.game.players.push(player.toJson())
            })
            room.game.winners = room.gameWinners; // Just Push Winner.
            return await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
        } catch (e) {
            console.log("Error:", e);
        }
    },

    calculateRake: async function(room) {
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
                room.gameWinners[i].chips -= commission
                room.getPlayerById(room.gameWinners[i].playerId).chips -= commission
            }
            console.log('Admin User got : ' + adminChips + ' Chips')

            return await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room)


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

    sitOutNextHand: async function(data) {
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
            let room = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(data.roomId);
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
            room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
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

    sitOutNextBigBlind: async function(data) {
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
            let room = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(data.roomId);
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
            room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
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

    broadcastPlayerInfo: async function(room) {
        try {
            let playerInfoDummy = [];
            // Just Send Player Info for Remainig Player
            for (var i = 0; i < room.players.length; i++) {
                if (room.players[i].status != 'Left') {
                    console.log("room.players[i].avatar :", room.players[i].playerName)
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
                        idealPlayer: (room.players[i].isIdeal == true) ? true : false,
                        //idealPlayer :false,
                        betAmount: bets,
                    };
                    /*if( room.players[i].status != 'Ideal' && ( room.players[i].status != 'Playing' || (room.players[i].folded == true) || room.status != 'Running') ){
                    	playerInfoObj.idealPlayer = false;
                    }*/
                    playerInfoDummy.push(playerInfoObj);
                }
            }
            //console.log("playerInfolist broadcast", playerInfoDummy)
            //	console.log("while sending broadcast roomdata", playerInfoDummy);
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
            await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(room.id).emit('playerInfoList', {
                playerInfo: playerInfoDummy,
                dealerPlayerId: dealerPlayerId,
                roomId: room.id,
                PlayerSidePot: {
                    sidePot: sidePot,
                    mainPot: gameMainPot
                }
                // smallBlindPlayerId : smallBlindPlayerId,
                // bigBlindPlayerId : bigBlindPlayerId
            });
            return room;
        } catch (error) {
            console.log('Error in broadcastPlayerInfo : ' + error);
            return new Error('Error in broadcastPlayerInfo');
        }
    },


    // rack distribution
    rackDeductionUpdate: async function(playerId, gameId, won, rackPercent, totalRack, rackFrom, rackTo, rackFromId, rackToId, gameNumber) {
        try {
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
                'totalRack': eval(parseFloat(totalRack).toFixed(4)),
                'createdAt': new Date(),
                'type': "rake"
            });
            if (rackTo == 'admin') {
                let admin = await Sys.App.Services.UserServices.getSingleUserData({ _id: rackToId });
                console.log("Admin chips--", admin.chips);
                await Sys.App.Services.UserServices.updateUserData({ _id: rackToId }, { chips: eval(parseFloat((admin.chips + totalRack)).toFixed(4)) })
            } else {
                let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: rackToId });
                console.log("agent chips--", agent.chips);
                await Sys.App.Services.agentServices.updateAgentData({ _id: rackToId }, { chips: eval(parseFloat((agent.chips + totalRack)).toFixed(4)) })
            }
        } catch (e) {
            console.log("Error in RackDeduction Update", e);
        }
    },

    rackDeduction: async function(room) {
        try {
            console.log("rack called");
            let totalRackOfTheGame = 0;

            let rack = await Sys.Setting;
            let adminRack = rack.rakePercenage;
            for (let i = 0; i < room.gameWinners.length; i++) {
                /*let commission = parseFloat(room.gameWinners[i].chips * (rakeByPercent / 100));
                adminChips += commission;
                room.gameWinners[i].chips -= commission
                room.getPlayerById(room.gameWinners[i].playerId).chips -= commission*/
                room.gameWinners[i].amount = eval(parseFloat(room.gameWinners[i].amount).toFixed(4));
                console.log("*******************Rack**********************")
                console.log("playerId", room.gameWinners[i].playerId);
                console.log("game id", room.game.id, room.game.gameNumber)
                console.log("won amount", room.gameWinners[i].amount)
                console.log("*******************Rack***********************")

                //let allAgentsRole = ['player'];
                //let rack = await Sys.Setting; //get Application rack

                let totalRackDeductionWinner = eval(parseFloat((parseFloat(room.gameWinners[i].amount) * parseFloat(Sys.Setting.rakePercenage)) / 100).toFixed(4));
                //let adminRack = rack.rakePercenage;
                console.log("totsl rsck deduction", totalRackDeductionWinner, rack, room.gameWinners[i].chips)

                for (let j = i; j < room.gameWinners.length; j++) {
                    if (room.gameWinners[i].playerId == room.gameWinners[j].playerId) {
                        room.gameWinners[j].chips -= parseFloat(totalRackDeductionWinner);
                    }

                }
                console.log("after deduction chips winner array", room.gameWinners);
                //room.gameWinners[i].chips -= parseFloat(totalRackDeductionWinner);

                console.log("Winners Chips after rack Deduction", room.gameWinners[i].playerId, room.gameWinners[i].chips)
                Sys.Log.info('-----------Game Id-----------: ' + room.game.id, room.game.gameNumber);
                Sys.Log.info('Winners Chips after rack Deduction : ' + room.gameWinners[i].playerId + 'winning final:' + room.gameWinners[i].chips);


                room.getPlayerById(room.gameWinners[i].playerId).chips -= parseFloat(totalRackDeductionWinner);

                var gamePortData = await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.getSingleData({ isGamePot: 'no', type: 'winner', user_id: room.gameWinners[i].playerId, gameId: room.game.id });
                if (gamePortData != null) {

                    var currentTotalChips = (parseFloat(gamePortData.afterBalance) - parseFloat(totalRackDeductionWinner));

                    let transactionDataPot = {
                        user_id: room.gameWinners[i].playerId,
                        username: room.gameWinners[i].playerName,
                        gameId: room.game.id,
                        gameNumber: room.game.gameNumber,
                        tableId: room.id,
                        tableName: room.name,
                        chips: parseFloat(totalRackDeductionWinner),
                        previousBalance: parseFloat(gamePortData.afterBalance),
                        afterBalance: parseFloat(currentTotalChips),
                        category: 'debit',
                        type: 'rake',
                        remark: 'Rake Deduct',
                        isTournament: 'Yes',
                        isGamePot: 'no'
                    }
                    console.log("omaha tournament rake deduct transactionDataPot: ", transactionDataPot)
                    await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataPot);
                }

                totalRackOfTheGame += totalRackDeductionWinner;
            }
            console.log("Totalrackofthegame", totalRackOfTheGame, room.game.gameNumber);
            console.log("room.game.roundBets", room.game.roundBets, room.game.gameNumber);
            console.log("Game POT :", room.game.gamePot, room.game.gameNumber);
            console.log("gameMainPot :", room.game.gameMainPot, room.game.gameNumber);
            console.log("Game REvert Point :", room.game.gameRevertPoint, room.game.gameNumber);
            if (totalRackOfTheGame > 0) {
                let totalOfRoundBets = 0;
                let allAgentsRole = ['player'];

                let tempRoundBets = room.game.roundBets.slice();
                console.log("tempRoundBets 2", tempRoundBets)
                tempRoundBets.sort(function(a, b) {
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
                for (let rp = 0; rp < room.players.length; rp++) {
                    if ((room.players[rp].status === 'Playing') || (room.players[rp].folded == true && room.players[rp].talked == true) || (room.players[rp].status === 'Left' && room.players[rp].talked == true) || (room.players[rp].status === 'Ideal' && room.players[rp].talked == true)) {
                        console.log("player name and roundbets", room.players[rp].playerName, room.game.roundBets[rp]);

                        totalRackDeduction = parseFloat(((room.game.roundBets[rp] / totalOfRoundBets) * totalRackOfTheGame).toFixed(4));
                        console.log("totalRackDeduction", room.players[rp].playerName, totalRackDeduction)
                        let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: room.players[rp].id });
                        console.log("inside rack", player.username, player.agentRole, player.agentId);
                        if (player.agentId != '' && player.agentId != null && player.agentId != undefined) {
                            let agentRoleId = rolesArray.indexOf(player.agentRole);
                            let allAgents = [player.agentId];
                            let allAgentsFromToIds = [room.players[rp].id, player.agentId];
                            console.log("consoleee", agentRoleId, allAgents, allAgentsFromToIds)
                            for (let rd = agentRoleId; rd >= 0; rd--) {
                                if (rd == 0) {
                                    console.log("in first")
                                    let master = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });

                                    allAgentsRole.push('admin');

                                    await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, totalOfRoundBets, adminRack, totalRackDeduction, allAgentsRole[allAgentsRole.length - 2], allAgentsRole[allAgentsRole.length - 1], allAgentsFromToIds[allAgentsFromToIds.length - 2], allAgentsFromToIds[allAgentsFromToIds.length - 1], room.game.gameNumber);
                                } else {
                                    console.log("in second")
                                    let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: allAgents[allAgents.length - 1] });
                                    allAgents.push(agent.parentId);

                                    allAgentsRole.push(agent.role + ' ( ' + agent.email + ')');

                                    let tempRackDeduction = eval(parseFloat((totalRackDeduction * (100 - agent.commission)) / 100).toFixed(4));
                                    console.log("tempRackDeduction", tempRackDeduction)
                                    totalRackDeduction = totalRackDeduction - tempRackDeduction;

                                    adminRack = agent.commission;

                                    await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, totalOfRoundBets, (100 - agent.commission), tempRackDeduction, allAgentsRole[allAgentsRole.length - 2], allAgentsRole[allAgentsRole.length - 1], allAgentsFromToIds[allAgentsFromToIds.length - 2], allAgentsFromToIds[allAgentsFromToIds.length - 1], room.game.gameNumber);
                                    allAgentsFromToIds.push(agent.parentId);
                                }
                            }
                        } else {
                            console.log("Agent not available");
                            let playerAgent = await Sys.App.Services.UserServices.getSingleUserData({});
                            console.log("admin rack agent", playerAgent)
                            let playerEmail = 'player ( ' + player.email + ')'
                            await module.exports.rackDeductionUpdate(room.players[rp].id, room.game.id, totalOfRoundBets, adminRack, totalRackDeduction, playerEmail, 'admin', room.players[rp].id, playerAgent._id, room.game.gameNumber);

                        }

                    } else {

                    }
                    allAgentsRole = ['player'];
                }
            }

            return await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room)


            //res.send(player);
        } catch (e) {
            console.log("Error in Rack Deduction", e);
        }
    },


}