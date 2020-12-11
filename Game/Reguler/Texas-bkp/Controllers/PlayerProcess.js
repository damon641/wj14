var Sys = require('../../../../Boot/Sys');
class Result {
  constructor(rank, message, bestCards) {
    this.rank = rank;
    this.message = message;
    this.bestCards = bestCards;
  }
}
module.exports = {
  progress: async function(room){
    try {
      let self = this
      var i, j, cards, hand;
      if (room.game) {
        if (await self.checkForEndOfRound(room) === true || room.game.status == 'ForceFinishedFolded' || room.game.status == 'ForceFinishedAllIn') {

          await self.changePlayerTurn(room);
          //Move all bets to the pot
          for (i = 0; i < room.game.bets.length; i += 1) {
            room.game.pot += parseInt(room.game.bets[i], 10);
            room.game.roundBets[i] += parseInt(room.game.bets[i], 10);
          }

          // Save Sidepot Data;
          let sidePot = await room.game.getSidePotAmount(room); // Save Data

          //console.log('<=> Side Pot ||  OMAHA GAME-NUMBER ['+room.game.gameNumber+'] || Player SidePot : ' , sidePot);

          if (room.game.status == 'ForceFinishedAllIn') {
            console.log('----------ForceFinishedAllIn--------------------------');
            //Evaluate each hand

            let turnBetData = room.getPreviousPlayerAction();
            await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('PlayerAction',{
              action: turnBetData,
              playerBuyIn : (turnBetData.playerId) ? room.getPlayerById(turnBetData.playerId).chips : 0,
            });

           
            switch (room.game.roundName) {
              case 'Preflop':
                console.log(":: Preflop ALL IN ---------------");
                room.game.deck.pop();
                for (i = 0; i < 3; i += 1) {
                  room.game.board.push(room.game.deck.pop());
                }
                room.game.roundName = 'Flop';

                Sys.Timers[room.id] = setTimeout(function (room) {
                  let dataObj = {
                      roundStarted: room.game.roundName,
                      cards: room.game.board,
                      potAmount: room.game.pot,
                  };
                  
                  console.log('<=> Game Round Complete Broadcast ||  OMAHA GAME-NUMBER ['+room.game.gameNumber+'] || RoundComplete : ',dataObj);

                    Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('RoundComplete', {
                      roundStarted: room.game.roundName,
                      cards: room.game.board,
                      potAmount: room.game.pot,
                      PlayerSidePot : {
                        sidePot : sidePot,
                        mainPot : room.game.gameMainPot
                      }
                    })
                    Sys.Timers[room.id] = setTimeout(function (room) {
                        room.game.deck.pop();
                        room.game.board.push(room.game.deck.pop());
                        room.game.roundName = 'Turn';

                        Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('RoundComplete', {
                              roundStarted: room.game.roundName,
                          cards: room.game.board,
                          potAmount: room.game.pot,
                          PlayerSidePot : {
                            sidePot : sidePot,
                            mainPot : room.game.gameMainPot
                          }
                        });
                        Sys.Timers[room.id] = setTimeout(async function (room) {
                            room.game.deck.pop();
                            room.game.board.push(room.game.deck.pop());
                            room.game.roundName = 'Showdown';
                            room.game.bets.splice(0, room.game.bets.length);
                            for (j = 0; j < room.players.length; j += 1) {
                              hand = new Sys.Game.Reguler.Texas.Entities.Hand(
                                room.players[j].cards,
                                room.game.board
                              )
                                room.players[j].hand = await self.rankHand(hand);
                            }
                            await self.checkForWinner(room);
                            await self.checkForBankrupt(room);
                            room.currentPlayer = undefined;
                            room.game.status = 'Finished AllIn'
                            // depricated
                            // Event.fire("PokerGameFinished", room);
                            await Sys.Game.Reguler.Texas.Controllers.RoomProcess.gameFinished(room,sidePot)

                        }, 1000, room)
                    }, 1500, room)
                }, 1000, room)
                break;

              case 'Flop':
                console.log(":: Flop ALL IN ---------------");
                room.game.deck.pop();
                room.game.board.push(room.game.deck.pop());
                room.game.roundName = 'Turn';
                Sys.Timers[room.id] = setTimeout(function (room) {
                  Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('RoundComplete', {
                    roundStarted: room.game.roundName,
                    cards: room.game.board,
                    potAmount: room.game.pot,
                    PlayerSidePot : {
                      sidePot : sidePot,
                      mainPot : room.game.gameMainPot
                    }
                  });
                  Sys.Timers[room.id] = setTimeout(async function (room) {
                    room.game.deck.pop();
                    room.game.board.push(room.game.deck.pop());
                    room.game.roundName = 'Showdown';
                    room.game.bets.splice(0, room.game.bets.length);
                    for (j = 0; j < room.players.length; j += 1) {
                      hand = new Sys.Game.Reguler.Texas.Entities.Hand(
                        room.players[j].cards,
                        room.game.board
                      );
                      room.players[j].hand = await self.rankHand(hand);
                    }
                    await self.checkForWinner(room);
                    await self.checkForBankrupt(room);
                    room.currentPlayer = undefined;
                    room.game.status = 'Finished AllIn'
                    await Sys.Game.Reguler.Texas.Controllers.RoomProcess.gameFinished(room,sidePot)
                  }, 1000, room)
                },1000,room)
                break;
              case 'Turn':
                  console.log(":: Turn ALL IN ---------------");
                  room.game.deck.pop();
                  room.game.board.push(room.game.deck.pop());
                  room.game.roundName = 'Showdown';
                  room.game.bets.splice(0, room.game.bets.length);
                  for (j = 0; j < room.players.length; j += 1) {
                    hand = new Sys.Game.Reguler.Texas.Entities.Hand(
                      room.players[j].cards,
                      room.game.board
                    );
                    room.players[j].hand = await self.rankHand(hand);
                  }
                  await self.checkForWinner(room);
                  await self.checkForBankrupt(room);
                  room.currentPlayer = undefined;
                  room.game.status = 'Finished AllIn'
                  await Sys.Game.Reguler.Texas.Controllers.RoomProcess.gameFinished(room,sidePot)
                break;
              default:
                console.log(":: Default ALL IN ---------------");
                room.game.roundName = 'Showdown';
                room.game.bets.splice(0, room.game.bets.length);
                for (j = 0; j < room.players.length; j += 1) {
                  hand = new Sys.Game.Reguler.Texas.Entities.Hand(
                    room.players[j].cards,
                    room.game.board
                  )
                  room.players[j].hand = await self.rankHand(hand);
                }
                await  self.checkForWinner(room);
                await self.checkForBankrupt(room);
                room.currentPlayer = undefined;
                room.game.status = 'Finished AllIn'
                await Sys.Game.Reguler.Texas.Controllers.RoomProcess.gameFinished(room,sidePot);

            }
          } else if (room.game.roundName === 'River' || room.game.status == 'ForceFinishedFolded') {
              console.log('effective river ForceFinishedFolded');

              let turnBetData = room.getPreviousPlayerAction();  // Shiv
              await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('PlayerAction',{
                action: turnBetData,
                playerBuyIn : (turnBetData.playerId) ? room.getPlayerById(turnBetData.playerId).chips : 0,
              });


              room.game.roundName = 'Showdown';
              for (i = 0; i < room.game.bets.length; i += 1) {
                room.game.bets[i] = 0;
              }
              //Evaluate each hand
              for (j = 0; j < room.players.length; j += 1) {
                  hand = new Sys.Game.Reguler.Texas.Entities.Hand(room.players[j].cards, room.game.board
                  )
                  room.players[j].hand = await self.rankHand(hand);
              }
              await self.checkForWinner(room);
              await self.checkForBankrupt(room);
              room.currentPlayer = undefined;
              room.game.status = 'Finished'
 
              await Sys.Game.Reguler.Texas.Controllers.RoomProcess.gameFinished(room,sidePot)


          } else if (room.game.roundName === 'Turn') {
              console.log('effective turn');
              room.game.roundName = 'River';
              room.game.deck.pop(); //Burn a card
              room.game.board.push(room.game.deck.pop()); //Turn a card
              for (i = 0; i < room.game.bets.length; i += 1) {
                  room.game.bets[i] = 0;
              }
              for (i = 0; i < room.players.length; i += 1) {
                  room.players[i].talked = false;
              }
              await Sys.Game.Reguler.Texas.Controllers.RoomProcess.roundFinished(room,sidePot)

          } else if (room.game.roundName === 'Flop') {
              console.log('effective flop');
              room.game.roundName = 'Turn';
              room.game.deck.pop(); //Burn a card
              room.game.board.push(room.game.deck.pop()); //Turn a card
              for (i = 0; i < room.game.bets.length; i += 1) {
                  room.game.bets[i] = 0;
              }
              for (i = 0; i < room.players.length; i += 1) {
                  room.players[i].talked = false;
              }
 
              console.log("round Finished");
              await Sys.Game.Reguler.Texas.Controllers.RoomProcess.roundFinished(room,sidePot)

          } else if (room.game.roundName === 'Preflop') {
              console.log('effective deal');
              room.game.roundName = 'Flop';
              room.game.deck.pop(); //Burn a card
              for (i = 0; i < 3; i += 1) { //Turn three cards
                  room.game.board.push(room.game.deck.pop());
              }
 
              for (i = 0; i < room.game.bets.length; i += 1) {
                  room.game.bets[i] = 0;
              }
              for (i = 0; i < room.players.length; i += 1) {
                  room.players[i].talked = false;
              }

            
              console.log("round Finished 2");
              await Sys.Game.Reguler.Texas.Controllers.RoomProcess.roundFinished(room,sidePot)
          }
        }
        else {
          await Sys.Game.Reguler.Texas.Controllers.RoomProcess.turnFinished(room);
        }
      }
    } catch (e) {
      console.log("Error: ", e);
    }

  },

  getHand: async function(player, board) {
    try {
      let hand = await new Sys.Game.Reguler.Texas.Entities.Hand(player.cards, board);
      return await this.rankHand(hand);
    }
    catch (e) {
      console.log("Error in getHand :", e);
      return new Error(e);
    }

  },

  testWinner: async function(){
    try {
      let hand1 = {
         // player: [ 'AD', 'TS' ],
        //  board: [ 'AH' ,'2H', '3H', '4D', '7C' ],
          cards: [ 'AH' ,'2H', '3H', '4D', '7C', 'AD', 'TS' ] };

     let  hand2 = {
         // player: [ 'AC', 'KC' ],
         // board: [ '8H' ,'2H', '3H', '4D', '7C' ],
          cards: [ '2H' ,'JH', 'QH', 'KH', 'TH', '9H', 'KC' ] };

      let  hand3 = {
      // player: [ 'TC', '7H' ],
      // board: [ '8D' ,'5H', '8C', 'QH', 'KD' ],
        cards: ['8D' ,'8C', '8C', '9D', 'KH', 'TD', '9S' ] };

      // var myResult1 = await this.rankHandInt(hand1);
      // console.log("Rank 1 : ",myResult1.rank);
      // console.log("message 1 : ",myResult1.message);
      // console.log("bestCards 1 : ",myResult1.bestCards);


      // var myResult2 = await this.rankHandInt(hand2);
      // console.log("Rank 2 : ",myResult2.rank);
      // console.log("message 2 : ",myResult2.message);
      // console.log("bestCards 2 : ",myResult2.bestCards);

      var myResult3 = await this.rankHandInt(hand3);
      console.log("Rank 3 : ",myResult3.rank);
      console.log("message 3 : ",myResult3.message);
      console.log("bestCards 3 : ",myResult3.bestCards);


    } catch (e) {
      console.log("Error: ", e);
    }


  },

  rankHand: async function(hand) {
    try {
      //console.log("rankHand",hand);
      var myResult = await this.rankHandInt(hand);
      hand.rank = myResult.rank;
      hand.message = myResult.message;
      hand.bestCards = myResult.bestCards;
      return hand;
    }
    catch (e) {
      console.log("Error in rankHand :", e);
      return new Error(e);
    }
  },

  // rankHands: async function(hands) {
  //   try {
  //     console.log("rankHands ->",hands);
  //     var x, myResult;
  //     for (x = 0; x < hands.length; x += 1) {
  //         myResult = this.rankHandInt(hands[x]);
  //         hands[x].rank = myResult.rank;
  //         hands[x].message = myResult.message;
  //     }
  //     return hands;
  //   } catch (e) {
  //       console.log("Error:",e);
  //   }
  // },

  getMaxBet: async function(bets) {
    try {
      var maxBet, i;
      maxBet = 0;
      for (i = 0; i < bets.length; i += 1) {
          if (bets[i] > maxBet) {
              maxBet = bets[i];
          }
      }
      return maxBet;
    } catch (e) {
      console.log("Error: ",e);
    }
  },

  checkForEndOfRound: async function(room) {
    try {
      var maxBet, i, endOfRound, notFoldedPlayers, notAllInPlayers, currentTurn,maxbetPlayerIndex,notAllInPlayersIndex;
      endOfRound = true;
      maxBet = await this.getMaxBet(room.game.bets);
      notFoldedPlayers = 0;
      notAllInPlayers = 0;
      currentTurn = room.currentPlayer;

      // console.log("----------------------------------------------------------");
      // console.log('Current Player :',currentTurn);
      // console.log("----------------------------------------------------------");
      // Sys.Log.info('Check for end of round',room.players)
      //For each player, check
      for (i = currentTurn; i < room.players.length; i += 1) {
          if (room.players[i].folded === false && room.players[i].status === 'Playing') {
              // console.log("Talked : ",room.players[i].talked,i);
              // console.log("bets : ",room.game.bets[i]);
              // console.log("maxBet : ",maxBet);
              if (room.players[i].talked === false  || room.game.bets[i] != maxBet) {
                  if (room.players[i].allIn === false) {
                      room.currentPlayer = i;
                      endOfRound = false;
                      break
                  }
              }
          }
      }
      if (currentTurn == room.currentPlayer) {
          for (i = 0; i < currentTurn; i += 1) {
              if (room.players[i].folded === false && room.players[i].status === 'Playing') {
                    console.log("Talked 2: ",room.players[i].talked,i);
                  if (room.players[i].talked === false  || room.game.bets[i] !== maxBet) {
                      if (room.players[i].allIn === false) {
                          room.currentPlayer = i;
                          endOfRound = false;
                          break
                      }
                  }
              }
          }
      }

      for (i = 0; i < room.players.length; i += 1) {
        //console.log("Talked 3: ",room.players[i].talked,i);
        if(room.game.bets[i] == maxBet){ // Get Mabet Player Index
          maxbetPlayerIndex = i;
         }
          if (room.players[i].folded === false && room.players[i].status === 'Playing') {
              notFoldedPlayers += 1;
              if (room.players[i].allIn === false) {
                  notAllInPlayers += 1;
                  notAllInPlayersIndex = i; // When Single Player is Remain in not All in Then We use this variable. so do not confuse.
              }
          }
      }

      // console.log("endOfRound : ",endOfRound)
      // console.log("notFoldedPlayers : ",notFoldedPlayers)
      // console.log("notAllInPlayers : ",notAllInPlayers)
      // console.log("Sys.Config.Texas.AllIn : ",Sys.Config.Texas.AllIn)
      // console.log("room.turnBet.action : ",room.turnBet.action)
      // console.log("room.game.bets[currentTurn] : ",room.game.bets[currentTurn])
      // console.log("notAllInPlayersIndex : ",notAllInPlayersIndex)
      // console.log("maxbetPlayerIndex : ",maxbetPlayerIndex)


      if (notFoldedPlayers == 1) {
          room.game.status = 'ForceFinishedFolded'
          return endOfRound;
      }

      if (notAllInPlayers == 1 && room.turnBet.action != Sys.Config.Texas.AllIn && room.game.bets[notAllInPlayersIndex] == maxBet) { // Shiv!@#
          room.game.status = 'ForceFinishedAllIn'
      }

      if (notAllInPlayers == 0) {
          room.game.status = 'ForceFinishedAllIn'
      }


      if (notAllInPlayers == 1 && room.turnBet.action == Sys.Config.Texas.AllIn) { // when All in Player Turn.
        let currenPlayerBet = room.game.bets[currentTurn];
          if (currenPlayerBet > maxBet) {  
              endOfRound = true;
              room.game.status = 'ForceFinishedAllIn';
          }
      }

      if (notAllInPlayers == 1  && room.game.bets[notAllInPlayersIndex] == maxBet ){ // When Single Player is Remain & Max Bet Player is not All in Palyer Then Finishe Game.
          endOfRound = true;
          room.game.status = 'ForceFinishedAllIn';
      }
   
      // console.log("----------------------------------------------------------");
      // console.log('Checking round',endOfRound,   room.currentPlayer , room.game.status);
      // console.log("----------------------------------------------------------");
      
      return endOfRound;
    } catch (e) {
      console.log("Error: ",e);
    }
  },

  changePlayerTurn: async function(room) {
    try {
      let oldTurn = room.currentPlayer;
      // Shiv!@#
      // let smallBlind = room.dealer + 1;
      // if (smallBlind >= room.players.length) {
      //     smallBlind = 0;
      // }
      // if (smallBlind >= room.players.length) {
      //     smallBlind -= room.players.length;
      // }

      for (let i = room.smallBlindIndex; i < room.players.length; i += 1) { // Shiv!@# smallBlind
          if (room.players[i].folded === false && room.players[i].status === 'Playing') {
              if (room.players[i].allIn === false) {
                  room.currentPlayer = i;
                  break;
              }
          }
      }
      if (oldTurn == room.currentPlayer) {
          for (let i = 0; i < room.smallBlindIndex; i += 1) { // Shiv!@# smallBlind
              if (room.players[i].folded === false && room.players[i].status === 'Playing') {
                  if (room.players[i].allIn === false) {
                      room.currentPlayer = i;
                      break;
                  }
              }
          }
      }
    } catch (e) {
      console.log("Error:", e);
    }
  },

  checkForAllInPlayer: async function(room, winners) {
    try {
      console.log("checkForAllInPlayer Called");
      var i, allInPlayer;
      allInPlayer = [];
      for (i = 0; i < winners.length; i += 1) {
          if (room.players[winners[i]].allIn === true) {
              allInPlayer.push(winners[i]);
          }
      }
      return allInPlayer;
    } catch (e) {
      console.log("Error: ",e);
    }
  },

  checkForWinner: async function(room) {
    try {
      console.log('<=> Game Check For Winner || Texas GAME-NUMBER ['+room.game.gameNumber+'] ');

      let self = this;

      var i, j, k, l, maxRank, winners, part, prize, allInPlayer, minBets, roundEnd, sidePotIndex;
      //Identify winner(s)
      winners = [];
      maxRank = 0.000;

      // Check Winner from Side Pot 
      let GameWinner = [];
      // console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::;::::");
      // console.log(" gamePot :",room.game.gamePot);
      // console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::;::::");

      let h,r,s,playerIndexes,winplr,winAmount,winAmountPart,winTotalAmount;
      for (h = 0; h < room.game.gamePot.length; h += 1) {
        playerIndexes = room.game.gamePot[h].playerIndex;
       // console.log("playerIndexes",playerIndexes);

        maxRank = 0.000;
        let tempWinner = [];
        for(r=0;r<playerIndexes.length;r++){
          // Check Max Winner
          // console.log("room.players[playerIndexes[r]]",room.players[playerIndexes[r]])
          // console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::;::::")
          // console.log(" Max Rank :",maxRank);
          // console.log(" Player Name :",room.players[playerIndexes[r]].playerName);
          // console.log(" Player Rank :",room.players[playerIndexes[r]].hand.rank);
          // console.log(" Player Status :",room.players[playerIndexes[r]].status);
          // console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::;::::")
          
          if (room.players[playerIndexes[r]].hand.rank === maxRank && room.players[playerIndexes[r]].folded === false && room.players[playerIndexes[r]].status ===  'Playing') {
            tempWinner.push(playerIndexes[r]);
          }
          if (room.players[playerIndexes[r]].hand.rank > maxRank && room.players[playerIndexes[r]].folded === false && room.players[playerIndexes[r]].status ===  'Playing' ) {
            maxRank = room.players[playerIndexes[r]].hand.rank;
            tempWinner.splice(0, tempWinner.length);
            tempWinner.push(playerIndexes[r]);
          }
        }

        winTotalAmount = parseInt(room.game.gamePot[h].sidePotAmount);
        winAmountPart = parseInt(parseInt(room.game.gamePot[h].sidePotAmount) / parseInt(tempWinner.length));
        console.log("Win-Total-Amount",winTotalAmount)
        // Save winner 
        console.log("tempWinner",tempWinner);

        for (s = 0; s < tempWinner.length; s += 1) {
          console.log("tempWinner.length",tempWinner.length)
          if(s == tempWinner.length-1){
            winAmount = winTotalAmount;
          }else{
            winAmount = winAmountPart;
          }
          winTotalAmount = winTotalAmount - winAmountPart;

          winplr = room.players[tempWinner[s]];
          winplr.chips += parseInt(winAmount);

          room.gameWinners.push({
            playerId: winplr.id,
            playerName: winplr.playerName,
            amount: parseInt(winAmount),
            hand: winplr.hand,
            bestCards : winplr.hand.bestCards,
            winningType : winplr.hand.message,
            rank : winplr.hand.rank,
            chips : winplr.chips,
            winnerSeatIndex : winplr.seatIndex,
            sidePotPlayerIndex: room.game.gamePot[h].sidePotPlayerSeatIndex,
            sidePotPlayerId : room.game.gamePot[h].sidePotPlayerID, // Add for Testing
            rackAmount : 0
          });
        }
      }
      console.log(" room.game.gameMainPot :",room.game.gameMainPot);
      // Check Main Port Winner
      if(room.game.gameMainPot > 0){

        let minPotWinner = [];

        maxRank = 0.000;
        let lastPlayerCount = 0;
        for (k = 0; k < room.players.length; k += 1) {
          // console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::;::::")
          // console.log("- Player Name :",room.players[k].playerName);
          // console.log("- Player Hand :",room.players[k].hand);
          // console.log("- Player Rank :",room.players[k].hand.rank);
          // console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::;::::")

          if (room.players[k].folded === false && room.players[k].allIn === false && room.players[k].status ===  'Playing') {
            lastPlayerCount++;
          }

          if (room.players[k].hand.rank === maxRank && room.players[k].folded === false && room.players[k].allIn === false && room.players[k].status ===  'Playing') {
            minPotWinner.push(k);
          }
          if (room.players[k].hand.rank > maxRank && room.players[k].folded === false && room.players[k].allIn === false && room.players[k].status ===  'Playing') {
            maxRank = room.players[k].hand.rank;
            minPotWinner.splice(0, minPotWinner.length);
            minPotWinner.push(k);
          }
        }

        winTotalAmount = parseInt(room.game.gameMainPot);
        winAmountPart = parseInt(parseInt(room.game.gameMainPot) / parseInt(minPotWinner.length));
        
        console.log('Main Pot Winner : ',minPotWinner);
        console.log('lastPlayerCount : ',lastPlayerCount);

        if(minPotWinner.length == 1 && lastPlayerCount == 1){
          // console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::;::::");
          // console.log("-Single Player Name :",room.players[minPotWinner[0]].playerName);
          // console.log("-Single Player chips :",room.players[minPotWinner[0]].chips);
          // console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::;::::");

          // winplr.chips += parseInt(winAmount);
          winplr = room.players[minPotWinner[0]];
          room.game.gameRevertPoint.push({
            playerID : winplr.id,
            amount : winTotalAmount,
            playerIndex : minPotWinner[0]
          });
        }
        else{
          // Save winner 
          for (s = 0; s < minPotWinner.length; s += 1) {
            if(s == minPotWinner.length-1){
              winAmount = winTotalAmount;
            }
            else{
              winAmount = winAmountPart;
            }
            winTotalAmount = winTotalAmount - winAmountPart;
            winplr = room.players[minPotWinner[s]];
            winplr.chips += parseInt(winAmount);

            room.gameWinners.push({
              playerId: winplr.id,
              playerName: winplr.playerName,
              amount: winAmount,
              hand: winplr.hand,
              bestCards : winplr.hand.bestCards,
              winningType : winplr.hand.message,
              rank : winplr.hand.rank,
              chips : winplr.chips,
              winnerSeatIndex : winplr.seatIndex,
              sidePotPlayerIndex: -1, // main Port index,
              rackAmount : 0
            });
          }
        }
      }

      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      console.log("Game Winner :",room.gameWinners);
      console.log("Game RevertPoint :",room.game.gameRevertPoint);    
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    }
    catch (e) {
      console.log("Error in checkForWinner :", e);
      return new Error(e);
    }
  },

  checkForBankrupt: async function(room) {
    try {



         // Update Player Folded Variable. 
         for (let k = 0; k < room.gameWinners.length; k += 1) {
            for (let j = 0; j < room.players.length; j += 1) {
                if(room.gameWinners[k].playerId == room.players[j].id){
                    // when Player winn we update his status to Fold. so now we update winner status to fold flase.
                    room.players[j].folded = false;
                }
            }
        }


        console.log('<=> Check For Bankrupt ||  OMAHA GAME-NUMBER ['+room.game.gameNumber+'] ||');
        var i, autoBuyinPlayers;
        autoBuyinPlayers = [];
        for (i = 0; i < room.players.length; i += 1) {
         // console.log('<%%%%%%%%%%%%%%%%%%%%%%%%- ',room.id+' -%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%>');
          //  console.log('<%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%> Player chips ||',room.players[i].playerName+':-:-:'+room.players[i].chips);
            room.players[i].chips = parseInt(room.players[i].chips);
            if (room.players[i].chips == 0) {
                //if (room.players[i].autoBuyin == 0) {

                // uncommit After Testing.
                    // let isRevertAvilabel = false;
                    // for (let h = 0; h < room.game.gameRevertPoint.length; h += 1) {
                    //     console.log("<<---------------------------------------->>")
                    //     console.log('<=> Player Revert Name |>',room.players[room.game.gameRevertPoint[h].playerIndex].playerName);
                    //     if(room.game.gameRevertPoint[h].amount > 0 && room.players[i].id == room.players[room.game.gameRevertPoint[h].playerIndex].id) {
                    //         isRevertAvilabel = true;
                    //     }
                    // }
                  //  console.log('<=> Player Revert isRevertAvilabel |>',isRevertAvilabel);
                    // if(isRevertAvilabel == false){
                        room.gameLosers.push(room.players[i]);
                        console.log('<=> Player ' + room.players[i].playerName + ' is going Bankrupt ???????????????????????????????????????????????????????????????????????????????????????');
                        // room.players.splice(i, 1);
                        room.players[i].status = 'Left';

                        let tournament = await Sys.Game.Reguler.Texas.Services.TournamentServices.getById(room.tournament);
                        room.breakTime
                        tournament.tournamentLosers.push(room.players[i].id);
                        tournament = await Sys.Game.Reguler.Texas.Services.TournamentServices.updateTourData({_id :tournament.id },{tournamentLosers : tournament.tournamentLosers });
                        

                   // }


                // } else {
                //     autoBuyinPlayers.push(room.players[i])
                // }
            }
        }
        // if (autoBuyinPlayers.length > 0) {
        //     let ids = []
        //     autoBuyinPlayers.forEach(function (player) {
        //         ids.push(player.id)
        //     })
        //     //Player.find({ id: ids }).exec(function (err, players) {
        //     let players = await Sys.Game.Reguler.Texas.Services.PlayerServices.getByIds(ids);
        //     if (players && players != undefined && players.length != 0) {
        //         players.forEach(function (player) {
        //             autoBuyinPlayers.forEach(async function (autoBuyinPlayer) {
        //                 if (player.id == autoBuyinPlayer.id) {
        //                     if (autoBuyinPlayer.autoBuyin < player.chips) {
        //                         autoBuyinPlayer.chips = autoBuyinPlayer.autoBuyin
        //                         player.chips = parseInt(player.chips) - parseInt(autoBuyinPlayer.autoBuyin);

        //                         await Sys.Game.Reguler.Texas.Services.PlayerServices.update({id: player.id}, player);
                               
        //                         let tempdata = autoBuyinPlayer.toJson()
        //                         player.level = 0;
        //                         tempdata.player = player;

        //                         console.log('<=> Check For Bankrupt Auto Buy in ||GAME-NUMBER ['+room.game.gameNumber+']  PlayerInfo :', tempdata.playerName);
        //                         await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(room.id).emit('PlayerInfo', tempdata)
                                 
        //                     } else {
        //                         for (i = 0; i < room.players.length; i += 1) {
        //                             if (room.players[i].id == autoBuyinPlayer.id) {
        //                                 room.gameLosers.push(room.players[i]);
        //                                 //console.log('player ' + room.players[i].playerName + ' is going bankrupt');
        //                                 console.log('<=> Player ' + room.players[i].playerName + ' is going Bankrupt ||Omaha GAME-NUMBER ['+room.game.gameNumber+'] ||');
        //                                 // room.players.splice(i, 1);
        //                                 room.players[i].status = 'Left'
        //                                // await load('Games/Reguler/Omaha/Controllers/BotController').checkBots(room.id)                                        
        //                             }
        //                         }
        //                     }
        //                 }
        //             })
        //         })
        //     }
        //     //})
        // }



    } catch (e) {
      console.log("Error:", e);
    }
  },

  sortNumber:async function(a, b) {
      return b.rank - a.rank;
  },

  rankKickers: async function(ranks, noOfCards) {
    try {
      var i, myRanks, rank, result;

      myRanks = [];
      rank = '';

      //console.log("Rank Kickers ->",ranks);


      for (i = 0; i < ranks.length; i += 1) { // Removed = 
          rank = ranks.substr(i, 1);
          // console.log("rank->>>",rank)
          if (rank === 'A') { myRanks.push({ rank: 0.2048, card: rank }); }
          if (rank === 'K') { myRanks.push({ rank: 0.1024, card: rank }); }
          if (rank === 'Q') { myRanks.push({ rank: 0.0512, card: rank }); }
          if (rank === 'J') { myRanks.push({ rank: 0.0256, card: rank }); }
          if (rank === 'T') { myRanks.push({ rank: 0.0128, card: rank }); }
          if (rank === '9') { myRanks.push({ rank: 0.0064, card: rank }); }
          if (rank === '8') { myRanks.push({ rank: 0.0032, card: rank }); }
          if (rank === '7') { myRanks.push({ rank: 0.0016, card: rank }); }
          if (rank === '6') { myRanks.push({ rank: 0.0008, card: rank }); }
          if (rank === '5') { myRanks.push({ rank: 0.0004, card: rank }); }
          if (rank === '4') { myRanks.push({ rank: 0.0002, card: rank }); }
          if (rank === '3') { myRanks.push({ rank: 0.0001, card: rank }); }
          if (rank === '2') { myRanks.push({ rank: 0.0000, card: rank }); }
      }
      //console.log("myRanks->>>",myRanks)
      myRanks.sort(this.sortNumber);
      //console.log("After Sort MyRank ->>>",myRanks)
      let cardsLength = 0;
      if (myRanks.length > noOfCards) {
          cardsLength = noOfCards
      } else {
          cardsLength = myRanks.length
      }
      result = { rank: 0.0000, cards: '' }
      for (i = 0; i < cardsLength; i += 1) {
          result.rank += myRanks[i].rank;
          result.cards += myRanks[i].card;
      }
      //console.log("result ->>>",result)
      return result;
    } catch (e) {
      console.log("Error: ", e);
    }
  },

  rankHandInt: async function(hand) {
    try {
      var rank, message, handRanks, handSuits, ranks, suits, cards, result, i, bestCards;

      rank = 0.0000;
      message = '';
      handRanks = [];
      handSuits = [];
      bestCards = '';

      /** Code for Sort Cards  */

      let crds = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
      let cardsSortedByRank = [];
      for (let i = 0; i < crds.length; i++) {
        for (let j = 0; j < hand.cards.length; j++) {
            if (hand.cards[j].includes(crds[i])){
              cardsSortedByRank.push(hand.cards[j])
            }
        }
      } 

      // console.log("***********************************************")
      // console.log("Sored Cards :",cardsSortedByRank)
      // console.log("***********************************************")

      /** end Sort Card  */


      for (i = 0; i < cardsSortedByRank.length; i += 1) {
        handRanks[i] = cardsSortedByRank[i].substr(0, 1);
        handSuits[i] = cardsSortedByRank[i].substr(1, 1);
      }

     // console.log("handRanks :",handRanks)
    //  console.log("handSuits :",handSuits)


    //  handRanks = handRanks.sort(); // remove it after custom sort code
      handSuits = handSuits.sort();   


     // console.log(" :: After Sort ->>>>>>>>>>>> ");
     // console.log("handRanks :",handRanks)
      //console.log("handSuits :",handSuits)

      ranks = handRanks.toString().replace(/\W/g, "");
      suits = handSuits.toString().replace(/\W/g, "");

    // console.log(" :: After Replace ->>>>>>>>>>>> ");
     // console.log("ranks :",ranks)
    // console.log("suits :",suits)

      cards = cardsSortedByRank.toString();
      let tempHandCard = cardsSortedByRank;

    //  console.log("tempHandCard :",tempHandCard)

      function findCard(rank, suit, callback) {
        if (suit) {
          for (i = 0; i < tempHandCard.length; i += 1) {
            if (tempHandCard[i].substr(0, 1) == rank && tempHandCard[i].substr(1, 1) == suit) {
              return tempHandCard.splice(i, 1);
            }
          }
        } else {
          for (i = 0; i < tempHandCard.length; i += 1) {
            if (tempHandCard[i].substr(0, 1) == rank) {
              return tempHandCard.splice(i, 1);
            }
          }
        }
      }

      function setBestCard() {
       // console.log("Argument 1 :>>>>>>",arguments[0]);
       // console.log("Argument 2 :>>>>>>",arguments[1]);
        arguments[0].forEach(function (str) {
       //   console.log("str :>>>>>>",str);
          bestCards = bestCards + str;
        })
        //console.log("bestCards ->",bestCards);
        let tempCards = [];
        //console.log("arguments[1]",arguments[1]);
        if (arguments[1]) {
          let arg1 = arguments[1]; // Add By Himanshu for Royalflush 12345 of Heart
          bestCards.split("").forEach(function (rank) {
            tempCards.push(findCard(rank, arg1)[0]); // Replace arguments[1] to arg1
          })
        } else {
          bestCards.split("").forEach(function (rank) {
            tempCards.push(findCard(rank)[0]);
          })
        }
        bestCards = tempCards;
      }

      //Four of a kind
      if (rank === 0) {
        let cards = ['AAAA', 'KKKK', 'QQQQ', 'JJJJ', 'TTTT', '9999', '8888', '7777', '6666', '5555', '4444', '3333', '2222'];
        let rnk = 297;
        for (var i = 0; i < cards.length; i++) {
          if (ranks.indexOf(cards[i]) > -1 && rank === 0) {
            let rankKicker = await Sys.Game.Reguler.Texas.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], ''), 1);
            rank = rnk + rankKicker.rank; setBestCard([cards[i], rankKicker.cards]);
          }
          rnk--;
        };
        if (rank !== 0) { message = 'FourOfAKind'; }
      }

      //Full House
      if (rank === 0) {
        let cards3 = ['AAA', 'KKK', 'QQQ', 'JJJ', 'TTT', '999', '888', '777', '666', '555', '444', '333', '222'];
        let cards2 = ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22'];

        let rnk = 284;
        for (let i = 0; i < cards3.length; i++) {
          for (let k = 0; k < cards2.length; k++) {
            if (cards3[i].indexOf(cards2[k]) == -1) {
              if (ranks.indexOf(cards3[i]) > -1 && ranks.indexOf(cards2[k]) > -1 && rank === 0) {
                rank = rnk; setBestCard([cards3[i], cards2[k]]);
              }
              rnk--;
            }
          }
        }
        if (rank !== 0) { message = 'FullHouse'; }
      }

      //Flush
      if (rank === 0) {
        let flushSuit = '';
        if (suits.indexOf('CCCCC') > -1 || suits.indexOf('DDDDD') > -1 || suits.indexOf('HHHHH') > -1 || suits.indexOf('SSSSS') > -1) { rank = 128; message = 'Flush'; }
        if (suits.indexOf('CCCCC') > -1) { flushSuit = 'C'; }
        if (suits.indexOf('DDDDD') > -1) { flushSuit = 'D'; }
        if (suits.indexOf('HHHHH') > -1) { flushSuit = 'H'; }
        if (suits.indexOf('SSSSS') > -1) { flushSuit = 'S'; }

       // console.log('flushSuit:->>> ', flushSuit);
        // Straight Flush
        let suite = ['C', 'D', 'H', 'S'];
        let cardsSeq = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        let crd = ['T', '9', '8', '7', '6', '5', '4', '3', '2', 'A'];
        let rnk = 307;
        let indexPostion = 9; //skip eliment from start
        let decPostion = 0; // skip eliment from end
        for (let i = 0; i < crd.length; i++) {
          var selectedCards = cardsSeq.slice(indexPostion, cardsSeq.length - decPostion);
          for (let k = 0; k < suite.length; k++) {
            if (cards.indexOf(selectedCards[0] + suite[k]) > -1 && cards.indexOf(selectedCards[1] + suite[k]) > -1 && cards.indexOf(selectedCards[2] + suite[k]) > -1 && cards.indexOf(selectedCards[3] + suite[k]) > -1 && cards.indexOf(selectedCards[4] + suite[k]) > -1 && rank === 128) {
              rank = rnk;
              message = 'RoyalFlush';
              setBestCard([selectedCards.join('')], suite[k]);
            }
          }
          rnk--;
          indexPostion--;
          decPostion++;
        }
       // console.log('rank:->>> ', rank);
       // console.log('ranks:->>> ', ranks);
       // console.log('cards:->>> ', cards);
        if(rank === 128){
          let rankKicker = await Sys.Game.Reguler.Texas.Controllers.PlayerProcess.rankKickers(ranks, 5);
          rank = rank + rankKicker.rank;
         // console.log("Rank :",rank)
          // find Best Card For Flush Only
         // let suiteArray = ['C','D','H','S'];
          let betCardsArr = [];
         // for(let k=0;k<suiteArray.length;k++){
            
          //  if(suits.indexOf(suiteArray[k]+suiteArray[k]+suiteArray[k]+suiteArray[k]+suiteArray[k]) > -1){
            
              // let crd = ['J','Q','K','T','9','8','7','6','5','4','3','2','A'];

              for (let i = 0; i < crds.length; i++) {
                for (let j = 0; j < cardsSortedByRank.length; j++) {
                    if (cardsSortedByRank[j] == crds[i]+flushSuit && betCardsArr.length < 5){
                      betCardsArr.push(crds[i]+flushSuit);
                    }
                }
              } 
              // Old Code.
              // for(let i=0;i<crd.length;i++){
              //   console.log('crd[i]+suiteArray[k][k]: ', crd[i]+suiteArray[k]);
              //   if(cards.indexOf(crd[i]+suiteArray[k]) > -1){
              //     console.log('crd: ', crd[i]+suiteArray[k]);
              //     betCardsArr.push(crd[i]+suiteArray[k]);
              //   }
              // }
          //  }
         // }
          bestCards = betCardsArr;
        }
      }

      //Straight
      if (rank === 0) {
        let cardsSeq = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        let crd = ['T', '9', '8', '7', '6', '5', '4', '3', '2', 'A'];
        let rnk = 127;
        let indexPostion = 9; //skip eliment from start
        let decPostion = 0; // skip eliment from end
        for (let i = 0; i < crd.length; i++) {
          var selectedCards = cardsSeq.slice(indexPostion, cardsSeq.length - decPostion);

          if (cards.indexOf(selectedCards[0]) > -1 && cards.indexOf(selectedCards[1]) > -1 && cards.indexOf(selectedCards[2]) > -1 && cards.indexOf(selectedCards[3]) > -1 && cards.indexOf(selectedCards[4]) > -1 && rank === 0) {
            rank = rnk; setBestCard([selectedCards.join('')]);
          }

          rnk--;
          indexPostion--;
          decPostion++;
        }
        if (rank !== 0) { message = 'Straight'; }
      }

      //Three of a kind
      if (rank === 0) {
        let cards = ['AAA', 'KKK', 'QQQ', 'JJJ', 'TTT', '999', '888', '777', '666', '555', '444', '333', '222'];

        let rnk = 117;
        for (let i = 0; i < cards.length; i++) {
          if (ranks.indexOf(cards[i]) > -1 && rank === 0) {
            let rankKicker = await Sys.Game.Reguler.Texas.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], ''), 2);
            rank = rnk + rankKicker.rank; setBestCard([cards[i], rankKicker.cards]);
          }
          rnk--;
        }

        if (rank !== 0) { message = 'ThreeOfAKind'; }
      }

      //Two pair
      if (rank === 0) {
        let cards = ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22'];

        let rnk = 104;
        for (let i = 0; i < cards.length; i++) {
          for (let k = 0; k < cards.length; k++) {
            if (cards[i].indexOf(cards[k]) == -1 && k > i) {
              if (ranks.indexOf(cards[i]) > -1 && ranks.indexOf(cards[k]) > -1 && rank === 0) {
                let rankKicker = await Sys.Game.Reguler.Texas.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], '').replace(cards[k], ''), 1);
                rank = rnk + rankKicker.rank; setBestCard([cards[i] + cards[k], rankKicker.cards]);
              }
              rnk--;
            }
          }
        }

        if (rank !== 0) { message = 'TwoPair'; }
      }

      //One Pair
      if (rank === 0) {
        let cards = ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22'];
        console.log("ranks ->",ranks)
        let rnk = 26;
        for (let i = 0; i < cards.length; i++) {
          if (ranks.indexOf(cards[i]) > -1 && rank === 0) {
            let rankKicker = await Sys.Game.Reguler.Texas.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], ''), 3);
            rank = rnk + rankKicker.rank; setBestCard([cards[i], rankKicker.cards]);
          }
          rnk--;
        }

        if (rank !== 0) { message = 'OnePair'; }
      }

      //High Card
      if (rank === 0) {
        let cards = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
        let rnk = 13;

        // console.log("Befor reverse :",ranks)
        // let sortbyrank = '';
        // for (let i = 0; i < cards.length; i++) {
        //   if (ranks.indexOf(cards[i]) > -1){
        //     sortbyrank = sortbyrank + cards[i];
        //   }
        // }
        // ranks = sortbyrank;
        // console.log("After reverse :",ranks)
        for (let i = 0; i < cards.length; i++) {
          
          if (ranks.indexOf(cards[i]) > -1 && rank === 0) {
    //        console.log(">>>>>>>>>>>>>>>>>>>>>> :",cards[i]);
            let rankKicker = await Sys.Game.Reguler.Texas.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], ''), 4);  
     //       console.log("Ranks >> :",ranks);
    //        console.log("rankKicker >> :",rankKicker);
            rank = rnk + rankKicker.rank; setBestCard([cards[i], rankKicker.cards]);
          }
          rnk--;
        }
       // console.log(">>>>>>>>>>>>>> rank :",rank);
        if (rank !== 0) { message = 'HighCard'; }
      }
      result = new Result(rank, message, bestCards);
      return result;
    }
    catch (e) {
      console.log("Error in rankHandInt :", e);
      return new Error(e);
    }
  },

}
