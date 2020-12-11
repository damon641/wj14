var Sys = require('../../../../Boot/Sys');
let moment = require('moment');

module.exports = {

    test: async function(socket,data){
        try {
            return {
                status: 'success',
                message: "Player Room Joind successfuly.",
                result: {
                    roomId: 'done'
                }
            };
        } catch (e) {
            console.log("Erro",e);
        }

    },

    tip: async function(socket,data){
       /* try {

          let player = await Sys.Game.CashGame.Texas.Services.PlayerServices.getByData({ _id :socket.playerId })
          if (player) {
             var chips = player.chips - parseFloat(data.chips);
             let update = await Sys.Game.CashGame.Texas.Services.PlayerServices.update(socket.playerId, {chips: chips} );
             // added by K@Y
  						let transactionData = {
  							user_id						:	player.id,
  							username					: player.username,
  							// gameId						:
  							chips							:	parseFloat(data.chips),
  							previousBalance		:	parseFloat(player.chips),
  							afterBalance      : chips,
  							category					:	'debit',
  							type							:	'tip',
  							remark						: 'Player Has given tip'
  						}
						  //await Sys.Game.CashGame.Texas.Services.ChipsServices.createTransaction(transactionData);
              data.playerId = socket.playerId;
             // load('Server/WsFacade').io.in(request.body.roomId).emit('PokerTip', request.body);
            // channel.socket.io.to(data.roomId).emit('Tip', data)
            await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(data.roomId).emit('Tip', data)
             return {
               status: 'success',
               result:  null,
               message: 'Tip recieved.'
             }
         }else {
           return {
             status: 'fail',
             result:  null,
             message: 'Player Not Found.'
           }
         }
        } catch (e) {
            console.log("Error: ",e);
        }*/

    },

    requestChips: async function(socket, player) {
      try {
        // var hostname = load('Iniv/Config').get('app.host');
        // let data = {
        //     to :'pokerscript.net@gmail.com', // list of receivers
        //     subject : 'Chips Request -'+channel.socket.myData.firstname +' '+ channel.socket.myData.lastname, // Subject line
        //     text : 'Hello Admin', // plain text body
        //     html : '<b> Requesting You to Add '+player.chips+' Chips to My Account.' // html body
        // };
        // load('Iniv/Mail').send(data);
        return {
          status  : 'success',
          result  : null,
          message : 'We have sent Buy Chips Request Email'
        }
      } catch (e) {
        console.log('Error: ',e);
      }

    },

    chat: async function(socket, data){
      try {
        await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(data.roomId).emit('Chat', data)
          return {
            status  : 'success',
            result  : null,
            message : 'Message broadcast successfuly'
          };
      } catch (e) {
        console.log("Error: ", e);
      }
    },

    gift: async function(socket, data){
      try {
        await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(data.roomId).emit('PlayerGift', data)
        return {
          status: 'success',
          result  : null,
          message: 'Gift broadcast successfuly'
        };
      } catch (e) {
        console.log("Error: ", e);
      }

    },

    inviteFriend: async function(socket, data){
      try {
        let player = await Sys.Game.CashGame.Texas.Services.PlayerServices.getById(data.friendId);
        if (!player) {
            return {
                status: 'fail',
                result: null,
                message: 'No Such Player Found.',
                statusCode: 401
            }
        }
        var gamePlayer = {
            game : 1,
            player: player.id,
            status: 'not playing',
            room: data.roomId,
            createdAt: new Date(),
            updatedAt: new Date(),
            id: 0
        };
        let sender = await Sys.Game.CashGame.Texas.Services.PlayerServices.getById(data.playerId);
        if (!sender) {
            return {
                status: 'fail',
                result: null,
                message: 'No Such Player Found.',
                statusCode: 401
            }
        }
        gamePlayer.sender = sender;
        let room = await Sys.Game.CashGame.Texas.Services.RoomServices.get(gamePlayer.room);
        if (!room) {
            return {
                status: 'fail',
                result: null,
                message: 'No Such Room Found.',
                statusCode: 401
            }
        }
        gamePlayer.blindAmount = room.smallBlind
        gamePlayer.minBuyinAmount = room.minBuyIn
        gamePlayer.maxBuyinAmount = room.maxBuyIn

        await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(data.roomId).emit('InviteFriend', gamePlayer)
        return {
            status : 'success',
            result : 'ok',
            message : 'Invite reques sent successfully.'
        }
      } catch (e) {
        console.log("Error: ", e);
      }

    },

    playerAction: async function(socket, data){
      try {
        var action = await Sys.Game.CashGame.Texas.Controllers.RoomProcess.playerAction(data);
        return {
          status: 'success',
          result  : null,
          data: action,
          message: 'Player action successful.'
        };
      } catch (e) {
        console.log("Error: ", e);
      }

    },

    playerDetails: async function(socket, data){
      try {
        let player = await Sys.Game.CashGame.Texas.Services.PlayerServices.getById(data.id);
        if (player) {
          return {
              status: 'success',
              result: data,
              message: 'New Player Created'
          }
        }else {
          return {
            status: 'fail',
            result: null,
            message: 'No Such Player Found.',
            statusCode: 401
          }
        }
      } catch (e) {
          console.log("Error: ", e);
      }
    },

/*     removePlayerFromRooms:async function() {
      console.log("remove player calles")
      try{
        let rooms = Sys.Rooms;

        let allRooms = await Sys.Game.CashGame.Texas.Services.RoomServices.getAllRoom({});

        if(allRooms.length > 0){
          for(let r = 0; r< allRooms.length; r++){
            let tId = allRooms[r]._id;
            var room = rooms[tId];
            if(room){
             // console.log("working player rooms ---->", room.players);
              var players = room.players;
              console.log("player", players.length)
              if(players.length > 0){
                for(let p =0; p < players.length; p++){
                  var playerTimeout = room.players[p].idealTime;

                  if(playerTimeout != null){

                    let idealAt = moment(playerTimeout);
                    //console.log("ideal at", idealAt)
                    let removeAt =  moment(playerTimeout).add('8','minutes')
                    //let removeAt =  moment(playerTimeout).add('5','minutes')
                    //console.log("remove at", removeAt);
                    if( removeAt < moment() ){
                      console.log("date comes");
                       room.players[p].status = "Left";
                       room.players[p].sitOutNextHand = false;
                       room.players[p].sitOutNextBigBlind = false;
                       room.players[p].defaultActionCount = 0;
                       room.players[p].oldPlayerLeftTime = new Date();
                       room.players[p].idealTime = null;

                       if(room.tableType == "omaha"){
                        await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('PlayerLeft', { 'playerId': room.players[p].id,roomId: room.id });
                       }else{
                        await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('PlayerLeft', { 'playerId': room.players[p].id,roomId: room.id });
                       }

                      //await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('PlayerLeft', { 'playerId': room.players[p].id,roomId: room.id });
                      console.log("ideal player status", room.players[p].isAllinPlayersChipsAssigned)
                      let dataPlayer = await Sys.Game.CashGame.Texas.Services.PlayerServices.getById(room.players[p].id);
                      if (dataPlayer && room.players[p].isAllinPlayersChipsAssigned == false) {
                          console.log("Chips",dataPlayer.chips,room.players[p].chips);
                        let chips = parseFloat(dataPlayer.chips) + parseFloat(room.players[p].chips) + parseFloat(room.players[p].extraChips);
                        var playerUpdate = await Sys.Game.CashGame.Texas.Services.PlayerServices.update(room.players[p].id, { chips: chips });
                        // added by K@Y
                        let transactionData = {
                          user_id           : room.players[p].id,
                          username          : room.players[p].playerName,
                          // gameId           :
                          chips             : parseFloat(room.players[p].chips),
                          previousBalance   : parseFloat(dataPlayer.chips),
                          afterBalance      : chips,
                          category          : 'credit',
                          type              : 'remove',
                          remark            : 'Remove player from rooms if player is ideal for more than 5 minutes'
                        }
                        //await Sys.Game.CashGame.Texas.Services.ChipsServices.createTransaction(transactionData);
                        room.players[p].isAllinPlayersChipsAssigned = true;
                        room.players[p].extraChips = 0;

                        var transGameId = ""
                        var transGameNum = ""
                        if(room.game != null){
                          var transGameId = room.game.id;
                          var transGameNum = room.game.gameNumber;
                        }

                        let transactionLeftData = {
                          user_id: room.players[p].id,
                          username: room.players[p].playerName,
                          gameId: transGameId,
                          gameNumber: transGameNum,
                          tableId: room.id,
                          tableName: room.name,
                          chips: parseFloat(room.players[p].chips),
                          previousBalance: parseFloat(dataPlayer.chips),
                          afterBalance: parseFloat(chips),
                          category: 'debit',
                          type: 'entry',
                          remark: 'Left',
                          isTournament: 'No',
                          isGamePot: 'no'
                        }
                        let traNumber = + new Date()
                        let sessionData={
                          sessionId:room.players[p].sessionId,
                          uniqId:room.players[p].uniqId,
                          user_id:room.players[p].id,
                          username:room.players[p].playerName,
                          chips: room.players[p].chips,
                          previousBalance: parseFloat(dataPlayer.chips),
                          afterBalance: parseFloat(chips),
                          type:"leftChips",
                          remark:"game left",
                          category:"credit",
                          transactionNumber: 'DEP-' + traNumber,
                        }
                        await Sys.Game.CashGame.Texas.Services.ChipsServices.insertData(sessionData);	
                        console.log("minutes left player transactionLeftData: ", transactionLeftData);
                        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionLeftData);

                      }
                      let playerUpdated = await Sys.Game.CashGame.Texas.Services.RoomServices.update(room)
                      console.log("player updated in ideal player remove", playerUpdated);

                    }else{
                      console.log("waiting");
                    }
                  }else{
                    console.log("ideal time else", playerTimeout, room.players[p].id, room.players[p].playerName);
                  }

                }
              }else{
                console.log("player not found");
              }

              // remove singlr player
              let totalPlayingPlayers = 0;
              let removePlayerIndex;
              for (i = 0; i < room.players.length; i++) {
                if(room.players[i].status != 'Ideal' && room.players[i].status != 'Left'){
                  removePlayerIndex = i;
                  totalPlayingPlayers++;
                }
              }
            console.log("remove player index", removePlayerIndex, totalPlayingPlayers)
            if(room.status != 'Running' && totalPlayingPlayers == 1){
              let subscribePlayerTIme = room.players[removePlayerIndex].subscribeTime;
              if(subscribePlayerTIme != null){

                let idealAt = moment(room.players[removePlayerIndex].subscribeTime);
                console.log("single player eideal at", idealAt)
                let removeAt =  moment(room.players[removePlayerIndex].subscribeTime).add('30','minutes')
                console.log("single player remove at", removeAt);
                if( removeAt < moment() ){
                  console.log("single player date comes");
                   room.players[removePlayerIndex].status = "Left";
                   room.players[removePlayerIndex].subscribeTime = null;
                   room.players[removePlayerIndex].sitOutNextHand = false;
                   room.players[removePlayerIndex].sitOutNextBigBlind = false;
                   room.players[removePlayerIndex].defaultActionCount = 0;
                   room.players[removePlayerIndex].oldPlayerLeftTime = new Date();
                   room.players[removePlayerIndex].waitForBigBlindCheckbox = false;
                   room.players[removePlayerIndex].waitForBigBlindCheckboxValue = false;
                   if(room.tableType == "omaha"){
                    await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('PlayerLeft', { 'playerId': room.players[removePlayerIndex].id, roomId: room.id });
                   }else{
                    await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('PlayerLeft', { 'playerId': room.players[removePlayerIndex].id, roomId: room.id });
                   }
                  
                  let dataPlayer = await Sys.Game.CashGame.Texas.Services.PlayerServices.getById(room.players[removePlayerIndex].id);
                  console.log("single player status", room.players[removePlayerIndex].isAllinPlayersChipsAssigned)
                    
                    //await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('PlayerLeft', { 'playerId': room.players[removePlayerIndex].id, roomId: room.id });
                     if (dataPlayer && room.players[removePlayerIndex].isAllinPlayersChipsAssigned == false) {
                        console.log("Chips",dataPlayer.chips,room.players[removePlayerIndex].chips, room.players[removePlayerIndex].extraChips);
                        let chips = parseFloat(dataPlayer.chips) + parseFloat(room.players[removePlayerIndex].chips) + parseFloat(room.players[removePlayerIndex].extraChips);
                        var playerUpdate = await Sys.Game.CashGame.Texas.Services.PlayerServices.update(room.players[removePlayerIndex].id, { chips: chips });
                        // added by K@Y
                        let transactionData = {
                          user_id           : room.players[removePlayerIndex].id,
                          username          : room.players[removePlayerIndex].playerName,
                          // gameId           :
                          chips             : parseFloat(room.players[removePlayerIndex].chips) + parseFloat(room.players[removePlayerIndex].extraChips),
                          previousBalance   : parseFloat(dataPlayer.chips),
                          afterBalance      : chips,
                          category          : 'debit',
                          type              : 'remove',
                          remark            : 'Remove player from rooms if player is ideal for more than 5 minutes'
                        }
                        //await Sys.Game.CashGame.Texas.Services.ChipsServices.createTransaction(transactionData);
                        room.players[removePlayerIndex].isAllinPlayersChipsAssigned = true;

                        var transGameId = "";
                        var transGameNum = "";
                        if(room.game != null){
                          var transGameId = room.game.id;
                          var transGameNum = room.game.gameNumber;
                        }

                        let transactionDataLeft = {
                          user_id: room.players[removePlayerIndex].id,
                          username: room.players[removePlayerIndex].playerName,
                          gameId: transGameId,
                          gameNumber: transGameNum,
                          tableId: room.id,
                          tableName: room.name,
                          chips: (parseFloat(room.players[removePlayerIndex].chips) + parseFloat(room.players[removePlayerIndex].extraChips)),
                          previousBalance: parseFloat(dataPlayer.chips),
                          afterBalance: parseFloat(chips),
                          category: 'credit',
                          type: 'entry',
                          remark: 'Left',
                          isTournament: 'No',
                          isGamePot: 'no'
                        }
                        console.log("Player left for game: ", transactionDataLeft);
                        let traNumber = + new Date()
                        let sessionData={
                          sessionId:room.players[removePlayerIndex].sessionId,
                          uniqId:room.players[removePlayerIndex].uniqId,
                          user_id:room.players[removePlayerIndex].id,
                          username:room.players[removePlayerIndex].playerName,
                          chips: room.players[removePlayerIndex].chips,
                          previousBalance: parseFloat(dataPlayer.chips),
                          afterBalance: parseFloat(chips),
                          type:"leftChips",
                          remark:"game left",
                          category:"credit",
                          transactionNumber: 'DEP-' + traNumber,
                        }
                        await Sys.Game.CashGame.Texas.Services.ChipsServices.insertData(sessionData);	

                        room.players[removePlayerIndex].extraChips = 0;
                        console.log("extra chips test", room.players[removePlayerIndex].extraChips);

                        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataLeft);

                      }
                      let playerUpdated = await Sys.Game.CashGame.Texas.Services.RoomServices.update(room)
                      console.log("player updated in sinble player remove ", playerUpdated)

                  }else{
                    console.log("waiting for removing single player");
                  }
                }else{
                  console.log("single player time else", room.players[removePlayerIndex].subscribeTime, room.players[removePlayerIndex].id, room.players[removePlayerIndex].playerName);
                }
              }
            }
          }
        }
      }catch(error){
        console.log("error when ideal and single player remove automatically: ", error);
      }
    }, */

    assignCashToPlayers: async function(room, removedPlayerID, considerflags) {
      try{
        console.log("call assignCashToPlayers", removedPlayerID, considerflags);

        let dataPlayer = await Sys.Game.CashGame.Texas.Services.PlayerServices.getById(removedPlayerID);
        if (dataPlayer) {
          console.log("room.players.length in assignCashToPlayers", room.players.length - 1);
          for(let t = (room.players.length - 1); t >= 0; t-- ){
            if(removedPlayerID == room.players[t].id && room.players[t].isAllinPlayersChipsAssigned == false){
              console.log("Chips in assignCashToPlayers",dataPlayer.chips,room.players[t].chips, room.players[t].id, t);
              
              let playerExtraChips = parseFloat(room.getPlayerById(removedPlayerID).extraChips);
              let playerChips = parseFloat(room.getPlayerById(removedPlayerID).chips);
              room.getPlayerById(removedPlayerID).isAllinPlayersChipsAssigned = true;
              room.getPlayerById(removedPlayerID).extraChips = 0;
              if(considerflags == true){
                room.getPlayerById(removedPlayerID).sitOutNextHand = false;
                room.getPlayerById(removedPlayerID).sitOutNextBigBlind = false;
                room.getPlayerById(removedPlayerID).defaultActionCount = 0;
                room.getPlayerById(removedPlayerID).oldPlayerLeftTime = new Date();
                room.getPlayerById(removedPlayerID).idealTime = null;
                room.getPlayerById(removedPlayerID).subscribeTime = null;
                room.getPlayerById(removedPlayerID).waitForBigBlindCheckbox = false;
                room.getPlayerById(removedPlayerID).waitForBigBlindCheckboxValue = false;
                room.getPlayerById(removedPlayerID).status = "Left";
              }
              let removePlayerName = room.getPlayerById(removedPlayerID).playerName;
              let removePlayerSessionId = room.getPlayerById(removedPlayerID).sessionId;
              let removePlayerUniqId = room.getPlayerById(removedPlayerID).uniqId;
              let chips = parseFloat(dataPlayer.chips) + parseFloat(playerChips) + parseFloat(playerExtraChips);
              chips = +parseFloat(chips).toFixed(4);
              let playerUpdated = await Sys.Game.CashGame.Texas.Services.PlayerServices.findOneAndUpdate({"_id": removedPlayerID}, { chips: chips }, {new: true});
      
              
              let updatedRoom = await Sys.Game.CashGame.Texas.Services.RoomServices.update(room);

              var transGameId = ""
              var transGameNum = ""
              if(room.game != null){
                var transGameId = room.game.id;
                var transGameNum = room.game.gameNumber;
              }

              let transactionLeftData = {
                user_id: removedPlayerID,
                username: removePlayerName,
                gameId: transGameId,
                gameNumber: transGameNum,
                tableId: room.id,
                tableName: room.name,
                chips: parseFloat(playerChips) + parseFloat(playerExtraChips),
                previousBalance: parseFloat(dataPlayer.chips),
                afterBalance: parseFloat(playerUpdated.chips),
                category: 'debit',
                type: 'entry',
                remark: 'Left',
                isTournament: 'No',
                isGamePot: 'no'
              }
              let traNumber = + new Date()
              let sessionData={
                sessionId:removePlayerSessionId,
                uniqId:removePlayerUniqId,
                user_id:removedPlayerID,
                username:removePlayerName,
                chips: parseFloat(playerChips),
                previousBalance: parseFloat(dataPlayer.chips),
                afterBalance: parseFloat(playerUpdated.chips),
                type:"leftChips",
                remark:"game left",
                category:"credit",
                transactionNumber: 'DEP-' + traNumber,
              }
              await Sys.Game.CashGame.Texas.Services.ChipsServices.insertData(sessionData); 
              console.log("minutes left player transactionLeftData: ", transactionLeftData);
              await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionLeftData);
              
                
              if(removedPlayerID != room.getPlayerById(removedPlayerID).id){
                console.log("We have a problem in chips assign for Automatic playerleft", removedPlayerID,room.players[t].id );
              }
              if( parseFloat(playerUpdated.chips) != parseFloat(chips) ){
                console.log("We have a problem in chips assign for Automatic playerleft, player chips mismatch", removedPlayerID,room.players[t].id, parseFloat(playerUpdated.chips) , parseFloat(chips) );
              }

              break;
            }
          }
        }
        console.log("assignCashToPlayers function call complete");
      }catch(e){
        console.log("error when ideal and single player assignCashToPlayers automatically: ");
      }
    },

    removePlayerFromRooms:async function() {
      console.log("remove player calles")
      try{
        let rooms = Sys.Rooms;

        let allRooms = await Sys.Game.CashGame.Texas.Services.RoomServices.getByData({isTournamentTable : false});
        
        if(allRooms.length > 0){
          for(let r = 0; r< allRooms.length; r++){
            let tId = allRooms[r]._id;
            let room = rooms[tId];
            if(room){
             // console.log("working player rooms ---->", room.players);
              let players = room.players;
              //console.log("player in remove player call", players.length, players);
              if(players.length > 0){
                for(let p =0; p < players.length; p++){
                  let playerTimeout = room.players[p].idealTime;

                  if(playerTimeout != null && room.players[p].status == "Ideal"){

                    let idealAt = moment(playerTimeout);
                    //console.log("ideal at", idealAt)
                    let removeAt =  moment(playerTimeout).add('8','minutes')
                    //let removeAt =  moment(playerTimeout).add('5','minutes')
                    //console.log("remove at", removeAt);
                    let removedPlayerID = room.players[p].id;
                    if( removeAt < moment() ){
                      console.log("date comes",removedPlayerID, room.players[p].id, p);
                      
                      if(room.tableType == "omaha"){
                        await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('PlayerLeft', { 'playerId': removedPlayerID,roomId: room.id });
                      }else{
                        await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('PlayerLeft', { 'playerId': removedPlayerID,roomId: room.id });
                      }

                      console.log("ideal player status", room.players[p].isAllinPlayersChipsAssigned, room.players[p].id,removedPlayerID, p);
                      await module.exports.assignCashToPlayers(room, removedPlayerID, true);
                      console.log("After calling assignCashToPlayers");
                      
                      
                      let playerUpdated = await Sys.Game.CashGame.Texas.Services.RoomServices.update(room)
                      //console.log("player updated in ideal player remove", playerUpdated);

                    }else{
                      console.log("waiting");
                    }
                  }else{
                    console.log("ideal time else", playerTimeout, room.players[p].id, room.players[p].playerName);
                  }

                }
              }else{
                console.log("player not found");
              }

              // remove singlr player
              let totalPlayingPlayers = 0;
              let removePlayerIndex;
              for (i = 0; i < room.players.length; i++) {
                if(room.players[i].status != 'Ideal' && room.players[i].status != 'Left'){
                  removePlayerIndex = room.players[i].id;
                  totalPlayingPlayers++;
                }
              }
              console.log("remove player index", removePlayerIndex, totalPlayingPlayers)
              if(room.status != 'Running' && totalPlayingPlayers == 1){
                for(let p =0; p < room.players.length; p++){
                  if(room.players[p].id == removePlayerIndex && room.status != 'Running' ){
                    let subscribePlayerTIme = room.players[p].subscribeTime;
                    if(subscribePlayerTIme != null && room.status != 'Running'){

                      let idealAt = moment(room.players[p].subscribeTime);
                      console.log("single player eideal at", idealAt)
                      let removeAt =  moment(room.players[p].subscribeTime).add('30','minutes')
                      console.log("single player remove at", removeAt);
                      if( removeAt < moment() && room.status != 'Running' ){
                        console.log("single player date comes", room.players[p].id);
                        let removedPlayerID = room.players[p].id;
                        if(room.tableType == "omaha"){
                          await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('PlayerLeft', { 'playerId': removedPlayerID, roomId: room.id });
                        }else{
                          await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('PlayerLeft', { 'playerId': removedPlayerID, roomId: room.id });
                        }
                        
                        console.log("single player status",removedPlayerID, room.players[p].isAllinPlayersChipsAssigned)
                        
                        await module.exports.assignCashToPlayers(room, removedPlayerID, true);  

                        let playerUpdated = await Sys.Game.CashGame.Texas.Services.RoomServices.update(room);
                        //console.log("player updated in sinble player remove ", playerUpdated);

                      }else{
                        console.log("waiting for removing single player");
                      }
                    }else{
                      console.log("single player time else", room.players[p].subscribeTime, room.players[p].id, room.players[p].playerName);
                    }
                  }
                }
              }

            }
          }
        }
      }catch(error){
        console.log("error when ideal and single player remove automatically: ", error);
      }
    },


}
