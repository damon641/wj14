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
        try {

          let player = await Sys.Game.Reguler.Texas.Services.PlayerServices.getByData({ _id :socket.playerId })
          if (player) {
             var chips = player.chips - parseFloat(data.chips);
             let update = await Sys.Game.Reguler.Texas.Services.PlayerServices.update(socket.playerId, {chips: chips} );
             data.playerId = socket.playerId;
             // load('Server/WsFacade').io.in(request.body.roomId).emit('PokerTip', request.body);
            // channel.socket.io.to(data.roomId).emit('Tip', data)
            await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(data.roomId).emit('Tip', data)
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
        }

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
        await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(data.roomId).emit('Chat', data)
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
        await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(data.roomId).emit('PlayerGift', data)
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
        let player = await Sys.Game.Reguler.Texas.Services.PlayerServices.getById(data.friendId);
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
        let sender = await Sys.Game.Reguler.Texas.Services.PlayerServices.getById(data.playerId);
        if (!sender) {
            return {
                status: 'fail',
                result: null,
                message: 'No Such Player Found.',
                statusCode: 401
            }
        }
        gamePlayer.sender = sender;
        let room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(gamePlayer.room);
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

        await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(data.roomId).emit('InviteFriend', gamePlayer)
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
        var action = await Sys.Game.Reguler.Texas.Controllers.RoomProcess.playerAction(data);
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
        let player = await Sys.Game.Reguler.Texas.Services.PlayerServices.getById(data.id);
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

    // remove player fro rooms if player is ideal for more than 5 minutes
    removePlayerFromRooms:async function() {
      console.log("remove player calles")
        
      let rooms = Sys.Rooms;
       
      let allRooms = await Sys.Game.Reguler.Texas.Services.RoomServices.getAllRoom({});
      
      if(allRooms.length > 0){
        for(let r = 0; r< allRooms.length; r++){
          let tId = allRooms[r]._id;
          var room = rooms[tId];
          if(room){
            //console.log("working rooms ---->", room);
            var players = room.players;
            console.log("player", players.length)
            if(players.length > 0){ 
              for(let p =0; p < players.length; p++){
                var playerTimeout = room.players[p].idealTime;
                
                if(playerTimeout != null){
                 
                  let idealAt = moment(playerTimeout);
                  console.log("ideal at", idealAt)
                  let removeAt =  moment(playerTimeout).add('15','minutes')
                  console.log("remove at", removeAt);
                  if( removeAt < moment() ){
                    console.log("date comes");
                     room.players[p].status = "Left";
                     room.players[p].sitOutNextHand = false;
                     room.players[p].sitOutNextBigBlind = false;
                     room.players[p].defaultActionCount = 0;
                     room.players[p].oldPlayerLeftTime = new Date();
                     room.players[p].idealTime = null;
                    await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('PlayerLeft', { 'playerId': room.players[p].id, roomId: room.id });
                    console.log("ideal player status", room.players[p].isAllinPlayersChipsAssigned)
                    let dataPlayer = await Sys.Game.Reguler.Texas.Services.PlayerServices.getById(room.players[p].id);
                    if (dataPlayer && room.players[p].isAllinPlayersChipsAssigned == false) {
                        console.log("Chips",dataPlayer.chips,room.players[p].chips);
                      let chips = parseFloat(dataPlayer.chips) + parseFloat(room.players[p].chips);
                      var playerUpdate = await Sys.Game.Reguler.Texas.Services.PlayerServices.update(room.players[p].id, { chips: chips });
                      room.players[p].isAllinPlayersChipsAssigned = true;

                      var transGameId = "";
                      var transGameNum = "";
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
                        isTournament: 'Yes',
                        isGamePot: 'no'
                      }

                      console.log("regular tournament left player transactionLeftData: ", transactionLeftData);
                      await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionLeftData);                     
                    }
                    let playerUpdated = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room)
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
                let removeAt =  moment(room.players[removePlayerIndex].subscribeTime).add('15','minutes')
                console.log("single player remove at", removeAt);
                if( removeAt < moment() ){
                  console.log("single player date comes");
                   room.players[removePlayerIndex].status = "Left";
                   room.players[removePlayerIndex].subscribeTime = null;
                   room.players[removePlayerIndex].sitOutNextHand = false;
                   room.players[removePlayerIndex].sitOutNextBigBlind = false;
                   room.players[removePlayerIndex].defaultActionCount = 0;
                   room.players[removePlayerIndex].oldPlayerLeftTime = new Date();
                  await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('PlayerLeft', { 'playerId': room.players[removePlayerIndex].id, roomId:room.id });
                  let dataPlayer = await Sys.Game.Reguler.Texas.Services.PlayerServices.getById(room.players[removePlayerIndex].id);
                  console.log("single player status", room.players[removePlayerIndex].isAllinPlayersChipsAssigned)
                    if (dataPlayer && room.players[removePlayerIndex].isAllinPlayersChipsAssigned == false) {
                        console.log("Chips",dataPlayer.chips,room.players[removePlayerIndex].chips);
                      let chips = parseFloat(dataPlayer.chips) + parseFloat(room.players[removePlayerIndex].chips) + parseFloat(room.players[removePlayerIndex].extraChips);
                      var playerUpdate = await Sys.Game.Reguler.Texas.Services.PlayerServices.update(room.players[removePlayerIndex].id, { chips: chips });
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
                        isTournament: 'Yes',
                        isGamePot: 'no'
                      }
                      console.log("regular tournament Player left for game: ", transactionDataLeft);
                      await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataLeft);

                    }
                    let playerUpdated = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room)
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

    },


}
