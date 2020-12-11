var Sys = require('../../../../Boot/Sys');
const mongoose = require('mongoose');
// class Result {
//   constructor(rank, message, bestCards) {
//     this.rank = rank;
//     this.message = message;
//     this.bestCards = bestCards;
//   }
// }
module.exports = {

  progress: async function (room) {
    try {
      let self = this
      //var i, j, cards, hand;
      if (room.game) {
       
        if (await self.checkForEndOfRound(room) === true || room.game.status == 'ForceFinishedFolded' || room.game.status == 'ForceFinishedAllIn') {
          console.log("change player turn", room.game.status, room.status);
          clearTimeout(Sys.Timers[room.id]);
          clearInterval(Sys.Timers[room.id]);
          await self.changePlayerTurn(room); // When Roud Finished Set Player Turn To Big Blind
          //Move all bets to the pot
          console.log("room status", room.game.status, room.game.gameNumber);
          console.log("room.game.bets", room.game.bets, room.game.gameNumber);
          for (i = 0; i < room.game.bets.length; i += 1) {
            room.game.pot += parseFloat(room.game.bets[i], 10);
            room.game.roundBets[i] += parseFloat(room.game.bets[i], 10);
          }
          room.game.pot = + parseFloat(room.game.pot).toFixed(2);
          console.log("************room.game.pot***********", room.game.pot, room.game.status, room.status);
          // Save Sidepot Data;
          let sidePot = await room.game.getSidePotAmount(room); // Save Data
          console.log('<=> Side Pot ||  Omaha GAME-NUMBER [' + room.game.gameNumber + '] || Player SidePot : ', sidePot);
          if (room.game.status == 'ForceFinishedAllIn') {
            console.log('----------ForceFinishedAllIn--------------------------', room.game.gameNumber, room.game.status, room.status);

            let turnBetData = room.getPreviousPlayerAction();
            await Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(room.id).emit('PlayerAction', {
              action: turnBetData,
              playerBuyIn: (turnBetData.playerId) ? parseFloat(room.getPlayerById(turnBetData.playerId).chips) : 0,
              roomId: room.id,
              totalTablePotAmount: room.game.pot,
            });

            /*Code to display all players cards when forcefinshallin*/
            let playersCards = [];
            for (let i = 0; i < room.players.length; i++) {
              // show cards to all players
              console.log("show all cards to all players")
              if (room.players[i].status == 'Playing' && room.players[i].folded == false) {
                if (room.players[i].muck == true) {
                  playersCards.push({
                    playerId: room.players[i].id,
                    cards: ['BC', 'BC']
                  });
                } else {
                  room.players[i].isDisplayedCard = true;
                  playersCards.push({
                    playerId: room.players[i].id,
                    cards: room.players[i].cards
                  });
                }
              }

            }
            await Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(room.id).emit('GameFinishedPlayersCards', { playersCards: playersCards, roomId: room.id });

            /*Code to display all players cards when forcefinshallin*/



            /** Start ::: Custom code for Side Pot Two Player (code is Petch) */

            let playersLength = 0;
            for (let i = 0; i < room.players.length; i += 1) {
              if (room.players[i].status != 'Ideal' && room.players[i].status != 'Left') {
                playersLength += 1;
              }
            }
            console.log("::: SidePot Length :", sidePot.length)
            if (playersLength == 2 && sidePot.length > 0) {
              console.log("/************************************/")
              console.log("::: SidePot :", sidePot)
              console.log("::: sidePot[0].sidePotAmount  :", sidePot[0].sidePotAmount)
              console.log("::: room.game.gameMainPot :", room.game.gameMainPot)
              // room.game.gameMainPot = parseFloat(room.game.gameMainPot) + parseFloat(sidePot[0].sidePotAmount);
              // sidePot = [];
              console.log("::: SidePot :", sidePot)

              console.log("::: room.game.gameMainPot :", room.game.gameMainPot)
              console.log("/************************************/")

            }
            /** End ::: Custom code for Side Pot Two Player (code is Petch) */

            //await self.revertPoint(room);

            switch (room.game.roundName) {
              case 'Preflop':
                console.log(":: Preflop ALL IN ---------------", room.game.gameNumber, room.game.status, room.status);
                room.game.deck.pop();
                /*room.game.board.push('JC');
                room.game.board.push('5D');
                room.game.board.push('QD');
                room.game.board.push('9C');
                room.game.board.push('8D');*/
                for (i = 0; i < 5; i += 1) { // shubh
                  room.game.board.push(room.game.deck.pop());
                }
                await self.checkForWinner(room); // shubh
                await self.revertPoint(room, false); // shubh
                let tempBoardThree = []; // shubh
                for (let i = 0; i < 3; i++) { // shubh
                  tempBoardThree.push(room.game.board[i]); // shubh
                } // shubh
                room.game.roundName = 'Flop';
                Sys.Timers[room.id] = setTimeout(async function (room) {
                  let dataObj = {
                    roundStarted: room.game.roundName,
                    // cards: room.game.board, // shubh
                    cards: tempBoardThree, // shubh
                    potAmount: room.game.pot,
                  };

                  console.log("Preflop round complete room.game.gameMainPot: ", room.game.gameMainPot);

                  console.log('<=> Game Round Complete Broadcast ||  Omaha GAME-NUMBER [' + room.game.gameNumber + '] || RoundComplete : ', dataObj);
                  Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(room.id).emit('RoundComplete', {
                    roundStarted: room.game.roundName,
                    // cards: room.game.board, // shubh
                    cards: tempBoardThree, // shubh
                    potAmount: room.game.pot,
                    PlayerSidePot: {
                      sidePot: sidePot,
                      mainPot: +(room.game.gameMainPot).toFixed(2)
                    },
                    roomId: room.id,
                  })
                  // await self.revertPoint(room,false);


                  Sys.Timers[room.id] = setTimeout(function (room) {
                    // room.game.deck.pop(); // shubh
                    // room.game.board.push(room.game.deck.pop()); // shubh
                    let tempBoardFour = []; // shubh
                    for (let i = 0; i < 4; i++) { // shubh
                      tempBoardFour.push(room.game.board[i]); // shubh
                    } // shubh
                    room.game.roundName = 'Turn';

                    Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(room.id).emit('RoundComplete', {
                      roundStarted: room.game.roundName,
                      // cards: room.game.board, // shubh
                      cards: tempBoardFour, // shubh
                      potAmount: room.game.pot,
                      PlayerSidePot: {
                        sidePot: sidePot,
                        mainPot: +(room.game.gameMainPot).toFixed(2)
                      },
                      roomId: room.id,
                    });
                    Sys.Timers[room.id] = setTimeout(async function (room) {
                      // room.game.deck.pop(); // shubh
                      // room.game.board.push(room.game.deck.pop()); // shubh
                      room.game.roundName = 'Showdown';
                      room.game.bets.splice(0, room.game.bets.length);
                      for (j = 0; j < room.players.length; j += 1) {
                        hand = new Sys.Game.Sng.Omaha.Entities.Hand(
                          room.players[j].cards,
                          room.game.board
                        )
                        //  room.players[j].hand = await self.rankHand(hand);
                      }
                      // await self.checkForWinner(room); // shubh
                      // await self.revertPoint(room,false); // shubh
                      //await self.checkForBankrupt(room);
                      room.currentPlayer = undefined;
                      room.game.status = 'Finished AllIn'
                      // depricated
                      // Event.fire("PokerGameFinished", room);
                      await Sys.Game.Sng.Omaha.Controllers.RoomProcess.gameFinished(room, sidePot)

                    }, 1000, room)
                  }, 1500, room)





                  /* room.game.deck.pop();
                  room.game.board.push(room.game.deck.pop());
                  room.game.roundName = 'Turn';

                  Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(room.id).emit('RoundComplete', {
                        roundStarted: room.game.roundName,
                    cards: room.game.board,
                    potAmount: room.game.pot,
                    PlayerSidePot : {
                      sidePot : sidePot,
                      mainPot : room.game.gameMainPot
                    },
                    roomId: room.id,
                  });

                  room.game.deck.pop();
                  room.game.board.push(room.game.deck.pop());
                  room.game.roundName = 'Showdown';
                  room.game.bets.splice(0, room.game.bets.length);
                  for (j = 0; j < room.players.length; j += 1) {
                    hand = new Sys.Game.Sng.Omaha.Entities.Hand(
                      room.players[j].cards,
                      room.game.board
                    )
                    //  room.players[j].hand = await self.rankHand(hand);
                  }
                  await self.checkForWinner(room);
                  await self.revertPoint(room,false);
                  //await self.checkForBankrupt(room);
                  room.currentPlayer = undefined;
                  room.game.status = 'Finished AllIn'
                  // depricated
                  // Event.fire("PokerGameFinished", room);
                  await Sys.Game.Sng.Omaha.Controllers.RoomProcess.gameFinished(room,sidePot) */

                  /* Sys.Timers[room.id] = setTimeout(function (room) {

                       Sys.Timers[room.id] = setTimeout(async function (room) {



                       }, 1000, room)
                   }, 1500, room)*/




                }, 1000, room)
                break;
              case 'Flop':
                console.log(":: Flop ALL IN ---------------", room.game.gameNumber, room.game.status, room.status);
                // room.game.deck.pop();
                // room.game.board.push(room.game.deck.pop());
                for (let i = 0; i < 2; i++) {
                  room.game.board.push(room.game.deck.pop());
                }
                /*room.game.board.push('9C');
                room.game.board.push('8D');*/
                await self.checkForWinner(room); // shubh
                await self.revertPoint(room, false); // shubh
                let tempBoardFour = []; // shubh
                for (let i = 0; i < 4; i++) { // shubh
                  tempBoardFour.push(room.game.board[i]); // shubh
                } // shubh
                room.game.roundName = 'Turn';
                Sys.Timers[room.id] = setTimeout(async function (room) {
                  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n");
                  console.log("tempBoardFour :", tempBoardFour, "\n");
                  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

                  console.log("Flop round complete room.game.gameMainPot: ", room.game.gameMainPot);

                  Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(room.id).emit('RoundComplete', {
                    roundStarted: room.game.roundName,
                    // cards: room.game.board, // shubh
                    cards: tempBoardFour, // shubh
                    potAmount: room.game.pot,
                    PlayerSidePot: {
                      sidePot: sidePot,
                      mainPot: +(room.game.gameMainPot).toFixed(2)
                    },
                    roomId: room.id,
                  });
                  //await self.revertPoint(room,false);

                  /* room.game.deck.pop();
                  room.game.board.push(room.game.deck.pop());
                  room.game.roundName = 'Showdown';
                  room.game.bets.splice(0, room.game.bets.length);
                  for (j = 0; j < room.players.length; j += 1) {
                    hand = new Sys.Game.Sng.Omaha.Entities.Hand(
                      room.players[j].cards,
                      room.game.board
                    );
                    //room.players[j].hand = await self.rankHand(hand);
                  }
                  await self.checkForWinner(room);
                  await self.revertPoint(room, false);
                 // await self.checkForBankrupt(room);
                  room.currentPlayer = undefined;
                  room.game.status = 'Finished AllIn'
                  await Sys.Game.Sng.Omaha.Controllers.RoomProcess.gameFinished(room,sidePot) */

                  Sys.Timers[room.id] = setTimeout(async function (room) {
                    // room.game.deck.pop(); // shubh
                    // room.game.board.push(room.game.deck.pop()); // shubh
                    room.game.roundName = 'Showdown';
                    room.game.bets.splice(0, room.game.bets.length);
                    for (j = 0; j < room.players.length; j += 1) {
                      hand = new Sys.Game.Sng.Omaha.Entities.Hand(
                        room.players[j].cards,
                        room.game.board
                      );
                      //room.players[j].hand = await self.rankHand(hand);
                    }
                    // await self.checkForWinner(room); // shubh
                    // await self.revertPoint(room, false); // shubh
                    // await self.checkForBankrupt(room);
                    room.currentPlayer = undefined;
                    room.game.status = 'Finished AllIn'
                    await Sys.Game.Sng.Omaha.Controllers.RoomProcess.gameFinished(room, sidePot)
                  }, 1000, room) // shubh

                }, 1000, room)
                break;
              case 'Turn':
                console.log(":: Turn ALL IN ---------------", room.game.gameNumber);
                room.game.deck.pop();
                room.game.board.push(room.game.deck.pop());
                //room.game.board.push('8D');
                room.game.roundName = 'Showdown';
                room.game.bets.splice(0, room.game.bets.length);
                for (j = 0; j < room.players.length; j += 1) {
                  hand = new Sys.Game.Sng.Omaha.Entities.Hand(
                    room.players[j].cards,
                    room.game.board
                  );
                  //room.players[j].hand = await self.rankHand(hand);
                }
                await self.checkForWinner(room);
                await self.revertPoint(room, false);
                // await self.checkForBankrupt(room);
                room.currentPlayer = undefined;
                room.game.status = 'Finished AllIn'
                await Sys.Game.Sng.Omaha.Controllers.RoomProcess.gameFinished(room, sidePot)
                break;
              default:
                console.log(":: Default ALL IN ---------------", room.game.status, room.status);
                room.game.roundName = 'Showdown';
                room.game.bets.splice(0, room.game.bets.length);
                for (j = 0; j < room.players.length; j += 1) {
                  hand = new Sys.Game.Sng.Omaha.Entities.Hand(
                    room.players[j].cards,
                    room.game.board
                  )
                  // room.players[j].hand = await self.rankHand(hand);
                }
                await self.checkForWinner(room);
                await self.revertPoint(room, false);
                // await self.checkForBankrupt(room);
                room.currentPlayer = undefined;
                room.game.status = 'Finished AllIn'
                await Sys.Game.Sng.Omaha.Controllers.RoomProcess.gameFinished(room, sidePot);
            }
          } else if (room.game.roundName === 'River' || room.game.status == 'ForceFinishedFolded') {
            console.log('effective river ForceFinishedFolded', room.game.gameNumber, room.game.status, room.status);

            let turnBetData = room.getPreviousPlayerAction();
            await Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(room.id).emit('PlayerAction', {
              action: turnBetData,
              playerBuyIn: (turnBetData.playerId) ? parseFloat(room.getPlayerById(turnBetData.playerId).chips) : 0,
              roomId: room.id,
              totalTablePotAmount: room.game.pot,
              /*PlayerSidePot : {
                sidePot : sidePot,
                mainPot : room.game.pot
              }*/
            });

            /*if(room.game.status == 'ForceFinishedFolded'){
              console.log("lastplayer folded id", room.otherData.lastFoldedPlayerId)
              if(room.otherData.lastFoldedPlayerId){
                 Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(room.id).emit('DisplayShowCardButton', { playerIdList : [room.otherData.lastFoldedPlayerId], gameId: room.game.id, roomId: room.id });
              }
            }*/

            console.log("river round complete sidePot: ", sidePot);
            console.log("river round complete room.game.gameMainPot: ", room.game.gameMainPot);
            console.log("river round complete room.game.pot: ", room.game.pot);

            room.game.roundName = 'Showdown';
            for (i = 0; i < room.game.bets.length; i += 1) {
              room.game.bets[i] = 0;
            }
            room.game.maxBetOnRaise = 0;
            room.game.stopReraise = false;
            room.game.isUnqualifiedRaise = false;

            console.log('<=> Game Finished Round Complete Broadcast in FORCEFINISHFOLDED ||  Omaha GAME-NUMBER [' + room.game.gameNumber + '] || RoundComplete : ');

            await Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(room.id).emit('RoundComplete', {
              roundStarted: room.game.roundName,
              cards: room.game.board,
              potAmount: room.game.pot,
              roomId: room.id,
              PlayerSidePot: {
                sidePot: sidePot,
                //mainPot : room.game.pot
                mainPot: +(room.game.gameMainPot).toFixed(2)
              }
            });
            await self.checkForWinner(room);
            Sys.Timers[room.id] = setTimeout(async function (room) {
              await self.revertPoint(room, true);
              room.currentPlayer = undefined;
              //room.game.status = 'Finished'

              await Sys.Game.Sng.Omaha.Controllers.RoomProcess.gameFinished(room, sidePot)
            }, 1000, room)
            //  await self.checkForBankrupt(room);
          } else if (room.game.roundName === 'Turn') {
            console.log('effective turn', room.game.gameNumber, room.game.status, room.status);
            room.game.roundName = 'River';
            room.game.deck.pop(); //Burn a card
            room.game.board.push(room.game.deck.pop()); //Turn a card
            //room.game.board.push('8D');
            for (i = 0; i < room.game.bets.length; i += 1) {
              room.game.bets[i] = 0;
            }
            for (i = 0; i < room.players.length; i += 1) {
              room.players[i].talked = false;
              room.players[i].isSidepot = false;
              room.players[i].roundRaisedAmount = 0;
            }
            room.game.maxBetOnRaise = 0;
            room.game.stopReraise = false;
            room.game.isUnqualifiedRaise = false;


            await Sys.Game.Sng.Omaha.Controllers.RoomProcess.roundFinished(room, sidePot)

          } else if (room.game.roundName === 'Flop') {
            console.log('effective flop', room.game.gameNumber, room.game.status, room.status);
            room.game.roundName = 'Turn';
            room.game.deck.pop(); //Burn a card
            room.game.board.push(room.game.deck.pop()); //Turn a card
            //room.game.board.push('9C');
            for (i = 0; i < room.game.bets.length; i += 1) {
              room.game.bets[i] = 0;
            }
            for (i = 0; i < room.players.length; i += 1) {
              room.players[i].talked = false;
              room.players[i].isSidepot = false;
              room.players[i].roundRaisedAmount = 0;
            }
            room.game.maxBetOnRaise = 0;
            room.game.stopReraise = false;
            room.game.isUnqualifiedRaise = false;


            console.log("round Finished");
            await Sys.Game.Sng.Omaha.Controllers.RoomProcess.roundFinished(room, sidePot)

          } else if (room.game.roundName === 'Preflop') {
            console.log('effective deal', room.game.gameNumber, room.game.status, room.status);
            room.game.roundName = 'Flop';
            room.game.deck.pop(); //Burn a card
            for (i = 0; i < 3; i += 1) { //Turn three cards
              room.game.board.push(room.game.deck.pop());
            }

            /* room.game.board.push('JC');
             room.game.board.push('5D');
             room.game.board.push('QD');*/

            for (i = 0; i < room.game.bets.length; i += 1) {
              room.game.bets[i] = 0;
            }
            for (i = 0; i < room.players.length; i += 1) {
              room.players[i].talked = false;
              room.players[i].isSidepot = false;
              room.players[i].roundRaisedAmount = 0;
            }
            room.game.maxBetOnRaise = 0;
            room.game.stopReraise = false;
            room.game.isUnqualifiedRaise = false;


            console.log("round Finished 2", room.game.status, room.status);
            await Sys.Game.Sng.Omaha.Controllers.RoomProcess.roundFinished(room, sidePot)
          } else {
            console.log("showdown else condition in progress");
            await self.revertPoint(room, true);
            room.currentPlayer = undefined;
            await Sys.Game.Sng.Omaha.Controllers.RoomProcess.gameFinished(room, sidePot);
          }
        }
        else {
          console.log("room status turnFinished", room.game.status, room.status);
          await Sys.Game.Sng.Omaha.Controllers.RoomProcess.turnFinished(room);
        }
      }
    } catch (e) {
      console.log("Error: ", e);
    }

  },

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
      var maxBet, endOfRound, notFoldedPlayers, notAllInPlayers, currentTurn,maxbetPlayerIndex,notAllInPlayersIndex;
      endOfRound = true;
      maxBet = await this.getMaxBet(room.game.bets);
      notFoldedPlayers = 0;
      notAllInPlayers = 0;
      currentTurn = room.currentPlayer;

      console.log("----------------------------------------------------------");
      console.log('Current Player :',currentTurn, room.game.gameNumber, room.game.status, room.status);
      console.log("----------------------------------------------------------");


      //For each player, check
        for (let i = currentTurn; i < room.players.length; i += 1) {
          if (room.players[i].folded === false && room.players[i].status === 'Playing' ) {
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
          for (let i = 0; i < currentTurn; i++) {
              if (room.players[i].folded === false && room.players[i].status === 'Playing' ) {
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




      for (let i = 0; i < room.players.length; i += 1) {
         if(room.game.bets[i] == maxBet){ // Get Mabet Player Index
              maxbetPlayerIndex = i;
         }
        if (room.players[i].folded === false && room.players[i].status === 'Playing' ) {
            notFoldedPlayers += 1;
            if (room.players[i].allIn === false) {
                notAllInPlayers += 1;
                notAllInPlayersIndex = i; // When Single Player is Remain in not All in Then We use this variable. so do not confuse.
            }
        }
      }
 
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


 

      console.log("----------------------------------------------------------");
      console.log('Checking round',endOfRound,   room.currentPlayer , room.game.status);
      console.log("----------------------------------------------------------");
      
      return endOfRound;
    } catch (e) {
      console.log("Error: ",e);
    }
  },

  changePlayerTurn: async function(room) {
    try {
      let oldTurn = room.currentPlayer;
      let playerFound = false;
      console.log("all players in room ", room.players, room.game.gameNumber)
      console.log("delaer index", room.dealerIndex)
      console.log("oldTurn", oldTurn);
      console.log("smallblent----",room.smallBlindIndex,room.players.length )
      for (let i = room.smallBlindIndex; i < room.players.length; i += 1) {
        console.log("room.players status in changeplayerChnage function", room.players[i].playerName,room.players[i].id, room.players[i].folded, room.players[i].allIn, room.players[i].status )
          if (room.players[i].folded === false && room.players[i].allIn === false && room.players[i].status === 'Playing') {
              room.currentPlayer = i;
              playerFound = true;
              break;
          }
      }
      console.log("decided current player", room.currentPlayer, playerFound, room.game.gameNumber)
      if (oldTurn == room.currentPlayer && playerFound == false) {console.log("yes iam in same turn so change my turn", room.game.status, room.status)
          for (let i = 0; i < room.smallBlindIndex; i += 1) {
            if(i != room.dealerIndex){
              console.log("room.players status in changeplayerChnage function in samePlayerTurn", room.players[i].playerName,room.players[i].id, room.players[i].folded, room.players[i].allIn, room.players[i].status )
              if (room.players[i].folded === false && room.players[i].allIn === false && room.players[i].status === 'Playing') {
                room.currentPlayer = i;
                break;
              }
            }
            
          }
      }
      console.log("final current player", room.currentPlayer)
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
      clearTimeout(Sys.Timers[room.id]);
      clearInterval(Sys.Timers[room.id]);

      console.log('<=> Game Check For Winner || Omaha GAME-NUMBER ['+room.game.gameNumber+'] ');
      // Poker Winning New Logic Start Here.
      /**
       * Side Pot Winner Calculation.
       */

      if(room.limit == "Hi-Lo" || room.limit == "Hi-Lo-pot_limit" || room.limit == "Hi-Lo-limit"){
        for(let h = 0; h < room.game.gamePot.length; h += 1){
          let playerIndexes = room.game.gamePot[h].playerIndex;
          console.log("Side POT playerIndexes HI-LO",playerIndexes);
          let SidePotPlayerIndex = [];
          let hands = [];
          for(let i = 0; i < room.game.board.length; i++){
            room.game.board[i] = room.game.board[i].charAt(0) + room.game.board[i].charAt(1).toLowerCase(); 
          }
          for(let l = 0; l < playerIndexes.length; l++ ){
            for(let m = 0; m < room.players[playerIndexes[l]].cards.length; m++){
              room.players[playerIndexes[l]].cards[m] = room.players[playerIndexes[l]].cards[m].charAt(0) + room.players[playerIndexes[l]].cards[m].charAt(1).toLowerCase();
            }
            hands.push({id: playerIndexes[l], cards: room.players[playerIndexes[l]].cards});
          }             
          
          console.log("HANDS",hands)
          var results = Sys.Ranker.orderHands(hands,room.game.board,Sys.Ranker.OMAHA_HI_LO);
          console.log("RE",results)
          let hiWinners = [];
          let lowWinners = [];
          results.high = results.high.reduce((acc, val) => acc.concat(val), []);
          for(let i = 0; i < results.high.length; i++){
            if(results.high[i].ranking == results.high[0].ranking && i != 0){
              let AddWinner = checkCards(results.high[0],results.high[i]);
              console.log("ADD WINNER",AddWinner)
              if(AddWinner == true){
                hiWinners.push(results.high[i]);
              }
            }else if(i == 0){
              hiWinners.push(results.high[i]);
            }
          }
          if(results.low){
            results.low = results.low.reduce((acc, val) => acc.concat(val), []);
          }
          for(let j = 0; j < results.low.length; j++){
            if(results.low[j].ranking == results.low[0].ranking && j != 0){
              let AddWinner = checkCards(results.low[0],results.low[j]);
              console.log("ADD WINNER",AddWinner)
              if(AddWinner == true){
                lowWinners.push(results.low[j]);
              }
            }else if(j == 0){
              lowWinners.push(results.low[j]);
            }
          }

          console.log("HI WINNERS FOR SIDE POT",hiWinners);
          console.log("LOW WINNERS FOR SIDE POT",lowWinners);
          let winplr, winAmount, winAmountHighPart, winTotalAmount, winAmountLowPart;
          let oddAmount = 0;
          winTotalAmount = + parseFloat(room.game.gamePot[h].sidePotAmount).toFixed(4);
          if(winTotalAmount % 1 !== 0){
            let checkOddAmount = winTotalAmount % 10;
            if(checkOddAmount > 1){
              winTotalAmount -= 1;
              oddAmount += 1;
            }else{
              winTotalAmount -= checkOddAmount;
              oddAmount += checkOddAmount;
            }
          }
          winAmountHighPart = + parseFloat( parseFloat(winTotalAmount) / 2 ).toFixed(4);
          winAmountLowPart = winTotalAmount - winAmountHighPart;
          
          console.log("WIN TOTAL SIDE POT AMOUNT",winTotalAmount)
          console.log('WIN AMOUNT SIDE POT HIGH PART',winAmountHighPart)
          console.log("WIN AMOUNT SIDE POT LOW PART",winAmountLowPart)
          console.log("ODD SIDE POT AMOUNT",oddAmount)

          for(let k = 0; k < hiWinners.length; k++){
            console.log("HI",hiWinners[k])
            winplr = room.players[hiWinners[k].id];
            winplr.hand = hiWinners[k];
            let bestCards = [];
            for(let f=0; f < hiWinners[k].playingCards.length; f++){
              if(hiWinners[k].playingCards[f].rank == '1' || hiWinners[k].playingCards[f].rank == '14' ){ // If got '1' instead of 'A' 
                 hiWinners[k].playingCards[f].rank = 'A';
              }else if(hiWinners[k].playingCards[f].rank == '13'){
                hiWinners[k].playingCards[f].rank = 'K';
              }else if(hiWinners[k].playingCards[f].rank == '12'){
                hiWinners[k].playingCards[f].rank = 'Q';
              }else if(hiWinners[k].playingCards[f].rank == '11'){
                hiWinners[k].playingCards[f].rank = 'J';
              }else if(hiWinners[k].playingCards[f].rank == '10'){
                hiWinners[k].playingCards[f].rank = 'T';
              }

              bestCards.push(hiWinners[k].playingCards[f].rank + hiWinners[k].playingCards[f].suit.toUpperCase());  
            }
            winplr.hand.bestCards = bestCards;
            console.log("WIN PLAYER",winplr,winTotalAmount,winAmountHighPart,winAmountLowPart,oddAmount)

            if(lowWinners.length > 0){
              winAmount = winAmountHighPart;
              if(hiWinners.length > 1 && k != hiWinners.length -1 ){
                winAmount = parseFloat( parseFloat(winAmount) / hiWinners.length ).toFixed(4); 
                winAmountHighPart -= winAmount;
              }
            }else{
              winAmount = winTotalAmount;
              if(hiWinners.length > 1 && k != hiWinners.length -1){
                winAmount = parseFloat( parseFloat(winAmount) / hiWinners.length ).toFixed(4); 
              }
            }
            console.log("WIN HIGH TOTAL AMOUNT BEFORE",winTotalAmount, winAmount)
            winTotalAmount = winTotalAmount - winAmount;
            if(k == 0  && oddAmount > 0){
              winAmount = parseFloat(parseFloat(winAmount) + parseFloat(oddAmount)).toFixed(4);
            }
            console.log("WIN HIGH TOTAL AMOUNT AFTER",winTotalAmount,winAmount)
            winplr.chips += parseFloat(winAmount);

            let player = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(winplr.id);
            player.statistics.cashgame.totalWonGame++; 
            player.statistics.cashgame.totalLoseGame = parseInt(player.statistics.cashgame.noOfPlayedGames)-parseInt(player.statistics.cashgame.totalWonGame);
            await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(player.id, { statistics: player.statistics });
            room.gameWinners.push({
              playerId: winplr.id,
              playerName: winplr.playerName,
              amount: +parseFloat(winAmount).toFixed(2),
              hand: winplr.cards,
              bestCards : winplr.hand.bestCards,
              winningType : 'WINNER HI',
              uniqId:winplr.uniqId,
              // rank : winplr.hand.rank,
              chips : parseFloat(winplr.chips),
              winnerSeatIndex : winplr.seatIndex,
              sidePotPlayerIndex: room.game.gamePot[h].sidePotPlayerSeatIndex,
              sidePotPlayerId : room.game.gamePot[h].sidePotPlayerID,
              rackAmount : 0,
              winningHandName: winplr.hand.ranking
            });
          }
          for(let m = 0; m < lowWinners.length; m++){
            console.log("LOW",lowWinners[m])
            winplr = room.players[lowWinners[m].id];
            winplr.hand = lowWinners[m];
            let bestCards = [];
            for(let f=0; f < lowWinners[m].playingCards.length; f++){
              if(lowWinners[m].playingCards[f].rank == '1' || lowWinners[m].playingCards[f].rank == '14' ){ // If got '1' instead of 'A' 
                 lowWinners[m].playingCards[f].rank = 'A';
              }else if(lowWinners[m].playingCards[f].rank == '13'){
                lowWinners[m].playingCards[f].rank = 'K';
              }else if(lowWinners[m].playingCards[f].rank == '12'){
                lowWinners[m].playingCards[f].rank = 'Q';
              }else if(lowWinners[m].playingCards[f].rank == '11'){
                lowWinners[m].playingCards[f].rank = 'J';
              }else if(lowWinners[m].playingCards[f].rank == '10'){
                lowWinners[m].playingCards[f].rank = 'T';
              }
              bestCards.push(lowWinners[m].playingCards[f].rank + lowWinners[m].playingCards[f].suit.toUpperCase());  
            }
            winplr.hand.bestCards = bestCards;
            console.log("WIN PLAYER",winplr)
            
            winAmount = winAmountLowPart;
            if(lowWinners.length > 1 && m != lowWinners.length -1 ){
              winAmount = parseFloat( parseFloat(winAmount) / lowWinners.length ).toFixed(4); 
              winAmountLowPart -= winAmount;
            }
              
            console.log("WIN LOW TOTAL AMOUNT BEFORE",winTotalAmount, winAmount)
            winTotalAmount = winTotalAmount - winAmount;
            console.log("WIN LOW TOTAL AMOUNT AFTER",winTotalAmount)
            winplr.chips += parseFloat(winAmount);

            let player = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(winplr.id);
            player.statistics.cashgame.totalWonGame++; 
            player.statistics.cashgame.totalLoseGame = parseInt(player.statistics.cashgame.noOfPlayedGames)-parseInt(player.statistics.cashgame.totalWonGame);
            await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(player.id, { statistics: player.statistics });
            room.gameWinners.push({
              playerId: winplr.id,
              playerName: winplr.playerName,
              amount: +parseFloat(winAmount).toFixed(2),
              hand: winplr.cards,
              bestCards : winplr.hand.bestCards,
              winningType : 'WINNER LO',
              uniqId:winplr.uniqId,
              // rank : winplr.hand.rank,
              chips : parseFloat(winplr.chips),
              winnerSeatIndex : winplr.seatIndex,
              sidePotPlayerIndex: room.game.gamePot[h].sidePotPlayerSeatIndex,
              sidePotPlayerId : room.game.gamePot[h].sidePotPlayerID,
              rackAmount : 0,
              winningHandName: winplr.hand.ranking
            });
          }
        }

      }else{
        for (let h = 0; h < room.game.gamePot.length; h += 1) {

          let playerIndexes = room.game.gamePot[h].playerIndex;
           console.log("Side POT playerIndexes",playerIndexes);
           let SidePotPlayerIndex = [];
           let PokerWinnnerHands = [];
           for(let r=0; r < playerIndexes.length; r++){
             let maxHand = null;
             let playerCombineCards = combine(room.players[playerIndexes[r]].cards,2);
             let bordCombineCards = combine(room.game.board,3);
             let allPosibility = [];
             for(let x=0; x < playerCombineCards.length; x++){
               for(let y=0; y < bordCombineCards.length; y++){
                 allPosibility.push(Sys.Poker.solve(bordCombineCards[y].concat(playerCombineCards[x])));
               }
             }
             let OmahaWinnerResult = Sys.Poker.winners(allPosibility);
             maxHand = Sys.Poker.solve(OmahaWinnerResult[0].cards);
             SidePotPlayerIndex.push({
               index : playerIndexes[r],
               hand : maxHand
             })
             PokerWinnnerHands.push(maxHand);
           }
   
           let PokerWinnerResult = Sys.Poker.winners(PokerWinnnerHands);
           console.log("No Of Winners :",PokerWinnerResult.length);
   
           
           let winplr,winAmount,winAmountPart,winTotalAmount;
           winTotalAmount = parseFloat(room.game.gamePot[h].sidePotAmount);
           winAmountPart = parseFloat(parseFloat(room.game.gamePot[h].sidePotAmount) / parseFloat(PokerWinnerResult.length));
           console.log("Win-Total-Amount",winTotalAmount)
           // Save winner
   
   
           for (let s = 0; s < PokerWinnerResult.length; s++) {
               console.log("tempWinner.length",PokerWinnerResult.length)
               if(s == PokerWinnerResult.length-1){
                 winAmount = winTotalAmount;
               }else{
                 winAmount = winAmountPart;
               }
               winTotalAmount = winTotalAmount - winAmountPart;
   
              if(PokerWinnerResult.length == PokerWinnnerHands.length){
                     console.log("ALL Sidepot Player Winners");
                     winplr = room.players[SidePotPlayerIndex[s].index];
                     winplr.hand = SidePotPlayerIndex[s].hand;
                     let bestCards = [];
                     for(let f=0; f < PokerWinnerResult[s].cards.length; f++){
                       console.log("card length", PokerWinnerResult[s].cards.length, PokerWinnerResult[s].cards[f])
                       bestCards.push(
                         PokerWinnerResult[s].cards[f].value + PokerWinnerResult[s].cards[f].suit.toUpperCase()
                       )
                     }
                     console.log("BestCards 1->",bestCards)
                     winplr.hand.bestCards = bestCards;
               }else{
                 //for(let i=0; i< PokerWinnerResult.length; i++){
                   for(let k=0; k< SidePotPlayerIndex.length; k++){
                     if(JSON.stringify(SidePotPlayerIndex[k].hand.cards) == JSON.stringify(PokerWinnerResult[s].cards)){
                       console.log("POKER WINNER :",SidePotPlayerIndex[k].index);
                       winplr = room.players[SidePotPlayerIndex[k].index];
                       winplr.hand = SidePotPlayerIndex[k].hand;
                       let bestCards = [];
                       for(let f=0; f < PokerWinnerResult[s].cards.length; f++){
                         console.log("card length", PokerWinnerResult[s].cards.length, PokerWinnerResult[s].cards[f])
                         bestCards.push(
                           PokerWinnerResult[s].cards[f].value + PokerWinnerResult[s].cards[f].suit.toUpperCase()
                         )
                       }
                       console.log("BestCards 2->",bestCards)
                       winplr.hand.bestCards = bestCards;
                     }
                   }
                // }
               }
               winplr.chips += parseFloat(winAmount);
               let sidePotPlayerSeatIndex =  room.game.gamePot[h].sidePotPlayerSeatIndex
             /** Start ::: Custom code for Side Pot Two Player (code is Petch) */
                 let playersLength = 0;
                 for (let i = 0; i < room.players.length; i += 1) {
                   if(room.players[i].status != 'Ideal' && room.players[i].status != 'Left'){
                     playersLength += 1;
                   }
                 }
                 console.log("################################### ::: SidePot Length :",playersLength )
                /* if(playersLength == 2 ){
                   sidePotPlayerSeatIndex = -1;
                 }*/
               /** End ::: Custom code for Side Pot Two Player (code is Petch) */
               // Update Player Statistics
   
               let player = await Sys.Game.Sng.Omaha.Services.PlayerServices.getById(winplr.id);
               player.statistics.sng.totalWonGame++; 
               player.statistics.sng.totalLoseGame = parseInt(player.statistics.sng.noOfPlayedGames)-parseInt(player.statistics.sng.totalWonGame);
               await Sys.Game.Sng.Omaha.Services.PlayerServices.update(player.id, { statistics: player.statistics });
             room.gameWinners.push({
                 playerId: winplr.id,
                 playerName: winplr.playerName,
                 amount: +parseFloat(winAmount).toFixed(2),
                 hand: winplr.cards,
                 bestCards : winplr.hand.bestCards,
                 winningType : winplr.hand.name,
                 rank : winplr.hand.rank,
                 chips : parseFloat(winplr.chips),
                 winnerSeatIndex : winplr.seatIndex,
                 sidePotPlayerIndex:sidePotPlayerSeatIndex,
                 sidePotPlayerId : room.game.gamePot[h].sidePotPlayerID, // Add for Testing
                 rackAmount : 0
               });
           }
         }
      }

      console.log(" room.game.gameMainPot :",room.game.gameMainPot);
      // Check Main Port Winner
      if(room.game.gameMainPot > 0){

        if(room.limit == "Hi-Lo" || room.limit == "Hi-Lo-pot_limit" || room.limit == "Hi-Lo-limit"){
          let lastPlayerCount = 0;
          let hands = [];
          for(let i = 0; i < room.game.board.length; i++){
              room.game.board[i] = room.game.board[i].charAt(0) + room.game.board[i].charAt(1).toLowerCase(); 
          }
          for (let k = 0; k < room.players.length; k += 1){
            if (room.players[k].folded === false && room.players[k].allIn === false && room.players[k].status ===  'Playing') {
              lastPlayerCount++;
            } 
            if(room.players[k].folded === false && room.players[k].allIn === false && room.players[k].status ===  'Playing'){
              let maxHand = null;
              for(let l = 0; l < room.players[k].cards.length; l++ ){
                room.players[k].cards[l] = room.players[k].cards[l].charAt(0) + room.players[k].cards[l].charAt(1).toLowerCase();
              }             
              hands.push({id: k, cards: room.players[k].cards});
            }
          }
            var results;
            if(room.game.board.length > 0){
              results = Sys.Ranker.orderHands(hands,room.game.board,Sys.Ranker.OMAHA_HI_LO);
            }
           
            console.log("RE",results)
            let hiWinners = [];
            let lowWinners = [];
            if(results != undefined){
              results.high = results.high.reduce((acc, val) => acc.concat(val), []);
              for(let i = 0; i < results.high.length; i++){
                if(results.high[i].ranking == results.high[0].ranking && i != 0){
                  let AddWinner = checkCards(results.high[0],results.high[i]);
                  console.log("ADD WINNER",AddWinner)
                  if(AddWinner == true){
                    hiWinners.push(results.high[i]);
                  }  
                }else if(i == 0){
                  hiWinners.push(results.high[i]);
                }
              }
              if(results.low){
                results.low = results.low.reduce((acc, val) => acc.concat(val), []);
              }
              for(let j = 0; j < results.low.length; j++){
                if(results.low[j].ranking == results.low[0].ranking && j != 0){
                  let AddWinner = checkCards(results.low[0],results.low[j]);
                  console.log("ADD WINNER",AddWinner)
                  if(AddWinner == true){
                    lowWinners.push(results.low[j]);
                  }
                }else if(j == 0){
                  lowWinners.push(results.low[j]);
                }
              }
            }
                       
            console.log("HI WINNERS",hiWinners);
            console.log("LOW WINNERS",lowWinners);
            let winplr, winAmount, winAmountHighPart, winTotalAmount, winAmountLowPart;
            let oddAmount = 0;
            winTotalAmount = + parseFloat(room.game.gameMainPot).toFixed(4);
            if(winTotalAmount % 1 !== 0){
              let checkOddAmount = winTotalAmount % 10;
              if(checkOddAmount > 1){
                winTotalAmount -= 1;
                oddAmount += 1;
              }else{
                winTotalAmount -= checkOddAmount;
                oddAmount += checkOddAmount;
              }
            }
            winAmountHighPart = + parseFloat( parseFloat(winTotalAmount) / 2 ).toFixed(4);
            winAmountLowPart = winTotalAmount - winAmountHighPart;
            
            console.log("WIN TOTAL AMOUNT",winTotalAmount)
            console.log('WIN AMOUNT HIGH PART',winAmountHighPart)
            console.log("WIN AMOUNT LOW PART",winAmountLowPart)
            console.log("ODD AMOUNT",oddAmount)

            if(hands.length == 1 && lastPlayerCount == 1){
              winplr = room.players[hands[0].id];
    
              if(room.game.status == 'ForceFinishedFolded'){
                room.game.gameRevertPoint.push({
                  playerID : winplr.id,
                  amount : winTotalAmount,
                  playerIndex : hands[0].id,
                  forcefinishfolded : true,
                });
              }else{
                room.game.gameRevertPoint.push({
                  playerID : winplr.id,
                  amount : winTotalAmount,
                  playerIndex : hands[0].id,
                  forcefinishfolded : false,
                });
              }
            }else{
              for(let k = 0; k < hiWinners.length; k++){
                console.log("HI",hiWinners[k])
                winplr = room.players[hiWinners[k].id];
                winplr.hand = hiWinners[k];
                let bestCards = [];
                for(let f=0; f < hiWinners[k].playingCards.length; f++){
                  if(hiWinners[k].playingCards[f].rank == '1' || hiWinners[k].playingCards[f].rank == '14' ){ // If got '1' instead of 'A' 
                    hiWinners[k].playingCards[f].rank = 'A';
                  }else if(hiWinners[k].playingCards[f].rank == '13'){
                    hiWinners[k].playingCards[f].rank = 'K';
                  }else if(hiWinners[k].playingCards[f].rank == '12'){
                    hiWinners[k].playingCards[f].rank = 'Q';
                  }else if(hiWinners[k].playingCards[f].rank == '11'){
                    hiWinners[k].playingCards[f].rank = 'J';
                  }else if(hiWinners[k].playingCards[f].rank == '10'){
                    hiWinners[k].playingCards[f].rank = 'T';
                  }
                  bestCards.push(hiWinners[k].playingCards[f].rank + hiWinners[k].playingCards[f].suit.toUpperCase());  
                }
                winplr.hand.bestCards = bestCards;
                console.log("WIN PLAYER",winplr,winTotalAmount,winAmountHighPart,winAmountLowPart,oddAmount)

                if(lowWinners.length > 0){
                  winAmount = winAmountHighPart;
                  if(hiWinners.length > 1 && k != hiWinners.length -1){
                    winAmount = parseFloat( parseFloat(winAmount) / hiWinners.length ).toFixed(4); 
                    winAmountHighPart -= winAmount;
                  }
                }else{
                  winAmount = winTotalAmount;
                  if(hiWinners.length > 1 && k != hiWinners.length -1){
                    winAmount = parseFloat( parseFloat(winAmount) / hiWinners.length ).toFixed(4); 
                  }
                }
                console.log("WIN HIGH TOTAL AMOUNT BEFORE",winTotalAmount, winAmount)
                winTotalAmount = winTotalAmount - winAmount;
                if(k == 0  && oddAmount > 0){
                  winAmount = parseFloat(parseFloat(winAmount) + parseFloat(oddAmount)).toFixed(4);
                }
                console.log("WIN HIGH TOTAL AMOUNT AFTER",winTotalAmount,winAmount)
                winplr.chips += parseFloat(winAmount);

                let player = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(winplr.id);
                player.statistics.cashgame.totalWonGame++; 
                player.statistics.cashgame.totalLoseGame = parseInt(player.statistics.cashgame.noOfPlayedGames)-parseInt(player.statistics.cashgame.totalWonGame);
                await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(player.id, { statistics: player.statistics });
                room.gameWinners.push({
                  playerId: winplr.id,
                  playerName: winplr.playerName,
                  amount: +parseFloat(winAmount).toFixed(2),
                  hand: winplr.cards,
                  bestCards : winplr.hand.bestCards,
                  winningType : 'WINNER HI',
                  uniqId:winplr.uniqId,
                  // rank : winplr.hand.rank,
                  chips : parseFloat(winplr.chips),
                  winnerSeatIndex : winplr.seatIndex,
                  sidePotPlayerIndex: -1, // main Port index,
                  rackAmount : 0,
                  winningHandName: winplr.hand.ranking
                });
              }
              for(let m = 0; m < lowWinners.length; m++){
                console.log("LOW",lowWinners[m])
                winplr = room.players[lowWinners[m].id];
                winplr.hand = lowWinners[m];
                let bestCards = [];
                for(let f=0; f < lowWinners[m].playingCards.length; f++){
                  if(lowWinners[m].playingCards[f].rank == '1' || lowWinners[m].playingCards[f].rank == '14' ){ // If got '1' instead of 'A' 
                    lowWinners[m].playingCards[f].rank = 'A';
                  }else if(lowWinners[m].playingCards[f].rank == '13'){
                    lowWinners[m].playingCards[f].rank = 'K';
                  }else if(lowWinners[m].playingCards[f].rank == '12'){
                    lowWinners[m].playingCards[f].rank = 'Q';
                  }else if(lowWinners[m].playingCards[f].rank == '11'){
                    lowWinners[m].playingCards[f].rank = 'J';
                  }else if(lowWinners[m].playingCards[f].rank == '10'){
                    lowWinners[m].playingCards[f].rank = 'T';
                  }
                  bestCards.push(lowWinners[m].playingCards[f].rank + lowWinners[m].playingCards[f].suit.toUpperCase());  
                }
                winplr.hand.bestCards = bestCards;
                console.log("WIN PLAYER",winplr)
                
                winAmount = winAmountLowPart;
                if(lowWinners.length > 1 && m != lowWinners.length -1){
                  winAmount = parseFloat( parseFloat(winAmount) / lowWinners.length ).toFixed(4); 
                  winAmountLowPart -= winAmount;
                }
                  
                console.log("WIN LOW TOTAL AMOUNT BEFORE",winTotalAmount, winAmount)
                winTotalAmount = winTotalAmount - winAmount;
                console.log("WIN LOW TOTAL AMOUNT AFTER",winTotalAmount)
                winplr.chips += parseFloat(winAmount);

                let player = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(winplr.id);
                player.statistics.cashgame.totalWonGame++; 
                player.statistics.cashgame.totalLoseGame = parseInt(player.statistics.cashgame.noOfPlayedGames)-parseInt(player.statistics.cashgame.totalWonGame);
                await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(player.id, { statistics: player.statistics });
                room.gameWinners.push({
                  playerId: winplr.id,
                  playerName: winplr.playerName,
                  amount: +parseFloat(winAmount).toFixed(2),
                  hand: winplr.cards,
                  bestCards : winplr.hand.bestCards,
                  winningType : 'WINNER LO',
                  uniqId:winplr.uniqId,
                  // rank : winplr.hand.rank,
                  chips : parseFloat(winplr.chips),
                  winnerSeatIndex : winplr.seatIndex,
                  sidePotPlayerIndex: -1, // main Port index,
                  rackAmount : 0,
                  winningHandName: winplr.hand.ranking
                });
              }
            }

        }else{
           // let minPotWinner = [];
        let lastPlayerCount = 0;
        let checkWinerPlayerIndex = [];
        let winnerHands = [];
        for (let k = 0; k < room.players.length; k += 1) {
          if (room.players[k].folded === false && room.players[k].allIn === false && room.players[k].status ===  'Playing') {
            lastPlayerCount++;
          }
          if(room.players[k].folded === false && room.players[k].allIn === false && room.players[k].status ===  'Playing'){
            let maxHand = null;
            let playerCombineCards = combine(room.players[k].cards,2);
            let bordCombineCards = combine(room.game.board,3);
            if(bordCombineCards.length > 2)
            {
              let allPosibility = [];
              for(let x=0; x < playerCombineCards.length; x++){
                for(let y=0; y < bordCombineCards.length; y++){
                  allPosibility.push(Sys.Poker.solve(bordCombineCards[y].concat(playerCombineCards[x])));
                }
              }
              let OmahaWinnerResult = Sys.Poker.winners(allPosibility);
              //console.log('OmahaWinnerResult : ',OmahaWinnerResult);
                maxHand = Sys.Poker.solve(OmahaWinnerResult[0].cards);
                checkWinerPlayerIndex.push({
                  index : k,
                  hand :  maxHand,
                })
                winnerHands.push(maxHand);
                
            }else{
            
              maxHand = Sys.Poker.solve(room.players[k].cards);
              checkWinerPlayerIndex.push({
                index : k,
                hand :  maxHand,
              })
              winnerHands.push(maxHand);
              
            }
          }
        }

        let PokerWinnerResult = Sys.Poker.winners(winnerHands);
        console.log("No Of Winners :",PokerWinnerResult.length);

        let winplr, winAmount, winAmountPart, winTotalAmount;
        winTotalAmount = + parseFloat(room.game.gameMainPot).toFixed(4);
        winAmountPart = + parseFloat( parseFloat(room.game.gameMainPot) / parseFloat(PokerWinnerResult.length) ).toFixed(4);
        console.log("check for fixed float value", winAmountPart)
        console.log('Main Pot Winner : ',PokerWinnerResult.length);
        console.log('lastPlayerCount : ',lastPlayerCount);

        if(PokerWinnerResult.length == 1 && lastPlayerCount == 1){

          let index = 0;
          for(let i=0; i< PokerWinnerResult.length; i++){
            for(let k=0; k< checkWinerPlayerIndex.length; k++){
              if(JSON.stringify(checkWinerPlayerIndex[k].hand.cards) == JSON.stringify(PokerWinnerResult[i].cards)){
                console.log("POKER WINNER :",checkWinerPlayerIndex[k].index);
                winplr = room.players[checkWinerPlayerIndex[k].index];
                winplr.hand = checkWinerPlayerIndex[k].hand;
                let bestCards = [];
                for(let f=0; f < checkWinerPlayerIndex[k].hand.cards.length; f++){
                  bestCards.push(
                    checkWinerPlayerIndex[k].hand.cards[f].value+checkWinerPlayerIndex[k].hand.cards[f].suit.toUpperCase()
                  )
                }
                console.log("BestCards 3->",bestCards)
                winplr.hand.bestCards = bestCards;
                index = checkWinerPlayerIndex[k].index;
                }
            }
          }

           if(room.game.status == 'ForceFinishedFolded'){
            room.game.gameRevertPoint.push({
              playerID : winplr.id,
              amount : winTotalAmount,
              playerIndex : index,
              forcefinishfolded : true,
            });
           }else{
            room.game.gameRevertPoint.push({
              playerID : winplr.id,
              amount : winTotalAmount,
              playerIndex : index,
              forcefinishfolded : false,
            });
           }


        }else{
          // Save winner
          for (let s = 0; s < PokerWinnerResult.length; s += 1) {
            if(PokerWinnerResult.length == winnerHands.length){
                console.log("ALL Normal Player Winners");
                winplr = room.players[checkWinerPlayerIndex[s].index];
                winplr.hand = checkWinerPlayerIndex[s].hand;

                let bestCards = [];
                for(let f=0; f < checkWinerPlayerIndex[s].hand.cards.length; f++){
                  bestCards.push(
                    checkWinerPlayerIndex[s].hand.cards[f].value+checkWinerPlayerIndex[s].hand.cards[f].suit.toUpperCase()
                  )
                }
                winplr.hand.bestCards = bestCards;

             }else{

              for(let k=0; k< checkWinerPlayerIndex.length; k++){
                if(JSON.stringify(checkWinerPlayerIndex[k].hand.cards) == JSON.stringify(PokerWinnerResult[s].cards)){

                  winplr = room.players[checkWinerPlayerIndex[k].index];
                  winplr.hand = checkWinerPlayerIndex[k].hand;

                  let bestCards = [];
                  for(let f=0; f < checkWinerPlayerIndex[k].hand.cards.length; f++){
                    bestCards.push(
                      checkWinerPlayerIndex[k].hand.cards[f].value+checkWinerPlayerIndex[k].hand.cards[f].suit.toUpperCase()
                    )
                  }
                  winplr.hand.bestCards = bestCards;

                }
              }
            }

            if(s == PokerWinnerResult.length-1){
              winAmount = winTotalAmount;
            }else{
              winAmount = winAmountPart;
            }

            winTotalAmount = winTotalAmount - winAmountPart;
            winplr.chips += parseFloat(winAmount);

            // Update Player Statistics

            let player = await Sys.Game.Sng.Omaha.Services.PlayerServices.getById(winplr.id);
            player.statistics.sng.totalWonGame++; 
            player.statistics.sng.totalLoseGame = parseInt(player.statistics.sng.noOfPlayedGames)-parseInt(player.statistics.sng.totalWonGame);
            await Sys.Game.Sng.Omaha.Services.PlayerServices.update(player.id, { statistics: player.statistics });
            
            room.gameWinners.push({
              playerId: winplr.id,
              playerName: winplr.playerName,
              amount: +parseFloat(winAmount).toFixed(2),
              hand: winplr.cards,
              bestCards : winplr.hand.bestCards,
              winningType : winplr.hand.name,
              rank : winplr.hand.rank,
              chips : parseFloat(winplr.chips),
              winnerSeatIndex : winplr.seatIndex,
              sidePotPlayerIndex: -1, // main Port index,
              rackAmount : 0
            });
          }
        }
        }
      }

      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      console.log("Game Winner :",room.gameWinners, room.game.gameNumber);
      console.log("Game RevertPoint :",room.game.gameRevertPoint, room.game.gameNumber);
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    }
    catch (e) {
      console.log("Error in checkForWinner :", e);
      return new Error(e);
    }
  },

  testWinner: async function(){
    try {

     let hand1 = {
         player: [ "AH","8D" ],
         board: [ "6D","5S","JS","3H","5C" ],
         cards: [ "6D","5S","JS","3H","5C","AH","8D"]};

    let  hand2 = {
         player: [ "KC","4D" ],
         board: ["6D","5S","JS","3H","5C" ],
         cards: ["6D","5S","JS","3H","5C","KC","4D" ]}; 

    let  hand3 = {
         player: [ "2D","5D" ],
         board: ["6D","5S","JS","3H","5C" ],
         cards: ["6D","5S","JS","3H","5C","2D","5D"]};           

   
      let PokerWinnnerHands = [];
     
      let hand = Sys.Poker.solve(hand1.cards);
      PokerWinnnerHands.push(hand);
      hand = Sys.Poker.solve(hand2.cards);
      PokerWinnnerHands.push(hand);
      hand = Sys.Poker.solve(hand3.cards);
      PokerWinnnerHands.push(hand);
      console.log("poker hands winner",PokerWinnnerHands);
      let PokerWinnerResult = Sys.Poker.winners(PokerWinnnerHands);

      console.log("result",PokerWinnerResult, PokerWinnerResult.length);

    } catch (e) {
      console.log("Error: ", e);
    }


  },

  agentsUpdate: async function (entry_fee, player, acton, tournamentId) {
    try {
      var entry_feeTotal_amount = entry_fee
      var agentId = player.agentId
      var action = acton;
      var commission = 0
      var commitionValue = 0
      var finalCommision = 0
      let agentLevel= {};
      if(player.agentRole == 'admin'){
        agentLevel.level =1;
      }else{
        agentLevel = await Sys.App.Services.agentServices.getSingleAgentData({ _id: mongoose.Types.ObjectId(agentId) }, {level: 1});
      }
      
      for (let index = 0; index < agentLevel.level; index++) {
        let agent = await Sys.App.Services.agentServices.getSingleAgentData({ _id: mongoose.Types.ObjectId(agentId), }, null, null, ['chips', 'id', 'parentId', 'level', 'commission', 'username', 'agentRole'])
        if (agent) {
          if (agent.level == agentLevel.level) {
            finalCommision = agent.commission;
          } else {
            finalCommision = agent.commission - commission;
          }
          commitionValue = entry_feeTotal_amount * finalCommision / 100;
          let traNumber = + new Date()
          let updateReport = await Sys.Game.Reguler.Texas.Services.ChipsServices.createAgentTransaction({
            user_id: agentId,
            rackToId: agentId,
            rackFromId: player.uniqId,
            rackFrom  : "player",
            totalRack: eval(parseFloat(commitionValue).toFixed(4)),
            username: agent.username ? agent.username : "",
            receiverName: player.uniqId,
            chips: parseFloat(commitionValue),
            providerEmail:agent.email,
            category: acton == "register" ? 'credit' : "debit",
            type: acton == "register" ? 'deposit' : "deduct",
            gameNumber: tournamentId,
            remark: acton == "register" ? 'Tournament Entry Fee For ' + player.uniqId : acton ==  "checkRegularTournamentStatus" ? "Tournament cancel return Entry Fee on "+ player.uniqId: 'Return Entry Fee on tournament leave on ' + player.uniqId,
            gameId: tournamentId,
            transactionNumber: acton == "register" ? 'DEP-'+ traNumber: 'DE-'+ traNumber ,
            beforeBalance: agent.rake_chips,
            afterBalance: acton == "register" ? parseFloat(agent.rake_chips + parseFloat(commitionValue)) : parseFloat(agent.rake_chips - parseFloat(commitionValue)),
            isTournament: "true",
            status:"success",
            rakeChips:true,
          });
  
          await Sys.App.Services.agentServices.updateAgentData({ _id: mongoose.Types.ObjectId(agentId) }, {
            rake_chips: action == "register" ? agent.rake_chips + parseFloat(commitionValue) : agent.rake_chips - parseFloat(commitionValue)
          });
          if (agent.level == 2) {
            agentId = agent.parentId
            commission = agent.commission
            finalCommision = 100 - commission
            commitionValue = entry_feeTotal_amount * finalCommision / 100
            let traNumber = + new Date()
            let admin = await Sys.App.Services.UserServices.getSingleUserData({ _id: mongoose.Types.ObjectId(agent.parentId) })
            let updateReport = await Sys.Game.Reguler.Texas.Services.ChipsServices.createAgentTransaction({
              user_id: agentId,
              username: "admin",
              rackFrom  : "player",
              rackFromId: player.uniqId,
              rackPercent: finalCommision,
              totalRack: eval(parseFloat(commitionValue).toFixed(4)),
              providerEmail:admin.email,
              receiverId: player.uniqId,
              receiverName: player.uniqId,
              chips: parseFloat(commitionValue),
              category: action == "register" ? 'credit' : "debit",
              type: action == "register" ? 'deposit' : "deduct",
              gameNumber: tournamentId,
              remark: action == "register" ? 'Tournament Entry Fee For ' + player.uniqId : 'Return Entry Fee on tournament leave on ' + player.uniqId,
              gameId: tournamentId,
              transactionNumber: acton == "register" ? 'DEP-'+ traNumber: 'DE-'+ traNumber ,
              beforeBalance: admin.rake_chips,
              afterBalance: action == "register" ? parseFloat(admin.rake_chips + parseFloat(commitionValue)) : parseFloat(admin.rake_chips - parseFloat(commitionValue)),
              isTournament: "true",
              rakeChips:true,
            });
  
            await Sys.App.Services.UserServices.updateUserData({ _id: mongoose.Types.ObjectId(agentId) },
              { rake_chips: action == "register" ? admin.rake_chips + parseFloat(commitionValue) : admin.rake_chips - parseFloat(commitionValue) })
            break;
          }
          agentId = agent.parentId
          commission = agent.commission
        } else {
          let admin = await Sys.App.Services.UserServices.getSingleUserData({ _id: mongoose.Types.ObjectId(agentId) })
          let traNumber = + new Date()
          let updateReport = await Sys.Game.Reguler.Texas.Services.ChipsServices.createAgentTransaction({
            user_id: agentId,
            rackToId: agentId,
            username: "admin",
            rackFrom  : "player",
            rackFromId: player.uniqId,
            rackTo:"admin",
            rackPercent: 100,
            totalRack: eval(parseFloat(entry_feeTotal_amount).toFixed(4)),
            receiverId: player.uniqId,
            receiverName: player.username,
            chips: parseFloat(entry_feeTotal_amount),
            category: action == "register" ? 'credit' : "debit",
            type: action == "register" ? 'deposit' : "deduct",
            gameNumber: tournamentId,
            remark: action == "register" ? 'Tournament Entry Fee For ' + player.uniqId : 'Return Entry Fee on tournament leave on ' + player.uniqId,
            gameId: tournamentId,
            transactionNumber: acton == "register" ? 'DEP-'+ traNumber: 'DE-'+ traNumber ,
            beforeBalance: admin.rake_chips,
            afterBalance: action == "register" ? parseFloat(admin.rake_chips + parseFloat(entry_feeTotal_amount)) : parseFloat(admin.rake_chips - parseFloat(entry_feeTotal_amount)),
            isTournament: "true",
            rakeChips:true,
          });
          await Sys.App.Services.UserServices.updateUserData({ _id: mongoose.Types.ObjectId(agentId) },
            { rake_chips: action == "register" ? admin.rake_chips + parseFloat(entry_feeTotal_amount) : admin.rake_chips - parseFloat(entry_feeTotal_amount) })
          break;
        }
      }
    } catch (e) {
      console.log("Error in RackDeduction Update", e);
    }
  
  },

  //  sortNumber:async function(a, b) {
  //     return b.rank - a.rank;
  // },


  // rankHand: async function(hand) {
  //   try {
  //     console.log("rankHand",hand);
  //     var myResult = await this.rankHandInt(hand);
  //     hand.rank = myResult.rank;
  //     hand.message = myResult.message;
  //     hand.bestCards = myResult.bestCards;
  //     return hand;
  //   }
  //   catch (e) {
  //     console.log("Error in rankHand :", e);
  //     return new Error(e);
  //   }
  // },

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



  // getHand: async function(player, board) {
  //   try {
  //     let hand = await new Sys.Game.Sng.Omaha.Entities.Hand(player.cards, board);
  //     return await this.rankHand(hand);
  //   }
  //   catch (e) {
  //     console.log("Error in getHand :", e);
  //     return new Error(e);
  //   }

  // },

  // rankKickers: async function(ranks, noOfCards) {
  //   try {
  //     var i, myRanks, rank, result;

  //     myRanks = [];
  //     rank = '';

  //     //console.log("Rank Kickers ->",ranks);


  //     for (i = 0; i < ranks.length; i += 1) { // Removed = 
  //         rank = ranks.substr(i, 1);
  //         // console.log("rank->>>",rank)
  //         if (rank === 'A') { myRanks.push({ rank: 0.2048, card: rank }); }
  //         if (rank === 'K') { myRanks.push({ rank: 0.1024, card: rank }); }
  //         if (rank === 'Q') { myRanks.push({ rank: 0.0512, card: rank }); }
  //         if (rank === 'J') { myRanks.push({ rank: 0.0256, card: rank }); }
  //         if (rank === 'T') { myRanks.push({ rank: 0.0128, card: rank }); }
  //         if (rank === '9') { myRanks.push({ rank: 0.0064, card: rank }); }
  //         if (rank === '8') { myRanks.push({ rank: 0.0032, card: rank }); }
  //         if (rank === '7') { myRanks.push({ rank: 0.0016, card: rank }); }
  //         if (rank === '6') { myRanks.push({ rank: 0.0008, card: rank }); }
  //         if (rank === '5') { myRanks.push({ rank: 0.0004, card: rank }); }
  //         if (rank === '4') { myRanks.push({ rank: 0.0002, card: rank }); }
  //         if (rank === '3') { myRanks.push({ rank: 0.0001, card: rank }); }
  //         if (rank === '2') { myRanks.push({ rank: 0.0000, card: rank }); }
  //     }
  //     //console.log("myRanks->>>",myRanks)
  //     myRanks.sort(this.sortNumber);
  //     //console.log("After Sort MyRank ->>>",myRanks)
  //     let cardsLength = 0;
  //     if (myRanks.length > noOfCards) {
  //         cardsLength = noOfCards
  //     } else {
  //         cardsLength = myRanks.length
  //     }
  //     result = { rank: 0.0000, cards: '' }
  //     for (i = 0; i < cardsLength; i += 1) {
  //         result.rank += myRanks[i].rank;
  //         result.cards += myRanks[i].card;
  //     }
  //     //console.log("result ->>>",result)
  //     return result;
  //   } catch (e) {
  //     console.log("Error: ", e);
  //   }
  // },

  // rankHandInt: async function(hand) {
  //   try {
  //     var rank, message, handRanks, handSuits, ranks, suits, cards, result, i, bestCards;

  //     rank = 0.0000;
  //     message = '';
  //     handRanks = [];
  //     handSuits = [];
  //     bestCards = '';

  //     /** Code for Sort Cards  */

  //     let crds = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  //     let cardsSortedByRank = [];
  //     for (let i = 0; i < crds.length; i++) {
  //       for (let j = 0; j < hand.cards.length; j++) {
  //           if (hand.cards[j].includes(crds[i])){
  //             cardsSortedByRank.push(hand.cards[j])
  //           }
  //       }
  //     } 

  //     console.log("***********************************************")
  //     console.log("Sored Cards :",cardsSortedByRank)
  //     console.log("***********************************************")

  //     /** end Sort Card  */


  //     for (i = 0; i < cardsSortedByRank.length; i += 1) {
  //       handRanks[i] = cardsSortedByRank[i].substr(0, 1);
  //       handSuits[i] = cardsSortedByRank[i].substr(1, 1);
  //     }

  //    // console.log("handRanks :",handRanks)
  //   //  console.log("handSuits :",handSuits)


  //   //  handRanks = handRanks.sort(); // remove it after custom sort code
  //     handSuits = handSuits.sort();   


  //    // console.log(" :: After Sort ->>>>>>>>>>>> ");
  //    // console.log("handRanks :",handRanks)
  //     //console.log("handSuits :",handSuits)

  //     ranks = handRanks.toString().replace(/\W/g, "");
  //     suits = handSuits.toString().replace(/\W/g, "");

  //   // console.log(" :: After Replace ->>>>>>>>>>>> ");
  //    console.log("ranks :",ranks)
  //   // console.log("suits :",suits)

  //     cards = cardsSortedByRank.toString();
  //     let tempHandCard = cardsSortedByRank;

  //   //  console.log("tempHandCard :",tempHandCard)

  //     function findCard(rank, suit, callback) {
  //       if (suit) {
  //         for (i = 0; i < tempHandCard.length; i += 1) {
  //           if (tempHandCard[i].substr(0, 1) == rank && tempHandCard[i].substr(1, 1) == suit) {
  //             return tempHandCard.splice(i, 1);
  //           }
  //         }
  //       } else {
  //         for (i = 0; i < tempHandCard.length; i += 1) {
  //           if (tempHandCard[i].substr(0, 1) == rank) {
  //             return tempHandCard.splice(i, 1);
  //           }
  //         }
  //       }
  //     }

  //     function setBestCard() {
  //      // console.log("Argument 1 :>>>>>>",arguments[0]);
  //      // console.log("Argument 2 :>>>>>>",arguments[1]);
  //       arguments[0].forEach(function (str) {
  //      //   console.log("str :>>>>>>",str);
  //         bestCards = bestCards + str;
  //       })
  //       //console.log("bestCards ->",bestCards);
  //       let tempCards = [];
  //       //console.log("arguments[1]",arguments[1]);
  //       if (arguments[1]) {
  //         let arg1 = arguments[1]; // Add By Himanshu for Royalflush 12345 of Heart
  //         bestCards.split("").forEach(function (rank) {
  //           tempCards.push(findCard(rank, arg1)[0]); // Replace arguments[1] to arg1
  //         })
  //       } else {
  //         bestCards.split("").forEach(function (rank) {
  //           tempCards.push(findCard(rank)[0]);
  //         })
  //       }
  //       bestCards = tempCards;
  //     }

  //     //Four of a kind
  //     if (rank === 0) {
  //       let cards = ['AAAA', 'KKKK', 'QQQQ', 'JJJJ', 'TTTT', '9999', '8888', '7777', '6666', '5555', '4444', '3333', '2222'];
  //       let rnk = 297;
  //       for (var i = 0; i < cards.length; i++) {
  //         if (ranks.indexOf(cards[i]) > -1 && rank === 0) {
  //           let rankKicker = await Sys.Game.Sng.Omaha.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], ''), 1);
  //           rank = rnk + rankKicker.rank; setBestCard([cards[i], rankKicker.cards]);
  //         }
  //         rnk--;
  //       };
  //       if (rank !== 0) { message = 'FourOfAKind'; }
  //     }

  //     //Full House
  //     if (rank === 0) {
  //       let cards3 = ['AAA', 'KKK', 'QQQ', 'JJJ', 'TTT', '999', '888', '777', '666', '555', '444', '333', '222'];
  //       let cards2 = ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22'];

  //       let rnk = 284;
  //       for (let i = 0; i < cards3.length; i++) {
  //         for (let k = 0; k < cards2.length; k++) {
  //           if (cards3[i].indexOf(cards2[k]) == -1) {
  //             if (ranks.indexOf(cards3[i]) > -1 && ranks.indexOf(cards2[k]) > -1 && rank === 0) {
  //               rank = rnk; setBestCard([cards3[i], cards2[k]]);
  //             }
  //             rnk--;
  //           }
  //         }
  //       }
  //       if (rank !== 0) { message = 'FullHouse'; }
  //     }

  //     //Flush
  //     if (rank === 0) {
  //       let flushSuit = '';
  //       if (suits.indexOf('CCCCC') > -1 || suits.indexOf('DDDDD') > -1 || suits.indexOf('HHHHH') > -1 || suits.indexOf('SSSSS') > -1) { rank = 128; message = 'Flush'; }
  //       if (suits.indexOf('CCCCC') > -1) { flushSuit = 'C'; }
  //       if (suits.indexOf('DDDDD') > -1) { flushSuit = 'D'; }
  //       if (suits.indexOf('HHHHH') > -1) { flushSuit = 'H'; }
  //       if (suits.indexOf('SSSSS') > -1) { flushSuit = 'S'; }

  //      // console.log('flushSuit:->>> ', flushSuit);
  //       // Straight Flush
  //       let suite = ['C', 'D', 'H', 'S'];
  //       let cardsSeq = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  //       let crd = ['T', '9', '8', '7', '6', '5', '4', '3', '2', 'A'];
  //       let rnk = 307;
  //       let indexPostion = 9; //skip eliment from start
  //       let decPostion = 0; // skip eliment from end
  //       for (let i = 0; i < crd.length; i++) {
  //         var selectedCards = cardsSeq.slice(indexPostion, cardsSeq.length - decPostion);
  //         for (let k = 0; k < suite.length; k++) {
  //           if (cards.indexOf(selectedCards[0] + suite[k]) > -1 && cards.indexOf(selectedCards[1] + suite[k]) > -1 && cards.indexOf(selectedCards[2] + suite[k]) > -1 && cards.indexOf(selectedCards[3] + suite[k]) > -1 && cards.indexOf(selectedCards[4] + suite[k]) > -1 && rank === 128) {
  //             rank = rnk;
  //             message = 'RoyalFlush';
  //             setBestCard([selectedCards.join('')], suite[k]);
  //           }
  //         }
  //         rnk--;
  //         indexPostion--;
  //         decPostion++;
  //       }
  //      // console.log('rank:->>> ', rank);
  //      // console.log('ranks:->>> ', ranks);
  //      // console.log('cards:->>> ', cards);
  //       if(rank === 128){
  //         let rankKicker = await Sys.Game.Sng.Omaha.Controllers.PlayerProcess.rankKickers(ranks, 5);
  //         rank = rank + rankKicker.rank;
  //        // console.log("Rank :",rank)
  //         // find Best Card For Flush Only
  //        // let suiteArray = ['C','D','H','S'];
  //         let betCardsArr = [];
  //        // for(let k=0;k<suiteArray.length;k++){
            
  //         //  if(suits.indexOf(suiteArray[k]+suiteArray[k]+suiteArray[k]+suiteArray[k]+suiteArray[k]) > -1){
            
  //             // let crd = ['J','Q','K','T','9','8','7','6','5','4','3','2','A'];

  //             for (let i = 0; i < crds.length; i++) {
  //               for (let j = 0; j < cardsSortedByRank.length; j++) {
  //                   if (cardsSortedByRank[j] == crds[i]+flushSuit && betCardsArr.length < 5){
  //                     betCardsArr.push(crds[i]+flushSuit);
  //                   }
  //               }
  //             } 
  //             // Old Code.
  //             // for(let i=0;i<crd.length;i++){
  //             //   console.log('crd[i]+suiteArray[k][k]: ', crd[i]+suiteArray[k]);
  //             //   if(cards.indexOf(crd[i]+suiteArray[k]) > -1){
  //             //     console.log('crd: ', crd[i]+suiteArray[k]);
  //             //     betCardsArr.push(crd[i]+suiteArray[k]);
  //             //   }
  //             // }
  //         //  }
  //        // }
  //         bestCards = betCardsArr;
  //       }
  //     }

  //     //Straight
  //     if (rank === 0) {
  //       let cardsSeq = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  //       let crd = ['T', '9', '8', '7', '6', '5', '4', '3', '2', 'A'];
  //       let rnk = 127;
  //       let indexPostion = 9; //skip eliment from start
  //       let decPostion = 0; // skip eliment from end
  //       for (let i = 0; i < crd.length; i++) {
  //         var selectedCards = cardsSeq.slice(indexPostion, cardsSeq.length - decPostion);

  //         if (cards.indexOf(selectedCards[0]) > -1 && cards.indexOf(selectedCards[1]) > -1 && cards.indexOf(selectedCards[2]) > -1 && cards.indexOf(selectedCards[3]) > -1 && cards.indexOf(selectedCards[4]) > -1 && rank === 0) {
  //           rank = rnk; setBestCard([selectedCards.join('')]);
  //         }

  //         rnk--;
  //         indexPostion--;
  //         decPostion++;
  //       }
  //       if (rank !== 0) { message = 'Straight'; }
  //     }

  //     //Three of a kind
  //     if (rank === 0) {
  //       let cards = ['AAA', 'KKK', 'QQQ', 'JJJ', 'TTT', '999', '888', '777', '666', '555', '444', '333', '222'];

  //       let rnk = 117;
  //       for (let i = 0; i < cards.length; i++) {
  //         if (ranks.indexOf(cards[i]) > -1 && rank === 0) {
  //           let rankKicker = await Sys.Game.Sng.Omaha.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], ''), 2);
  //           rank = rnk + rankKicker.rank; setBestCard([cards[i], rankKicker.cards]);
  //         }
  //         rnk--;
  //       }

  //       if (rank !== 0) { message = 'ThreeOfAKind'; }
  //     }

  //     //Two pair
  //     if (rank === 0) {
  //       let cards = ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22'];

  //       let rnk = 104;
  //       for (let i = 0; i < cards.length; i++) {
  //         for (let k = 0; k < cards.length; k++) {
  //           if (cards[i].indexOf(cards[k]) == -1 && k > i) {
  //             if (ranks.indexOf(cards[i]) > -1 && ranks.indexOf(cards[k]) > -1 && rank === 0) {
  //               let rankKicker = await Sys.Game.Sng.Omaha.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], '').replace(cards[k], ''), 1);
  //               rank = rnk + rankKicker.rank; setBestCard([cards[i] + cards[k], rankKicker.cards]);
  //             }
  //             rnk--;
  //           }
  //         }
  //       }

  //       if (rank !== 0) { message = 'TwoPair'; }
  //     }

  //     //One Pair
  //     if (rank === 0) {
  //       let cards = ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22'];
  //       console.log("ranks ->",ranks)
  //       let rnk = 26;
  //       for (let i = 0; i < cards.length; i++) {
  //         if (ranks.indexOf(cards[i]) > -1 && rank === 0) {
  //           let rankKicker = await Sys.Game.Sng.Omaha.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], ''), 3);
  //           rank = rnk + rankKicker.rank; setBestCard([cards[i], rankKicker.cards]);
  //         }
  //         rnk--;
  //       }

  //       if (rank !== 0) { message = 'OnePair'; }
  //     }

  //     //High Card
  //     if (rank === 0) {
  //       let cards = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  //       let rnk = 13;

  //       // console.log("Befor reverse :",ranks)
  //       // let sortbyrank = '';
  //       // for (let i = 0; i < cards.length; i++) {
  //       //   if (ranks.indexOf(cards[i]) > -1){
  //       //     sortbyrank = sortbyrank + cards[i];
  //       //   }
  //       // }
  //       // ranks = sortbyrank;
  //       // console.log("After reverse :",ranks)
  //       for (let i = 0; i < cards.length; i++) {
          
  //         if (ranks.indexOf(cards[i]) > -1 && rank === 0) {
  //   //        console.log(">>>>>>>>>>>>>>>>>>>>>> :",cards[i]);
  //           let rankKicker = await Sys.Game.Sng.Omaha.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], ''), 4);  
  //    //       console.log("Ranks >> :",ranks);
  //   //        console.log("rankKicker >> :",rankKicker);
  //           rank = rnk + rankKicker.rank; setBestCard([cards[i], rankKicker.cards]);
  //         }
  //         rnk--;
  //       }
  //      // console.log(">>>>>>>>>>>>>> rank :",rank);
  //       if (rank !== 0) { message = 'HighCard'; }
  //     }
  //     result = new Result(rank, message, bestCards);
  //     return result;
  //   }
  //   catch (e) {
  //     console.log("Error in rankHandInt :", e);
  //     return new Error(e);
  //   }
  // },


  revertPoint: async function(room, isFolded){console.log("folded----",isFolded)
    // Send Revert Point to Player
    let tournament = await Sys.Game.Common.Services.sngTournamentServices.getById(room.tournament);
    for (let h = 0; h < room.game.gameRevertPoint.length; h += 1) {
      if (room.game.gameRevertPoint[h].amount > 0) {
        let winplr = room.players[room.game.gameRevertPoint[h].playerIndex];
        let winAmount = room.game.gameRevertPoint[h].amount;
        // rack update
        for (let w = 0; w < room.players.length; w += 1) {           
          if(room.players[w].id == room.game.gameRevertPoint[h].playerID ){

            // let transactionRevert = {
            //   user_id:room.game.gameRevertPoint[h].playerID,
            //   username: room.players[w].playerName,
            //   gameId: room.game.id,
            //   gameNumber: room.game.gameNumber,
            //   tableId: room.id,
            //   tableName: room.name,
            //   chips:parseFloat(room.game.gameRevertPoint[h].amount),
            //   previousBalance:parseFloat(room.players[w].chips),
            //   afterBalance: (parseFloat(room.players[w].chips) + parseFloat(room.game.gameRevertPoint[h].amount)),
            //   category: 'credit',
            //   type: 'revert',
            //   remark: 'Revert for game',
            //   isTournament: 'No'
            // }

            // await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionRevert);
            let traNumber = + new Date()

              let transactionDataWinData = {									
              user_id: room.game.gameRevertPoint[h].playerID,
              username: room.players[w].playerName,
              gameId: room.game.id,
              gameNumber: room.game.gameNumber,
              chips: parseFloat(room.game.gameRevertPoint[h].amount),
              bet_amount: room.game.roundBets[w],
              afterBalance:parseFloat(room.players[room.game.gameRevertPoint[h].playerIndex].chips + room.game.gameRevertPoint[h].amount),
              previousBalance: room.players[room.game.gameRevertPoint[h].playerIndex].chips +  room.game.roundBets[w] ,
              category: 'credit',
              transactionNumber: 'DEP-' + traNumber,
              type: 'winner',
              remark: 'Winner for game  in revert point',
              uniqId:room.players[w].uniqId,
              sessionId:  tournament.playersSestionIds[tournament.players.indexOf(room.game.gameRevertPoint[h].playerID)],
            }
              console.log(transactionDataWinData);
             await Sys.Game.Sng.Omaha.Services.ChipsServices.insertData(transactionDataWinData);

          }
        }
        winplr.chips += winAmount;

        let dataObj = {
          playerId: winplr.id,
          playerName: winplr.playerName,
          amount: winAmount,
          chips : winplr.chips,
          winnerSeatIndex: winplr.seatIndex,
          sidePotPlayerIndex: -1, // main Port index,
          forcefinishfolded: room.game.gameRevertPoint[h].forcefinishfolded,
          roomId: room.id,
        };
        console.log("revertpoint in playerProcess", dataObj, room.game.gameNumber)
        //Add revertpoint amount into player winningarray  @chetan
        for(let w = 0; w < room.gameWinners.length; w += 1){
          if(room.game.gameRevertPoint[h].playerID == room.gameWinners[w].playerId){
            room.gameWinners[w].chips += parseFloat(room.game.gameRevertPoint[h].amount);
          }
        }
        
        //console.log("revertpoint player", room.game.gameRevertPoint);
        //console.log("room winners", room.gameWinners);
        console.log("revert point win amount",winAmount );
        console.log("final wining amount sum", winplr.chips);
        console.log('<=> Game RevertPoint Broadcast || Omaha GAME-NUMBER [' + room.game.gameNumber + '] || RevertPoint : ', dataObj);
        if(isFolded == true){
          
          console.log("isFolded revertpoint check", dataObj, room.game.gameNumber)
         
          if(dataObj.forcefinishfolded == true){
              
           /* let totalOfRoundBets = 0;  
            
            let tempRoundBets = room.game.roundBets.slice();
            tempRoundBets.sort(function (a, b) {
              return a - b;
            });
            
            if(tempRoundBets[(tempRoundBets.length)-1] > tempRoundBets[(tempRoundBets.length )-2] ){
              tempRoundBets[(tempRoundBets.length)-1] = tempRoundBets[(tempRoundBets.length) -2];
            }
            console.log("roundbetss", room.game.roundBets, room.game.gameNumber);
            totalOfRoundBets = parseFloat( ( tempRoundBets.reduce((a, b) => a + b, 0) ).toFixed(4) );
            console.log("total win when forcefinishfolded", totalOfRoundBets, room.game.gameNumber)

            room.gameWinners.push({
                playerId: winplr.id,
                playerName: winplr.playerName,
                amount: parseFloat(totalOfRoundBets),
                chips : parseFloat(winplr.chips),
                winnerSeatIndex : winplr.seatIndex,
                sidePotPlayerIndex:-1,
                rackAmount : 0
            });
            console.log("forcefinishfolded gameWinner", room.gameWinners, room.game.gameNumber)
            room = await Sys.Game.Sng.Omaha.Controllers.RoomProcess.rackDeduction(room);
            dataObj.chips = room.gameWinners[0].chips;*/
            console.log("forcefinishfolded gameWinner chipss after rack", room.gameWinners, dataObj, room.game.gameNumber)
            await Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(room.id).emit('RevertPointFolded', dataObj);
            room.gameWinners.pop();
            console.log("game winners array after pop", room.gameWinners, room.game.gameNumber);
          }else{
            await Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(room.id).emit('RevertPointFolded', dataObj);
          }
          


        }else{console.log("reveertpoint in......", room.game.gameNumber)
           await Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(room.id).emit('RevertPoint', dataObj);
        }
        
        if(room.game.gameMainPot > 0){
          room.game.gameMainPot -= parseFloat( parseFloat( room.game.gameRevertPoint[h].amount).toFixed(4) );
        }
        
        

        console.log("revertpoint after assigning through revertpoint function", room.game.gameRevertPoint, room.game.gameNumber);
      }
    }
    room.game.gameRevertPoint = [];
  },

  checkForTournamentWinner: async function (room) {
    try {console.log("tournament room final", room)
      console.log('*** Room Check For Tournament Winner || Omaha ROOM-ID ['+room.id+'] ***');
      // let winner = null;
      // let firstRunnerUp = null;
      // let secondRunnerUp = null;
      let tournamentWinners = [];

      // Push First Winner
      for (let i = 0; i < room.players.length; i++) {
        if (room.players[i].status == 'Playing') {
          tournamentWinners.push({ 
            playerId : room.players[i].id,
            username : room.players[i].playerName,
            avatar : room.players[i].avatar,
            winningChips : 0,
          });
        }
      }
      console.log("tournamentWinners :",tournamentWinners);
      console.log("tournamentWinners :",room.gameLosers,room.gameLosers.length ,room.gameLosers.length-1, room.gameLosers.length-2);
      // Push Second & Third Winner
      for (let i = room.gameLosers.length-1; i >= room.gameLosers.length-2; i--) {console.log("count",i);
          tournamentWinners.push({ 
            playerId : room.gameLosers[i].id,
            username : room.gameLosers[i].playerName,
            avatar : room.gameLosers[i].avatar,
            winningChips : 0,
          });
      }
      console.log("tournamentWinners :",tournamentWinners);

      let sngTournament = await Sys.Game.Sng.Omaha.Services.TournamentServices.getById(room.tournament);
      for(let i=0;i<sngTournament.players.length;i++){
        let player = await Sys.Game.Reguler.Texas.Services.PlayerServices.getById(sngTournament.players[i]);    
          if( player  ){
            if(sngTournament.isCashGame == true){
              await module.exports.agentsUpdate(sngTournament.entry_fee, player, "register", room.tournament);
            }   
            sngTournament.tournamentTotalChips = parseFloat(parseFloat(sngTournament.tournamentTotalChips)-parseFloat(sngTournament.entry_fee));
          } else {
              console.log("player data not found");
              return  
          }
      }

      if(sngTournament instanceof Error) {
        return { status: 'fail', result: null, message: 'No Tournament Found!.',  statusCode: 400}
      }
      let prizePool = await Sys.Game.Sng.Omaha.Services.PricePoolServices.getPricepoolData();
      if(prizePool instanceof Error) {
        return { status: 'fail', result: null, message: 'No Price Pool Found!.',  statusCode: 400}
      }

      // Send Player Chips 

      console.log("prizePool.winner ->",prizePool.winner)
      console.log("prizePool.firstRunnerUp ->",prizePool.firstRunnerUp)
      if(sngTournament.isFreeRoll == true) {
        for (let i = 0; i < tournamentWinners.length; i++) {
          let player = await Sys.Game.Sng.Omaha.Services.PlayerServices.getById(tournamentWinners[i].playerId);
          let adminDeductionChips = 0;
          if(i == 0){
            tournamentWinners[i].winningChips = +parseFloat(prizePool.fr_winner).toFixed(4);
            if(sngTournament.isCashGame == true){
              adminDeductionChips = +parseFloat(prizePool.fr_winner).toFixed(4);
            }
          }
          if( i == 1){
            tournamentWinners[i].winningChips = +parseFloat(prizePool.fr_firstRunnerUp).toFixed(4);
             if(sngTournament.isCashGame == true){
              adminDeductionChips = +parseFloat(prizePool.fr_firstRunnerUp).toFixed(4);
            }
          }
          if( i >= 2){
            tournamentWinners[i].winningChips = +parseFloat(prizePool.fr_secondRunnerUp).toFixed(4);
             if(sngTournament.isCashGame == true){
              adminDeductionChips = +parseFloat(prizePool.fr_secondRunnerUp).toFixed(4);
            }
          }
          
          // deduct admin chips if cashgame
          if(sngTournament.isCashGame == true && adminDeductionChips > 0){
            let superAdmin = await Sys.App.Services.UserServices.getSingleUserData({ isSuperAdmin: true });
            console.log("superAdmin", superAdmin);
            console.log("superadmin deduct pay", adminDeductionChips);
            await Sys.App.Services.UserServices.updateUserData({ _id: superAdmin.id },{ 
              extraRakeChips: eval( parseFloat( parseFloat(superAdmin.extraRakeChips) - parseFloat(adminDeductionChips) ).toFixed(4) ) ,
            });
            let traNumber = + new Date()
            let updateReport = await Sys.Game.Reguler.Texas.Services.ChipsServices.createAgentTransaction({
              user_id: superAdmin.id,
              username: "admin",
              receiverId: player.uniqId,
              receiverName: player.username,
              chips: parseFloat(adminDeductionChips),
              category:  "debit",
              type:  "deduct",
              gameNumber: sngTournament._id,
              remark: "free roll sng tournament winning amount to " + player.username,
              gameId: sngTournament._id,
              transactionNumber:  'DE-'+ traNumber ,
              beforeBalance: superAdmin.extraRakeChips,
              afterBalance: parseFloat(superAdmin.extraRakeChips - adminDeductionChips) ,
              isTournament: "true",
              adminChips:true,
            });
          }
          
          // add chips in player account
          let updatedPlayer = await Sys.Game.Sng.Omaha.Services.PlayerServices.update(tournamentWinners[i].playerId, { chips:  parseFloat( player.chips + tournamentWinners[i].winningChips ).toFixed(4)} );
          console.log("updated player", updatedPlayer);
          let traNumber = + new Date()
          let sessionData={
            sessionId:  sngTournament.playersSestionIds[sngTournament.players.indexOf(player._id)],
            uniqId:player.uniqId,
            username:player.username,
            chips:  tournamentWinners[i].winningChips,
            beforeBalance: player.chips,
            previousBalance: player.chips,
            afterBalance:  parseFloat(player.chips + parseFloat(tournamentWinners[i].winningChips)),
            type:"leave",
            category:"credit",
            user_id:player._id,
            remark: 'game left',
            isTournament: "true",
            transactionNumber: 'DEP-' + traNumber,
            gameId:  sngTournament._id,
          }   
          await Sys.Game.Common.Services.ChipsServices.insertData(sessionData)
        }
      }else{
        let prizePoolTotal = eval( parseFloat(sngTournament.buy_in * sngTournament.max_players).toFixed(4) );
        let total = sngTournament.tournamentTotalChips;
        for (let i = 0; i < tournamentWinners.length; i++) {
          let player = await Sys.Game.Sng.Omaha.Services.PlayerServices.getById(tournamentWinners[i].playerId);
          if(i == 0){
            tournamentWinners[i].winningChips = eval( parseFloat(parseFloat(total * parseFloat(prizePool.winner))/100).toFixed(4) );
            sngTournament.tournamentTotalChips = sngTournament.tournamentTotalChips - tournamentWinners[i].winningChips;
            // console.log("win",i, winningPrise, sngTournament.tournamentTotalChips)
          }
          if( i == 1){
            tournamentWinners[i].winningChips = eval( parseFloat(parseFloat(total * parseFloat(prizePool.firstRunnerUp))/100).toFixed(4) );
            sngTournament.tournamentTotalChips = sngTournament.tournamentTotalChips - tournamentWinners[i].winningChips;
            // console.log("win",i,  winningPrise, sngTournament.tournamentTotalChips)
          }
          if( i >= 2){
            tournamentWinners[i].winningChips = eval( parseFloat(parseFloat(total * parseFloat(prizePool.secondRunnerUp))/100).toFixed(4) );
            sngTournament.tournamentTotalChips = sngTournament.tournamentTotalChips - tournamentWinners[i].winningChips;

            // console.log("win", i, winningPrise, sngTournament.tournamentTotalChips)
          }
          // console.log("winningPrise ->",winningPrise)
          // tournamentWinners[i].winningChips = winningPrise;

          await Sys.Game.Sng.Omaha.Services.PlayerServices.update(tournamentWinners[i].playerId, { chips: eval( parseFloat( player.chips + tournamentWinners[i].winningChips ).toFixed(4) )   });
          let traNumber = + new Date()
          let sessionData={
            sessionId:  sngTournament.playersSestionIds[sngTournament.players.indexOf(player._id)],
            uniqId:player.uniqId,
            username:player.username,
            chips:  tournamentWinners[i].winningChips,
            beforeBalance: player.chips,
            previousBalance: player.chips,
            afterBalance:  parseFloat(player.chips + parseFloat(tournamentWinners[i].winningChips)),
            type:"leave",
            category:"credit",
            user_id:player._id,
            remark: 'game left',
            isTournament: "true",
            transactionNumber: 'DEP-' + traNumber,
            gameId:  sngTournament._id,
          }   
          await Sys.Game.Common.Services.ChipsServices.insertData(sessionData)
        }
      }
      /* let prizePoolTotal = eval( parseFloat(sngTournament.buy_in * sngTournament.max_players).toFixed(4) );
      let total = sngTournament.tournamentTotalChips;
      for (let i = 0; i < tournamentWinners.length; i++) {
        let player = await Sys.Game.Sng.Omaha.Services.PlayerServices.getById(tournamentWinners[i].playerId);
        if(i == 0){
          tournamentWinners[i].winningChips = eval( parseFloat(parseFloat(total * parseFloat(prizePool.winner))/100).toFixed(4) );
          sngTournament.tournamentTotalChips = sngTournament.tournamentTotalChips - tournamentWinners[i].winningChips;
          // console.log("win",i, winningPrise, sngTournament.tournamentTotalChips)
        }
        if( i == 1){
          tournamentWinners[i].winningChips = eval( parseFloat(parseFloat(total * parseFloat(prizePool.firstRunnerUp))/100).toFixed(4) );
          sngTournament.tournamentTotalChips = sngTournament.tournamentTotalChips - tournamentWinners[i].winningChips;
          // console.log("win",i,  winningPrise, sngTournament.tournamentTotalChips)
        }
        if( i >= 2){
          tournamentWinners[i].winningChips = eval( parseFloat(parseFloat(total * parseFloat(prizePool.secondRunnerUp))/100).toFixed(4) );
          sngTournament.tournamentTotalChips = sngTournament.tournamentTotalChips - tournamentWinners[i].winningChips;

          // console.log("win", i, winningPrise, sngTournament.tournamentTotalChips)
        }
        // console.log("winningPrise ->",winningPrise)
        // tournamentWinners[i].winningChips = winningPrise;

        await Sys.Game.Sng.Omaha.Services.PlayerServices.update(tournamentWinners[i].playerId, { chips: eval( parseFloat( player.chips + tournamentWinners[i].winningChips ).toFixed(4) )   });
        let traNumber = + new Date()
        let sessionData={
          sessionId:  sngTournament.playersSestionIds[sngTournament.players.indexOf(player._id)],
          uniqId:player.uniqId,
          username:player.username,
          chips:  tournamentWinners[i].winningChips,
          beforeBalance: player.chips,
          previousBalance: player.chips,
          afterBalance:  parseFloat(player.chips + parseFloat(tournamentWinners[i].winningChips)),
          type:"leave",
          category:"credit",
          user_id:player._id,
          remark: 'game left',
          isTournament: "true",
          transactionNumber: 'DEP-' + traNumber,
          gameId:  sngTournament._id,
        }		
        await Sys.Game.Common.Services.ChipsServices.insertData(sessionData)
      } */
      roomUpdated =  Sys.Game.Sng.Omaha.Services.RoomServices.update(room);
      await Sys.Game.Sng.Omaha.Services.TournamentServices.updateTourData({_id: room.tournament},{status:'Finished', tournamentWinners:tournamentWinners,tournamentTotalChips: parseFloat(sngTournament.tournamentTotalChips).toFixed(4) });
      await Sys.Game.Sng.Omaha.Services.playerGameHistoryServices.updatePlayerStatus(tournamentWinners[0].playerId,'Finished');
      // await Sys.Game.Sng.Omaha.Services.PlayerServices.update(player.id, { chips: chips });
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      console.log("Tournament Room Winners :", tournamentWinners);
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

      await Sys.Io.of(Sys.Config.Namespace.CashSngOmaha).to(room.id).emit('SngTournamentFinished', { winners: tournamentWinners,roomId:room.id });
    }
    catch (e) {
      console.log("Error in checkForWinner :", e);
      return new Error(e);
    }
  }

}

function combine(set, k){
  var i, j, combs, head, tailcombs;
  // There is no way to take e.g. sets of 5 elements from
  // a set of 4.
  if (k > set.length || k <= 0) {
      return [];
  }
  // K-sized set has only one K-sized subset.
  if (k == set.length) {
      return [set];
  }
  // There is N 1-sized subsets in a N-sized set.
  if (k == 1) {
      combs = [];
      for (i = 0; i < set.length; i++) {
          combs.push([set[i]]);
      }
      return combs;
  }
  combs = [];
  for (i = 0; i < set.length - k + 1; i++) {
      // head is a list that includes only our current element.
      head = set.slice(i, i + 1);
      // We take smaller combinations from the subsequent elements
      tailcombs = combine(set.slice(i + 1), k - 1);
      // For each (k-1)-combination we join it with the current
      // and store it to the set of k-combinations.
      for (j = 0; j < tailcombs.length; j++) {
          combs.push(head.concat(tailcombs[j]));
      }
  }
  return combs;
} 

function checkCards(c1,c2){
  let cardsPlayer1 = c1.playingCards;
  let cardsPlayer2 = c2.playingCards;
  let checkForAce1 = false;
  let checkForAce2 = false;
  let total1 = 0;
  let total2 = 0;
  let isEligible = true;
  if(cardsPlayer1.find(element => element.rank == 'A')){
    if(cardsPlayer1.find(element => element.rank == 'K')){
      checkForAce1 = true;
    }else if(cardsPlayer1.find(element => element.rank == 'Q')){
      checkForAce1 = true;
    }else if(cardsPlayer1.find(element => element.rank == 'J')){
      checkForAce1 = true;
    }else if(cardsPlayer1.find(element => element.rank == 'T')){
      checkForAce1 = true;
    }
  }

  if(cardsPlayer2.find(element => element.rank == 'A')){
    if(cardsPlayer2.find(element => element.rank == 'K')){
      checkForAce2 = true;
    }else if(cardsPlayer2.find(element => element.rank == 'Q')){
      checkForAce2 = true;
    }else if(cardsPlayer2.find(element => element.rank == 'J')){
      checkForAce2 = true;
    }else if(cardsPlayer2.find(element => element.rank == 'T')){
      checkForAce2 = true;
    }
  }
  

  for(let i = 0; i < cardsPlayer1.length; i++){
    switch(cardsPlayer1[i].rank){
      case 'A':
      if(checkForAce1==true){
        cardsPlayer1[i].rank = cardsPlayer1[i].rank.replace('A', '14');
      }else{
        cardsPlayer1[i].rank = cardsPlayer1[i].rank.replace('A', '1');
      }
      break;
      case 'K':
        cardsPlayer1[i].rank = cardsPlayer1[i].rank.replace('K', '13');
        break;
      case 'Q':
        cardsPlayer1[i].rank = cardsPlayer1[i].rank.replace('Q', '12');
        break;
      case 'J':
        cardsPlayer1[i].rank = cardsPlayer1[i].rank.replace('J', '11');
        break;
      case 'T':
        cardsPlayer1[i].rank = cardsPlayer1[i].rank.replace('T', '10');
        break;
    }    
      total1 += parseInt(cardsPlayer1[i].rank);
      
  }

  for(let j = 0; j < cardsPlayer2.length; j++){
    switch(cardsPlayer2[j].rank){
      case 'A':
      if(checkForAce2==true){
        cardsPlayer2[j].rank = cardsPlayer2[j].rank.replace('A', '14');
      }else{
        cardsPlayer2[j].rank = cardsPlayer2[j].rank.replace('A', '1');
      }
      break;
      case 'K':
        cardsPlayer2[j].rank = cardsPlayer2[j].rank.replace('K', '13');
        break;
      case 'Q':
        cardsPlayer2[j].rank = cardsPlayer2[j].rank.replace('Q', '12');
        break
      case 'J':
        cardsPlayer2[j].rank = cardsPlayer2[j].rank.replace('J', '11');
        break;
      case 'T':
        cardsPlayer2[j].rank = cardsPlayer2[j].rank.replace('T', '10');
        break;
    } 
      total2 += parseInt(cardsPlayer2[j].rank);
      
  }
    console.log("TOTAL 1",total1)
    console.log("TOTAL 2",total2)
    isEligible = cardsPlayer1.every((val,index) => val.rank === cardsPlayer2[index].rank);
    let checkTotal = false;
    if(total2 == total1 && isEligible == true){
      checkTotal = true;
    }
    return checkTotal;
}