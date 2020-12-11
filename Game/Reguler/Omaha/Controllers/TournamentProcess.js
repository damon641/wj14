var Sys = require('../../../../Boot/Sys');
const mongoose = require('mongoose');

var running = false;
module.exports = {

	startTournament: async function (data) {
		try {
			let tournament = await Sys.Game.Reguler.Omaha.Services.TournamentServices.getById(data.tournamentId);
      let blinds = await Sys.Game.Common.Services.blindLevelsServices.getBlindLevelsData(tournament.blindLevels);
      if (!tournament) {
				return {	status: 'fail',	result: null,message: "Tournament not found",	statusCode: 401	};
            }

            Sys.BlindTime[tournament.id] = 0;
            // Save Tournament into RAM.
            Sys.Tournaments[tournament.id] = {
                blind_levels_rise_time : tournament.blind_levels_rise_time,
                breaks_time            : tournament.breaks_time,
                smallBlind             : parseFloat(blinds[0].blindLevels[0].minBlind),
                bigBlind               : parseFloat(blinds[0].blindLevels[0].maxBlind)
            }

            // get tournament Player
            let playerDetails = [];
            for(let i=0;i< tournament.players.length;i++){
                let player = await Sys.Game.Reguler.Omaha.Services.PlayerServices.getById(tournament.players[i]);
                //let socket = await Sys.Game.Common.Services.SocketServices.getByPlayerID({ playerId :  player._id});
                // Join Player Socekt To Tournament 
                if(Sys.Io.sockets.connected[player.socketId]){
                    //console.log("Player Socket Found.....")
                    Sys.Io.sockets.connected[player.socketId].join(tournament.id);
                }
                

                playerDetails.push({
                  id  :  player.id,
                  socketId  :  player.socketId, 
                  username  :  player.username, 
                  avatar    :  player.profilePic, 
                  appid :  player.appid, 
                  autoBuyin :  false
                })
            }
            let tableMaxPlayer = 9;
            let roomCount = Math.ceil(parseFloat(playerDetails.length)/tableMaxPlayer);
            // Create Empty Rooms
            let roomCounter = await Sys.Game.Reguler.Omaha.Services.RoomServices.getLastTable();
            let roomObj = {
                isTournamentTable : true,
                tournamentType  : 'regular',
                tournament      : tournament.id,
                name            : tournament.name,
                gameType        : tournament.gameType,
                smallBlind      : parseFloat(blinds[0].blindLevels[0].minBlind),
                bigBlind        : parseFloat(blinds[0].blindLevels[0].maxBlind),
                smallBlindIndex : 0,
                bigBlindIndex   : 0,
                minPlayers      : 2,
                maxPlayers      : tableMaxPlayer,
                rackPercent     : 0,
                minBuyIn        : 0,
                maxBuyIn        : 0,
                tableNumber     : 'T1',
                status          : "Waiting",
                owner           : 'admin',
                dealer          : 0,
                turnBet         : [],
                players         : [],
                gameWinners     : [],
                gameLosers      : [],
                game            : null,
                currentPlayer   : 0,
                limit           : tournament.limit,
                tableType       : 'omaha',
                timerStart      : false,
                otherData       : {},
                currentBlindIndex: 0
            }
            console.log("ROOOOOMMMMMMM OOOOOBBBBJJJJ",roomObj)
            // Push Player in Room;
            let nextRoom = true;
            let roomIds = [];
            for(let i=0;i<roomCount;i++){
              let tableNumber = 1
              if (roomCounter.length != 0) {
                let [lastTableName, lastTableNumber] = roomCounter[0].tableNumber.split('T');
                tableNumber = parseInt(Number(lastTableNumber) + 1);
              }
                roomObj.tableNumber = "T"+tableNumber;
                  let room = await Sys.Game.Reguler.Omaha.Services.RoomServices.create(roomObj);
                    if (!room) {	return {	status: 'fail',	result: room,	message: 'issue with room',statusCode: 400	};
                    }
                    roomIds.push(room.id);

                for(let j=0;j<tableMaxPlayer;j++){
                    // Check is Remian Player is 4
                    if(playerDetails.length <= 4 && nextRoom == true &&  i != (roomCount-1)){
                        nextRoom = false;
                        break;
                    }else{
                        if(playerDetails.length != 0){

                            // Add Last Player To Room.
                            await room.AddPlayer(playerDetails[playerDetails.length-1].id, playerDetails[playerDetails.length-1].socketId,playerDetails[playerDetails.length-1].username, playerDetails[playerDetails.length-1].avatar, playerDetails[playerDetails.length-1].appid, tournament.stacks_chips, j, playerDetails[playerDetails.length-1].autoBuyin, playerDetails[playerDetails.length-1].isIdeal);  

                            // Remove Last Player
                            playerDetails.splice(playerDetails.length-1,1);
                        }
                    }
                }
               
                room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
                
            }

            // Update Tournament 
             await Sys.Game.Reguler.Omaha.Services.TournamentServices.updateTourData({_id: tournament.id},{status:'Running',rooms:roomIds, tournamentWinners : [],tournamentLosers : []});

            console.log("Let's Start Tournnament......",tournament.id);

            let timer = 10;
            Sys.Timers[tournament.id] = setInterval(async function(){
                timer--;
                console.log("Wait For Start Tournament : ",timer)
                // Player Click on Accept / Reject Button. when Click on Accept button then send us playerId with TournamentId & we Join Player to his room.
                // JoinTournamet Event with tournamtId+playerId
                Sys.Io.to(tournament.id).emit('OnTournamentStart', {

                    tournamentId: tournament.id,
                    type : 'regular',
                    namespaceString: Sys.Config.Namespace.CashRegularOmaha,
                    pokerGameType: tournament.game_type,
                    pokerGameFormat: 'tournament',
                    message : 'Your Tournament is Starting In ',
                    timer : timer,
                    maxTimer :  10
                });
                if(timer < 1){
                    clearTimeout(Sys.Timers[tournament.id]);
                    for(let i=0;i<roomIds.length;i++){
                        console.log("fpr loop started")
                        setTimeout( async () => {
                            let room = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(roomIds[i]);
                            Sys.Log.info('Tournament Room Started.....' + i);
                            room.breakTime = new Date().getTime();
                            room.StartGame();
                        }, 1000*i);
                        
                    }
                    // Blind Level Raised Broadcast..
                    await module.exports.startBlindTimer(tournament,roomIds);

                }
            }, 1000);
		return tournament;

		} catch (e) {
			console.log("Error: ", e);
		}
    },

    joinTournament: async function (data) {
		try {
 
			let tournament = await Sys.Game.Reguler.Omaha.Services.TournamentServices.getById(data.tournamentId);
			if (!tournament) {
				return {	status: 'fail',	result: null,message: "Tournament not found",	statusCode: 401	};
            }
            let playerRoom = null;
            for(let i=0;i<tournament.rooms.length;i++){

                let room = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(tournament.rooms[i]);
              
                if (!room) {	
                    return {	status: 'fail',	result: room,	message: 'issue with room',statusCode: 400	};
                }
                for(let j=0;j<room.players.length;j++){
                    if(room.players[j].id == data.playerId){
                        playerRoom = room;
                        break;   
                    }
                }
               
              if(playerRoom){
                break;
              }
              
          }
		return playerRoom;

		} catch (e) {
			console.log("Error: ", e);
		}
    },

    finishTournament: async function (roomId,tournamentId) {
		try {
            clearTimeout(Sys.Timers[tournamentId]);
            console.log("<<======= Tournament Finished =======>>");
            let tournament = await Sys.Game.Reguler.Omaha.Services.TournamentServices.getById(tournamentId);
            let registeredPlayersArray =tournament.tournamentLosers.length ? tournament.tournamentLosers : tournament.players;
			if (!tournament) {
				return {	status: 'fail',	result: null,message: "Tournament not found",	statusCode: 401	};
			}
            
            let payOutRecords = await Sys.Game.Reguler.Omaha.Services.pricePoolServices.getPricePoolDataSelect( {minPlayers: { $lte:  tournament.players.length}} );
                console.log("payOutRecords omaha",  payOutRecords);
                if(payOutRecords[0]){
                    let prisePoolArray = [];
                    for (let [key, value] of Object.entries(payOutRecords[0].toObject())) {
                      if(value === 0 || value == null){  break; }
                      if(key.includes('place_')){
                        prisePoolArray.push({
                          key : key,
                          value : value
                        })
                      }
                    }
               
                    let playout = [];
                    for(let i=0; i < prisePoolArray.length ; i++){
                      var expArry = prisePoolArray[i].key.split("place_");
                      if(expArry[1].includes('_')){
                        let subArry = expArry[1].split("_");
                        for(let j=subArry[0];j<=subArry[1];j++){
                          playout.push(prisePoolArray[i].value);
                        }
                      }else{
                        playout.push(prisePoolArray[i].value);
                      }
                    } 
                    //console.log("payout", playout)

                    if(tournament.isFreeRoll == true){
                        let first = true;
                        for(let i=0;i<playout.length;i++){
                          let player = await Sys.Game.Reguler.Omaha.Services.PlayerServices.getById(tournament.tournamentLosers[ tournament.tournamentLosers.length-1]);    


                            let pay = parseFloat(playout[i]).toFixed(4);
                            console.log("pay to payout **", i, pay);
                                  

                            if(first){
                                first = false;
                                await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(roomId).emit('RegularTournamentFinished',{
                                    playerId        :  player.id,
                                    username  :  player.username, 
                                    avatar    :  player.profilePicId, 
                                    winningChips : pay,
                                    roomId : roomId,
                                    tournamentId: tournamentId
                                });
                                console.log("First Winner :",player.username);
                            }
                            tournament.tournamentWinners.push({
                              id        :  player._id,
                              username  :  player.username, 
                              avatar    :  player.profilePicId, 
                              winningChips : pay
                            });
                            // deduct freeroll amount from admin account
                            if(tournament.isCashGame == true){
                              let superAdmin = await Sys.App.Services.UserServices.getSingleUserData({ isSuperAdmin: true });
                              console.log("superAdmin", superAdmin);
                              console.log("superadmin deduct pay", pay);
                              await Sys.App.Services.UserServices.updateUserData({ _id: superAdmin.id },{ 
                                extraRakeChips: eval( parseFloat( parseFloat(superAdmin.extraRakeChips) - parseFloat(pay) ).toFixed(4) ) ,
                              });
                              let traNumber = + new Date()
                              let updateReport = await Sys.Game.Reguler.Texas.Services.ChipsServices.createAgentTransaction({
                                user_id: superAdmin.id,
                                username: "admin",
                                receiverId: player.uniqId,
                                receiverName: player.username,
                                chips: parseFloat(pay),
                                category:  "debit",
                                type:  "deduct",
                                gameNumber: tournament._id,
                                remark: "free roll tournament winning amount to " + player.username,
                                gameId: tournament._id,
                                transactionNumber:  'DE-'+ traNumber ,
                                beforeBalance: superAdmin.extraRakeChips,
                                afterBalance: parseFloat(superAdmin.extraRakeChips - pay) ,
                                isTournament: "true",
                                adminChips:true,
                              });
                              // need to add transaction report for admin chips deduction
                            }
                              let traNumber = + new Date()
                              let sessionData={
                                sessionId:  tournament.playersSestionIds[tournament.players.indexOf(player._id)],
                                uniqId:player.uniqId,
                                username:player.username,
                                  chips:  pay,
                                beforeBalance: player.chips,
                                previousBalance: player.chips,
                                afterBalance:  parseFloat(player.chips + parseFloat(pay)),
                                type:"leave",
                                category:"credit",
                                user_id:player._id,
                                remark: 'game left',
                                // isTournament: "true",
                                isTournament: "true",
                                transactionNumber: 'DEP-' + traNumber,
                                gameId:  tournament._id,
                              }		
                              await Sys.Game.Common.Services.ChipsServices.insertData(sessionData)
                            registeredPlayersArray.splice( registeredPlayersArray.indexOf(player.id), 1 );
                            await Sys.Game.Reguler.Omaha.Services.PlayerServices.update(player.id,{ 
                              chips: eval( parseFloat( parseFloat(player.chips) + parseFloat(pay) ).toFixed(4) ) ,
                            });
                            console.log("updated payOut", i)  
                        }
                    }else{
                        for(let i=0;i<tournament.tournamentLosers.length;i++){
                          let player = await Sys.Game.Reguler.Omaha.Services.PlayerServices.getById(tournament.tournamentLosers[i]);    
                            if( player  ){
                                if(tournament.isCashGame == true){
                                  await module.exports.agentsUpdate(tournament.entry_fee, player, "register", tournamentId);
                                }    
                                tournament.tournamentTotalChips = parseFloat(parseFloat(tournament.tournamentTotalChips)-parseFloat(tournament.entry_fee));
                            } else {
                                console.log("player data not found");
                                return  
                            }
                        }

                        let totalPayout = eval( parseFloat(tournament.buy_in * tournament.players.length).toFixed(4) );
                        let first = true;
                        for(let i=0;i<playout.length;i++){
                          let player = await Sys.Game.Reguler.Omaha.Services.PlayerServices.getById(tournament.tournamentLosers[ tournament.tournamentLosers.length-1]);    


                            let pay = eval( parseFloat(totalPayout*playout[i]/100).toFixed(4) );
                            console.log("pay to payout **", i, pay);
                                  

                            if(first){
                                first = false;
                                await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(roomId).emit('RegularTournamentFinished',{
                                    playerId        :  player.id,
                                    username  :  player.username, 
                                    avatar    :  player.profilePicId, 
                                    winningChips : pay,
                                    roomId : roomId,
                                    tournamentId: tournamentId
                                });
                                console.log("First Winner :",player.username);
                            }
                            tournament.tournamentWinners.push({
                              id        :  player._id,
                              username  :  player.username, 
                              avatar    :  player.profilePicId, 
                              winningChips : pay
                            });
                            tournament.tournamentTotalChips = tournament.tournamentTotalChips-pay;
                   
                            let traNumber = + new Date()
                            let sessionData={
                              sessionId:  tournament.playersSestionIds[tournament.players.indexOf(player._id)],
                              uniqId:player.uniqId,
                              username:player.username,
                                chips:  pay,
                              beforeBalance: player.chips,
                              previousBalance: player.chips,
                              afterBalance:  parseFloat(player.chips + parseFloat(pay)),
                              type:"leave",
                              category:"credit",
                              user_id:player._id,
                              remark: 'game left',
                              isTournament: "true",
                              transactionNumber: 'DEP-' + traNumber,
                              gameId:  tournament._id,
                            }					
                            // await Sys.Game.CashGame.Omaha.Services.ChipsServices.createTransaction(sessionData)
                            await Sys.Game.Common.Services.ChipsServices.insertData(sessionData)
                            let transactionData = {
                                user_id:player.id,
                                username: player.username,
                                tableId: tournament.id,
                                tableName: tournament.name,
                                chips: parseFloat(pay),
                                previousBalance: parseFloat(player.chips),
                                afterBalance:  parseFloat(player.chips + parseFloat(pay)),
                                category: 'credit',
                                type: 'winner',
                                remark: 'payout for game',
                                isTournament: 'Yes',
                                isGamePot: 'no'
                            }
                            console.log("regular tournament payout for game: ", transactionData);
                            await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);

                            registeredPlayersArray.splice( registeredPlayersArray.indexOf(player.id), 1 );
                            await Sys.Game.Reguler.Omaha.Services.PlayerServices.update(player.id,{ 
                              chips: eval( parseFloat( parseFloat(player.chips) + parseFloat(pay) ).toFixed(4) ) 
                              });
                            console.log("updated payOut", i)

                        }
                    }

        
                    //Clear Room & other data.
                    for(let i=0;i<tournament.rooms.length;i++){
                        //console.log("Clear Room :",tournament.rooms[i])
                        let room = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(tournament.rooms[i]);
                        room.status = 'Closed';
                        room.game = null;
                        room.currentBlindIndex = 0; 
                        room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
                    }
                    clearTimeout(Sys.Timers[tournamentId]);
                    console.log("/****************************************************************/")
                    console.log("Congratulation Your Tournamet Finished.... Thanks.")
                    console.log("Tournament Winners :")
                    console.log(tournament.tournamentWinners);
                    console.log("/****************************************************************/")
                    await Sys.Game.Reguler.Omaha.Services.playerGameHistoryServices.updatePlayerStatus(tournament.tournamentWinners[0].playerId,'Finished');
                    await Sys.Game.Reguler.Omaha.Services.TournamentServices.updateTourData({_id: tournamentId},{status:'Finished',tournamentWinners : tournament.tournamentWinners,tournamentLosers:registeredPlayersArray,tournamentTotalChips:parseFloat(tournament.tournamentTotalChips).toFixed(4)});
                }else{
                    console.log('No Playout Found!')
                } 
 
        return tournament;

		} catch (e) {
			console.log("Error: ", e);
		}
    },


    stopBlindTimer : async function(tournament){
      running = false;
      clearInterval(Sys.Timers[tournament.id]);
    },
    startBlindTimer : async function(tournament,newRoomIds){
      running = true;
      let newBlinds = await Sys.Game.Common.Services.blindLevelsServices.getBlindLevelsData(tournament.blindLevels);
      Sys.Timers[tournament.id] = setInterval(async function(){
       Sys.BlindTime[tournament.id]++;
      for(let i = 0; i < newRoomIds.length;i++){
        let room = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(newRoomIds[i]);
       
        Sys.Tournaments[tournament.id].smallBlind = (room.currentBlindIndex  < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].minBlind) : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].minBlind);
        Sys.Tournaments[tournament.id].bigBlind =  (room.currentBlindIndex < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].maxBlind)  : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].maxBlind);
        await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(newRoomIds[i]).emit('OnBlindLevels', {
          roomId: newRoomIds[i],
          current : {
                  smallBlind : (room.currentBlindIndex  < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].minBlind) : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].minBlind),
                  bigBlind :  (room.currentBlindIndex < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].maxBlind)  : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].maxBlind)
          },
          next : {
            smallBlind : (room.currentBlindIndex  < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].minBlind) : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].minBlind),
            bigBlind :  (room.currentBlindIndex  < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].maxBlind)  : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].maxBlind)
          },
          remain : parseFloat(parseFloat(Sys.Tournaments[tournament.id].blind_levels_rise_time * 60) - parseFloat(Sys.BlindTime[tournament.id]))
      });
      }

      var divisor_for_minutes = Sys.BlindTime[tournament.id] % (60 * 60);
      var minutes = Math.floor(divisor_for_minutes / 60);

      if(minutes >= parseFloat(Sys.Tournaments[tournament.id].blind_levels_rise_time)){
        console.log("--------------------------------------------")
        console.log("Blind Levels Raised :")
        console.log("--------------------------------------------")
        Sys.BlindTime[tournament.id] = 0;
        let room;
        for(let i=0;i<newRoomIds.length;i++){
          room = await Sys.Game.Reguler.Omaha.Services.RoomServices.get(newRoomIds[i]);
          room.currentBlindIndex++;
          
            console.log("--------------------------------------------")
            console.log("Room ID :",newRoomIds[i])
            console.log("Small Blind :",Sys.Tournaments[tournament.id].smallBlind)
            console.log("Big Blind :",Sys.Tournaments[tournament.id].bigBlind)
            console.log("--------------------------------------------")

         
            await Sys.Io.of(Sys.Config.Namespace.CashRegularOmaha).to(newRoomIds[i]).emit('OnBlindLevelsRaised', {
                tournamentId: tournament.id,
                type : 'reguler',
                message : 'Table Blind Level Raised. ',
                roomId : newRoomIds[i],
                smallBlind : (room.currentBlindIndex  < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].minBlind) : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].minBlind),
                bigBlind :  (room.currentBlindIndex  < newBlinds[0].blindLevels.length ) ? parseFloat(newBlinds[0].blindLevels[room.currentBlindIndex].maxBlind)  : parseFloat(newBlinds[0].blindLevels[newBlinds[0].blindLevels.length - 1].maxBlind),
                roomId:newRoomIds[i] 
            });  
            
        }
        room = await Sys.Game.Reguler.Omaha.Services.RoomServices.update(room);
    }

      },1000);
    },
agentsUpdate: async function (entry_fee, player, acton, tournamentId) {
      try {
        var entry_feeTotal_amount = entry_fee
        var agentId = player.agentId
        var action = acton;
        var commission = 0
        var commitionValue = 0
        var finalCommision = 0
        let agentLevel= {};
        if(player.agentRole == 'admin'){
          agentLevel.level =1;
        }else{
          agentLevel = await Sys.App.Services.agentServices.getSingleAgentData({ _id: mongoose.Types.ObjectId(agentId) }, {level: 1});
        }

        for (let index = 0; index < agentLevel.level; index++) {
          let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: mongoose.Types.ObjectId(agentId), }, null, null, ['chips', 'id', 'parentId', 'level', 'commission', 'username', 'agentRole','rake_chips'])
          if (agent) {
            if (agent.level == agentLevel.level) {
              finalCommision = agent.commission;
            } else {
              finalCommision = agent.commission - commission;
            }
            commitionValue = entry_feeTotal_amount * finalCommision / 100;
            let traNumber = + new Date()
  
            let updateReport = await Sys.Game.Reguler.Texas.Services.ChipsServices.createAgentTransaction({
              user_id: agentId,
              rackToId: agentId,
              rackFromId: player.uniqId,
              rackFrom  : "player",
              totalRack: eval(parseFloat(commitionValue).toFixed(4)),
              rackPercent: finalCommision,
              username: agent.username ? agent.username : "",
              receiverName: player.username,
              chips: parseFloat(commitionValue),
              providerEmail:agent.email,
              category: acton == "register" ? 'credit' : "debit",
              type: acton == "register" ? 'deposit' : "deduct",
              gameNumber: tournamentId,
              remark: acton == "register" ? 'Tournament Entry Fee For ' + player.uniqId : acton ==  "checkRegularTournamentStatus" ? "Tournament cancel return Entry Fee on "+ player.uniqId: 'Return Entry Fee on tournament leave on ' + player.uniqId,
              gameId: tournamentId,
              transactionNumber: acton == "register" ? 'DEP-'+ traNumber: 'DE-'+ traNumber ,
              beforeBalance: agent.rake_chips,
              afterBalance: acton == "register" ? parseFloat(agent.rake_chips + parseFloat(commitionValue)) : parseFloat(agent.rake_chips - parseFloat(commitionValue)),
              isTournament: "true",
              status:"success",
              rakeChips:true,
            });
  
            await Sys.App.Services.agentServices.updateAgentData({ _id: mongoose.Types.ObjectId(agentId) }, {
              rake_chips: action == "register" ? agent.rake_chips + parseFloat(commitionValue) : agent.rake_chips - parseFloat(commitionValue)
            });
            if (agent.level == 2) {
              agentId = agent.parentId
              commission = agent.commission
              finalCommision = 100 - commission
              commitionValue = entry_feeTotal_amount * finalCommision / 100
              let admin = await Sys.App.Services.UserServices.getSingleUserData({ _id: mongoose.Types.ObjectId(agent.parentId) })
              let traNumber = + new Date()
              let updateReport = await Sys.Game.Reguler.Texas.Services.ChipsServices.createAgentTransaction({
                user_id: agentId,
                username: "admin",
                rackToId: agentId,
                rackFrom  : "player",
                rackFromId: player.uniqId,
                rackPercent: finalCommision,
                totalRack: eval(parseFloat(commitionValue).toFixed(4)),
                providerEmail:admin.email,
                receiverId: player.uniqId,
                receiverName: player.username,
                chips: parseFloat(commitionValue),
                category: action == "register" ? 'credit' : "debit",
                type: action == "register" ? 'deposit' : "deduct",
                gameNumber: tournamentId,
                remark: action == "register" ? 'Tournament Entry Fee For ' + player.uniqId : 'Return Entry Fee on tournament leave on ' + player.uniqId,
                gameId: tournamentId,
                transactionNumber: acton == "register" ? 'DEP-'+ traNumber: 'DE-'+ traNumber ,
                beforeBalance: admin.rake_chips,
                afterBalance: action == "register" ? parseFloat(admin.rake_chips + parseFloat(commitionValue)) : parseFloat(admin.rake_chips - parseFloat(commitionValue)),
                isTournament: "true",
                rakeChips:true,
              });
  
              await Sys.App.Services.UserServices.updateUserData({ _id: mongoose.Types.ObjectId(agentId) },
                { rake_chips: action == "register" ? admin.rake_chips + parseFloat(commitionValue) : admin.rake_chips - parseFloat(commitionValue) })
              break;
            }
            agentId = agent.parentId
            commission = agent.commission
          } else {
            let admin = await Sys.App.Services.UserServices.getSingleUserData({ _id: mongoose.Types.ObjectId(agentId) })
            let traNumber = + new Date()
            let updateReport = await Sys.Game.Reguler.Texas.Services.ChipsServices.createAgentTransaction({
              user_id: agentId,
              username: "admin",
              rackToId: agentId,
              rackFrom  : "player",
              rackFromId: player.uniqId,
              rackTo:"admin",
              rackPercent: 100,
              totalRack: eval(parseFloat(entry_feeTotal_amount).toFixed(4)),
              receiverId: player.uniqId,
              receiverName: player.username,
              chips: parseFloat(entry_feeTotal_amount),
              category: action == "register" ? 'credit' : "debit",
              type: action == "register" ? 'deposit' : "deduct",
              gameNumber: tournamentId,
              remark: action == "register" ? 'Tournament Entry Fee For ' + player.uniqId : 'Return Entry Fee on tournament leave on ' + player.uniqId,
              gameId: tournamentId,
              transactionNumber: acton == "register" ? 'DEP-'+ traNumber: 'DE-'+ traNumber ,
              beforeBalance: admin.rake_chips,
              afterBalance: action == "register" ? parseFloat(admin.rake_chips + parseFloat(entry_feeTotal_amount)) : parseFloat(admin.rake_chips - parseFloat(entry_feeTotal_amount)),
              isTournament: "true",
              rakeChips:true,
            });
            await Sys.App.Services.UserServices.updateUserData({ _id: mongoose.Types.ObjectId(agentId) },
              { rake_chips: action == "register" ? admin.rake_chips + parseFloat(entry_feeTotal_amount) : admin.rake_chips - parseFloat(entry_feeTotal_amount) })
            break;
          }
        }
      } catch (e) {
        console.log("Error in RackDeduction Update", e);
      }
  
    }
}

 
