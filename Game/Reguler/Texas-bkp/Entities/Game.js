var Sys = require('../../../../Boot/Sys');

class Game {
  constructor(id, roomId, currencyType, smallBlind, bigBlind, status, pot, roundName, betName, bets, roundBets, deck, board, players,winners, history, gameNumber, gameType, sidePotAmount, playerSidePot, gamePot,gameMainPot, gameRevertPoint) {
      
    this.id               = id;
    this.roomId           = roomId;
    this.currencyType     = currencyType;
    this.smallBlind       = smallBlind;
    this.bigBlind         = bigBlind;
    this.status           = (status) ? status : 'Waiting';
    this.pot              = (pot) ? pot : 0;
    this.roundName        = (roundName) ? roundName : 'Preflop';
    this.betName          = (betName) | 'bet';
    this.bets             = (bets) ? bets : [];
    this.roundBets        = (roundBets) ? roundBets : [];
    this.deck             = (deck) ? deck : [];
    this.board            = (board) ? board : [];
    this.players          = (players) ? players : [];
    this.winners          = (winners) ? winners : [];
    this.history          = (history) ? history : [];
    this.gameNumber       = gameNumber;
    this.gameType         = gameType || 'cash';
    this.sidePotAmount    = sidePotAmount,
    this.playerSidePot    = playerSidePot,
    this.gamePot          = gamePot,
    this.gameMainPot      = gameMainPot,
    this.gameRevertPoint  = gameRevertPoint
  }

  createObject (game) {
    return new Game(
      game.id,
      game.roomId,
      game.currencyType,
      game.smallBlind,
      game.bigBlind,
      game.status,
      game.pot,
      game.roundName,
      game.betName,
      game.bets,
      game.roundBets,
      game.deck,
      game.board,
      game.players,
      game.winners,
      game.history,
      game.gameNumber,
      game.gameType,
      game.sidePotAmount,
      game.playerSidePot,
      game.gamePot,
      game.gameMainPot,
      game.gameRevertPoint
    );
  }

  toJson() {
    var game = {
      id              : this.id,
      roomId          : this.roomId,
      currencyType    : this.currencyType,
      smallBlind      : this.smallBlind,
      bigBlind        : this.bigBlind,
      status          : this.status,
      pot             : this.pot,
      roundName       : this.roundName,
      betName         : this.betName,
      bets            : this.bets,
      roundBets       : this.roundBets,
      deck            : this.deck,
      board           : this.board,
      players         : this.players,
      winners         : this.winners,
      history         : this.history,
      gameNumber      : this.gameNumber,
      gameType        : this.gameType,
      sidePotAmount   : this.sidePotAmount,
      playerSidePot   : this.playerSidePot,
      gamePot         : this.gamePot,
      gameMainPot     : this.gameMainPot,
      gameRevertPoint : this.gameRevertPoint
    };
    return game;
  }

  async getSidePotAmount(room){

    console.log('<=> Save Side Pot Data ||  OMAHA GAME-NUMBER ['+room.game.gameNumber+'] || Room Round Name : ' , room.game.roundName);
    
    let players = room.players;
    let game = room.game;
    let pot = [];
    let sidepPot = {};
    // let gamePot = [];
    let allInPlayers = [];
    let allInPlayersSidePot = [];
    let playerIndex = [];
    let playerIds = [];

    let gameMainPot = 0;
    let mainPortAddMore = 0; 

    let extraAmount = 0; // Lefted / Folded Player Amount
    
    for (let i = 0; i < room.players.length; i++) {
      if (room.players[i].allIn == true && room.players[i].status === 'Playing' ) {
      //  console.log("Push All in Player  :",room.players[i].playerName);
        allInPlayers.push(i);
        allInPlayersSidePot.push({ id: room.players[i].id, bet: game.roundBets[i] , seatIndex : room.players[i].seatIndex, index : i });
      }

      if (room.players[i].isSidepot == false && (room.players[i].folded == true || room.players[i].status === 'Left')) {
        room.players[i].isSidepot = true; // Folded / Left Player Amount Save into Main Port;
        //console.log("Extrat amont Of Player : ",room.players[i].playerName);
       // console.log("Extrat amont  : ",game.roundBets[i]);
        extraAmount += game.roundBets[i];
      }
    }
        
    if (allInPlayers.length > 0) {

      // Just sort By Bet Amount
      allInPlayersSidePot.sort(function (a, b) {
        return a.bet - b.bet;
      });
      console.log("Game Round Bets : ",game.roundBets);
      console.log("allInPlayers : ",allInPlayers);
      console.log("allInPlayersSidePot : ",allInPlayersSidePot);
      
      let allInValue = 0;
      for (let j = 0; j < allInPlayersSidePot.length; j++) {
        let sumOfBet =  0;
        for (let i = 0; i < game.roundBets.length; i++) {
          if (game.roundBets[i] >= allInPlayersSidePot[j].bet) {
            sumOfBet += allInPlayersSidePot[j].bet - allInValue;
          }
        }

        playerIndex = []; 
        playerIds = [];
        for (let i = 0; i < room.players.length; i++) { 
          console.log("------------------------------");
          console.log("Add Player Chips Name ->",room.players[i].playerName)
          console.log("room.players[i].isSidepot ->",room.players[i].isSidepot);
          if(room.players[i].isSidepot == false && room.players[i].status === 'Playing'){ // chekc Already Side Pot not Calculate.
            playerIndex.push(i); // Add Aligible Player indexses for this Side pot.
            playerIds.push(room.players[i].id);
          }
        }

        console.log("sumOfBet ->",sumOfBet);
        console.log("Final  extraAmount ->",extraAmount);
        sumOfBet += extraAmount;
        extraAmount = 0; // After Assign value to Side Por Set Value 0
        
        console.log("New sumOfBet ->",sumOfBet);
        console.log("playerIndex ->",playerIndex);

        //let playingPlayer = 0;
        // if(playerIndex.length == 0){
        //   // check if Single player is Remain So Return All Amount to Remain Palyer.
        //   for (let i = 0; i < room.players.length; i++) {
        //     if (room.players[i].status === 'Playing' && room.players[i].folded == false ) {
        //       playingPlayer++;
        //     }
        //   }
        // }else{
          // playingPlayer = 1;
        //}
        

        //console.log("playingPlayer ->",playingPlayer);

        if(playerIndex.length == 1 ){ // When Side Pot Palyer is Single One Then We not Add This Amount in side Pot. Just Add this Amount in Main Port

          // Add GameRevertPoint to Players Chips 

          mainPortAddMore += sumOfBet;
          
          // for (let i = 0; i < room.players.length; i++) {
          //   if(room.players[i].id == allInPlayersSidePot[j].id ){
          //     console.log("Add Player Chips Name ->",room.players[i].playerName)
          //     console.log("Add Player Chips ->",room.players[i].chips)
          //     room.players[i].chips = parseInt(room.players[i].chips) + sumOfBet; 
          //   }
          // }

          game.gameRevertPoint.push({
            playerID : allInPlayersSidePot[j].id,
            amount : sumOfBet,
            playerIndex : allInPlayersSidePot[j].index
          });
        }
        else{
          // Save All in Player Side Pot in Single Variable
          let isNotAvilabel = true;
          for(let h=0;h < game.gamePot.length; h++){
            if(game.gamePot[h].sidePotPlayerID == allInPlayersSidePot[j].id){
              isNotAvilabel = false;
            }
          }

          if(isNotAvilabel && sumOfBet > 0){
            game.gamePot.push({
              playerIds : playerIds,
              playerIndex : playerIndex,
              sidePotPlayerID : allInPlayersSidePot[j].id,
              sidePotPlayerSeatIndex : allInPlayersSidePot[j].seatIndex,
              sidePotAmount : sumOfBet
            });
          }
        }
        allInValue = allInPlayersSidePot[j].bet;
        room.players[allInPlayersSidePot[j].index].isSidepot = true; // When Player side Pot is Calculate then we set variable true.
        //console.log("game.gamePot",game.gamePot);
      }

      for (let i = 0; i < game.roundBets.length; i++) {
        if (game.roundBets[i] >= allInValue) {
          gameMainPot += game.roundBets[i] - (allInValue);
        }
      }
    } 
    else {
      // Save All Bet Amount in Main Port
      for (let i = 0; i < game.roundBets.length; i++) {
        gameMainPot += game.roundBets[i];
      }

    }

    gameMainPot += mainPortAddMore;  // RefundCoin Add in Main Port

    console.log("------------------------------------------------");

    game.gameMainPot = gameMainPot;
    console.log("gameMainPot :",game.gameMainPot);
    //console.log("Game POT :",game.gamePot);
    console.log("Game REvert Point :",game.gameRevertPoint);
    console.log("------------------------------------------------");
    return game.gamePot;
  }

}


module.exports = Game
