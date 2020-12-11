'use strict';
var Sys = require('../../../Boot/Sys');

const mongoose = require('mongoose');
const roomModel  = mongoose.model('room');
const stacksModel  = mongoose.model('stacks');
const playerGameHistoryModel  = mongoose.model('playerGameHistory');
const playerModel = mongoose.model('player');

module.exports = { 
  getStacks: async function(data){
    try {
        return  await stacksModel.find({});
    } catch (error) {
        Sys.Log.info('Room Service Error in getStacks : ' + error);
    }
  },
  getStackById: async function(id){
    try {
        return  await stacksModel.findById(id);
    } catch (error) {
        Sys.Log.info('Room Service Error in getStack By ID : ' + error);
    }
  },
  getAllRoom: async function(data){
    try {
      return await roomModel.find({});
    }
    catch (error) {
      console.log('Room Service Error in getAllRoom : ' + error);
      return new Error(error);
    }
  },

  getById: async function(id){
    try {
      return await roomModel.findById(id);
    }
    catch (error) {
      Sys.Log.info('Error in getByData : ' + error);
    }
  },

  getByData: async function(data){
    try {
      return await roomModel.find(data);
    }
    catch (error) {
      console.log('Room Service Error in getByData : ' + error);
      return new Error(error);
    }
  },

  getByDataPara: async function(query, length, start, sort = ''){
    try {
      if(sort != ""){
        return  await roomModel.find(query).skip(start).limit(length).sort(sort);
      }else{
        return  await roomModel.find(query).skip(start).limit(length).sort({createdAt:-1});
      }
    } catch (e) {
      console.log("Error",e);
    }
  },

  getCount: async function(){
    try {
      return await roomModel.countDocuments({});
    }
    catch (error) {
      console.log('Room Service Error in getCount : ' + error);
      return new Error(error);
    }
  },

  // create: async function(data){
  //     console.log('Create Room Called -------:',data)
  //     try {
  //         let tableCount = await roomModel.countDocuments({'gameType': 'points'});
        
  //         Sys.Log.info('<=> tableCount|| '+tableCount);
  //         let tableNumber = 'RPP' + (tableCount + 1);

  //         let roomObj = {
  //             "tableType": data.gameType.toLowerCase(),
  //             "name": data.gameType+' Rummy',
  //             "dealer" : 0,
  //             "minPlayers": 2,
  //             "maxPlayers": data.noOfSeats,
  //             "tableNumber": tableNumber,
  //             "status": "waiting",
  //             "type": data.type.toLowerCase(),
  //             "owner": "user",
  //             "gameType" : data.gameType.toLowerCase(),
  //             "players": [],
  //             "gameWinners": [],
  //             "gameLosers": [],
  //             "game": null,
  //             "currentPlayer": 0,
  //             "gameLimit": false,
  //             "entryFees" :data.entry_fee,
  //             "varient" : "RR",
  //             "numberOfDecks" : 2,
  //             "printedJoker" : 2,
  //             "timerStart" : false,
  //             "gameOverPoint" : data.gameOverPoint,
              
  //         }

  // 		let room =  new Sys.Game.Practice.Points.Entities.Room(null,roomObj.tableType,roomObj.name, roomObj.tableNumber, roomObj.dealer, roomObj.minPlayers, roomObj.maxPlayers, roomObj.type, roomObj.owner, roomObj.gameType, roomObj.entryFees, roomObj.currentPlayer, roomObj.players,   roomObj.gameWinners, roomObj.gameLosers, roomObj.status, roomObj.game, roomObj.varient,roomObj.numberOfDecks,roomObj.printedJoker,roomObj.timerStart,roomObj.gameOverPoint);
          
  //         let roomSave = new roomModel(room);
  //         room = await roomSave.save(); // Save Room
  //         if(room){
  //                 // Let's Create Namespace For Room.
            
  //                 let namespace =  room.type+'_'+room.gameType+'/'+room.id;
  //                 console.log('namespace',namespace);
  //                 let dyn_ns = Sys.Io.of(namespace).on('connection', function(nameSpaceSocket){
  //                      console.log('User Connected To Practice Points New Namespace');
  //                      Object.keys(Sys.Game.Practice.Points.Sockets).forEach(function(key){ // Register Socket File in Socket Variable
  //                         Sys.Game.Practice.Points.Sockets[key](nameSpaceSocket)
  //                     })
  //                 }); 


  //                 Sys.Rooms[room.id]  = new Sys.Game.Practice.Points.Entities.Room(room.id, room.tableType,room.name, room.tableNumber, room.dealer, room.minPlayers, room.maxPlayers, room.type, room.owner, room.gameType, room.entryFees, room.currentPlayer, room.players,   room.gameWinners, room.gameLosers, room.status, room.game, room.varient,room.numberOfDecks,room.printedJoker,room.timerStart,room.gameOverPoint); // Save room in Rooms object

                  
  //                 return Sys.Rooms[room.id]; // return Room 

  //         }else{
  //             return new Error("Room Not Created !");
  //         }
          

  //     } catch (error) {
  //         Sys.Log.info('Error in Create Room : ' + error);
  //        // return  error; 
  //     }
  // },

  get: async function(id){
    try {
      if(Sys.Rooms[id]){
        console.log("->>>>>>>>>>>>>>>>>>>>>>.");
        return Sys.Rooms[id];
      }
      else{
        let room = await roomModel.findOne({'_id' :id});
        let namespace = room.type+'_'+room.gameType+'/'+room.id;
        let dyn_ns = Sys.Io.of(namespace).on('connection', function(nameSpaceSocket){
          console.log('Create New User Connected To Practice Points New Namespace');
          Object.keys(Sys.Game.Practice.Points.Sockets).forEach(function(key){ // Register Socket File in Socket Variable
            Sys.Game.Practice.Points.Sockets[key](nameSpaceSocket)
          });
        }); 

        Sys.Rooms[room.id]  = new Sys.Game.Practice.Points.Entities.Room(room.id, room.tableType,room.name, room.tableNumber, room.dealer, room.minPlayers, room.maxPlayers, room.type, room.owner, room.gameType, room.entryFees, room.currentPlayer, room.players,   room.gameWinners, room.gameLosers, room.status, room.game, room.varient,room.numberOfDecks,room.printedJoker,room.timerStart,room.gameOverPoint); // Save room in Game object
        return Sys.Rooms[room.id];
      }
    }
    catch (error) {
      console.log('Error in Get Room : ' + error);
      return new Error(error);
    }
  },

  resetAllRoom : async function(){
    try {
      let rooms = await roomModel.find({});
      for(let r = 0; r < rooms.length; r += 1){
        if( rooms[r].isTournamentTable == false){
          rooms[r].status = 'Waiting';
          try{
            console.log("player", rooms[r].players.length)
            if(rooms[r].players.length > 0){
              for(let p =0; p < rooms[r].players.length; p++){
               let dataPlayer = await Sys.Game.CashGame.Texas.Services.PlayerServices.getById(rooms[r].players[p].id);
                if (dataPlayer && rooms[r].players[p].isAllinPlayersChipsAssigned == false) {
                  let chips = parseFloat(dataPlayer.chips) + parseFloat(rooms[r].players[p].chips);
                  console.log("total chips", chips, rooms[r].players[p].id);
                  let playerUpdate = await Sys.Game.CashGame.Texas.Services.PlayerServices.update(rooms[r].players[p].id, { chips: chips });  
                } 
              }
            }else{
              console.log("players not found");
            }
          }catch(e){
            Sys.Log.info('Error in while assigning chips during game reset server : ' + e);
          } 
        }else{
          if(rooms[r].tournamentType != "sng"){
            rooms[r].status = 'Closed';
          }    
        }
        rooms[r].timerStart = false;
        rooms[r].players = [];
        //room.oldPlayers = [];
        rooms[r].waitingPlayers = [];
        rooms[r].gameWinners = [];
        rooms[r].gameLosers = [];
        rooms[r].dealer = 0;
        rooms[r].game = null;
        rooms[r].turnBet = [];
        let updatedGame = await roomModel.updateOne({
        _id: rooms[r].id
        }, rooms[r], {
          new: true
        });
      }

     /* rooms.forEach( async function(room) {  
        if( room.isTournamentTable == false){
          room.status = 'Waiting';
          try{
            console.log("player", room.players.length)
            if(room.players.length > 0){
              for(let p =0; p < room.players.length; p++){
               let dataPlayer = await Sys.Game.CashGame.Texas.Services.PlayerServices.getById(room.players[p].id);
                if (dataPlayer && room.players[p].isAllinPlayersChipsAssigned == false) {
                  let chips = parseFloat(dataPlayer.chips) + parseFloat(room.players[p].chips);
                  console.log("total chips", chips)
                  let playerUpdate = await Sys.Game.CashGame.Texas.Services.PlayerServices.update(room.players[p].id, { chips: chips });  
                } 
              }
            }else{
              console.log("players not found");
            }
          }catch(e){
            Sys.Log.info('Error in while assigning chips during game reset server : ' + e);
          } 
        }else{
          room.status = 'Closed';
        }
        room.timerStart = false;
        room.players = [];
        //room.oldPlayers = [];
        room.gameWinners = [];
        room.gameLosers = [];
        room.dealer = 0;
        room.game = null;
        room.turnBet = [];
       
        let updatedGame = await roomModel.updateOne({
        _id: room.id
        }, room, {
          new: true
        });
      });*/

    }
    catch (error) {
      Sys.Log.info('Error in reset All Room  : ' + error);
    }
  },
  clearAllHistory : async function(){
    try {
       await playerGameHistoryModel.remove();
    }
    catch (error) {
      Sys.Log.info('Error in reset All Room  : ' + error);
    }
  },

  /*checkLocation : async function(data){
    try{
      console.log("DATA",data)
      var lat = parseFloat(data.latitude);
      var long = parseFloat(data.longitude); 
      console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
      console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
      console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
      console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
      console.log('lat', lat);
      console.log('long', long);
      console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
      console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
      console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
      console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
      
    let geo = playerModel.aggregate([
				{
					"$geoNear": {
				        "near": {
				            "type": "Point",
				            "coordinates": [long,lat]
				        }, 
				        "spherical": true,
				        "distanceField": "distance",
				        // 'maxDistance': (10 * 1609.34), // miles to meter
						// 'distanceMultiplier': 0.000621371
				    }
        }
      ]);
      console.log("GEO",geo)
      return geo;
    }catch(error){
      console.log("Error in checkLocation",error);
    }
  }*/

}
 
 
