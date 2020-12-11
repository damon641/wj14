var Sys = require('../../../../Boot/Sys');

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
             var chips = player.chips - parseInt(data.chips);
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


}
