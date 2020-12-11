'use strict';
var Sys = require('../../../../Boot/Sys');

const mongoose = require('mongoose');
const gameModel  = mongoose.model('game');


module.exports = {

  create: async function(data){Sys.Log.info('<=> gameCount');
    //console.log('Create Game Called -------:',data)
    try {
      //let gameCount = await gameModel.countDocuments();
      let gameCount = await gameModel.estimatedDocumentCount();
      Sys.Log.info('<=> gameCount|| '+gameCount);
      let gameNumber = 'G' + (gameCount + 1); // Cash Poker Texas [G]

      let gameObj = {
        "roomId"        : data.roomId,
        "smallBlind"    : data.smallBlind,
        "bigBlind"      : data.bigBlind,
        "isTournamentTable" : data.isTournamentTable,
        "tournamentType" : data.tournamentType,
        "tournament" : data.tournament,
        "tableType" : data.tableType,
        "isCashGame" : data.isCashGame,
        "otherData" : data.otherData,
        "gameType"      : data.gameType,
        "pot"           : 0,
        "roundName"     : "Preflop",
        "betName"       : "bet",
        "players"       : [],
        "winners"       : [],
        "bets"          : [],
        "roundBets"     : [],
        "deck"          : [],
        "board"         : [],
        "history"       : [],
        "gameNumber"    : gameNumber,
        "sidePotAmount" : [],
        "playerSidePot" : [],
        "gamePot"       : [],
        "gameMainPot"   : 0,
        "gameRevertPoint" : [],
        "createdAt"     : new Date(),
        "maxBetOnRaise" : 0,
        "stopReraise"   : false,
        "aggressorIdArray": [],
        "isUnqualifiedRaise": false,
      }

      let gameSave = new gameModel(gameObj);
     let game = await gameSave.save(); // Save Game
      if(game){
        return new Sys.Game.Sng.Texas.Entities.Game().createObject(game) // return Game
      }else{
        return new Error("Game Not Created !");
      }
    } catch (error) {
      Sys.Log.info('Error in Create Game : ' + error);
    }
  },

  getSingleGameData: async function(data){
      try {
        return  await gameModel.findOne(data);
      } catch (e) {
        console.log("Error",e);
      }
  },
  
  // update: async function(game){
  //   try {
  //     console.log("game Update Called");
  //     let tempgame = game.toJson();
  //     if(tempgame){
  //         let updatedGame = await gameModel.updateOne({
  //           _id: tempgame.id
  //         }, tempgame, {
  //           new: true
  //         });
  //       return game;
  //     }else{
  //       Sys.Log.info('No Game Updated : ');
  //       return game;
  //     }
  //   }
  //   catch (error) {
  //     Sys.Log.info('Error in Update Game : ' + error);
  //   }
  // },
}
