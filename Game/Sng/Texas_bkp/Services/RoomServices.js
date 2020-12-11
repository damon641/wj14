'use strict';
var Sys = require('../../../../Boot/Sys');

const mongoose = require('mongoose');
const roomModel  = mongoose.model('room');
const gameModel  = mongoose.model('game');

module.exports = {
  getById: async function(id){
      try {
      return  await roomModel.findById(id);
      } catch (error) {
          Sys.Log.info('Error in getByData : ' + error);
      }
  },
  getAllRoom: async function(data){
    try {
      return await roomModel.find({});
    }
    catch (error) {
      Sys.Log.info('Room Service Error in getAllRoom : ' + error);
    }
  },

  getByData: async function(data){
    try {
      return await roomModel.find(data);
    }
    catch (error) {
      Sys.Log.info('Room Service Error in getByData : ' + error);
    }
  },

  getCount: async function(){
    try {
      return await roomModel.countDocuments({});
    }
    catch (error) {
      Sys.Log.info('Room Service Error in getCount : ' + error);
    }
  },

  create: async function(data){
    try {
      return await roomModel.create(data);
    }
    catch (e) {
      console.log("Error Inserting Table", e);
      return new Error(e);
    }
	},

  get: async function(id){
    try {
      if(Sys.Rooms[id]){
        return Sys.Rooms[id];
      }else{
        let room = await roomModel.findOne({'_id' :id});
        Sys.Rooms[room.id] = new Sys.Game.Sng.Texas.Entities.Room().createObject(room); // Save room in  object
        return Sys.Rooms[room.id];
      }
    }
    catch (error) {
      Sys.Log.info('Error in Get Room : ' + error);
    }
  },

  update: async function(room){
    try {
      console.log("Room Update Called");
      let tempRoom = room.toJson();
      //console.log("Room Converted yo json")
      if(tempRoom){
        if (tempRoom.game) {
          //console.log("game is updating")
          let updatedGame = await gameModel.updateOne({
            _id: tempRoom.game.id
          }, tempRoom.game, {
            new: true
          });
          tempRoom.game = updatedGame.id; // Store Game ID for Save Room
        }
        // console.log("Now Room Updates")
        let updatedtempRoom = await roomModel.updateOne({
          _id: tempRoom.id
        }, tempRoom, {
          new: true
        });
        return room;
      }
      else{
        Sys.Log.info('No Room Updated : ');
        return room;
      }
    }
    catch (error) {
      Sys.Log.info('Error in Update Room : ' + error);
    }
  },



}
