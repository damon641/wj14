var Sys = require('../../../Boot/Sys');
var moment = require('moment-timezone');
const mongoose = require('mongoose');

module.exports = {

  // Sng
  listSngRooms: async function (socket, data) {
    try {
      let query = {
        status: { "$ne": 'Closed' }
      };

      if (data.game.toLowerCase() != 'all') {
        query.limit = data.game;
      } 
      if (data.stacks.toLowerCase() != 'all') {
        let stac = data.stacks.split('/');
        query.smallBlind = stac[0];
        query.bigBlind = stac[1];
      }
      if (data.maxPlayer.toLowerCase() != 'all') {
        query.maxPlayers = parseInt(data.maxPlayer);
      }
      // console.log("Query :",query);
      if(data.pokerGameType != 'all'){
        query.tableType = data.pokerGameType;
      }
            
      let rooms = await Sys.Game.Common.Services.RoomServices.getByData(query);

      if (rooms) {
        var result = [];
        for (let i = 0; i < rooms.length; i++) {
          //rooms.forEach(function (room) {
          console.log("rooms[i].tournament", rooms[i])
          let sngTournament = await Sys.Game.Common.Services.sngTournamentServices.getTourData({
            _id: rooms[i].tournament,isDelete:false
          });
          if (sngTournament instanceof Error) {
            return {
              status: 'fail',
              result: null,
              message: 'No Tournament Found!',
              statusCode: 401
            }
          }
          let type;
          if(rooms[i].limit == 'limit'){
            if(rooms[i].tableType == 'texas'){
              type = 'LTH'
            }else{
              type = 'LOH'
            }
          }else if(rooms[i].limit == 'no_limit'){
            if(rooms[i].tableType == 'texas'){
              type = 'NLTH';
            }else{
              type = 'NLOH'
            }
          }else if(rooms[i].limit == 'pot_limit'){
            if(rooms[i].tableType == 'texas'){
              type = 'PLTH';
            }else{
              type = 'PLOH'
            }
          }else if(rooms[i].limit == 'Hi-Lo'){
            type = 'H/LNLOH'
          }else if(rooms[i].limit == 'Hi-Lo-limit'){
            type = 'H/LLOH'
          }else if(rooms[i].limit == 'Hi-Lo-pot_limit'){
            type = 'H/LPLOH'
          }
          console.log({sngTournament})
          if(sngTournament){
            result.push({
              id: rooms[i].id,
              tournamentId: rooms[i].tournament,
              type: type,
              name: rooms[i].name,
              seat: rooms[i].players.length + '/' + rooms[i].maxPlayers,
              blinds: rooms[i].smallBlind + '/' + rooms[i].bigBlind,
              buyIn: sngTournament.buy_in + '+' + sngTournament.entry_fee,
              status: rooms[i].status,
              namespaceString: (rooms[i].tableType == 'texas') ? Sys.Config.Namespace.CashSngTexas : Sys.Config.Namespace.CashSngOmaha,
              pokerGameType: rooms[i].tableType,
              pokerGameFormat: 'sng'

            });
          }
          
        }
        //});
        return {
          status: 'success',
          result: result,
          message: 'Table Available',
          statusCode: 200
        };
      }
      return {
        status: 'fail',
        result: null,
        message: 'No Rooms Found.',
        statusCode: 401
      }
    }
    catch (e) {
      console.log("Error in listRooms :", e);
      return new Error(e);
    }
  },

  registerSngTournament: async function (socket, data) {
    try {
      
      let room =data.pokerGameType == 'texas' ?  await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId) :  await Sys.Game.Sng.Omaha.Services.RoomServices.get(data.roomId);
      if (room instanceof Error) {
        return { status: 'fail', result: null, message: 'Server error fetching room.', statusCode: 500 }
      }
      let tournament = await Sys.Game.Common.Services.sngTournamentServices.getById(room.tournament);
      let registeredPlayersArray = tournament.players;
      let playersSestionIds = tournament.playersSestionIds;

      if (tournament instanceof Error) {
        return {
          status: 'fail',
          result: null,
          message: 'Server error fetching tournament.',
          statusCode: 500
        }
      }
      let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({ _id: data.playerId });
      if (player instanceof Error) {
        return {
          status: 'fail',
          result: null,
          message: 'Server error fetching player.',
          statusCode: 500
        }
      }

      if (player) {
        if (registeredPlayersArray.includes(data.playerId)) {
          return {
            status: 'success',
            result: null,
            message: 'You are already registered for this tournament.',
            statusCode: 200
          }
        }
    

        if (player.chips >= (tournament.entry_fee + tournament.buy_in)) {

          let seatAvailable = false;
          let playerCount = room.players.length;
          let allSeatIndex = [];
          for (let i = 0; i < room.players.length; i++) {
            allSeatIndex.push(room.players[i].seatIndex);
          }

          if (playerCount < room.maxPlayers) {
            // let Find Free SeatIndex
            for (let k = 0; k < room.maxPlayers; k++) {
              if (!allSeatIndex.includes(k)) {
                seatAvailable = true;
                data.seatIndex = k;
                break;
              }
            }
          }

          // When Fist User Wants to Push on Table.
          if (allSeatIndex.length == 0) {
            seatAvailable = true;
            data.seatIndex = 0;
          }
          console.log("----------seatAvailable :", seatAvailable);
          console.log("------------------------------------------------------------");


          if (seatAvailable) {
            //push player to tournament database

            registeredPlayersArray.push(data.playerId);

            let date = new Date()
            let timestamp1 = date.getTime();
            let sessionId= player.uniqId + "-" + tournament.tournamentNumber+"-" +timestamp1
            playersSestionIds.push(sessionId)
            await Sys.Game.Common.Services.sngTournamentServices.updateTourData(
              {
                _id: room.tournament
              }, {
                players: registeredPlayersArray,
                rooms: data.roomId,
                tournamentTotalChips: eval(tournament.tournamentTotalChips + parseFloat(tournament.buy_in + tournament.entry_fee) ),
                playersSestionIds:playersSestionIds
              }
            );
            await Sys.Game.Common.Services.PlayerServices.update(data.playerId, { chips: parseFloat(player.chips) - parseFloat(tournament.entry_fee + tournament.buy_in) });
  
            let traNumber = + new Date()
            let sessionData={
              sessionId:sessionId,
              uniqId:player.uniqId,
              username:player.username,
              chips: parseFloat(tournament.entry_fee + tournament.buy_in),
              beforeBalance: player.chips,
              previousBalance: player.chips,
              afterBalance: parseFloat(player.chips - parseFloat(tournament.entry_fee + tournament.buy_in)),
              type:"entry",
              category:"debit",
              user_id:data.playerId,
              transactionNumber: 'DE-'+ traNumber,
              remark:"Tournament Entry Fee",
              isTournament: "true",
              gameNumber: data.tournamentId,
              gameId: data.tournamentId,
            }					
            await Sys.Game.Common.Services.ChipsServices.insertData(sessionData)

            let transactionData = {
              user_id: player.id,
              username: player.username,
              tableId: tournament.id,
              tableName: tournament.name,
              chips: (parseFloat(tournament.entry_fee) + parseFloat(tournament.buy_in)),
              previousBalance: parseFloat(player.chips),
              afterBalance: parseFloat(player.chips - parseFloat(tournament.entry_fee + tournament.buy_in)),
              category: 'debit',
              type: 'entry',
              remark: 'Joined',
              isTournament: 'Yes',
              isGamePot: 'no'
            }

            console.log("regular tournament register player transactionData: ", transactionData);
            await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);



            room.AddPlayer(player.id, socket.id, player.username, player.profilePic, 0, tournament.stacks_chips, data.seatIndex, false);
              console.log("UPDATED IIFFF", data.pokerGameType)
              room = data.pokerGameType == 'texas' ? await Sys.Game.Sng.Texas.Services.RoomServices.update(room): await Sys.Game.Sng.Omaha.Services.RoomServices.update(room);
            

            let counter = 0;
            for (let i = 0; i < room.players.length; i++) {
              if (room.players[i].status != 'Left') {
                counter++;
              }
            }

            Sys.Log.info('*****************************************************');
            Sys.Log.info('Counter : ', counter);
            console.log('Room ID : ', room.id);
            console.log('Tournament ID_id : ', tournament._id);
            Sys.Log.info('Starting Soon.....');
            Sys.Log.info('*****************************************************');
            if (counter == room.maxPlayers) { // room.maxPlayers replace with
              // Check For Tournament Start.
              let srtObj = {
                tournamentId: tournament.id,
                roomId: room.id
              }
              console.log("////////////////////////////////////////////");
              console.log("////////////////////////////////////////////");
              console.log("////////////////////////////////////////////");
              console.log("tournament.gameType", tournament.gameType)
              console.log("////////////////////////////////////////////");
              console.log("////////////////////////////////////////////");
              console.log("////////////////////////////////////////////");
              if (tournament.gameType == 'texas') {
                console.log("tournament.gameType ifff", tournament.gameType)
                await Sys.Game.Sng.Texas.Controllers.TournamentController.startTournament(srtObj);
              } else {
                console.log("tournament.gameType else", tournament.gameType)
                await Sys.Game.Sng.Omaha.Controllers.TournamentController.startTournament(srtObj);
              }

            }
            return {
              status: 'success',
              result: { roomId: room.id },
              message: 'Registration Successful.',
              statusCode: 200
            }
          } else {
            return {
              status: 'fail',
              result: null,
              message: 'Seat Not Avilable',
              statusCode: 400
            }
          }

        } else {
          return {
            status: 'fail',
            result: null,
            message: "You don't have sufficient chips to register for this tournament.",
            statusCode: 400
          }
        }
      } else {
        return {
          status: 'fail',
          result: null,
          message: 'Player Not Found',
          statusCode: 400
        }
      }

    } catch (error) {
      Sys.Log.info('Error in registerSngTournament tournament : ' + error);
      return new Error(error);
    }

  },

  sngTournamentPlayers: async function (socket, data) {
    try {
      console.log("sngTournamentPlayers", data)
      let room;
      if (data.pokerGameType == 'texas') {
        room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
      } else {
        room = await Sys.Game.Sng.Omaha.Services.RoomServices.get(data.roomId);
      }

      if (room instanceof Error) {
        return { status: 'fail', result: null, message: 'Server error fetching room.', statusCode: 500 }
      }
      let playerDetails = [];
      for (let i = 0; i < room.players.length; i++) {
        let player = await Sys.Game.Reguler.Texas.Services.PlayerServices.getById(room.players[i].id);
        playerDetails.push({
          id: player.id,
          rank: 1,
          name: player.username,
          avatar: player.profilePicId,
          cash: 0,
          winning: 0,
          tableId: 0,
        })
      }
      return {
        status: 'success',
        result: playerDetails,
        message: 'Tournament Players Details'
      }
    } catch (error) {
      Sys.Log.info('Error in regular tournament : ' + error);
      return new Error(e);
    }
  },

  sngTournamentTables: async function (socket, data) {
    try {
      let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
      if (room instanceof Error) {
        return { status: 'fail', result: null, message: 'Server error fetching room.', statusCode: 500 }
      }

      return {
        status: 'success',
        result: {
          roomId: room.id,
          name: room.name,
          namespaceString: (room.tableType == 'texas') ? Sys.Config.Namespace.CashSngTexas : Sys.Config.Namespace.CashSngOmaha,
          pokerGameType: room.tableType,
          pokerGameFormat: 'sng',
          isTournament : true
        },
        message: 'Tournament Tables Details'

      }

    } catch (error) {
      Sys.Log.info('Error in regular tournament : ' + error);
      return new Error(e);
    }
  },

  sngTournamentPayout: async function (socket, data) {
    try {
      let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
      if (room instanceof Error) {
        return { status: 'fail', result: null, message: 'Server error fetching room.', statusCode: 500 }
      }

      console.log('Room ID : ', room.tournament);
      let tournament = await Sys.Game.Common.Services.sngTournamentServices.getById(room.tournament);
      if (tournament instanceof Error) {
        return { status: 'fail', result: null, message: 'Server error fetching tournament.', statusCode: 500 }
      }

      let payoutDetails = [];
      if(tournament.players.length > 0){
        let payout = await Sys.Game.Common.Services.pricePoolServices.getSngPricePooldata({});console.log("sng payout", payout)
        if(payout){
          let totalPayout = parseFloat(tournament.buy_in * tournament.max_players);console.log("totalPayout", totalPayout);
          let winnerAmount = { position: 1, amount: eval(parseFloat(totalPayout * payout[0].winner / 100).toFixed(2)) };
          let firstRunnerUp = { position: 2, amount: eval(parseFloat(totalPayout * payout[0].firstRunnerUp / 100).toFixed(2)) };
          let secondRunnerUp = { position: 3, amount: eval(parseFloat(totalPayout * payout[0].secondRunnerUp / 100).toFixed(2)) };
          payoutDetails.push(winnerAmount, firstRunnerUp, secondRunnerUp)
        }
        
      }  

      return {
        status: 'success',
        result: payoutDetails,
        message: 'Tournament Payout Details'
      }
    } catch (error) {
      Sys.Log.info('Error in regular tournament : ' + error);
      return new Error(e);
    }
  },

  sngTournamentBlinds: async function (socket, data) {
    try {
      let room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
      if (room instanceof Error) {
        return { status: 'fail', result: null, message: 'Server error fetching room.', statusCode: 500 }
      }

      console.log('Room ID : ', room.tournament);
      let tournament = await Sys.Game.Common.Services.sngTournamentServices.getById(room.tournament);
      if (tournament instanceof Error) {
        return { status: 'fail', result: null, message: 'Server error fetching tournament.', statusCode: 500 }
      }
      
      console.log("tourblind",tournament)
      let blinds = await Sys.Game.Common.Services.blindLevelsServices.getBlindLevelsData(tournament.blindLevels);
      console.log("blinds",blinds)
      let blindsDetails = [];

        for(let j=0; j< blinds[0].blindLevels.length;j++){
          blindsDetails.push({
            index : j + 1,
            blinds: blinds[0].blindLevels[j].minBlind + '/' + blinds[0].blindLevels[j].maxBlind,
            duaration: tournament.blind_levels_rise_time
          });
        }
      
      return {
        status: 'success',
        result: blindsDetails,
        message: 'Tournament Blinds Details'
      }

    } catch (error) {
      Sys.Log.info('Error in regular tournament : ' + error);
      return new Error(e);
    }
  },

  unRegisterSngTournament: async function (socket, data) {
    try {
        let room = data.pokerGameType == 'texas' ? await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId):await Sys.Game.Sng.Omaha.Services.RoomServices.get(data.roomId);
      if (room instanceof Error) {
        return { status: 'fail', result: null, message: 'Server error fetching room.', statusCode: 500 }
      }
      let tournament = await Sys.Game.Common.Services.sngTournamentServices.getById(room.tournament);
      if (tournament instanceof Error) {
        return {
          status: 'fail',
          result: null,
          message: 'Server error fetching tournament.',
          statusCode: 500
        }
      }

      let player = await Sys.Game.Common.Services.PlayerServices.getOneByData({ _id: data.playerId });
      
      let registeredPlayersArray = tournament.players;
      let playersSestionIds=tournament.playersSestionIds;
      if (player instanceof Error) {
        return {
          status: 'fail',
          result: null,
          message: 'Server error fetching player.',
          statusCode: 500
        }
      }
      if(tournament.status == 'Running'){
          if (registeredPlayersArray.includes(data.playerId)) {
            return {
              status: 'fail',
              result: null,
              message: 'Tournament is started,you can not leave.',
              statusCode: 400
            }
          }        
      }
      if (!registeredPlayersArray.includes(data.playerId)) {
        return {
          status: 'success',
          result: { playerId: data.playerId },
          message: 'You are not registered in this Tournaments.',
          statusCode: 200
        }
      }
      if (player) {
        // for (var i = 0; i < room.players.length; i++) {
        //   if (room.players[i].id == data.playerId) {
        //     room.players.splice(i, 1);
        //     isPlayerExists = true;
        //     break;
        //   }
        // }
        let sesstionId = playersSestionIds.splice(registeredPlayersArray.indexOf(data.playerId), 1);
        registeredPlayersArray.splice(registeredPlayersArray.indexOf(data.playerId), 1);
        room.players.splice( room.players.findIndex(x => x.id ===data.playerId), 1);
        await Sys.Game.Common.Services.sngTournamentServices.updateTourData(
          {
            _id: room.tournament
          }, {
            players: registeredPlayersArray,
            rooms: data.roomId,
            tournamentTotalChips: eval(tournament.tournamentTotalChips - parseFloat(tournament.buy_in + tournament.entry_fee) ),
            playersSestionIds:playersSestionIds
          }
        );
        let transactionDataLeft = {
          user_id: player.id,
          username: player.username,
          gameId: tournament.id,
          gameNumber: tournament.name,
          tableId: tournament.id,
          tableName: tournament.name,
          chips: (parseFloat(tournament.entry_fee) + parseFloat(tournament.buy_in)),
          previousBalance: parseFloat(player.chips),
          afterBalance: parseFloat(player.chips + parseFloat(tournament.entry_fee + tournament.buy_in)),
          category: 'credit',
          type: 'entry',
          remark: 'Un-Register',
          isTournament: 'Yes',
          isGamePot: 'no'
      }

      console.log("Player regular tournament unRegister transactionDataLeft: ", transactionDataLeft);
      await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataLeft);

      let traNumber = + new Date()
      let sessionData={
        sessionId:sesstionId[0],
        uniqId:player.uniqId,
        user_id:data.playerId,
        username:player.username,
        chips: parseFloat(tournament.entry_fee + tournament.buy_in),
        beforeBalance: parseFloat(player.chips),
        previousBalance: parseFloat(player.chips),
        afterBalance: parseFloat(player.chips + parseFloat(tournament.entry_fee + tournament.buy_in)),
        type:"leave",
        category:"credit",
        remark:"Return Entry Fee on tournament leave",
        isTournament: "true",
        gameNumber: data.tournamentId,
        gameId: data.tournamentId,
        transactionNumber: 'DEP-'+ traNumber,
      }					


      await Sys.Game.Common.Services.ChipsServices.insertData(sessionData)

       
        await Sys.Game.Common.Services.PlayerServices.update(data.playerId, { chips: parseFloat(player.chips) + parseFloat(tournament.entry_fee + tournament.buy_in) });        
          room =data.pokerGameType == 'texas' ?  await Sys.Game.Sng.Texas.Services.RoomServices.update(room):  await Sys.Game.Sng.Omaha.Services.RoomServices.update(room)

        return {
          status: 'success',
          result: { playerId: data.playerId },
          message: 'UnRegistration Success.',
          statusCode: 200
        }
      } else {
        return {
          status: 'fail',
          result: null,
          message: 'Player Not Found',
          statusCode: 400
        }
      }
    } catch (error) {
      Sys.Log.info('Error in UnRegisterSngTournament tournament : ' + error);
      return new Error(error);
    }
  },

  sngTournamentInfo: async function (socket, data) {
    try {
      let room;
      if (data.pokerGameType == 'texas') {
        room = await Sys.Game.Sng.Texas.Services.RoomServices.get(data.roomId);
      } else {
        room = await Sys.Game.Sng.Omaha.Services.RoomServices.get(data.roomId);
      }

      if (room instanceof Error) {
        return { status: 'fail', result: null, message: 'Server error fetching room.', statusCode: 500 }
      }

      let tournament = await Sys.Game.Common.Services.sngTournamentServices.getById(room.tournament);
      if (tournament instanceof Error) {
        return { status: 'fail', result: null, message: 'Server error fetching tournament.', statusCode: 500 }
      }

      let isRegistered = false;
      for (let i = 0; i < room.players.length; i++) {
        if (data.playerId == room.players[i].id) {
          isRegistered = true;
        }
      }

      let responsedata = {
        tournamentId: tournament._id,
        id: room.id,
        isRegistered: isRegistered,
        players: room.players.length,
        registrationStatus: 'open',
        name: room.name,
        gameType: room.limit,
        prizePool: parseFloat(tournament.buy_in * tournament.max_players),
        stacks: tournament.stacks.minStack + '/' + tournament.stacks.maxStack,
        buyIn: tournament.buy_in + '+' + tournament.entry_fee,
        min_players: room.minPlayers,
        max_players: room.maxPlayers,
        //description :tournament.description,
        status: tournament.status,
        pokerGameType: tournament.gameType

      }

      return {
        status: 'success',
        result: responsedata,
        message: 'Tournament Details'
      }


    } catch (error) {

      Sys.Log.info('Error in sng tournament : ' + error);
      return new Error(error);
    }
  },

  // common 
  rejectTournament: async function (socket, data) {
    try {console.log("socket in reject", socket.id,socket);
      socket.leave(data.tournamentId);
      return {
        status: 'success',
        result: null,
        message: 'Leave Success.',
        statusCode: 200
      }
    } catch (error) {
      Sys.Log.info('Error in registerSngTournament tournament : ' + error);
      return new Error(error);
    }

  },

  // common

  rejectTournament: async function (socket, data) {
    try {console.log("socket in reject1", socket.id,socket);
      // Remove Player form Subscripbe Tournamet
      socket.leave(data.tournamentId);
      return {
        status: 'success',
        result: null,
        message: 'Tournament Rejected Succeess'
      }
    } catch (error) {
      Sys.Log.info('Error in regular tournament : ' + error);
      return new Error(error);
    }
  },

  // Reguler
  checkRegularTournamentStatus: async function (req, res) {
    try {

      let getTournament = await Sys.App.Services.TournamentServices.getByData({ status: 'Waiting' });
      for (let tournament of getTournament) {


        /* let tournamentTime = tournament.tournament_date_time;
         let date = new Date();
         let currentTimeUtc =new Date(
           date.getUTCFullYear(),
           date.getUTCMonth(),
           date.getUTCDate(),
           date.getUTCHours(),
           date.getUTCMinutes(), 
           date.getUTCSeconds()
         );*/

        let tournamentTime = moment(new Date(tournament.tournament_date_time)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format()
        let currentTimeUtc = moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format();


        //var seconds = (tournamentTime.getTime() - currentTimeUtc.getTime()) / 1000;
        // console.log("MINUTES :",seconds/60)

        if (currentTimeUtc >= tournamentTime) {
          console.log(tournament);
          //check for players limit,if minimum player is not available revert back entry back
          if (tournament.players.length < tournament.min_players) {
            console.log("/****************************************************/")
            console.log("* Tournament Minimum Player Not Found So Revert Cash.")
            console.log("/****************************************************/")
            await Sys.App.Services.TournamentServices.updateTourData({ _id: tournament._id }, { status: 'Cancel' })
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$");
            console.log("tournament.players",tournament.players);
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$");
          
            // for (let player of tournament.players) {
              for (let index = 0; index < tournament.players.length; index++) {
                console.log("tournament.players",tournament.players[index]);
              let playerDetails = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: tournament.players[index] });
              console.log("playerDetails",playerDetails);
              
              // if(playerDetails) {
              //   await module.exports.agentsUpdate(tournament.entry_fee, playerDetails, "checkRegularTournamentStatus", tournament._id);
              // }else {
              //   console.log("playerDetails not found")
              //   return ; 
              // }
              if(playerDetails){
              tournament.tournamentTotalChips =  parseFloat(tournament.tournamentTotalChips - parseFloat(tournament.buy_in  + tournament.entry_fee ))
              let traNumber = + new Date()
                let sessionData = {
                  sessionId: tournament.playersSestionIds[index],
                  uniqId: playerDetails.uniqId,
                  username: playerDetails.username,
                  chips: parseFloat(tournament.entry_fee + tournament.buy_in),
                  beforeBalance: playerDetails.chips,
                  previousBalance: playerDetails.chips,
                  afterBalance: playerDetails.chips + parseFloat(tournament.entry_fee + tournament.buy_in),
                  type: "leave",
                  category: "credit",
                  user_id: playerDetails._id,
                  remark: 'Return Entry Fee on tournament Cancel ',
                  isTournament: "true",
                  gameId: tournament._id,
                  gameNumber: tournament._id,
                  transactionNumber: 'DEP-' + traNumber,
                }
                await Sys.Game.Common.Services.ChipsServices.insertData(sessionData)
   
              
              let transactionReturn = {
                user_id:playerDetails._id,
                username: playerDetails.username,
                tableId: tournament._id,
                tableName: tournament.name,
                chips:parseFloat(tournament.entry_fee + tournament.buy_in),
                previousBalance:parseFloat(playerDetails.chips),
                afterBalance: (parseFloat(playerDetails.chips ) + parseFloat(tournament.entry_fee) + parseFloat(tournament.buy_in)),
                category: 'credit',
                type: 'revert',
                remark: 'Return Amount of tournament',
                isTournament: 'Yes'
              }
              console.log("regular tournament cancel transactionReturn: ", transactionReturn);
              await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionReturn);
            }
            }
            await Sys.App.Services.PlayerServices.updateMultiplePlayerData({ _id: { $in: tournament.players } },
               { $inc: { chips: parseFloat(tournament.entry_fee + tournament.buy_in) },
                });
                
            await Sys.App.Services.TournamentServices.updateTourData({ _id: tournament._id }, { players: [],playersSestionIds:[], tournamentTotalChips: tournament.tournamentTotalChips,  status: 'Cancel' })
          } else {
            console.log("/****************************************************/")
            console.log("* Tournament Start :", tournament._id)
            console.log("/****************************************************/")
            await Sys.App.Services.TournamentServices.updateTourData({ _id: tournament._id }, { status: 'Running' });
            if (tournament.gameType == 'texas') {
              Sys.Game.Reguler.Texas.Controllers.TournamentController.startTournament({ tournamentId: tournament._id });
            } else {
              Sys.Game.Reguler.Omaha.Controllers.TournamentController.startTournament({ tournamentId: tournament._id });
            }

          }
        }
      }



      // Start Tournament By simple way. Testing Only

      //  let data = {
      //   tournamentId :'5c4232bfe9ba4f01418cfd34'
      // }
      // Sys.Game.Reguler.Texas.Controllers.TournamentController.startTournament(data); 
      //res.send("Tournament Checking Done...Thanks");

    } catch (error) {
      let getTournament = await Sys.App.Services.TournamentServices.getByData({ status: 'Waiting' });
      for (let tournament of getTournament) {
        let tournamentTime = moment(new Date(tournament.tournament_date_time)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format()
        let currentTimeUtc = moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format();
        if (currentTimeUtc >= tournamentTime) {
          console.log(tournament);
          if (tournament.players.length < tournament.min_players) {
            await Sys.App.Services.TournamentServices.updateTourData({ _id: tournament._id }, { status: 'Cancel' })            
          }
        }
      }
      Sys.Log.info('Error in regular tournament status change : ' + error);
      res.send("Tournament Checking With Error...Thanks");
    }
  },

  tournamentInfo: async function (socket, data) {
    try {
      let tournament = await Sys.Game.Common.Services.TournamentServices.getById(data.tournamentId);
      if (!tournament) {
        return { status: 'fail', result: null, message: 'Tournament not Found!', statusCode: 400 }
      }

      let isRegistered = false;
      let registeredPlayersArray = tournament.players;
      if (registeredPlayersArray.includes(data.playerId)) {
        isRegistered = true;
      }

      let TournamentDT = new Date(tournament.tournament_date_time);

      //let TournamentDateTime = TournamentDT.getUTCFullYear()+'/'+(TournamentDT.getUTCMonth()+1)+'/'+TournamentDT.getUTCDate()+' '+TournamentDT.getUTCMinutes()+':'+TournamentDT.getUTCSeconds();
      //let TournamentDateTimeTemp = moment(new Date(tournament.tournament_date_time)).tz('UTC').format('DD-MM-YYYY h:mm:ss a')
      let timeZone = data.timezone;console.log(timeZone);
      let TournamentDateTime
      if(timeZone){
        TournamentDateTime = moment(tournament.tournament_date_time, 'DD-MM-YYYY h:mm:ss a').tz(timeZone).format('DD-MM-YYYY h:mm:ss a');
        
      }else{
        let TournamentDateTimeUtc = moment(new Date(tournament.tournament_date_time)).tz('UTC').format('DD-MM-YYYY h:mm:ss a');
        TournamentDateTime =TournamentDateTimeUtc + " (UTC)"; 
      }
      
      console.log("time", TournamentDateTime);
      let gameType = "No Limit";
      if (tournament.limit == "limit") {
        gameType = "Limit";
      } else if (tournament.limit == "pot_limit") {
        gameType = "Pot Limit";
      }else if(tournament.limit == "Hi-Lo"){
        gameType = "Hi-Lo No Limit";
      }else if(tournament.limit == "Hi-Lo-pot_limit"){
        gameType = "Hi-Lo Pot Limit";
      }else if(tournament.limit == "Hi-Lo-limit"){
        gameType = "Hi-Lo Limit";
      }
      let responsedata = {
        id: tournament.id,
        players: tournament.players.length,
        isRegistered: isRegistered,
        registrationStatus: 'open',
        name: tournament.name,
        gameType: gameType,
        prizePool: parseFloat(tournament.buy_in * tournament.players.length),
        // stacks: tournament.stacks.minStack + '/' + tournament.stacks.maxStack,
        buyIn: tournament.buy_in + '+' + tournament.entry_fee,
        min_players: tournament.min_players,
        max_players: tournament.max_players,
        status: tournament.status,
        dateTime: TournamentDateTime,

        pokerGameType: tournament.tableType
      }

      return {
        status: 'success',
        result: responsedata,
        message: 'Tournament Details'
      }


    } catch (error) {

      Sys.Log.info('Error in regular tournament : ' + error);
      return new Error(error);
    }
  },

  tournamentPlayers: async function (socket, data) {
    try {
      let tournament = await Sys.Game.Common.Services.TournamentServices.getById(data.tournamentId);
      if (!tournament) {
        return { status: 'fail', result: null, message: 'Tournament not Found!', statusCode: 400 }
      }
      let playerDetails = [];

      if (tournament.status == 'Finished') {
        let rankId = 0;
        if (tournament.tournamentWinners) {
          for (let i = 0; i < tournament.tournamentWinners.length; i++) {
            rankId = rankId + 1;
            console.log("rankId", rankId)
            playerDetails.push({
              id: tournament.tournamentWinners[i].id,
              rank: rankId,
              name: tournament.tournamentWinners[i].username,
              avatar: tournament.tournamentWinners[i].avatar,
              cash: tournament.tournamentWinners[i].winningChips,
              winning: tournament.tournamentWinners[i].winningChips,
              tableId: 0,
            })
          }
        }
        if (tournament.tournamentLosers) {
          console.log("looser length", tournament.tournamentLosers.length)
          for (let j = (tournament.tournamentLosers.length - 1 - rankId); j >= 0; j--) {
            rankId = rankId + 1;
            console.log("rankid", tournament.tournamentLosers[j], rankId)
            let player = await Sys.Game.Reguler.Texas.Services.PlayerServices.getById(tournament.tournamentLosers[j]);
            playerDetails.push({
              id: player.id,
              rank: rankId,
              name: player.username,
              avatar: player.profilePicId,
              cash: 0,
              winning: 0,
              tableId: 0,
            })
          }
        }


      } else {
        for (let i = 0; i < tournament.players.length; i++) {
          let player = await Sys.Game.Reguler.Texas.Services.PlayerServices.getById(tournament.players[i]);
          playerDetails.push({
            id: player.id,
            rank: 0,
            name: player.username,
            avatar: player.profilePicId,
            cash: 0,
            winning: 0,
            tableId: 0,
          })
        }
      }
      // console.log(playerDetails)
      return {
        status: 'success',
        result: playerDetails,
        message: 'Tournament Players Details'
      }
    } catch (error) {
      Sys.Log.info('Error in regular tournament : ' + error);
      return new Error(error);
    }
  },

  tournamentTables: async function (socket, data) {
    try {
      let tournament = await Sys.Game.Common.Services.TournamentServices.getById(data.tournamentId);
      if (!tournament) {
        return { status: 'fail', result: null, message: 'Tournament not Found!', statusCode: 400 }
      }
      let roomDetails = [];
      for (let i = 0; i < tournament.rooms.length; i++) {
        let room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(tournament.rooms[i]);
        if (room.status != "Closed") {
          roomDetails.push({
            roomId: room.id,
            name: room.name,
            namespaceString: (tournament.gameType == 'texas') ? Sys.Config.Namespace.CashRegularTexas : Sys.Config.Namespace.CashRegularOmaha,
            pokerGameType: tournament.gameType,
            pokerGameFormat: 'tournament',
            isTournament: true,
          })
        }
      }

      return {
        status: 'success',
        result: roomDetails,
        message: 'Tournament Tables Details'
      }
    } catch (error) {
      Sys.Log.info('Error in regular tournament : ' + error);
      return new Error(e);
    }
  },

  tournamentPayout: async function (socket, data) {
    try {
      let tournament = await Sys.Game.Common.Services.TournamentServices.getById(data.tournamentId);
      if (!tournament) {
        return { status: 'fail', result: null, message: 'Tournament not Found!', statusCode: 400 }
      }


      let payOutRecords = await Sys.Game.Common.Services.pricePoolServices.getPricePoolDataSelect({minPlayers : { $lte:  tournament.players.length} });
      console.log("payout records",payOutRecords.length )
      if(payOutRecords.length == 0 && tournament.isFreeRoll == true){
        payOutRecords = await Sys.Game.Common.Services.pricePoolServices.getPricePoolData({isFreeRoll: tournament.isFreeRoll }, null, { sort: {minPlayers: 1}, limit:1 } );
      }
      let playoutDetails = [];

      if (payOutRecords[0]) {
        let prisePoolArray = [];
        for (let [key, value] of Object.entries(payOutRecords[0].toObject())) {
          if (value === 0) { break; }
          if (key.includes('place_')) {
            prisePoolArray.push({
              key: key,
              value: value
            })

          }
        }

        let playout = [];
        for (let i = 0; i < prisePoolArray.length; i++) {
          var expArry = prisePoolArray[i].key.split("place_");
          if (expArry[1].includes('_')) {
            let subArry = expArry[1].split("_");
            for (let j = subArry[0]; j <= subArry[1]; j++) {
              playout.push(prisePoolArray[i].value);
            }
          } else {
            playout.push(prisePoolArray[i].value);
          }
        }

        if(tournament.isFreeRoll == true){
          //console.log("freeroll tournament", playout);
          for (let i = 0; i < playout.length; i++) {
            if(playout[i] > 0){
              playoutDetails.push({
                position: i + 1,
                amount: parseFloat(playout[i]).toFixed(2)
              })
            }      
          }
        }else{
          let totalPayout = parseFloat(tournament.buy_in * tournament.players.length);
          for (let i = 0; i < playout.length; i++) {
            if(playout[i] > 0){
              playoutDetails.push({
                position: i + 1,
                amount: eval(parseFloat(totalPayout * playout[i] / 100).toFixed(2))
              })
            }
            
          }
        }

        
      }
      //console.log("payout ---", playoutDetails)
      return {
        status: 'success',
        result: playoutDetails,
        message: 'Tournament Payout Details'
      }
    } catch (error) {
      Sys.Log.info('Error in regular tournament : ' + error);
      return new Error(e);
    }
  },

  tournamentBlinds: async function (socket, data) {
    try {
      let tournament = await Sys.Game.Common.Services.TournamentServices.getById(data.tournamentId);
      if (!tournament) {
        return { status: 'fail', result: null, message: 'Tournament not Found!', statusCode: 400 }
      }
      console.log("tourblind",tournament)
      let blinds = await Sys.Game.Common.Services.blindLevelsServices.getBlindLevelsData(tournament.blindLevels);
      console.log("blinds",blinds)
      let blindsDetails = [];

        for(let j=0; j< blinds[0].blindLevels.length;j++){
          blindsDetails.push({
            index : j + 1,
            blinds: blinds[0].blindLevels[j].minBlind + '/' + blinds[0].blindLevels[j].maxBlind,
            duaration: tournament.blind_levels_rise_time
          });
        }
      
        // let minStack = tournament.blindLevel;
        // let maxStack = tournament.stacks.maxStack;
        // for (let i = 0; i < 10; i++) {
        //   blindsDetails.push({
        //     index: i + 1,
        //     blinds: minStack + '/' + maxStack,
        //     duaration: tournament.blind_levels_rise_time
        //   })
        //   minStack = minStack * 2;
        //   maxStack = maxStack * 2;
        // }
      return {
        status: 'success',
        result: blindsDetails,
        message: 'Tournament Blinds Details'
      }
    } catch (error) {
      Sys.Log.info('Error in regular tournament : ' + error);
      return new Error(error);
    }
  },

  searchTournamentLobby: async function (socket, data) {
    try {
      let query = {
        status: { "$ne": 'Closed' }
      };

      if (data.game.toLowerCase() != 'all') {
        query.game = data.game;
      }
      if (data.pokerGameType != 'all') {
        query.gameType = data.pokerGameType;
      }

      query.isDelete=false
      let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: data.playerId });
      if (player) {
        //console.log("player", player)
        query.isCashGame = player.isCash;
        let tournaments = await Sys.Game.Common.Services.TournamentServices.getByData(query);
        //console.log("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone)
        if (tournaments) {
          //console.log("tournamentss",tournaments)
          let result = [];
          //let date = new Date();console.log("current time testt", new Date())
          //let date= moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format();
          //console.log("current time testt", date)
          /*let currentTimeUtc = new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(), 
            date.getUTCSeconds()
          );*/
          //let currentTimeUtc = moment().tz('UTC').format()
          let currentTimeUtc = moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format();
          //console.log("UTC time", currentTimeUtc)
          tournaments.forEach(function (tournament) {
            let dateTime = 'Started';
            //let  date1 = new Date() // 10:20 is 11 mins
            //let tournamentDate = new Date(tournament.tournament_date_time); // 10:09 to
            let tournamentDate = moment(new Date(tournament.tournament_date_time)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format();
            //console.log("tournament date admin", tournamentDate)
            if (currentTimeUtc <= tournamentDate) {

              let one_day = 1000 * 60 * 60 * 24;
              // Convert both dates to milliseconds
              let currentTimeUtc_ms = moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('x');
              let tournamentDate_ms = moment(new Date(tournament.tournament_date_time)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('x');
              //console.log("miliseconds",currentTimeUtc_ms, tournamentDate_ms )
              // Calculate the difference in milliseconds
              let difference_ms = tournamentDate_ms - currentTimeUtc_ms;
              console.log("timediff", difference_ms)
              if (difference_ms >= 0) {
                //take out milliseconds
                difference_ms = difference_ms / 1000;
                let seconds = Math.floor(difference_ms % 60);
                difference_ms = difference_ms / 60;
                let minutess = Math.floor(difference_ms % 60);
                difference_ms = difference_ms / 60;
                let hours = Math.floor(difference_ms % 24);
                let days = Math.floor(difference_ms / 24);
                dateTime = days + 'D ' + hours + 'H ' + minutess + 'M ' + seconds + 'S';
                console.log("tournament time", dateTime)
              }

            }

            let type;
            if(tournament.limit == 'limit'){
              if(tournament.gameType == 'texas'){
                type = 'LTH'
              }else{
                type = 'LOH'
              }
            }else if(tournament.limit == 'no_limit'){
              if(tournament.gameType == 'texas'){
                type = 'NLTH';
              }else{
                type = 'NLOH'
              }
            }else if(tournament.limit == 'pot_limit'){
              if(tournament.gameType == 'texas'){
                type = 'PLTH';
              }else{
                type = 'PLOH'
              }
            }else if(tournament.limit == 'Hi-Lo'){
              type = 'H/LNLOH'
            }else if(tournament.limit == 'Hi-Lo-limit'){
              type = 'H/LLOH'
            }else if(tournament.limit == 'Hi-Lo-pot_limit'){
              type = 'H/LPLOH'
            }

            result.push({
              type: type,
              tournamentId: tournament.id,
              name: tournament.name,
              buyIn: tournament.buy_in + '+' + tournament.entry_fee,
              status: tournament.status,
              players: tournament.players.length,
              dateTime: (tournament.status == 'Finished') ? '--:--': dateTime,
              namespaceString: (tournament.tableType == 'texas') ? Sys.Config.Namespace.CashRegularTexas : Sys.Config.Namespace.CashRegularOmaha,
              pokerGameType: tournament.gameType,
              pokerGameFormat: 'tournament'
            });

          });

          return {
            status: 'success',
            result: result,
            message: 'Tournament List Result.',
            statusCode: 200
          };
        }
        return {
          status: 'fail',
          result: null,
          message: 'No Tournaments Found!',
          statusCode: 401
        }
      } else {
        return {
          status: 'fail',
          result: null,
          message: 'No Player Found!',
          statusCode: 401
        }
      }

      //console.log("Query :",query);


    }
    catch (e) {
      console.log("Error in listRooms :", e);
      return new Error(e);
    }
  },

  registerTournament: async function (socket, data) {
    //console.log("all data",data);
    let tournament = await Sys.App.Services.TournamentServices.getTourData({ _id: data.tournamentId ,isDelete:false });
    console.log("tournament:::::::::::::::::::::::::", tournament);
    let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: data.playerId });

    if (player) {
      if (player.isCash != tournament.isCashGame) {
        return {
          status: 'fail',
          result: null,
          message: 'You are not allowed to register for this tournament',
          statusCode: 400
        }
      }
      //console.log("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone)
      /* let tournamentRegisterTime = tournament.register_from_date_time;
      let tournament_time = tournament.tournament_date_time;
      let current_time = new Date();
      let currentTimeUtc =new Date(
        current_time.getUTCFullYear(),
        current_time.getUTCMonth(),
        current_time.getUTCDate(),
        current_time.getUTCHours(),
        current_time.getUTCMinutes(), 
        current_time.getUTCSeconds()
      );*/
      let tournamentRegisterTime = moment(new Date(tournament.register_from_date_time)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format()
      let tournament_time = moment(new Date(tournament.tournament_date_time)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format()
      let currentTimeUtc = moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format();
      /*console.log("current time in utc",currentTimeUtc)
      console.log("tournamentRegisterTime time in utc",tournamentRegisterTime)
      console.log("tournament_time time in utc",tournament_time)*/

      if (currentTimeUtc <= tournamentRegisterTime) {
        return {
          status: 'fail',
          result: null,
          message: 'Registration not started.',
          statusCode: 400
        }
      } else if (currentTimeUtc >= tournamentRegisterTime && currentTimeUtc <= tournament_time) {
        //let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({_id: data.playerId});

        if (player) {

          if (player.chips >= (tournament.entry_fee + tournament.buy_in)) {
            let registeredPlayersArray = tournament.players;
            let playersSestionIds = tournament.playersSestionIds;
            if (registeredPlayersArray.includes(data.playerId)) {
              return {
                status: 'success',
                result: null,
                message: 'You are already registered for this tournament.',
                statusCode: 200
              }
            } else if (registeredPlayersArray.length >= tournament.max_players) {
              return {
                status: 'fail',
                result: null,
                message: 'Maximum players limit set.you are not allowed to register this tournament now.',
                statusCode: 400
              }
            } else {
              registeredPlayersArray.push(data.playerId);
              //deduct entry fee from player chips
              await Sys.App.Services.PlayerServices.updatePlayerData(
                {
                  _id: data.playerId
                }, {
                  chips: parseFloat(player.chips - parseFloat(tournament.entry_fee + tournament.buy_in)),
                }
              );
              // await module.exports.agentsUpdate(tournament.entry_fee, player, "register", data.tournamentId);
            
              let date = new Date()
              let timestamp1 = date.getTime();
              let sessionId= player.uniqId + "-" + tournament.tournamentNumber+"-" +timestamp1
              playersSestionIds.push(sessionId)
              await Sys.App.Services.TournamentServices.updateTourData({
                _id: data.tournamentId
              }, {
                  tournamentTotalChips: eval(tournament.tournamentTotalChips + parseFloat(tournament.buy_in + tournament.entry_fee) ),
                  players: registeredPlayersArray,
                  playersSestionIds:playersSestionIds
                }
              );

              let traNumber = + new Date()
              let sessionData={
                sessionId:sessionId,
                uniqId:player.uniqId,
                username:player.username,
                chips: parseFloat(tournament.entry_fee + tournament.buy_in),
                beforeBalance: player.chips,
                previousBalance: player.chips,
                afterBalance: parseFloat(player.chips - parseFloat(tournament.entry_fee + tournament.buy_in)),
                type:"entry",
                category:"debit",
                user_id:data.playerId,
                transactionNumber: 'DE-'+ traNumber,
                remark:"Tournament Entry Fee",
                isTournament: "true",
                gameNumber: data.tournamentId,
                gameId: data.tournamentId,
              }					
              await Sys.Game.Common.Services.ChipsServices.insertData(sessionData)

              let transactionData = {
                user_id: player.id,
                username: player.username,
                tableId: tournament.id,
                tableName: tournament.name,
                chips: (parseFloat(tournament.entry_fee) + parseFloat(tournament.buy_in)),
                previousBalance: parseFloat(player.chips),
                afterBalance: parseFloat(player.chips - parseFloat(tournament.entry_fee + tournament.buy_in)),
                category: 'debit',
                type: 'entry',
                remark: 'Joined',
                isTournament: 'Yes',
                isGamePot: 'no'
              }

              console.log("regular tournament register player transactionData: ", transactionData);
              await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);

              //push player to tournament database
              await Sys.App.Services.TournamentServices.updateTourData(
                {
                  _id: data.tournamentId
                }, {
                  players: registeredPlayersArray,
                }
              );


              return {
                status: 'success',
                result: {
                  playerId: data.playerId,
                },
                message: 'You are Registered Successfully.'
              }

            }

          } else {
            return {
              status: 'fail',
              result: null,
              message: "You don't have sufficient chips to register for this tournament.",
              statusCode: 400
            }
          }

        } else {

          return {
            status: 'fail',
            result: null,
            message: 'Player Not Found',
            statusCode: 400
          }

        }

      } else {

        return {
          status: 'fail',
          result: null,
          message: 'Tournament Started,You are not allowed to register for this tournament.',
          statusCode: 400
        }

      }
    } else {
      return {
        status: 'fail',
        result: null,
        message: 'Player Not Found',
        statusCode: 400
      }
    }
  },

  unRegisterTournament: async function (socket, data) {
    let tournament = await Sys.App.Services.TournamentServices.getTourData({ _id: data.tournamentId });

    let tournamentRegisterTime = moment(new Date(tournament.register_from_date_time)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format()
    let tournament_time = moment(new Date(tournament.tournament_date_time)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format()
    let currentTimeUtc = moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format();

    let player = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: data.playerId });
    let registeredPlayersArray = tournament.players;
    let playersSestionIds=tournament.playersSestionIds
    if (registeredPlayersArray.includes(data.playerId)) {
      if (currentTimeUtc >= tournament_time) {
        return {
          status: 'fail',
          result: null,
          message: 'Tournament is started,you can not leave.',
          statusCode: 400
        }
      } else {
        let sesstionId = playersSestionIds.splice(registeredPlayersArray.indexOf(data.playerId), 1);
        let index=registeredPlayersArray.indexOf(data.playerId);
        playersSestionIds.splice(playersSestionIds.indexOf(index),1)
        registeredPlayersArray.splice(registeredPlayersArray.indexOf(data.playerId), 1);
        let transactionDataLeft = {
          user_id: player.id,
          username: player.username,
          gameId: tournament.id,
          gameNumber: tournament.name,
          tableId: tournament.id,
          tableName: tournament.name,
          chips: (parseFloat(tournament.entry_fee) + parseFloat(tournament.buy_in)),
          previousBalance: parseFloat(player.chips),
          afterBalance: parseFloat(player.chips + parseFloat(tournament.entry_fee + tournament.buy_in)),
          category: 'credit',
          type: 'entry',
          remark: 'Un-Register',
          isTournament: 'Yes',
          isGamePot: 'no'
      }

      console.log("Player regular tournament unRegister transactionDataLeft: ", transactionDataLeft);
      await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataLeft);

        //Add entry fee from player chips
        await Sys.App.Services.PlayerServices.updatePlayerData(
          {
            _id: data.playerId
          }, {
            chips: parseFloat(player.chips + parseFloat(tournament.entry_fee + tournament.buy_in)),
            //players: registeredPlayersArray,
          }
        );
        // await module.exports.agentsUpdate(tournament.entry_fee, player, "unRegister", data.tournamentId);

        //remove player from tournament database
        console.log("tournament.tournamentTotalChips",tournament.tournamentTotalChips);
        
        
        await Sys.App.Services.TournamentServices.updateTourData(
          {
            _id: data.tournamentId
          }, {
            players: registeredPlayersArray,
            playersSestionIds:playersSestionIds,
            tournamentTotalChips: eval(tournament.tournamentTotalChips -  parseFloat(tournament.buy_in + tournament.entry_fee) ),

          }
        );
        
        let traNumber = + new Date()
        let sessionData={
          sessionId:sesstionId[0],
          uniqId:player.uniqId,
          user_id:data.playerId,
          username:player.username,
          chips: parseFloat(tournament.entry_fee + tournament.buy_in),
          beforeBalance: parseFloat(player.chips),
          previousBalance: parseFloat(player.chips),
          afterBalance: parseFloat(player.chips + parseFloat(tournament.entry_fee + tournament.buy_in)),
          type:"leave",
          category:"credit",
          remark:"Return Entry Fee on tournament leave",
          isTournament: "true",
          gameNumber: data.tournamentId,
          gameId: data.tournamentId,
          transactionNumber: 'DEP-'+ traNumber,
        }					


        await Sys.Game.Common.Services.ChipsServices.insertData(sessionData)


        return {
          status: 'success',
          result: {
            playerId: data.playerId,
          },
          message: 'You are Leaved Successfully from this Tournament.'
        }
      }
    } else {
      return {
        status: 'fail',
        result: null,
        message: 'You are Not registered for this tournament.',
        statusCode: 400
      }
    }

  },


  joinTournament: async function (socket, data){
    try {
      let room;
      let namespaceString;
      if(data.tournamentType == 'regular' || data.tournamentType == undefined || data.tournamentType == null){
        room = await Sys.Game.Reguler.Omaha.Controllers.TournamentProcess.joinTournament(data);
        namespaceString = (room.tableType == 'texas') ? Sys.Config.Namespace.CashRegularTexas :  Sys.Config.Namespace.CashRegularOmaha;
      }else{
        room = await Sys.Game.Sng.Texas.Controllers.TournamentProcess.joinTournament(data);
        namespaceString = (room.tableType == 'texas') ? Sys.Config.Namespace.CashSngTexas :  Sys.Config.Namespace.CashSngOmaha;
      }
      
      if(room instanceof Error){
        return { status: 'fail', result: null, message: room.message, statusCode: 401 }
      }
      if(!room){
        return { status: 'fail', result: null, message: 'Room not Found!', statusCode: 401 }
      }
      console.log("Room ID : ", room.id);

      // let minBuyIn = 0;
      // let maxBuyIn = 0;
      // //console.log("Limit Type : ",room.limit);
      // if(room.limit == 'limit'){
      //  // Limit Game
      //  minBuyIn = parseFloat(parseFloat(room.bigBlind) * 10); // minimun Buy in Amount 
      //  maxBuyIn = 0; // No Limit in Max Buyin Game.
      // }else if(room.limit == 'no_limit'){
      //  // No Limit
      //  minBuyIn = parseFloat(parseFloat(room.bigBlind) * 40);
      //  maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 100);
      // }else{
      //  // Pot Limit
      //  minBuyIn = parseFloat(parseFloat(room.bigBlind) * 40);
      //  maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 100);
      // }
 
      socket.leave(data.tournamentId);
      return {
        status: 'success',
        message: "Player Room Joind successfuly.",
        result: {
          roomId: room.id,
          namespaceString: namespaceString,
          pokerGameType: room.tableType,
          pokerGameFormat: 'tournament',
          isTournament: true,
          // tableNumber : room.tableNumber,
          // limitType : room.limit,
          // minBuyIn : minBuyIn,
          // maxBuyIn : maxBuyIn,
          //smallBlind : room.smallBlind,
          //bigBlind : room.bigBlind
         
        }
      };
    }
    catch (error) {
      console.log('Error in JoinRoom : ', error);
      return new Error('Error in JoinRoom', error);
    }
  },
 

}
