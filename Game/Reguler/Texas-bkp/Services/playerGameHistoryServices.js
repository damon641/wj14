'use strict';
var Sys = require('../../../../Boot/Sys');

const mongoose = require('mongoose');
const playerGameHistoryModel  = mongoose.model('playerGameHistory');

module.exports = {
    create: async function(data){
        try {
            
          let playerGameHistorySave = new playerGameHistoryModel(data);
			    return  await playerGameHistorySave.save()
        } catch (error) {
            Sys.Log.info('Error in Create  : ' + error);
            return error;
        }
    },
    // updateGameStatus: async function(gameId,status){
    //     try {   
    //         return await playerGameHistoryModel.updateMany({ game : mongoose.Types.ObjectId(gameId) },{ status : status});
    //     } catch (error) {
    //         Sys.Log.info('Error in updateGameStatus  : ' + error);
    //         return error;
    //     }
    // },
    updateRoomStatus: async function(roomId,status){
        try {   
            return await playerGameHistoryModel.updateMany({ room : mongoose.Types.ObjectId(roomId) },{ status : status});
        } catch (error) {
            Sys.Log.info('Error in Update Room Status  : ' + error);
            return error;
        }
    },
    
}
