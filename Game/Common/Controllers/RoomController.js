 var Sys = require('../../../Boot/Sys');
 const moment  = require('moment');
 var arraySort = require('array-sort');
module.exports = {

  test: async function(socket,data){

      try {

          // Create new Room
          Sys.Log.info('data : ', data);

          Sys.Log.info('<=> Create New Room || ');

          let room = await Sys.Game.Common.Services.RoomServices.create(data);
          if (!room) {
              return { status: 'fail', result: null, message: 'No Room Created 1.', statusCode: 401 }
          }

          room = await Sys.Game.Common.Services.RoomServices.get(room.id); //// Just Get Table Data With Format.
          console.log("room Before :",room.players)
          room.AddPlayer();
          console.log("room After :",room)

          return room;



          //  let time = 0;

          //  var DaynamicNamespace = Sys.Io.of('/practice/'+data.namespace ).on('connection', function(nameSpaceSocket){
          //     console.log('Some One Connected....');
          //         Object.keys(Sys.Game.Practice.Points.Sockets).forEach(function(key){ // Register Socket File in Socket Variable
          //             Sys.Game.Practice.Points.Sockets[key](nameSpaceSocket);
          //         })


          //         setInterval(function(){
          //             console.log("Timer :",time);
          //             nameSpaceSocket.emit('timer',time );
          //             time++;
          //         }, 1000);


          //         console.log('user connected to ');
          // });

          // if(DaynamicNamespace){
          //     return {
          //         status: 'success',
          //         result: {
          //             url :  '/practice/'+data.namespace,
          //         },
          //         message: 'done'
          //     }
          // }else{
          //     return {
          //         status: 'fail',
          //         result: null,
          //         message: 'done'
          //     }
          // }

      } catch (error) {
          Sys.Log.info('Error in Test : ' + error);
      }

  },


  getStacks: async function (socket, data){
    try {
      let Stacks = await Sys.Game.Common.Services.RoomServices.getStacks();
      return {
        status: 'success',
        result: Stacks,
        message: 'Stacks List',
        statusCode: 200
      };
       
    }
    catch (e) {
      console.log("Error in getStacks :", e);
      return new Error(e);
    }
  },

  privateRoomLogin: async function(socket, data){
    try{
      var isRoom = await Sys.Game.CashGame.Texas.Services.RoomServices.getByData({_id:data.roomId});
      if(isRoom){
        let roomDetail = await Sys.Game.CashGame.Texas.Services.RoomServices.getByData({_id:data.roomId,tablePassword:data.password});
        if(roomDetail.length > 0){
          console.log("privateRoomLogin Password match: ", roomDetail);
          return { status: 'success',message: "table detail", result: roomDetail }
        }else{
          console.log("privateRoomLogin Password not match: ", data.password);
          return { status: 'fail', result: null, message: "Password was wrong", statusCode: 401 } 
        }
      }else{
        console.log("privateRoomLogin room id not match: ", data.roomId);
        return { status: 'fail', result: null, message: "Room not available", statusCode: 401 } 
      }
    }catch(error){
      console.log("Error when private room login check: ", error);
      return { status: 'fail', result: null, message: "Fail to login", statusCode: 401 }
    }
  },


  listRooms: async function (socket, data){
    try {
      //console.log("Data :",data)
      let query = {
        isTournamentTable : false,
        status: { "$ne": 'Closed' }
      };

      if(data.game.toLowerCase() != 'all'){
        query.limit = data.game;
      }
      if(data.stacks.toLowerCase() != 'all'){
      
        let stac = data.stacks.split('/');
        query.smallBlind = stac[0];
        query.bigBlind = stac[1];
      }
      if(data.maxPlayer.toLowerCase() != 'all'){
        query.maxPlayers = parseInt(data.maxPlayer);
      }

      if(data.currencyType.toLowerCase() == 'cash'){
        query.currencyType = 'cash';
      }else{
        query.currencyType = 'chips';
      }

      if(data.pokerGameType.toLowerCase() != 'all'){
        query.tableType = data.pokerGameType;
      }

    //  console.log("Query :",query);

      let rooms = await Sys.Game.Common.Services.RoomServices.getByDataPara(query,false,false, {smallBlind:1});
    
      if (rooms) {
        var result = [];
        rooms.forEach(function (room) {

          let playerCount = 0;
          room.players.forEach(function (player){
            if(player.status != 'Left'){
              playerCount++;
            }
          });

          room.waitingPlayers.forEach(function(player){	
            if(player.status != 'Left'){	
              playerCount++;	
            }	
          });

          // if (data.playerPerTable == 'all' || data.playerPerTable) {

            let minBuyIn = 0;
            let maxBuyIn = 0;
           
            // console.log("Room name : ",room.name);
            // console.log("Limit Type : ",room.limit);
            // console.log("room.smallBlind : ",room.smallBlind);
            // console.log("(room.bigBlind : ",room.bigBlind);


            if(room.limit == 'limit'){
              // Limit Game
              minBuyIn = parseFloat(parseFloat(room.bigBlind) * 10); // minimun Buy in Amount 
              maxBuyIn = 0; // No Limit in Max Buyin Game.
            }else if(room.limit == 'no_limit'){
              // No Limit
              minBuyIn = parseFloat(parseFloat(room.smallBlind) * 80);
              maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
            }else{
              // Pot Limit
              minBuyIn = parseFloat(parseFloat(room.smallBlind) * 80);
              maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
            }

            var isPasswordProtected = false;
            if(room.tablePrivacy == "private"){
              var isPasswordProtected = true;
            }
            
            let type;
            if(room.limit == 'limit'){
              if(room.tableType == 'texas'){
                type = 'LTH'
              }else{
                type = 'LOH'
              }
            }else if(room.limit == 'no_limit'){
              if(room.tableType == 'texas'){
                type = 'NLTH';
              }else{
                type = 'NLOH'
              }
            }else if(room.limit == 'pot_limit'){
              if(room.tableType == 'texas'){
                type = 'PLTH';
              }else{
                type = 'PLOH'
              }
            }else if(room.limit == 'Hi-Lo'){
              type = 'H/LNLOH'
            }else if(room.limit == 'Hi-Lo-limit'){
              type = 'H/LLOH'
            }else if(room.limit == 'Hi-Lo-pot_limit'){
              type = 'H/LPLOH'
            }

          result.push({
            roomId: room.id,
            type: type,
            roomName: room.name,
            status: room.status,
            smallBlind: room.smallBlind,
            bigBlind: room.bigBlind,
            stake: room.smallBlind+'/'+room.bigBlind,
            playerCount: playerCount,
            pot: (room.game != null ? room.game.pot : 0),
            minBuyIn: room.minBuyIn,
            maxPlayers: room.maxPlayers,
            maxBuyIn: room.maxBuyIn,
            gameLimit: room.limit,
            minBuyIn : room.minBuyIn,
            maxBuyIn : room.maxBuyIn,
            isPasswordProtected: isPasswordProtected,
            pokerGameType: room.tableType,
            namespaceString: (room.tableType == 'texas') ? Sys.Config.Namespace.CashTexas : Sys.Config.Namespace.CashOmaha,
            isGPSRestriction: room.isGPSRestriction,
            isIPAddressRestriction: room.isIPAddressRestriction
 
          });
          //}
        });
        //console.log("searchLoby result",result)

        //await arraySort(result,'minBuyIn');

        let sortResult = result.sort(
           function(a, b) {        
              if (b.playerCount > a.playerCount) {
                 return b.playerCount - a.playerCount ? 1 : -1;
              }
              if(a.playerCount > b.playerCount){
                return a.playerCount - b.playerCount ? -1 : 1;
              }
              return a.smallBlind > b.smallBlind ? 1 : -1 ;
           });
        
        return {
          status: 'success',
          result: sortResult,
          message: 'Table Available',
          statusCode: 200
        };
      }
      return {
        status: 'success',
        result: null,
        message: 'No Rooms Found.',
        statusCode: 200
      }
    }
    catch (e) {
      console.log("Error in listRooms :", e);
      return new Error(e);
    }
  },

  getRunningGameList: async function (socket, data){
    try {
      //console.log("Data :",data)
      let query = {
        //isTournamentTable : false,
        status: { "$ne": 'Closed' },
      };

      var playerId = data.playerId;


    //  console.log("Query :",query);

      let rooms = await Sys.Game.Common.Services.RoomServices.getByData(query);
      if (rooms) {
        var result = [];
        rooms.forEach(function (room) {

          let playerCount = 0;
          var playerIdArr = [];
          room.players.forEach(function (player){
            if(player.status != 'Left'){
              playerIdArr.push(player.id);
              playerCount++;
            }
          });

          //console.log("room name: ", room.name);
          //console.log("playerIdArr: ", playerIdArr);
          if(playerIdArr.indexOf(playerId) > -1){
            // if (data.playerPerTable == 'all' || data.playerPerTable) {

            let minBuyIn = room.minBuyIn;
            let maxBuyIn = room.maxBuyIn;
           
            /* if(room.limit == 'limit'){
              // Limit Game
              minBuyIn = parseFloat(parseFloat(room.bigBlind) * 10); // minimun Buy in Amount 
              maxBuyIn = 0; // No Limit in Max Buyin Game.
            }else if(room.limit == 'no_limit'){
              // No Limit
              minBuyIn = parseFloat(parseFloat(room.smallBlind) * 80);
              maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
            }else{
              // Pot Limit
              minBuyIn = parseFloat(parseFloat(room.smallBlind) * 80);
              maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
            } */

            var isPasswordProtected = false;
            if(room.tablePrivacy == "private"){
              var isPasswordProtected = true;
            }
            let tournamentId = "";
            if(room.isTournamentTable == true){
              tournamentId = room.tournament;
            }
            let namespaceString = Sys.Config.Namespace.CashTexas;
            if(room.tableType == 'texas' && room.tournamentType == "sng"){
              namespaceString = Sys.Config.Namespace.CashSngTexas;
            }else if(room.tableType == 'omaha' && room.tournamentType == "sng"){
              namespaceString = Sys.Config.Namespace.CashSngOmaha;
            }else if(room.tableType == 'texas' && room.tournamentType == "regular"){
              namespaceString = Sys.Config.Namespace.CashRegularTexas;
            }else if(room.tableType == 'omaha' && room.tournamentType == "regular"){
              namespaceString = Sys.Config.Namespace.CashRegularOmaha;
            }else if(room.tableType == 'omaha' && room.isTournamentTable == false){
              namespaceString = Sys.Config.Namespace.CashOmaha;
            }

            result.push({
              tournamentId: tournamentId,
              isTournament: (tournamentId) ? true: false,
              roomId: room.id,
              type: room.gameType,
              roomName: room.name,
              status: room.status,
              smallBlind: room.smallBlind,
              bigBlind: room.bigBlind,
              stake: room.smallBlind+'/'+room.bigBlind,
              playerCount: playerCount,
              pot: (room.game != null ? room.game.pot : 0),
              minBuyIn: room.minBuyIn,
              maxPlayers: room.maxPlayers,
              maxBuyIn: room.maxBuyIn,
              gameLimit: room.limit,
              minBuyIn : minBuyIn,
              maxBuyIn : maxBuyIn,
              isPasswordProtected: isPasswordProtected,
              //namespaceString: (room.tableType == 'texas') ? Sys.Config.Namespace.CashTexas : Sys.Config.Namespace.CashOmaha,
              namespaceString: namespaceString,
              pokerGameType: room.tableType,
            });
          }
        });
        
        console.log("getRunningGameList result",result)
        
        return {
          status: 'success',
          result: result,
          message: 'Table Available',
          statusCode: 200
        };
      }
      return {
        status: 'success',
        result: null,
        message: 'No Rooms Found.',
        statusCode: 200
      }
    }
    catch (e) {
      console.log("Error in listRooms :", e);
      return new Error(e);
    }
  },  

  SearchSngLobby: async function (socket,data){
    try {

        
        let query={};

        if(data.game != 'all'){
          query.game = data.game;
        }
        if(data.stacks != 'all'){
          
          /*let stack = await Sys.Game.Common.Services.RoomServices.getStackById(data.stackId);
          if(!stack){
            return {  status: 'fail',  result: null,  message: 'Stack Not Found!', statusCode: 400  };
          }*/
          query.stacks = data.stacks;
        }
        if(data.maxPlayer.toLowerCase() != 'all'){
          query.max_players = parseInt(data.maxPlayer);
        }
        
        //let sngTournament = await Sys.Game.Common.Services.sngTournamentServices.getByData(query,{name:1,max_players:1,blind_levels_rise_time:1,buy_in:1});
        let sngTournament = await Sys.Game.Common.Services.sngTournamentServices.getByData(query);
        if (sngTournament && sngTournament.length>0) {
          var result = [];
          let count = 1;
          sngTournament.forEach(function (sng) {
            let playerCount = sng.players.length;
            result.push({
              type: sng.game,
              name: sng.name,
              seat: sng.max_players,
              blinds: sng.blind_levels_rise_time,
              minBuyIn: sng.buy_in,
              roomId: count++,
              playerCount: playerCount,
              maxPlayers: sng.max_players,
              status: sng.status,
            });
          });

          //await arraySort(result,'minBuyIn');

          return {
            status: 'success',
            result: result,
            message: 'Available Sit & Go Tournament',
            statusCode: 200
          }
        }

        return {
          status: 'fail',
          result: null,
          message: 'No Sit & Go Tournament Found.',
          statusCode: 401
        }
    }
    catch (e) {
      console.log("Error in Searching Sit & Go Tournament :", e);
      return new Error(e);
    }
  },

  SearchTournamentLobby: async function (socket,data){
    try {

        let query={};

        if(data.game != 'all'){
          query.game = data.game;
        }
        if(data.stacks != 'all'){
         /* let stack = await Sys.Game.Common.Services.RoomServices.getStackById(data.stackId);
          if(!stack){
            return {  status: 'fail',  result: null,  message: 'Stack Not Found!', statusCode: 400  };
          }*/
          query.stacks = data.stacks;
        }
        if(data.maxPlayer.toLowerCase() != 'all'){
          query.max_players = parseInt(data.maxPlayer);
        }
        console.log(query)
        let Tournaments = await Sys.Game.Common.Services.TournamentServices.getByData(query);
        
        if (Tournaments && Tournaments.length > 0) {

          var result = [];
           let count = 1;
          Tournaments.forEach(function (tournament) {
            let playerCount = tournament.players.length;

            let dateDuration= module.exports.calculateDateDuration(tournament.tournament_date_time)
            
            result.push({
              type: 'limit',
              name: tournament.name,
              seat: tournament.max_players,
              blinds: tournament.blind_levels_rise_time,
              minBuyIn: tournament.buy_in,
              roomId: count++,
              date: dateDuration,
              buyIn: tournament.stacks,
              players:playerCount+'/'+tournament.max_players, 
              status: tournament.status,
              playerCount: playerCount,
              maxPlayers: tournament.max_players,
               
            });
           
          });

          //await arraySort(result,'minBuyIn');

          return {
            status: 'success',
            result: result,
            message: 'Available Tournaments',
            statusCode: 200
          }
        }

        return {
          status: 'fail',
          result: null,
          message: 'No Tournaments Found.',
          statusCode: 401
        }
    }
    catch (e) {
      console.log("Error in Searching Tournaments :", e);
      return new Error(e);
    }
  },

  calculateDateDuration: function(date){
        var  date1 = new Date() // 10:20 is 11 mins
        var date2 = new Date(date); // 10:09 to
        
            if(date1 >= date2){
              return "-";
            }else{
              var one_day = 1000*60*60*24;
              var date1_ms = date1.getTime();
              var date2_ms = date2.getTime();
              var difference_ms = date2_ms - date1_ms;
            
              difference_ms = difference_ms/1000;
              var seconds = Math.floor(difference_ms % 60);
              difference_ms = difference_ms/60; 
              var minutess = Math.floor(difference_ms % 60);
              difference_ms = difference_ms/60; 
              var hours = Math.floor(difference_ms % 24);  
              var days = Math.floor(difference_ms/24);

              return startsIn = days + ' Days, ' + hours + ' Hours, ' + minutess + ' Minutes';
              
            }  
  },

  showFoldedPlayerCards: async function (socket, data){
    try {
      if( data.gameId ){
        var player = await Sys.Game.CashGame.Texas.Services.PlayerServices.getById(data.playerId);
        console.log("show card player", player);
        if(!player){
          return {  status: 'fail', result: null, message: "Player Not found!",statusCode: 404  };
        }
        let room = await Sys.Game.CashGame.Texas.Services.RoomServices.get(data.roomId);
        if (!room || room == undefined) {
          return {  status: 'fail', result: null, message: "Room Not found!",statusCode: 404  };
        }
        
        let playerCards = []; 
        console.log("syss", Sys.Rooms[data.roomId]);
        console.log("show folded players cards", Sys.Rooms[data.roomId].players )
        for(let g= 0; g < Sys.Rooms[data.roomId].players.length; g++){
          if(Sys.Rooms[data.roomId].players[g].id == data.playerId){
            if(Sys.Rooms[data.roomId].players[g].folded == true){
              playerCards = Sys.Rooms[data.roomId].players[g].cards;
            }
            
            break;
          }
        }
        console.log("show folded player cards", playerCards)

        if(playerCards.length != 0){
          return {
            status: 'success',
            result: {
              gameId : data.gameId ,
              cards: playerCards
            },
          };
        }else{
          return {
            status: 'fail',
            result: {
              
            },
          };
        }
        
      }else{
        console.log("gameID ie empty in showFoldedPlayerCards", data.roomID, data.playerId);
        Sys.Log.info("gameID ie empty in showFoldedPlayerCards", data.roomID, data.playerId);
        return {
          status: 'success',
        };
      }
      
    }
    catch (e) {
      console.log("Error in showFoldedPlayerCards : ", e);
      return new Error(e);
    }
  },
  
//START: Chirag 30-08-2018 this function use to player remove from game when system undermaintainance time start
  playerRemoveBySystem: async function(room){
    //if(playerDetail == ""){
      if(room.players.length > 0){
        for(var rm=0; rm<room.players.length; rm++){
          var roomId = room.id;
          var playerId = room.players[rm].id;
          await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:roomId,playerId:playerId});
          var plySocketId = room.players[rm].socketId;

          let query = {isTournamentTable : false};
          let allRooms = await Sys.Game.Common.Services.RoomServices.getByData(query);

          var isPlaying = 0;
          if(allRooms.length > 0){
            for(var i=0; i<allRooms.length; i++){
              var rmPlyList = allRooms[i].players;
              for(var j=0; j<rmPlyList.length; j++){
                var plyDetail = rmPlyList[j];
                if(plyDetail.status=="Playing" && playerId == plyDetail.id){
                  isPlaying = 1;
                  break;
                }
                console.log("plyDetail.status: ", plyDetail.status);
                if(plyDetail.status=="Waiting" && playerId == plyDetail.id){
                  await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:allRooms[i].id,playerId:playerId});
                }
              }
            }
          }

          console.log("playerRemoveBySystem isPlaying: ", isPlaying);

          if(isPlaying == 0){

            var socketIdArr = plySocketId.split('#');
            console.log("socketIdArr: ", socketIdArr);
            if(socketIdArr.length > 1){
              var socketId = socketIdArr[1];
            }else{
              var socketId = socketIdArr[0];
            }
            if(Sys.Setting.maintenance.quickMaintenance != "active"){
              await Sys.Io.to(socketId).emit('forceLogOut',{
                playerId :  playerId,
                message: Sys.Setting.maintenance.message + '\n You can login after ' + Sys.Setting.maintenance.maintenance_end_date,
              });
            }else{
              await Sys.Io.to(socketId).emit('forceLogOut',{
                playerId :  playerId,
                message: Sys.Setting.maintenance.message + '\n We will come back very shortly!' ,
              });
            }
            

            //await Sys.Io.sockets.connected[socketId].disconnect();

            await Sys.Game.Common.Services.PlayerServices.update({_id: playerId},{socketId:''});
          }
        }
      }
      if(room.waitingPlayers.length > 0){
        for(var rm=0; rm<room.waitingPlayers.length; rm++){
          var roomId = room.id;
          var playerId = room.waitingPlayers[rm].id;
          await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoom({roomId:roomId,playerId:playerId});
          var plySocketId = room.waitingPlayers[rm].socketId;

          let query = {isTournamentTable : false};
          let allRooms = await Sys.Game.Common.Services.RoomServices.getByData(query);

          var isPlaying = 0;
          if(allRooms.length > 0){
            for(var i=0; i<allRooms.length; i++){
              var rmPlyList = allRooms[i].waitingPlayers;
              console.log("RM LIST",rmPlyList)
              for(var j=0; j<rmPlyList.length; j++){
                var plyDetail = rmPlyList[j];
                if(plyDetail.status=="Waiting" && playerId == plyDetail.id){
                  isPlaying = 1;
                  break;
                }
                console.log("plyDetail.status: ", plyDetail.status);
                if(plyDetail.status=="Left" && playerId == plyDetail.id){
                  await Sys.Game.CashGame.Texas.Controllers.RoomProcess.leftRoomForWaitingPlayers({roomId:allRooms[i].id,playerId:playerId});
                }
              }
            }
          }

          console.log("playerRemoveBySystem isPlaying: ", isPlaying);

          if(isPlaying == 0){

            var socketIdArr = plySocketId.split('#');
            console.log("socketIdArr: ", socketIdArr);
            if(socketIdArr.length > 1){
              var socketId = socketIdArr[1];
            }else{
              var socketId = socketIdArr[0];
            }
            if(Sys.Setting.maintenance.quickMaintenance != "active"){
              await Sys.Io.to(socketId).emit('forceLogOut',{
                playerId :  playerId,
                message: Sys.Setting.maintenance.message + '\n You can login after ' + Sys.Setting.maintenance.maintenance_end_date
              });
            }else{
              await Sys.Io.to(socketId).emit('forceLogOut',{
                playerId :  playerId,
                message: Sys.Setting.maintenance.message + '\n We will come back very shortly!' ,
              });
            }
            

            //await Sys.Io.sockets.connected[socketId].disconnect();

            await Sys.Game.Common.Services.PlayerServices.update({_id: playerId},{socketId:''});
          }
        }
      }
    /*}else{
      var socketId = playerDetail.socketId;
      var playerId = playerDetail.id;
      
      await Sys.Io.to(socketId).emit('forceLogOut',{
        playerId :  playerId,
        message: "System under maintenance, please login after sometimes",
      });

      //await Sys.Io.sockets.connected[socketId].disconnect();

      await Sys.Game.Common.Services.PlayerServices.update({_id: playerId},{socketId:''});

    }*/
  },
//END: Chirag 30-08-2018 this function use to player remove from game when system undermaintainance time start

  getBuyinsAndPlayerchips: async function(socket, data){
    try{
      // let checkDistance = await Sys.Game.Common.Controllers.RoomController.LocationTableValidation(socket,data);
    
      
      // if(checkDistance.status == 'fail'){
      //   return{
      //     status: 'fail',
      //     message: 'Someone playing nearby to you',
      //     result: null,
      //     statusCode: 401
      //   }
      // }
      
      let room = await Sys.Game.Common.Services.RoomServices.getById(data.roomId);
      let player = await Sys.Game.Common.Services.PlayerServices.getById(data.playerId);

    
      if (!room || room == undefined || !player || player == undefined) {
        return {
          status: 'fail',
          result: null,
          message: "Data not found",
          statusCode: 404
        };
      }

      let minBuyIn = room.minBuyIn;
      let maxBuyIn = room.maxBuyIn;
       
      if(room.limit == 'limit'){
        // minBuyIn = parseFloat(parseFloat(room.bigBlind) * 10); // minimun Buy in Amount
        maxBuyIn = player.chips; // No Limit in Max Buyin Game.
      }else if(room.limit == 'no_limit'){
        // minBuyIn = parseFloat(parseFloat(room.smallBlind) * 80);
        maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
        maxBuyIn = minBuyIn >= maxBuyIn ? minBuyIn * 2: maxBuyIn;
        maxBuyIn = maxBuyIn > player.chips? player.chips : maxBuyIn;
      }else{
        // minBuyIn = parseFloat(parseFloat(room.smallBlind) * 80);
        maxBuyIn = parseFloat(parseFloat(room.bigBlind) * 200);
        maxBuyIn = minBuyIn >= maxBuyIn ? minBuyIn * 2: maxBuyIn;
        maxBuyIn = maxBuyIn > player.chips? player.chips : maxBuyIn;
      }

      maxBuyIn = (player.chips < maxBuyIn )? player.chips : maxBuyIn ;

      if (player.chips < minBuyIn) {
        return {
          status: 'fail',
          message: 'You do not have enough chips to play in this table.'
        };
      }

      // check for oldPlayer chips, it needs to be >= than previous chips
      let oldPlayer = null;
      let oldPlayerLeftTimeDiff = null;
      if(room){
        if (room.players.length > 0) {
          for (let i = 0; i < room.players.length; i++) {
            if (room.players[i].id == player.id && room.players[i].status == 'Left') { // && room.players[i].status == 'Left' Remove by Me
              oldPlayer = room.players[i];
              break;
            }
          }
        }

        if(oldPlayer == null){
          if (room.oldPlayers.length > 0) {
            for (let i = 0; i < room.oldPlayers.length; i++) {
              if (room.oldPlayers[i].id == player.id && room.oldPlayers[i].status == 'Left') { // && room.players[i].status == 'Left' Remove by Me
                oldPlayer = room.oldPlayers[i];
                break;
              }
            }
          }
        }

        if(oldPlayer){
          let oldPlayerLeftTime=moment(new Date(oldPlayer.oldPlayerLeftTime)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format();
          oldPlayerLeftTimeDiff = moment.duration(moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).diff(moment(new Date(oldPlayer.oldPlayerLeftTime)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone))).asMinutes();
          console.log("oldPlayerLeftTime", oldPlayerLeftTime)
          console.log("Current time", moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format())
          console.log("oldPlayerLeftTimeDiff", oldPlayerLeftTimeDiff)
          if( oldPlayer.chips > minBuyIn  && (Sys.Config.Texas.oldPlayerLeftTimeInMin) >= oldPlayerLeftTimeDiff){
            if(player.chips < oldPlayer.chips){
              return {
                status: 'fail',
                message: `zu wenig Chips. Das min. Buy-In beträgt ${oldPlayer.chips} \n Low chips. The min. Buy-in is ${oldPlayer.chips} `
              };
            }
          }
        }

      }

      return {
        status: 'success',
        message: "Room and Player data found!",
        result: {
          minBuyIn : minBuyIn,
          maxBuyIn : maxBuyIn,
          playerChips: parseFloat(player.chips)
        }
      };
      
    }catch(e){
      Sys.Log.info("error in getBuyinsAndPlayerchips", e);
    }
  },
  
 /* LocationTableValidation: async function(socket,data){
    try{
     
      let room =  await Sys.Game.Common.Services.RoomServices.getById(data.roomId);
      let player = await Sys.Game.CashGame.Texas.Services.PlayerServices.getById(data.playerId);
      
      return await Sys.Game.Common.Controllers.RoomController.checkPlayerDistance(room,player,data.latitude,data.longitude,data.playerId);
     
    }catch(e){
      console.log("Error in LocationTableValidation",e);
    }
  },

  checkPlayerDistance : async function(room,player,latitude,longitude,playerId){
    
    if(room.isGPSRestriction !=false)
    {
      let updateLocation =  await Sys.Game.Common.Services.PlayerServices.update({_id:playerId},{
        latitude:latitude,longitude:longitude
      });
     

     if (room.players.length > 0) {
       for (let i = 0; i < room.players.length; i++) {
         if(room.players[i].id != player._id){
          if (room.players[i].status != 'Left') {
            var dist;
             if((room.players[i].latitude ==player.latitude) && (room.players[i].longitude==player.longitude))
             {
              return{
                      status: 'fail',
                      message: 'Someone playing nearby to you',
                      result: null,
                      statusCode: 401
                    }
             }else{
              var radlat1 = Math.PI * room.players[i].latitude/180;
              var radlat2 = Math.PI * player.latitude/180;
              var theta = room.players[i].longitude - player.longitude;
              var radtheta = Math.PI * theta/180;
              var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
              if (dist > 1) {
                dist = 1;
              }
              dist = Math.acos(dist);
              dist = dist * 180/Math.PI;
              dist = dist * 60 * 1.1515;
              dist = dist * 1000;
              console.log("DISTANCE",dist)
              if(dist < room.radiousPoint){
                
                return{
                  status: 'fail',
                  message: 'Someone playing nearby to you',
                  result: null,
                  statusCode: 401
                }
             }
            
           }
          }
         }
        
     }
     
    } 
      return{
        status: 'success',
        message: '',
        statusCode: 200
      }
    }else{
      return{
        status: 'fail',
        message: 'GPS Restriction is not allowed',
        result: null,
        statusCode: 401
      }
    }
  }*/
}
