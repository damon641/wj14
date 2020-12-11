var Sys = require('../../../../Boot/Sys');

class Room {
  constructor(id, tableType, currencyType, name, smallBlind, bigBlind,smallBlindIndex,bigBlindIndex, minPlayers, maxPlayers, minBuyIn, maxBuyIn, type, gameLimit, status, dealer, players, gameWinners, gameLosers, turnBet, game, currentPlayer, rackPercent, rackAmount, expireTime, owner, tableNumber,timerStart,limit,isTournamentTable,tournamentType,tournament) {

    var room = this;
    this.id = id;
    this.tableType = tableType;
    this.currencyType = currencyType;
    this.name = name;
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.smallBlindIndex = smallBlindIndex;
    this.bigBlindIndex = bigBlindIndex;
    this.minPlayers = minPlayers;
    this.maxPlayers = maxPlayers;
    this.minBuyIn = minBuyIn;
    this.maxBuyIn = maxBuyIn;
    this.type = type;
    this.gameLimit = gameLimit;
    this.status = (status) ? status : 'Waiting';

    //Track the dealer position between games
    this.dealer = 0;
    if (dealer) {
      this.dealer = dealer;
    }
    this.players = [];
      if (players && Array.isArray(players)) {
        room.players = [];
        players.forEach(function (player) {
    
          room.players.push(new Sys.Game.Sng.Texas.Entities.Player().createObject(player));
        
        });
      }
    this.gameWinners = [];
    if (gameWinners && Array.isArray(gameWinners) ) {
      room.gameWinners = gameWinners
    }
    this.gameLosers = [];
    if (gameLosers) {
      gameLosers.forEach(function (player) {
       room.gameLosers.push(new Sys.Game.Sng.Texas.Entities.Player().createObject(player));
 
      });
    }
    this.turnBet = {};
    if (turnBet) {
      room.turnBet = turnBet;
    }
    // other variables
    this.game = null;
    if (game) {
      this.game = new Sys.Game.Sng.Texas.Entities.Game().createObject(game);
    }
    this.currentPlayer = currentPlayer
    this.rackPercent = rackPercent
    this.rackAmount = rackAmount
    this.expireTime = expireTime
    this.owner = owner
    this.tableNumber = tableNumber;
    this.timerStart = timerStart;
    this.limit = limit;
    this.isTournamentTable = isTournamentTable;
    this.tournamentType = tournamentType;
    this.tournament = tournament;
  }

   createObject(room) {
    return new Room(
      room.id,
      room.tableType,
      room.currencyType,
      room.name,
      room.smallBlind,
      room.bigBlind,
      room.smallBlindIndex,
      room.bigBlindIndex,
      room.minPlayers,
      room.maxPlayers,
      room.minBuyIn,
      room.maxBuyIn,
      room.type,
      room.gameLimit,
      room.status,
      room.dealer,
      room.players,
      room.gameWinners,
      room.gameLosers,
      room.turnBet,
      room.game,
      room.currentPlayer,
      room.rackPercent,
      room.rackAmount,
      room.expireTime,
      room.owner,
      room.tableNumber,
      room.timerStart,
      room.limit,
      room.isTournamentTable,
      room.tournamentType,
      room.tournament
    );
  }

  /*
   * Helper Methods Public
   */
  toJson() {

    var room = {
      id: this.id,
      tableType : this.tableType,
      currencyType : this.currencyType,
      name: this.name,
      smallBlind: this.smallBlind,
      bigBlind: this.bigBlind,
      smallBlindIndex : this.smallBlindIndex,
      bigBlindIndex : this.bigBlindIndex,
      minPlayers: this.minPlayers,
      maxPlayers: this.maxPlayers,
      minBuyIn: this.minBuyIn,
      maxBuyIn: this.maxBuyIn,
      type: this.type,
      gameLimit: this.gameLimit,
      status: this.status,
      dealer: this.dealer,
      turnBet: this.turnBet,
      players: [],
      gameWinners: this.gameWinners,
      gameLosers: [],
      game: null,
      currentPlayer: this.currentPlayer,
      rackPercent: this.rackPercent,
      rackAmount : this.rackAmount,
      expireTime : this.expireTime,
      owner : this.owner,
      tableNumber:this.tableNumber,
      timerStart : this.timerStart,
      limit : this.limit,
     /* isTournamentTable : this.isTournamentTable,
      tournamentType : this.tournamentType,
      tournament : this.tournament */
    }
    if (this.players.length > 0) {
      this.players.forEach(function (player) {
        room.players.push(new Sys.Game.Sng.Texas.Entities.Player().createObject(player));
      })
    }
    if (this.gameLosers.length > 0) {
      this.gameLosers.forEach(function (player) {
        room.gameLosers.push(new Sys.Game.Sng.Texas.Entities.Player().createObject(player));
      });
    }
    if (this.game) {
      room.game = this.game.toJson();
    }
    return room;
  }

  // newRound helper
  getHandForPlayerName(playerName) {
    for (var i in this.players) {
      if (this.players[i].playerName === playerName) {
        return this.players[i].cards;
      }
    }
    return [];
  }

  getDeal() {
    return this.game.board;
  }

  getDealer() {
    return this.players[this.dealer];
  }

  getSmallBliendPlayer() {
    return this.players[this.smallBlindIndex];
  }

  getBigBliendPlayer() {
    return this.players[this.bigBlindIndex];
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayer];
  }

  getPlayerById(id) {
    let player = null;
    for (let i = 0; i < this.players.length; i++) {
      if (id == this.players[i].id) {
        player = this.players[i];
        break;
      }
    }
    return player;
  }

  getPreviousPlayerAction() {
    return this.turnBet;
  }

  // Player actions: Check(), Fold(), Bet(bet), Call(), AllIn()
  check (id, hasRaised) {
    var currentPlayer = this.currentPlayer;
    if (id === this.players[currentPlayer].id) {
      this.players[currentPlayer].Check(this.id,hasRaised);
      return true;
    }
    else {
      // todo: check if something went wrong ( not enough money or things )
      Sys.Log.info("wrong user has made a move");
      return false;
    }
  }

  fold (id, hasRaised) {
    var currentPlayer = this.currentPlayer;
    if (id === this.players[currentPlayer].id) {
      this.players[currentPlayer].Fold(this.id,hasRaised);
      return true;
    }
    else {
      Sys.Log.info("wrong user has made a move");
      return false;
    }
  }

  call(id, hasRaised) {
    var currentPlayer = this.currentPlayer;
    if (id === this.players[currentPlayer].id) {
      this.players[currentPlayer].Call(this.id,hasRaised);
      return true;
    } else {
      Sys.Log.info("wrong user has made a move");
      return false;
    }
  }

  bet(id, amt, hasRaised) {
    var currentPlayer = this.currentPlayer;
    if (id === this.players[currentPlayer].id) {
      this.players[currentPlayer].Bet(this.id,amt, hasRaised);
      return true;
    } else {
      console.log("wrong user has made a move");
      return false;
    }
  }

  AllIn(id, hasRaised) {
    console.log("Action Called :: [-ALLIN-] ")
    var currentPlayer = this.currentPlayer;
    if (id === this.players[currentPlayer].id) {
      this.players[currentPlayer].AllIn(this.id,hasRaised);
      return true;
    } else {
      console.log("wrong user has made a move");
      return false;
    }
  }

  getWinners() {
     return this.gameWinners;
  }

  getLosers() {
     return this.gameLosers;
  }

  getAllHands() {
     var all = this.losers.concat(this.players);
     var allHands = [];
     for (var i in all) {
       allHands.push({
         playerName: all[i].playerName,
         chips: all[i].chips,
         hand: all[i].cards,
       });
     }
     return allHands;
  }

  AddPlayer(id, socketId, playerName, avatar, fb_avatar, chips, seatIndex, autoBuyin) {
    let room = this;
    if (chips >= this.minBuyIn) {
      let player = new Sys.Game.Sng.Texas.Entities.Player(id, socketId,seatIndex,playerName, avatar, fb_avatar, "Waiting", chips,false,false,false,[],autoBuyin,0,false,false,false,false);
      this.players.push(player);
    }
    return room; // Return Room
  }

  removePlayer(id) {
    for (let i in this.players) {
      if (this.players[i].id === id) {
        this.players[i].status = 'Left';
        this.players[i].Fold(this.id,false); // Set hasRais False
      }
    }
  }

  async StartGame() {
    try {
     console.log("Call Start Game");
     let room = this
     let playingCounter = 0;
     let playingKey = 0;
     let i;
     let playersLength = 0;
     room.players.forEach(function (player) {
       if (player.status != 'Left') {
         playersLength += 1;
       }
     });
     
      // First Select Room Dealer
      room.dealer += 1;
   
     if (room.dealer >= playersLength) {
        room.dealer = 0;
      }
      if (room.dealer >= playersLength) {
        room.dealer -= playersLength;
      }

     //Identify Small and Big Blind player index
     room.smallBlindIndex = room.dealer + 1;
     if (room.smallBlindIndex >= playersLength) {
       room.smallBlindIndex = 0;
     }
     if (room.smallBlindIndex >= playersLength) {
       room.smallBlindIndex -= playersLength;
     }
     room.bigBlindIndex = room.dealer + 2;
     if (room.bigBlindIndex >= playersLength) {
       room.bigBlindIndex -= playersLength;
     }
     if (room.bigBlindIndex >= playersLength) {
       room.bigBlindIndex -= playersLength;
     }


     if(room.players[room.bigBlindIndex].sitOutNextBigBlind == true){
      console.log("--------------------Bib Blind Remove----------------------------------");
      console.log("---", room.players[room.bigBlindIndex].playerName);
      console.log("----------------------------------------------------------------------");

      room.gameLosers.push(room.players[room.bigBlindIndex]);
      room.players[room.bigBlindIndex].status = 'Left';
      await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerLeft', { 'playerId':  room.players[room.bigBlindIndex].id });

      // Big Blind Remove So Find New Big Blind Player.
      playersLength = 0;
      room.players.forEach(function (player) {
        if (player.status != 'Left') {
          playersLength += 1;
        }
      });
      console.log("---", playersLength);
      if (room.dealer >= playersLength) {
        room.dealer = 0;
      }
      if (room.dealer >= playersLength) {
        room.dealer -= playersLength;
      }

     //Identify Small and Big Blind player index
     room.smallBlindIndex = room.dealer + 1;
     if (room.smallBlindIndex >= playersLength) {
       room.smallBlindIndex = 0;
     }
     if (room.smallBlindIndex >= playersLength) {
       room.smallBlindIndex -= playersLength;
     }
     room.bigBlindIndex = room.dealer + 2;
     if (room.bigBlindIndex >= playersLength) {
       room.bigBlindIndex -= playersLength;
     }
     if (room.bigBlindIndex >= playersLength) {
       room.bigBlindIndex -= playersLength;
     }
     console.log("---", room.dealer);
     console.log("---", room.smallBlindIndex);
      console.log("---", room.bigBlindIndex);
    } 



  
     for (let i = 0; i < room.players.length; i++) {
       if (room.players[i].status != 'Left') {
           playingCounter++; // Count How Many Player Playing Game.
           playingKey = i;
       }
     }
     if(playingCounter == 1){ // if Only One Player in Table
         room.players[playingKey].status = 'Waiting'; // When Player is One Then Change Player Status
     }

     // Remove Player Which Have Status Left
     for (let i = room.players.length-1; i >= 0; i--) { // Shiv!@#
       if (room.players[i].status == 'Left') {
           room.players.splice(i,1);
       }
     }

     room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
     
   
     if (room.game == null && playersLength >= this.minPlayers) {
 
       let gameobj = {
         roomId: room.id,
         smallBlind: room.smallBlind,
         bigBlind: room.bigBlind,
         status: 'Running',
       };
     //  console.log("Befor create Game",gameobj);
      let game = await Sys.Game.Sng.Texas.Services.GameServices.create(gameobj);
       // console.log("Game :>",game);
       if(game){
         room.game = game;
         room.game.status = 'Running';
         room.game.pot = 0;
         room.game.roundName = 'Preflop'; //Start the first round
         room.game.betName = 'bet'; //bet,raise,re-raise,cap
         room.game.bets.splice(0, room.game.bets.length);
         room.game.deck.splice(0, room.game.deck.length);
         room.game.board.splice(0, room.game.board.length);
         room.game.history.splice(0, room.game.history.length);
         for (let i = 0; i < room.players.length; i++) {
              room.game.bets[i] = 0;
              room.game.roundBets[i] = 0;
         }
         // Player Sort As Seatindex.
        room.players.sort(function (a, b) {
          return a.seatIndex - b.seatIndex;
        })



        for (let i = 0; i < room.players.length; i += 1) {
          room.players[i].folded = false;
          room.players[i].talked = false;
          room.players[i].allIn = false;
          room.players[i].isSidepot = false;
          room.players[i].cards.splice(0, room.players[i].cards.length);
        }

     
         if (room.players[room.smallBlindIndex].chips <= room.smallBlind) {
              room.players[room.smallBlindIndex].allIn = true;
              room.players[room.smallBlindIndex].talked = true;
              room.game.bets[room.smallBlindIndex] = parseInt(room.players[room.smallBlindIndex].chips);

              // Send Player Action 

              room.turnBet = {action: Sys.Config.Texas.AllIn, playerId: room.players[room.smallBlindIndex].id,betAmount: parseInt(room.players[room.smallBlindIndex].chips), hasRaised: false}
              await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerAction',{
                action: room.turnBet,
                playerBuyIn : 0,
              });

              room.game.history.push({
                time: new Date(),
                playerId: room.players[room.smallBlindIndex].id,
                playerName: room.players[room.smallBlindIndex].playerName,
                gameRound: room.game.roundName,
                betAmount: room.players[room.smallBlindIndex].chips,
                totalBetAmount: room.smallBlind,
                playerAction: Sys.Config.Texas.AllIn,
                remaining: 0
              })
              room.players[room.smallBlindIndex].chips = 0;
        } else {
              room.players[room.smallBlindIndex].chips -= room.smallBlind;
              room.game.bets[room.smallBlindIndex] = room.smallBlind;

              // Send Player Action
              room.turnBet = {action: Sys.Config.Texas.SmallBlind, playerId: room.players[room.smallBlindIndex].id,betAmount: parseInt(room.smallBlind), hasRaised: false}
              await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerAction',{
                action: room.turnBet,
                playerBuyIn : parseInt(room.players[room.smallBlindIndex].chips),
              });

              room.game.history.push({
                time: new Date(),
                playerId: room.players[room.smallBlindIndex].id,
                playerName: room.players[room.smallBlindIndex].playerName,
                gameRound: room.game.roundName,
                betAmount: room.smallBlind,
                totalBetAmount: room.smallBlind,
                playerAction: Sys.Config.Texas.smallBlind,
                remaining: room.players[room.smallBlindIndex].chips
              })
        }

         if (room.players[room.bigBlindIndex].chips <= room.bigBlind) {
            room.players[room.bigBlindIndex].allIn = true;
            room.players[room.bigBlindIndex].talked = true;
            room.game.bets[room.bigBlindIndex] = parseInt(room.players[room.bigBlindIndex].chips);

            // Player Action
            room.turnBet = {action: Sys.Config.Texas.AllIn, playerId: room.players[room.bigBlindIndex].id,betAmount: parseInt(room.players[room.bigBlindIndex].chips), hasRaised: false}
            await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerAction',{
              action: room.turnBet,
              playerBuyIn : 0,
            });

            room.game.history.push({
              time: new Date(),
              playerId: room.players[room.bigBlindIndex].id,
              playerName: room.players[room.bigBlindIndex].playerName,
              gameRound: room.game.roundName,
              betAmount: room.players[room.bigBlindIndex].chips,
              totalBetAmount: room.bigBlind,
              playerAction: Sys.Config.Texas.AllIn,
              remaining: 0
            })
            room.players[room.bigBlindIndex].chips = 0
        } else {
            room.players[room.bigBlindIndex].chips -= room.bigBlind;
            room.game.bets[room.bigBlindIndex] = parseInt(room.bigBlind);

            // Player cards
            room.turnBet = {action: Sys.Config.Texas.BigBlind, playerId: room.players[room.bigBlindIndex].id,betAmount: parseInt(room.bigBlind), hasRaised: false}
            await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerAction',{
              action: room.turnBet,
              playerBuyIn : parseInt(room.players[room.bigBlindIndex].chips),
            });

            room.game.history.push({
              time: new Date(),
              playerId: room.players[room.bigBlindIndex].id,
              playerName: room.players[room.bigBlindIndex].playerName,
              gameRound: room.game.roundName,
              betAmount: room.bigBlind,
              totalBetAmount: room.bigBlind,
              playerAction: Sys.Config.Texas.BigBlind,
              remaining: room.players[room.bigBlindIndex].chips
            })
        }
      

         let playersLength = 0;
         room.players.forEach(function (player) {
           if (player.status != 'Left') {
             playersLength += 1;
           }
         })
         if (playersLength >= room.minPlayers) {
           room.game.status = 'Running';
           room.status = 'Running';
           let gameStarted = await Sys.Game.Sng.Texas.Controllers.RoomProcess.newGameStarted(room);
           room.initNewRound();
         }
       }else{ // Shiv!@#
        console.log("Game Not Created. So Try Again...");
        room.StartGame();
       }

     }else{
      clearTimeout(Sys.Timers[room.id]);
      room.status = 'Finished';
      room.game = null;
      console.log("single Player Remain After Bib Blind Player Left. So Game Not starting...");
      room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);
     }
    } catch (e) {
			console.log("Error In start Game : ", e);
		}


  }

  async initNewRound() {
    console.log("Init new Round");
    var room = this
    
   

    console.log("Befor Fill Deck")
    room.game.deck = [];
    await new Sys.Game.Sng.Texas.Entities.Deck().fillDeck(room.game.deck);
    room.NewRound();
  };
  

  async NewRound() {
     console.log("New Round")
     var room = this
     // Add players in waiting list
     // update remove player

     for (var i in room.players) {
       if (room.players[i].status == 'Waiting') {
         room.players[i].status = 'Playing'
       }
     }
     room.gameWinners = [];
     room.gameLosers = [];
   
     //Deal 2 cards to each player
     for (i = 0; i < room.players.length; i += 1) {
       room.players[i].cards.push(room.game.deck.pop());
       room.players[i].cards.push(room.game.deck.pop());
     }
   
     //Force Blind Bets
     
     // get currentPlayer
     room.currentPlayer = room.dealer + 3;
     if (room.currentPlayer >= room.players.length) {
       room.currentPlayer -= room.players.length;
     }
     if (room.currentPlayer >= room.players.length) {
       room.currentPlayer -= room.players.length;
     }
     console.log("Room Running");
     room.status = 'Running';
     // depriciated
     console.log("Bets ========================================================");
     console.log(room.game.bets);

     room  =  await Sys.Game.Sng.Texas.Controllers.RoomProcess.broadcastPlayerInfo(room);
     
     let newRoundStarted = Sys.Game.Sng.Texas.Controllers.RoomProcess.newRoundStarted(room);
 

   }

  /** Start : Current  Player  Turn Button Action  */

  getCurrentTurnButtonAction() {

    console.log("Room Called");

    let maxBet = parseInt(this.getMaxBet(this.game.bets));
    let yourBet = parseInt(this.game.bets[this.currentPlayer]);
    let playerChips = parseInt(this.players[this.currentPlayer].chips);

    console.log("maxBet :",maxBet);
    console.log("yourBet",yourBet);
    console.log("playerChips",playerChips);

    // Check For All In
    if(playerChips <= parseInt(maxBet - yourBet)){
      console.log("ALL In.......");
      return {
        allIn : true,
        allInAmount : parseInt(playerChips),
        check : false,
        call : false,
        callAmount : 0.0,
        raise : false,
        minRaise : 0.0,
        maxRaise : 0.0
      }
    }

    // Check for Call
    if(yourBet < maxBet){
      console.log("Call .......");

      let min = parseInt(parseInt(maxBet - yourBet) + parseInt(this.smallBlind));

      if(min < parseInt(playerChips)){
        return {
          allIn : false,
          allInAmount : 0,
          check : false,
          call : true,
          callAmount : parseInt(maxBet - yourBet),
          raise : true,
          minRaise : parseInt(parseInt(maxBet - yourBet) + parseInt(this.smallBlind)),
          maxRaise : parseInt(playerChips)
        }
      }else{
        return {
          allIn : true,
          allInAmount : parseInt(playerChips),
          check : false,
          call : true,
          callAmount : parseInt(maxBet - yourBet),
          raise : false,
          minRaise : 0.0,
          maxRaise : 0.0
        }
      }

      
    }

    // Check for Check

    if(yourBet == maxBet){
      console.log("Check .......");
      return {
        allIn : false,
        check : true,
        call : false,
        callAmount : 0.0,
        raise : true,
        minRaise : parseInt(this.smallBlind),
        maxRaise : parseInt(playerChips)
      }
    }

  }


  getMaxBet(bets) {
    var maxBet, i;
    maxBet = 0;
    for (i = 0; i < bets.length; i += 1) {
        if (bets[i] > maxBet) {
            maxBet = bets[i];
        }
    }
    return maxBet;
  }

   /** End : Current  Player  Turn Button Action */




}



module.exports = Room
