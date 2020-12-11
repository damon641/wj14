var Sys = require('../../../../Boot/Sys');
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
        // Check for Ideal Player time Out.
        /*for (let j = 0; j < room.players.length; j += 1) {
            if ( room.players[j].status === 'Ideal' ) {
                  console.log("#############################################3")
                  console.log("Ideal Time :",room.players[j].idealTime)
                  let currentTime = new Date().getTime()
                  var difference = currentTime - room.players[j].idealTime;
                  var resultInMinutes = Math.round(difference / 60000);
                  console.log("Current Time :",currentTime)
                  console.log("resultInMinutes :",resultInMinutes)
                  if(resultInMinutes >= 2){
                    console.log("Remove Player form table....", room.players[j].playerName)
                    room.players[j].idealTime = null;
                    room.players[j].status = "Left";
                    //console.log("remove polayer statyus", room.players)
                    //room = await Sys.Game.CashGame.Texas.Services.RoomServices.update(room);
                    await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('PlayerLeft', { 'playerId': room.players[j].id, roomId:room.id });
                    let playerInfoDummy = [];
                    // Just Send Player Info for Remainig Player
                    for (let i = 0; i < room.players.length; i++) {
                      if(room.players[i].status != 'Left'){
                        let playerInfoObj = {
                          id : room.players[i].id,
                          status : room.players[i].status,
                          username : room.players[i].playerName,
                          chips : parseFloat(room.players[i].chips),
                          appId :room.players[i].appid,
                          avatar :  room.players[i].avatar,
                          fb_avatar :  room.players[i].fb_avatar,
                          folded : room.players[i].folded,
                          allIn : room.players[i].allIn,
                          seatIndex : room.players[i].seatIndex,
                          idealPlayer : (parseFloat(room.players[i].defaultActionCount) > 0)? true : false,
                        };
                        playerInfoDummy.push(playerInfoObj);
                      }
                    }


                    let dealerPlayerId = '';

                    if(room.status == 'Running'){
                      dealerPlayerId = room.getDealer().id;
                      //smallBlindPlayerId = room.getSmallBliendPlayer().id;
                      //bigBlindPlayerId = room.getBigBliendPlayer().id;
                    }
                    await Sys.Io.of(Sys.Config.Namespace.CashTexas).to([room.players[j].socketId]).emit('playerInfoList', {
                      playerInfo: playerInfoDummy,
                      dealerPlayerId : dealerPlayerId,
                    });

                  }
                  console.log("#############################################3")
            }
        }*/

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
          console.log('<=> Side Pot ||  Texas GAME-NUMBER [' + room.game.gameNumber + '] || Player SidePot : ', sidePot);
          console.log("room.game.roundName in progress", room.game.roundName);
          if (room.game.status == 'ForceFinishedAllIn') {
            console.log('----------ForceFinishedAllIn--------------------------', room.game.gameNumber, room.game.status, room.status);

            let turnBetData = room.getPreviousPlayerAction();
            await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('PlayerAction', {
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
            await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('GameFinishedPlayersCards', { playersCards: playersCards, roomId: room.id });

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

                  console.log('<=> Game Round Complete Broadcast ||  Texas GAME-NUMBER [' + room.game.gameNumber + '] || RoundComplete : ', dataObj);
                  
                  room.game.bets.splice(0, room.game.bets.length);
                  Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('RoundComplete', {
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

                    Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('RoundComplete', {
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
                      /*room.game.otherData.tempBets = [...room.game.bets];
                      room.game.bets.splice(0, room.game.bets.length);*/
                      for (j = 0; j < room.players.length; j += 1) {
                        hand = new Sys.Game.CashGame.Texas.Entities.Hand(
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
                      await Sys.Game.CashGame.Texas.Controllers.RoomProcess.gameFinished(room, sidePot)

                    }, 1000, room)
                  }, 1500, room)





                  /* room.game.deck.pop();
                  room.game.board.push(room.game.deck.pop());
                  room.game.roundName = 'Turn';

                  Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('RoundComplete', {
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
                    hand = new Sys.Game.CashGame.Texas.Entities.Hand(
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
                  await Sys.Game.CashGame.Texas.Controllers.RoomProcess.gameFinished(room,sidePot) */

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
                  
                  room.game.bets.splice(0, room.game.bets.length);
                  Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('RoundComplete', {
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
                    hand = new Sys.Game.CashGame.Texas.Entities.Hand(
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
                  await Sys.Game.CashGame.Texas.Controllers.RoomProcess.gameFinished(room,sidePot) */

                  Sys.Timers[room.id] = setTimeout(async function (room) {
                    // room.game.deck.pop(); // shubh
                    // room.game.board.push(room.game.deck.pop()); // shubh
                    room.game.roundName = 'Showdown';
                    /*room.game.otherData.tempBets = [...room.game.bets];
                    room.game.bets.splice(0, room.game.bets.length);*/
                    for (j = 0; j < room.players.length; j += 1) {
                      hand = new Sys.Game.CashGame.Texas.Entities.Hand(
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
                    await Sys.Game.CashGame.Texas.Controllers.RoomProcess.gameFinished(room, sidePot)
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
                  hand = new Sys.Game.CashGame.Texas.Entities.Hand(
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
                await Sys.Game.CashGame.Texas.Controllers.RoomProcess.gameFinished(room, sidePot)
                break;
              default:
                console.log(":: Default ALL IN ---------------", room.game.status, room.status);
                room.game.roundName = 'Showdown';
                
                room.game.bets.splice(0, room.game.bets.length);
                for (j = 0; j < room.players.length; j += 1) {
                  hand = new Sys.Game.CashGame.Texas.Entities.Hand(
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
                await Sys.Game.CashGame.Texas.Controllers.RoomProcess.gameFinished(room, sidePot);
            }
          } else if (room.game.roundName === 'River' || room.game.status == 'ForceFinishedFolded') {
            console.log('effective river ForceFinishedFolded', room.game.gameNumber, room.game.status, room.status);

            let turnBetData = room.getPreviousPlayerAction();
            await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('PlayerAction', {
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
                 Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('DisplayShowCardButton', { playerIdList : [room.otherData.lastFoldedPlayerId], gameId: room.game.id, roomId: room.id });
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

            console.log('<=> Game Finished Round Complete Broadcast in FORCEFINISHFOLDED ||  Texas GAME-NUMBER [' + room.game.gameNumber + '] || RoundComplete : ');

            await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('RoundComplete', {
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

              await Sys.Game.CashGame.Texas.Controllers.RoomProcess.gameFinished(room, sidePot)
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


            await Sys.Game.CashGame.Texas.Controllers.RoomProcess.roundFinished(room, sidePot)

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
            await Sys.Game.CashGame.Texas.Controllers.RoomProcess.roundFinished(room, sidePot)

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
            await Sys.Game.CashGame.Texas.Controllers.RoomProcess.roundFinished(room, sidePot)
          }  else {
            console.log("showdown else condition in progress");
            await self.revertPoint(room, true);
            room.currentPlayer = undefined;
            await Sys.Game.CashGame.Texas.Controllers.RoomProcess.gameFinished(room, sidePot);
          }
        }
        else {
          console.log("room status turnFinished", room.game.status, room.status);
          await Sys.Game.CashGame.Texas.Controllers.RoomProcess.turnFinished(room);
        }
      }
    } catch (e) {
      console.log("Error: ", e);
    }

  },

  getMaxBet: async function (bets) {
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
      console.log("Error: ", e);
    }
  },

  checkForEndOfRound: async function (room) {
    try {
      var maxBet, endOfRound, notFoldedPlayers, notAllInPlayers, currentTurn, maxbetPlayerIndex, notAllInPlayersIndex;
      endOfRound = true;
      maxBet = await this.getMaxBet(room.game.bets);
      notFoldedPlayers = 0;
      notAllInPlayers = 0;
      currentTurn = room.currentPlayer;

      console.log("----------------------------------------------------------");
      console.log('Current Player :', currentTurn, room.game.gameNumber);
      console.log("----------------------------------------------------------");


      //For each player, check
      for (let i = currentTurn; i < room.players.length; i += 1) {
        if (room.players[i].folded === false && room.players[i].status === 'Playing') {
          if (room.players[i].talked === false || room.game.bets[i] != maxBet) {
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
          if (room.players[i].folded === false && room.players[i].status === 'Playing') {
            if (room.players[i].talked === false || room.game.bets[i] !== maxBet) {
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
        if (room.game.bets[i] == maxBet) { // Get Mabet Player Index
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

      if (notAllInPlayers == 1 && room.game.bets[notAllInPlayersIndex] == maxBet) { // When Single Player is Remain & Max Bet Player is not All in Palyer Then Finishe Game.
        endOfRound = true;
        room.game.status = 'ForceFinishedAllIn';
      }




      console.log("----------------------------------------------------------");
      console.log('Checking round', endOfRound, room.currentPlayer, room.game.status, room.status);
      console.log("----------------------------------------------------------");

      return endOfRound;
    } catch (e) {
      console.log("Error: ", e);
    }
  },

  changePlayerTurn: async function (room) {
    try {
      let oldTurn = room.currentPlayer;
      let playerFound = false;
      console.log("all players in room ", room.players)
      console.log("delaer index", room.dealerIndex)
      console.log("oldTurn", oldTurn);
      console.log("smallblent----", room.smallBlindIndex, room.players.length)
      for (let i = room.smallBlindIndex; i < room.players.length; i += 1) {
        console.log("room.players status in changeplayerChnage function", room.players[i].playerName, room.players[i].id, room.players[i].folded, room.players[i].allIn, room.players[i].status)
        if (room.players[i].folded === false && room.players[i].allIn === false && room.players[i].status === 'Playing') {
          room.currentPlayer = i;
          playerFound = true;
          break;
        }
      }
      console.log("decided current player", room.currentPlayer, playerFound)
      if (oldTurn == room.currentPlayer && playerFound == false) {
        console.log("yes iam in same turn so change my turn", room.game.status, room.status)
        for (let i = 0; i < room.smallBlindIndex; i += 1) {
          if (i != room.dealerIndex) {
            console.log("room.players status in changeplayerChnage function in samePlayerTurn", room.players[i].playerName, room.players[i].id, room.players[i].folded, room.players[i].allIn, room.players[i].status)
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

  checkForAllInPlayer: async function (room, winners) {
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
      console.log("Error: ", e);
    }
  },

  checkForWinner: async function (room) {
    try {
      clearTimeout(Sys.Timers[room.id]);  // multiple timer issue
      clearInterval(Sys.Timers[room.id]);
      console.log('<=> Game Check For Winner || Texas GAME-NUMBER [' + room.game.gameNumber + '] ');
      // Poker Winning New Logic Start Here.
      /**
       * Side Pot Winner Calculation.
       */

       //console.log("checkForWinner room: ", room);

      /*for (let rp = 0; rp < room.players.length; rp++) {
        var playerRoundBets = room.game.roundBets[rp];
        var playerData = room.players[rp];

        if(playerData.status == "Playing"){
          
          let transactionData = {
            user_id           : playerData.id,
            username          : playerData.playerName,
            gameId            : room.game.id,
            gameNumber        : room.game.gameNumber,
            chips             : playerRoundBets,
            afterBalance      : playerData.chips,
            category          : 'debit',
            type              : 'totalbet',
            remark            : 'Player Bets Amount'
          }
         // await Sys.Game.CashGame.Texas.Services.ChipsServices.createTransaction(transactionData);
        }

      }*/

      for (let h = 0; h < room.game.gamePot.length; h += 1) {

        let playerIndexes = room.game.gamePot[h].playerIndex;
        console.log("Side POT playerIndexes", playerIndexes);
        let SidePotPlayerIndex = [];
        let PokerWinnnerHands = [];
        for (let r = 0; r < playerIndexes.length; r++) {
          let hand = Sys.Poker.solve(room.game.board.concat(room.players[playerIndexes[r]].cards));
          SidePotPlayerIndex.push({
            index: playerIndexes[r],
            hand: hand
          })
          PokerWinnnerHands.push(hand);
        }

        let PokerWinnerResult = Sys.Poker.winners(PokerWinnnerHands);
        console.log("No Of Winners :", PokerWinnerResult.length);

        let winplr, winAmount, winAmountPart, winTotalAmount;
        winTotalAmount = parseFloat(room.game.gamePot[h].sidePotAmount);
        winAmountPart = eval(parseFloat(parseFloat(room.game.gamePot[h].sidePotAmount) / parseFloat(PokerWinnerResult.length)).toFixed(4));
        console.log("Win-Total-Amount check for fixed length", winTotalAmount)
        // Save winner


        for (let s = 0; s < PokerWinnerResult.length; s++) {
          console.log("tempWinner.length", PokerWinnerResult.length)
          if (s == PokerWinnerResult.length - 1) {
            winAmount = winTotalAmount;
          } else {
            winAmount = winAmountPart;
          }
          winTotalAmount = winTotalAmount - winAmountPart;

          if (PokerWinnerResult.length == PokerWinnnerHands.length) {
            console.log("ALL Sidepot Player Winners");
            winplr = room.players[SidePotPlayerIndex[s].index];
            winplr.hand = SidePotPlayerIndex[s].hand;
            let bestCards = [];
            for (let f = 0; f < PokerWinnerResult[s].cards.length; f++) {
              if(f < 5){
                console.log("card length", PokerWinnerResult[s].cards.length, PokerWinnerResult[s].cards[f]);
                if(PokerWinnerResult[s].cards[f].value == '1'){ // If got '1' instead of 'A' 
                  PokerWinnerResult[s].cards[f].value = 'A';
                }
                bestCards.push(
                  PokerWinnerResult[s].cards[f].value + PokerWinnerResult[s].cards[f].suit.toUpperCase()
                );
              }
            }
            console.log("BestCards 1->", bestCards)
            winplr.hand.bestCards = bestCards;
          } else {
            //for(let i=0; i< PokerWinnerResult.length; i++){
            for (let k = 0; k < SidePotPlayerIndex.length; k++) {
              if (JSON.stringify(SidePotPlayerIndex[k].hand.cards) == JSON.stringify(PokerWinnerResult[s].cards)) {
                console.log("POKER WINNER :", SidePotPlayerIndex[k].index);
                winplr = room.players[SidePotPlayerIndex[k].index];
                winplr.hand = SidePotPlayerIndex[k].hand;
                let bestCards = [];
                for (let f = 0; f < PokerWinnerResult[s].cards.length; f++) {
                  if(f < 5){ 
                    if(PokerWinnerResult[s].cards[f].value == '1'){ // If got '1' instead of 'A' 
                      PokerWinnerResult[s].cards[f].value = 'A';
                    }
                    bestCards.push(
                      PokerWinnerResult[s].cards[f].value + PokerWinnerResult[s].cards[f].suit.toUpperCase()
                    );
                  }
                }
                console.log("BestCards 2->", bestCards)
                winplr.hand.bestCards = bestCards;
              }
            }
            // }
          }
          winplr.chips += parseFloat(winAmount);
          let sidePotPlayerSeatIndex = room.game.gamePot[h].sidePotPlayerSeatIndex

          /** Start ::: Custom code for Side Pot Two Player (code is Petch) */
          let playersLength = 0;
          for (let i = 0; i < room.players.length; i += 1) {
            if (room.players[i].status != 'Ideal' && room.players[i].status != 'Left') {
              playersLength += 1;
            }
          }
          console.log("################################### ::: SidePot Length :", playersLength)
          /* if(playersLength == 2 ){
             sidePotPlayerSeatIndex = -1;
           }*/
          /** End ::: Custom code for Side Pot Two Player (code is Petch) */
          // Update Player Statistics

          let player = await Sys.Game.CashGame.Texas.Services.PlayerServices.getById(winplr.id);
          player.statistics.cashgame.totalWonGame++; 
          player.statistics.cashgame.totalLoseGame = parseInt(player.statistics.cashgame.noOfPlayedGames)-parseInt(player.statistics.cashgame.totalWonGame);
          await Sys.Game.CashGame.Texas.Services.PlayerServices.update(player.id, { statistics: player.statistics });
          room.gameWinners.push({
            playerId: winplr.id,
            playerName: winplr.playerName,
            amount: +parseFloat(winAmount).toFixed(2),
            hand: winplr.cards,
            bestCards: winplr.hand.bestCards,
            winningType: winplr.hand.name,
            uniqId:winplr.uniqId,
            rank: winplr.hand.rank,
            chips: parseFloat(winplr.chips),
            winnerSeatIndex: winplr.seatIndex,
            sidePotPlayerIndex: sidePotPlayerSeatIndex,
            sidePotPlayerId: room.game.gamePot[h].sidePotPlayerID, // Add for Testing
            rackAmount: 0
          });
        }
      }

      console.log(" room.game.gameMainPot :", room.game.gameMainPot);
      // Check Main Port Winner
      if (room.game.gameMainPot > 0) {
        // let minPotWinner = [];
        let lastPlayerCount = 0;
        let checkWinerPlayerIndex = [];
        let winnerHands = [];
        for (let k = 0; k < room.players.length; k += 1) {
          if (room.players[k].folded === false && room.players[k].allIn === false && room.players[k].status === 'Playing') {
            lastPlayerCount++;
          }
          if (room.players[k].folded === false && room.players[k].allIn === false && room.players[k].status === 'Playing') {
            let hand = Sys.Poker.solve(room.game.board.concat(room.players[k].cards));
            checkWinerPlayerIndex.push({
              index: k,
              hand: hand,
            })
            winnerHands.push(hand);
          }
        }

        let PokerWinnerResult = Sys.Poker.winners(winnerHands);
        console.log("No Of Winners :", PokerWinnerResult.length);

        let winplr, winAmount, winAmountPart, winTotalAmount;
        winTotalAmount = + parseFloat(room.game.gameMainPot).toFixed(4);
        winAmountPart = + parseFloat(parseFloat(room.game.gameMainPot) / parseFloat(PokerWinnerResult.length)).toFixed(4);
        console.log("check for fixed float value", winAmountPart)
        console.log('Main Pot Winner : ', PokerWinnerResult.length);
        console.log('lastPlayerCount : ', lastPlayerCount);

        if (PokerWinnerResult.length == 1 && lastPlayerCount == 1) {

          let index = 0;
          for (let i = 0; i < PokerWinnerResult.length; i++) {
            for (let k = 0; k < checkWinerPlayerIndex.length; k++) {
              if (JSON.stringify(checkWinerPlayerIndex[k].hand.cards) == JSON.stringify(PokerWinnerResult[i].cards)) {
                console.log("POKER WINNER :", checkWinerPlayerIndex[k].index);
                winplr = room.players[checkWinerPlayerIndex[k].index];
                winplr.hand = checkWinerPlayerIndex[k].hand;
                let bestCards = [];
                for (let f = 0; f < checkWinerPlayerIndex[k].hand.cards.length; f++) {
                  if(f < 5){ 
                    if(checkWinerPlayerIndex[k].hand.cards[f].value == '1'){ // If got '1' instead of 'A' 
                      checkWinerPlayerIndex[k].hand.cards[f].value = 'A';
                    }
                    bestCards.push(
                      checkWinerPlayerIndex[k].hand.cards[f].value + checkWinerPlayerIndex[k].hand.cards[f].suit.toUpperCase()
                    );
                  }
                }
                console.log("BestCards 3->", bestCards)
                winplr.hand.bestCards = bestCards;
                index = checkWinerPlayerIndex[k].index;
              }
            }
          }

          if (room.game.status == 'ForceFinishedFolded') {
            room.game.gameRevertPoint.push({
              playerID: winplr.id,
              amount: winTotalAmount,
              playerIndex: index,
              forcefinishfolded: true,
            });
          } else {
            room.game.gameRevertPoint.push({
              playerID: winplr.id,
              amount: winTotalAmount,
              playerIndex: index,
              forcefinishfolded: false,
            });
          }


        } else {
          // Save winner
          for (let s = 0; s < PokerWinnerResult.length; s += 1) {
            if (PokerWinnerResult.length == winnerHands.length) {
              console.log("ALL Normal Player Winners");
              winplr = room.players[checkWinerPlayerIndex[s].index];
              winplr.hand = checkWinerPlayerIndex[s].hand;

              let bestCards = [];
              for (let f = 0; f < checkWinerPlayerIndex[s].hand.cards.length; f++) {
                if(f < 5){
                  if(checkWinerPlayerIndex[s].hand.cards[f].value == '1'){ // If got '1' instead of 'A' 
                    checkWinerPlayerIndex[s].hand.cards[f].value = 'A';
                  }
                  bestCards.push(
                    checkWinerPlayerIndex[s].hand.cards[f].value + checkWinerPlayerIndex[s].hand.cards[f].suit.toUpperCase()
                  );
                }
              }
              winplr.hand.bestCards = bestCards;

            } else {

              for (let k = 0; k < checkWinerPlayerIndex.length; k++) {
                if (JSON.stringify(checkWinerPlayerIndex[k].hand.cards) == JSON.stringify(PokerWinnerResult[s].cards)) {

                  winplr = room.players[checkWinerPlayerIndex[k].index];
                  winplr.hand = checkWinerPlayerIndex[k].hand;

                  let bestCards = [];
                  for (let f = 0; f < checkWinerPlayerIndex[k].hand.cards.length; f++) {
                    if(f < 5){
                      if(checkWinerPlayerIndex[k].hand.cards[f].value == '1'){ // If got '1' instead of 'A' 
                        checkWinerPlayerIndex[k].hand.cards[f].value = 'A';
                      }
                      bestCards.push(
                        checkWinerPlayerIndex[k].hand.cards[f].value + checkWinerPlayerIndex[k].hand.cards[f].suit.toUpperCase()
                      );
                    }
                  }
                  winplr.hand.bestCards = bestCards;

                }
              }
            }

            if (s == PokerWinnerResult.length - 1) {
              winAmount = winTotalAmount;
            } else {
              winAmount = winAmountPart;
            }

            winTotalAmount = winTotalAmount - winAmountPart;
            winplr.chips += parseFloat(winAmount);
             // Update Player Statistics

            let player = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(winplr.id);
            player.statistics.cashgame.totalWonGame++; 
            player.statistics.cashgame.totalLoseGame = parseInt(player.statistics.cashgame.noOfPlayedGames)-parseInt(player.statistics.cashgame.totalWonGame);
            await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(player.id, { statistics: player.statistics });
            room.gameWinners.push({
              playerId: winplr.id,
              playerName: winplr.playerName,
              amount: +parseFloat(winAmount).toFixed(2),
              hand: winplr.cards,
              bestCards: winplr.hand.bestCards,
              winningType: winplr.hand.name,
              uniqId:winplr.uniqId,
              rank: winplr.hand.rank,
              chips: parseFloat(winplr.chips),
              winnerSeatIndex: winplr.seatIndex,
              sidePotPlayerIndex: -1, // main Port index,
              rackAmount: 0
            });
          }
        }
      }

      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      console.log("Game Winner :", room.gameWinners, room.game.gameNumber);
      console.log("Game RevertPoint :", room.game.gameRevertPoint, room.game.gameNumber);
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    }
    catch (e) {
      console.log("Error in checkForWinner :", e);
      return new Error(e);
    }
  },

  // checkForBankrupt: async function(room) {
  //   try {



  //        // Update Player Folded Variable.
  //        for (let k = 0; k < room.gameWinners.length; k += 1) {
  //           for (let j = 0; j < room.players.length; j += 1) {
  //               if(room.gameWinners[k].playerId == room.players[j].id){
  //                   // when Player winn we update his status to Fold. so now we update winner status to fold flase.
  //                   room.players[j].folded = false;
  //               }
  //           }
  //       }


  //       console.log('<=> Check For Bankrupt ||  Texas GAME-NUMBER ['+room.game.gameNumber+'] ||');
  //       var i, autoBuyinPlayers;
  //       autoBuyinPlayers = [];
  //       for (i = 0; i < room.players.length; i += 1) {
  //           console.log('<=> Player chips ||',room.players[i].chips);
  //           room.players[i].chips = parseFloat(room.players[i].chips);
  //           if (room.players[i].chips == 0  && room.players[i].status == 'Playing') {
  //                   let isRevertAvilabel = false;
  //                   for (let h = 0; h < room.game.gameRevertPoint.length; h += 1) {
  //                       console.log("<<---------------------------------------->>")
  //                       console.log('<=> Player Revert Name |>',room.players[room.game.gameRevertPoint[h].playerIndex].playerName);
  //                       if(room.game.gameRevertPoint[h].amount > 0 && room.players[i].id == room.players[room.game.gameRevertPoint[h].playerIndex].id) {
  //                           isRevertAvilabel = true;
  //                       }
  //                   }
  //                   for (let h = 0; h < room.gameWinners.length; h += 1) {
  //                     console.log('<=> Player Winner Name |>',room.gameWinners[h].playerName);
  //                     if(room.gameWinners[h].playerId == room.players[i].id  ) {
  //                         isRevertAvilabel = true;
  //                     }
  //                   }

  //                   console.log('<=> Player Revert isRevertAvilabel |>',isRevertAvilabel);
  //                   if(isRevertAvilabel == false && room.players[i].status != 'Left'){
  //                       room.gameLosers.push(room.players[i]);
  //                       console.log('<=> Player ' + room.players[i].playerName + ' is going Bankrupt ||  Texas GAME-NUMBER ['+room.game.gameNumber+'] ||');
  //                       // room.players.splice(i, 1);
  //                       //console.log("player status before ideal", room.players);
  //                       if(parseFloat(room.players[i].extraChips) == 0){
  //                         room.players[i].status = 'Ideal';
  //                       }
  //                       room.players[i].idealTime = (room.players[i].idealTime == null) ? new Date().getTime() : room.players[i].idealTime;
  //                   }

  //           }
  //       }
  //       // if (autoBuyinPlayers.length > 0) {
  //       //     let ids = []
  //       //     autoBuyinPlayers.forEach(function (player) {
  //       //         ids.push(player.id)
  //       //     })
  //       //     //Player.find({ id: ids }).exec(function (err, players) {
  //       //     let players = await Sys.Game.CashGame.Texas.Services.PlayerServices.getByIds(ids);
  //       //     if (players && players != undefined && players.length != 0) {
  //       //         players.forEach(function (player) {
  //       //             autoBuyinPlayers.forEach(async function (autoBuyinPlayer) {
  //       //                 if (player.id == autoBuyinPlayer.id) {
  //       //                     if (autoBuyinPlayer.autoBuyin < player.chips) {
  //       //                         autoBuyinPlayer.chips = autoBuyinPlayer.autoBuyin
  //       //                         player.chips = parseFloat(player.chips) - parseFloat(autoBuyinPlayer.autoBuyin);

  //       //                         await Sys.Game.CashGame.Texas.Services.PlayerServices.update({id: player.id}, player);

  //       //                         let tempdata = autoBuyinPlayer.toJson()
  //       //                         player.level = 0;
  //       //                         tempdata.player = player;

  //       //                         console.log('<=> Check For Bankrupt Auto Buy in ||GAME-NUMBER ['+room.game.gameNumber+']  PlayerInfo :', tempdata.playerName);
  //       //                         await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('PlayerInfo', tempdata)

  //       //                     } else {
  //       //                         for (i = 0; i < room.players.length; i += 1) {
  //       //                             if (room.players[i].id == autoBuyinPlayer.id) {
  //       //                                 room.gameLosers.push(room.players[i]);
  //       //                                 //console.log('player ' + room.players[i].playerName + ' is going bankrupt');
  //       //                                 console.log('<=> Player ' + room.players[i].playerName + ' is going Bankrupt ||Texas GAME-NUMBER ['+room.game.gameNumber+'] ||');
  //       //                                 // room.players.splice(i, 1);
  //       //                                 room.players[i].status = 'Left'
  //       //                                // await load('Games/CashGame/Omaha/Controllers/BotController').checkBots(room.id)
  //       //                             }
  //       //                         }
  //       //                     }
  //       //                 }
  //       //             })
  //       //         })
  //       //     }
  //       //     //})
  //       // }



  //   } catch (e) {
  //     console.log("Error:", e);
  //   }
  // },

  testWinner: async function () {
    try {

      /*let hand1 = {
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
          cards: ["6D","5S","JS","3H","5C","2D","5D"]};*/


      let hand1 = {
        player: ["7C", "6D"],
        board: ["AD", "4D", "KD", "9D", "7D"],
        cards: ["AS", "4S", "KS", "9S", "7S", "7C", "6S"]
      };

      let hand2 = {
        player: ["3H", "KC"],
        board: ["AD", "4D", "KD", "9D", "7D"],
        cards: ["AS", "4S", "KS", "9S", "7S", ",3H", "KC"]
      };

      let hand3 = {
        player: ["2C", "8S"],
        board: ["AD", "4D", "KD", "9D", "7D"],
        cards: ["AS", "4S", "KS", "9S", "7S", "2C", "8S"]
      };


      let PokerWinnnerHands = [];

      let hand = Sys.Poker.solve(hand1.cards);
      PokerWinnnerHands.push(hand);
      hand = Sys.Poker.solve(hand2.cards);
      PokerWinnnerHands.push(hand);
      hand = Sys.Poker.solve(hand3.cards);
      PokerWinnnerHands.push(hand);
      console.log("poker hands winner", PokerWinnnerHands);
      let PokerWinnerResult = Sys.Poker.winners(PokerWinnnerHands);

      console.log("result", JSON.stringify(PokerWinnerResult), PokerWinnerResult.length);

    } catch (e) {
      console.log("Error: ", e);
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
  //     let hand = await new Sys.Game.CashGame.Texas.Entities.Hand(player.cards, board);
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
  //           let rankKicker = await Sys.Game.CashGame.Texas.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], ''), 1);
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
  //         let rankKicker = await Sys.Game.CashGame.Texas.Controllers.PlayerProcess.rankKickers(ranks, 5);
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
  //           let rankKicker = await Sys.Game.CashGame.Texas.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], ''), 2);
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
  //               let rankKicker = await Sys.Game.CashGame.Texas.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], '').replace(cards[k], ''), 1);
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
  //           let rankKicker = await Sys.Game.CashGame.Texas.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], ''), 3);
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
  //           let rankKicker = await Sys.Game.CashGame.Texas.Controllers.PlayerProcess.rankKickers(ranks.replace(cards[i], ''), 4);
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

  validateRevertPoint: async function(room, revertPoint){
    try{
      console.log("validate, game pot", room.game.pot);
      if(revertPoint.length > 0){
        let totalRevertPoint = + parseFloat( revertPoint.reduce((partial_sum, a) => parseFloat(partial_sum) + parseFloat(a.amount) , 0 )  ).toFixed(4);
        let sidePot = room.game.gamePot;
        let totalSidepot = + parseFloat( sidePot.reduce((partial_sum, a) => parseFloat(partial_sum) + parseFloat(a.sidePotAmount) , 0 )  ).toFixed(4);
        console.log("validate, totalRevertPoint", totalRevertPoint, totalSidepot);
        if(totalRevertPoint > ( room.game.pot - totalSidepot) ){
          let tempRevertPoint = [];
          let tempTotalPot = 0;
          for (let h = 0; h < revertPoint.length; h += 1) {
           if(tempTotalPot < ( room.game.pot - totalSidepot) ){
            tempTotalPot += revertPoint[h].amount;
            tempRevertPoint.push(revertPoint[h]);
           }
          }
          room.game.gameRevertPoint = tempRevertPoint;
          console.log("validate, room.game.gameRevertPoint", room.game.gameRevertPoint, tempTotalPot)
        }
      }   
    }catch(e){
      console.log("error in validationg revertpOint", e)
    }
  },

  revertPoint: async function (room, isFolded) {
    console.log("folded----", isFolded)
    let newRevertPoint = await module.exports.validateRevertPoint(room, room.game.gameRevertPoint);
    console.log("after validation room.game.gameRevertPoint", room.game.gameRevertPoint)

    // temp store revertpoint, to consider in rake
    room.game.otherData.gameRevertPoint = [...room.game.gameRevertPoint];
    // Send Revert Point to Player
    for (let h = 0; h < room.game.gameRevertPoint.length; h += 1) {
      let isTransferValidated = true;
      let tempGameTotalChips = room.game.gameTotalChips;

      if( ( room.game.gameRevertPoint[h].amount - tempGameTotalChips ) > 0.1 ){
        isTransferValidated = false;
        let errorLog={
          gameNumber:room.game.gameNumber,
          gameId:room.game.id,
          roomId:room.game.roomId,
          pot:room.game.pot,
          validationType: 'Prevent Revert',
          excessAmount: +parseFloat(room.game.gameRevertPoint[h].amount - tempGameTotalChips).toFixed(4),
          gameTotalChips:room.game.gameTotalChips,    
        }
        await Sys.Game.CashGame.Texas.Services.ChipsServices.createErrorReportValidationLog(errorLog);
        console.log("We have a problem in revertpoint chips assign", room.game.gameRevertPoint[h].amount,room.game.gameTotalChips,room.game.gameNumber );
      }

      if (room.game.gameRevertPoint[h].amount > 0 && isTransferValidated == true) {
        let winplr = room.players[room.game.gameRevertPoint[h].playerIndex];
        let winAmount = room.game.gameRevertPoint[h].amount;
        for (let w = 0; w < room.players.length; w += 1) {           
          if(room.players[w].id == room.game.gameRevertPoint[h].playerID ){

            var totalBetAmount = room.game.roundBets[w];

            console.log("(room.game.gameRevertPoint[h].amount: ", room.game.gameRevertPoint[h].amount);
            let winnerDetails={
              user_id:  room.game.gameRevertPoint[h].playerID,
              username:room.players[w].playerName,
              bet_amount: parseFloat(totalBetAmount),
              chips:parseFloat(room.game.gameRevertPoint[h].amount),
            }
            room.game.winnerDetails.push(winnerDetails);
            room.game.history.push({
              time: new Date(),
              playerId: room.game.gameRevertPoint[h].playerID,
              playerName: room.players[w].playerName,
              gameRound: "Revert point",
              betAmount: parseFloat(room.game.gameRevertPoint[h].amount) ,
              totalBetAmount:totalBetAmount,
              playerAction: 10,
              totalPot: room.game.pot,
              remaining:room.players[room.game.gameRevertPoint[h].playerIndex].chips,
              boardCard:room.game.board.length ? room.game.board:"",
            })

            let transactionRevert = {
              user_id:room.game.gameRevertPoint[h].playerID,
              username: room.players[w].playerName,
              gameId: room.game.id,
              gameNumber: room.game.gameNumber,
              tableId: room.id,
              tableName: room.name,
              chips:parseFloat(room.game.gameRevertPoint[h].amount),
              previousBalance:parseFloat(room.players[w].chips),
              afterBalance: (parseFloat(room.players[w].chips) + parseFloat(room.game.gameRevertPoint[h].amount)),
              category: 'credit',
              type: 'revert',
              remark: 'Revert for game',
              isTournament: 'No'
            }

            await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionRevert);
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
              type: 'winner',
              transactionNumber: 'DEP-' + traNumber,

              remark: 'Winner for game  in revert point',
              uniqId:room.players[w].uniqId,
              sessionId:room.players[w].sessionId
            }
              console.log(transactionDataWinData);
             await Sys.Game.CashGame.Texas.Services.ChipsServices.insertData(transactionDataWinData);

          }
        }

        // rack update
        winplr.chips += winAmount;
        let dataObj = {
          playerId: winplr.id,
          roomId: room.id,
          playerName: winplr.playerName,
          amount: winAmount,
          chips: winplr.chips,
          winnerSeatIndex: winplr.seatIndex,
          sidePotPlayerIndex: -1, // main Port index,
          forcefinishfolded: room.game.gameRevertPoint[h].forcefinishfolded,
        };
        console.log("revertpoint in playerProcess", dataObj, room.game.gameNumber)
        //Add revertpoint amount into player winningarray  @chetan
        for (let w = 0; w < room.gameWinners.length; w += 1) {
          if (room.game.gameRevertPoint[h].playerID == room.gameWinners[w].playerId) {
            room.gameWinners[w].chips += parseFloat(room.game.gameRevertPoint[h].amount);
          }
        }
        
        //console.log("revertpoint player", room.game.gameRevertPoint);
        //console.log("room winners", room.gameWinners);
        console.log("revert point win amount", winAmount);
        console.log("final wining amount sum", winplr.chips);
        console.log('<=> Game RevertPoint Broadcast || Texas GAME-NUMBER [' + room.game.gameNumber + '] || RevertPoint : ', dataObj);
         // added by K@Y

        if (isFolded == true) {

          console.log("isFolded revertpoint check", dataObj, room.game.gameNumber)

          if (dataObj.forcefinishfolded == true && room.currencyType != 'chips') {

            let totalOfRoundBets = 0;

            let tempRoundBets = room.game.roundBets.slice();
            tempRoundBets.sort(function (a, b) {
              return a - b;
            });

            if (tempRoundBets[(tempRoundBets.length) - 1] > tempRoundBets[(tempRoundBets.length) - 2]) {
              tempRoundBets[(tempRoundBets.length) - 1] = tempRoundBets[(tempRoundBets.length) - 2];
            }
            console.log("roundbetss", room.game.roundBets, room.game.gameNumber);
            totalOfRoundBets = parseFloat((tempRoundBets.reduce((a, b) => a + b, 0)).toFixed(4));
            console.log("total win when forcefinishfolded", totalOfRoundBets, room.game.gameNumber)

            room.gameWinners.push({
              playerId: winplr.id,
              playerName: winplr.playerName,
              amount: +parseFloat(totalOfRoundBets).toFixed(2),
              chips: parseFloat(winplr.chips),
              winnerSeatIndex: winplr.seatIndex,
              sidePotPlayerIndex: -1,
              rackAmount: 0
            });


            console.log("forcefinishfolded gameWinner", room.gameWinners, room.game.gameNumber)

            //START: 12-08-2019 rack deduction response change and win amount minus revert point amount old code
            //room = await Sys.Game.CashGame.Texas.Controllers.RoomProcess.rackDeduction(room);
            //dataObj.chips = newRoom.gameWinners[0].chips;
            //END: 12-08-2019 rack deduction response change and win amount minus revert point amount old code

            //START: 12-08-2019 rack deduction response change and win amount minus revert point amount new code
            newRoom = await Sys.Game.CashGame.Texas.Controllers.RoomProcess.rackDeduction(room);
            console.log("RevertPointFolded room: ", newRoom.game);
            dataObj.chips = newRoom.gameWinners[0].chips;
            /*for(var ri = 0; ri<newRoom.game.gameRevertPoint.length; ri++){
              if(room.game.gameRevertPoint[h].playerID == newRoom.game.gameRevertPoint[ri].playerID){
                dataObj.amount = newRoom.game.gameRevertPoint[ri].amount;
              }
            }*/
            //END: 12-08-2019 rack deduction response change and win amount minus revert point amount new code            
           for (let index = 0; index < newRoom.gameWinners.length; index++) {
             console.log(" before game revert room.game.gameTotalChips",room.game.gameTotalChips, newRoom.gameWinners[index].rackAmount);
             let orignalBalanceChips=parseFloat(newRoom.gameWinners[index].amount) - parseFloat(newRoom.gameWinners[index].rackAmount)
             room.game.gameTotalChips= parseFloat(parseFloat(room.game.gameTotalChips) -parseFloat(orignalBalanceChips)).toFixed(4);
             console.log(" after game revert room.game.gameTotalChips",room.game.gameTotalChips);       
             if(newRoom.gameWinners[index].amount!= dataObj.amount){
              let actualData=dataObj.amount-newRoom.gameWinners[index].amount
              room.game.gameTotalChips= parseFloat(parseFloat(room.game.gameTotalChips) -parseFloat(actualData)).toFixed(4);
             }
           }
           console.log("Complete game revert room.game.gameTotalChips",room.game.gameTotalChips);       
            console.log("forcefinishfolded gameWinner chipss after rack", newRoom.gameWinners, dataObj, newRoom.game.gameNumber)
            await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(newRoom.id).emit('RevertPointFolded', dataObj);
            newRoom.gameWinners.pop();
            console.log("game winners array after pop", newRoom.gameWinners, newRoom.game.gameNumber);
          } else {
            room.game.gameTotalChips= parseFloat(parseFloat(room.game.gameTotalChips)-parseFloat(dataObj.amount)).toFixed(4);
            await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('RevertPointFolded', dataObj);
          }



        } else {
          console.log("reveertpoint in......", room.game.gameNumber)
          room.game.gameTotalChips= eval(parseFloat(room.game.gameTotalChips).toFixed(4)- parseFloat(dataObj.amount).toFixed(4));
          await Sys.Io.of(Sys.Config.Namespace.CashTexas).to(room.id).emit('RevertPoint', dataObj);
        }

        if (room.game.gameMainPot > 0) {
          room.game.gameMainPot -= parseFloat(parseFloat(room.game.gameRevertPoint[h].amount).toFixed(4));
        }


        
        console.log("revertpoint after assigning through revertpoint function", room.game.gameRevertPoint, room.game.gameNumber);
      }
    }
    room.game.gameRevertPoint = [];
  }

}
