var Sys = require('../../../../Boot/Sys');

class Room {
  constructor(id, tableType, currencyType, name, smallBlind, bigBlind,dealerIndex,smallBlindIndex,bigBlindIndex, minPlayers, maxPlayers, minBuyIn, maxBuyIn, type, gameLimit, status, dealer, players, gameWinners, gameLosers, turnBet, game, currentPlayer, rackPercent, rackAmount, expireTime, owner, tableNumber,timerStart,limit,gameType,isCashGame,otherData,isTournamentTable,tournamentType,tournament, lastFoldedPlayerIdArray, currentBlindIndex,betCounter,allInInLimit) {
    var room = this;
    this.id = id;
    this.tableType = tableType;
    this.currencyType = currencyType;
    this.name = name;
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.dealerIndex = dealerIndex;
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
    this.dealer = -1;
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
    this.gameType = gameType;
    this.isCashGame = isCashGame;
    this.otherData = otherData;
    this.isTournamentTable = isTournamentTable;
    this.tournamentType = tournamentType;
    this.tournament = tournament;
    this.lastFoldedPlayerIdArray = [];
    this.currentBlindIndex = (currentBlindIndex) ? currentBlindIndex : 0 ;
    this.betCounter = 0;
    this.allInInLimit = false;
    if (lastFoldedPlayerIdArray && Array.isArray(lastFoldedPlayerIdArray) ) {
      room.lastFoldedPlayerIdArray = lastFoldedPlayerIdArray
    }

  }

   createObject(room) {
    return new Room(
      room.id,
      room.tableType,
      room.currencyType,
      room.name,
      room.smallBlind,
      room.bigBlind,
      room.dealerIndex,
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
      room.gameType,
      room.isCashGame,
      room.otherData,
      room.isTournamentTable,
      room.tournamentType,
      room.tournament,
      room.lastFoldedPlayerIdArray,
      room.currentBlindIndex,
      room.betCounter,
      room.allInInLimit
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
      dealerIndex : this.dealerIndex,
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
      gameType : this.gameType,
      isCashGame : this.isCashGame,
      otherData : this.otherData,
      isTournamentTable : this.isTournamentTable,
      tournamentType : this.tournamentType,
      tournament : this.tournament,
      lastFoldedPlayerIdArray: [],
      currentBlindIndex : this.currentBlindIndex,
      betCounter : this.betCounter,
      allInInLimit: this.allInInLimit
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
    return this.players[this.dealerIndex];
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
    console.log("Action Called :: [-CHECK-] ")
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
    console.log("Action Called :: [-FOLD-] ")
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
    console.log("Action Called :: [-CALL-] ")
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
    console.log("Action Called :: [-BET-] ")
    var currentPlayer = this.currentPlayer;
    if (id === this.players[currentPlayer].id) {
      this.betCounter = this.betCounter + 1;
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

  AddPlayer(id, socketId, playerName, avatar, fb_avatar, chips, seatIndex, autoBuyin, isIdeal) {
    let room = this;
    if (chips >= this.minBuyIn) {
      let player = new Sys.Game.Sng.Texas.Entities.Player(id, socketId,seatIndex, playerName, avatar, fb_avatar, "Waiting", chips,0,chips,false,false,false,[],autoBuyin,0,false,false,false,false,false,null, false, 0, false, false, false, false, isIdeal, 0, false);
     // console.log("Player -> :",player)
      let playerGameObj = {
        player : id,
        room : room.id,
        isTournament : true,
        tournamentType : 'sng',
        tournament : room.tournament,
        type : room.tableType,
        status : 'Running'
      }
      Sys.Game.Sng.Texas.Services.playerGameHistoryServices.create(playerGameObj);
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

      console.log("/$$$$$$$$$$$$$$$$$$NEW GAME START Texas $$$$$$$$$$$$$$$$$$$$$$$$/")
      console.log("||  ROOM ")
      console.log("/$$$$$$$$$$$$$$$$$$NEW GAME START Texas $$$$$$$$$$$$$$$$$$$$$$$$/")
 
     let room = this
     let playingCounter = 0;
     let playingKey = 0;

     console.log("/************** Removed Left Player ***********************/")
     for (let i = room.players.length-1; i >= 0; i--) { 
        if (room.players[i].status == 'Left') {
            console.log("Removed Name  : ",room.players[i].playerName)
            room.players.splice(i,1);
        }
     }
     console.log("/**************************************************/")



      let remainPlayerArray = [];
      for (let i = 0; i < room.players.length; i += 1) {
        if(room.players[i].status != 'Ideal'){
          remainPlayerArray.push(room.players[i]);
        }
      }

      // Player Sort By SeatIndex.
      remainPlayerArray.sort(function (a, b) {
        return a.seatIndex - b.seatIndex;
      });


     for (let i = 0; i < room.players.length; i += 1) {
        if(room.players[i].status == 'Ideal'){
          remainPlayerArray.push(room.players[i]);
        }
      }
      // Set New Player Arrray : last all Players  Ideals
    
      room.players = remainPlayerArray;

      room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);

     let playersLength =  await room.roomPlayerLength(room);
     console.log("Playing Player Length : ", playersLength);

     for (let i = 0; i < room.players.length; i++) {
       if (room.players[i].status != 'Left' && room.players[i].extraChips != 0) { 
            room.players[i].chips = parseFloat(room.players[i].chips) + parseFloat(room.players[i].extraChips); // Add Rebuyin Chips to Orignal Account.
            console.log("/************** EXTRA CHIPS ***********************/")
            console.log("| Name  : ",room.players[i].playerName)
            console.log("| Extra Chips : ",room.players[i].extraChips)
            console.log("| Chips : ",room.players[i].chips)
            console.log("/**************************************************/")
            room.players[i].entryChips = parseFloat(room.players[i].entryChips) + parseFloat(room.players[i].extraChips);
            room.players[i].extraChips = 0;
            if (room.players[i].status != 'Ideal') { // ???
              room.players[i].status = 'Playing';
              room.players[i].idealPlayer = false;
            }
       }

     }

     // Select Dealer/SB/BB
     room = await room.roomDealerPositionSet(room,false);

     console.log("--------------------Bib Blind Remove----------------------------------");
    //  console.log("---", room.players[room.bigBlindIndex].playerName);
     console.log("----------------------------------------------------------------------");


      console.log("--------------------Smalll Bliende----------------------------------");
      console.log("---", room.players[room.smallBlindIndex].playerName);
      console.log("----------------------------------------------------------------------");



     if(room.players[room.bigBlindIndex].sitOutNextBigBlind == true){

      console.log("--------------------Bib Blind Remove----------------------------------");
      console.log("---", room.players[room.bigBlindIndex].playerName);
      console.log("----------------------------------------------------------------------");

      room.gameLosers.push(room.players[room.bigBlindIndex]);

      room.players[room.bigBlindIndex].status = 'Ideal';
       //await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('PlayerLeft', { 'playerId':  room.players[room.bigBlindIndex].id });
      await Sys.Io.of(Sys.Config.Namespace.CashSngTexas).to(room.id).emit('onIdealPlayer', { 'playerId': room.players[room.bigBlindIndex].id,status : true, roomId: room.id });
      // Big Blind Remove So Find New Big Blind Player.
      room.players[room.bigBlindIndex].idealTime = (room.players[room.bigBlindIndex].idealTime == null) ? new Date().getTime() : room.players[room.bigBlindIndex].idealTime;
      room.players[room.bigBlindIndex].defaultActionCount = 3;
       let remainPlayerArray = [];
       for (let i = 0; i < room.players.length; i += 1) {
         if(room.players[i].status != 'Ideal'){
           remainPlayerArray.push(room.players[i]);
         }
       }

       // Player Sort By SeatIndex.
       remainPlayerArray.sort(function (a, b) {
         return a.seatIndex - b.seatIndex;
       });


      for (let i = 0; i < room.players.length; i += 1) {
         if(room.players[i].status == 'Ideal'){
           remainPlayerArray.push(room.players[i]);
         }
       }
       // Set New Player Arrray : last all Players  Ideals
      
       room.players = remainPlayerArray;

       room = await room.roomDealerPositionSet(room,true);


    }


    console.log("--------------------Bib Blind Remove----------------------------------");
    console.log("---", room.players[room.bigBlindIndex].playerName);
    console.log("----------------------------------------------------------------------");


     console.log("--------------------Smalll Bliende----------------------------------");
     console.log("---", room.players[room.smallBlindIndex].playerName);
     console.log("----------------------------------------------------------------------");






    for (let i = 0; i < room.players.length; i++) {
       if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal' ) {
           playingCounter++; // Count How Many Player Playing Game.
           playingKey = i;
       }
     }
     if(playingCounter == 1){ // if Only One Player in Table
         room.players[playingKey].status = 'Waiting'; // When Player is One Then Change Player Status
     }


     playersLength =  await room.roomPlayerLength(room);
     // Remove Player Which Have Status Left


     room = await Sys.Game.Sng.Texas.Services.RoomServices.update(room);

     
    if (room.game == null && playersLength >= this.minPlayers) {
        room.smallBlind = Sys.Tournaments[room.tournament].smallBlind;
        room.bigBlind = Sys.Tournaments[room.tournament].bigBlind;
       let gameobj = {
         roomId: room.id,
         smallBlind: room.smallBlind,
         bigBlind: room.bigBlind,
         status: 'Running',
         gameType : room.gameType,
         isTournamentTable : room.isTournamentTable,
         tournamentType : room.tournamentType,
         tournament : room.tournament,
         tableType : room.tableType,
         isCashGame : room.isCashGame,
         otherData : room.otherData
       };
        
      let game = await Sys.Game.Sng.Texas.Services.GameServices.create(gameobj);
       // console.log("Game :>",game);
      if(game){

        // Send Brodcast For New Updated Chips
        room = await Sys.Game.Sng.Texas.Controllers.RoomProcess.broadcastPlayerInfo(room);

         room.game = game;
         room.game.status = 'Running';
         room.game.pot = 0;
         room.game.roundName = 'Preflop'; //Start the first round
         room.game.betName = 'bet'; //bet,raise,re-raise,cap
         room.game.bets.splice(0, room.game.bets.length);
         room.game.deck.splice(0, room.game.deck.length);
         room.game.board.splice(0, room.game.board.length);
         room.game.history.splice(0, room.game.history.length);
         room.betCounter = 0;
         for (let i = 0; i < room.players.length; i++) {
              room.game.bets[i] = 0;
              room.game.roundBets[i] = 0;
         }

  


      console.log("--------------------Bib Blind Remove----------------------------------");
      console.log("---Dealer :::", room.players[room.dealerIndex].playerName);
      console.log("--- SB    :::", room.players[room.smallBlindIndex].playerName);
      console.log("--- BB    :::", room.players[room.bigBlindIndex].playerName);
      console.log("----------------------------------------------------------------------");

        for (let i = 0; i < room.players.length; i += 1) {
          room.players[i].folded = false;
          room.players[i].talked = false;
          room.players[i].allIn = false;
          room.players[i].isSidepot = false;
          room.players[i].cards.splice(0, room.players[i].cards.length);
        }

        // reset Turn  Bet When New Game Start
        room.turnBet = {action: '-', playerId: room.players[room.dealerIndex].id, betAmount: 0, raisedAmount : 0, hasRaised: false}


        if (room.players[room.smallBlindIndex].chips <= room.smallBlind) {
              room.players[room.smallBlindIndex].allIn = true;
              room.players[room.smallBlindIndex].talked = true;
              room.game.bets[room.smallBlindIndex] = parseFloat(room.players[room.smallBlindIndex].chips);
              room.game.history.push({
                time: new Date(),
                playerId: room.players[room.smallBlindIndex].id,
                playerName: room.players[room.smallBlindIndex].playerName,
                gameRound: room.game.roundName,
                betAmount: parseFloat( parseFloat( room.players[room.smallBlindIndex].chips ).toFixed(4) ),
                totalBetAmount: parseFloat( parseFloat( room.smallBlind ).toFixed(4) ),
                playerAction: Sys.Config.Texas.AllIn,
                remaining: 0
              })
              room.players[room.smallBlindIndex].chips = 0;
        } else {
              room.players[room.smallBlindIndex].chips -= room.smallBlind;
              room.game.bets[room.smallBlindIndex] = room.smallBlind;
              room.game.history.push({
                time: new Date(),
                playerId: room.players[room.smallBlindIndex].id,
                playerName: room.players[room.smallBlindIndex].playerName,
                gameRound: room.game.roundName,
                betAmount: parseFloat( parseFloat( room.smallBlind ).toFixed(4) ),
                totalBetAmount: parseFloat( parseFloat( room.smallBlind).toFixed(4) ),
                playerAction: Sys.Config.Texas.SmallBlind,
                remaining: parseFloat( parseFloat(room.players[room.smallBlindIndex].chips).toFixed(4) )
              })
        }

        if (room.players[room.bigBlindIndex].chips <= room.bigBlind) {
            room.players[room.bigBlindIndex].allIn = true;
            room.players[room.bigBlindIndex].talked = true;
            room.game.bets[room.bigBlindIndex] = parseFloat(room.players[room.bigBlindIndex].chips);
            room.game.history.push({
              time: new Date(),
              playerId: room.players[room.bigBlindIndex].id,
              playerName: room.players[room.bigBlindIndex].playerName,
              gameRound: room.game.roundName,
              betAmount: parseFloat( parseFloat( room.players[room.bigBlindIndex].chips).toFixed(4) ),
              totalBetAmount: parseFloat( parseFloat(room.bigBlind).toFixed(4) ),
              playerAction: Sys.Config.Texas.AllIn,
              remaining: 0
            })
            room.players[room.bigBlindIndex].chips = 0
        } else {
            room.players[room.bigBlindIndex].chips -= room.bigBlind;
            room.game.bets[room.bigBlindIndex] = parseFloat(room.bigBlind);
            room.game.history.push({
              time: new Date(),
              playerId: room.players[room.bigBlindIndex].id,
              playerName: room.players[room.bigBlindIndex].playerName,
              gameRound: room.game.roundName,
              betAmount: parseFloat( parseFloat( room.bigBlind).toFixed(4) ),
              totalBetAmount: parseFloat( parseFloat(room.bigBlind).toFixed(4) ),
              playerAction: Sys.Config.Texas.BigBlind,
              remaining: parseFloat( parseFloat( room.players[room.bigBlindIndex].chips ).toFixed(4) )
            })
        }


        playersLength =  await room.roomPlayerLength(room);

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
        console.log("removed error",room.game, playersLength)
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

    // Update Player Statistics

    for (let i = 0; i < room.players.length; i += 1) {
      let player = await Sys.Game.Sng.Texas.Services.PlayerServices.getById(room.players[i].id);
      player.statistics.sng.noOfPlayedGames++; 
      player.statistics.sng.totalLoseGame = parseInt(player.statistics.sng.noOfPlayedGames)-parseInt(player.statistics.sng.totalWonGame);
      await Sys.Game.Sng.Texas.Services.PlayerServices.update(player.id, { statistics: player.statistics });
    }
    
    console.log("Befor Fill Deck")
    room.game.deck = [];
    await new Sys.Game.Sng.Texas.Entities.Deck().fillDeck(room.game.deck);
    room.NewRound();
  };


  async NewRound() {
     console.log("New Round")
     var room = this;
     for (var i in room.players) {
       if (room.players[i].status == 'Waiting') {
         room.players[i].status = 'Playing'
       }
     }
     room.gameWinners = [];
     //room.gameLosers = [];

     //Deal 2 cards to each player
     for (let i = 0; i < room.players.length; i += 1) {
       if(room.players[i].status != 'Ideal' && room.players[i].status != 'Left'){
        room.players[i].cards.push(room.game.deck.pop());
        room.players[i].cards.push(room.game.deck.pop());
       }
     }



     let  playersLength =  await room.roomPlayerLength(room);

    // get currentPlayer
     room.currentPlayer = room.dealerIndex + 3;
     if (room.currentPlayer >= playersLength) {
       room.currentPlayer -= playersLength;
     }
     if (room.currentPlayer >= playersLength) {
       room.currentPlayer -= playersLength;
     }
     //Force Blind Bets

     console.log("--------------------After SB and BB assign----------------------------------");
     console.log("---Dealer :::", room.players[room.dealerIndex].playerName);
     console.log("--- SB    :::", room.players[room.smallBlindIndex].playerName);
     console.log("--- BB    :::", room.players[room.bigBlindIndex].playerName);
     console.log("-- current player", room.currentPlayer)
     console.log("----------------------------------------------------------------------");

 
     console.log("Room Running");
     room.status = 'Running';
     // depriciated
     console.log("Bets ========================================================");
     console.log(room.game.bets);

     let newRoundStarted = Sys.Game.Sng.Texas.Controllers.RoomProcess.newRoundStarted(room);


  }


  /** Start : Current  Player  Turn Button Action  */

  getCurrentTurnButtonAction() {

    console.log("Room Called");

    let maxBet = parseFloat(this.getMaxBet(this.game.bets));
    let yourBet = parseFloat(this.game.bets[this.currentPlayer]);
    let playerChips;
    let raisedAmount = (this.turnBet.raisedAmount == undefined) ? 0 : this.turnBet.raisedAmount;
    let oldBet = parseFloat(this.game.bets[this.currentPlayer]);

    if(this.limit == 'pot_limit')
    {
      let previousPlayerAction = this.getPreviousPlayerAction();
      console.log("PREVIOUS",previousPlayerAction.action)
      if(this.game.roundName == 'Preflop' && previousPlayerAction.action == '-')
      {
        playerChips = parseFloat(((3 * this.game.bigBlind)+this.smallBlind)-oldBet);
        console.log("PLAYER CHIPS 111",playerChips,raisedAmount)
        
      }else if (this.game.roundName == 'Preflop'){
        playerChips = parseFloat(((2 * maxBet)+this.game.bets.reduce((a, b) => a + b))-oldBet);
        console.log("PLAYER CHIPS 222",playerChips,raisedAmount)
       
      }else{
        playerChips = parseFloat(((2 * maxBet)+this.game.bets.reduce((a, b) => a + b)+this.game.pot)-oldBet);
        console.log("PLAYER CHIPS 333",playerChips)
      }
      if(playerChips >parseFloat(this.players[this.currentPlayer].chips))
      {
        playerChips = parseFloat(this.players[this.currentPlayer].chips);
      }
    }else{
      playerChips = parseFloat(this.players[this.currentPlayer].chips);
      
    }

    // myraiseAmount update @chetan
    //let minRaisedAmount = parseFloat(parseFloat(maxBet + raisedAmount) - yourBet);
    console.log("maxBetOnRaise in room", parseFloat( this.game.maxBetOnRaise) );
    let minRaisedAmount = parseFloat(parseFloat( parseFloat(this.game.maxBetOnRaise) + raisedAmount) - yourBet);
    if((this.limit == 'limit') && (this.game.roundName == 'Turn' || this.game.roundName == 'River' )){
      let previousPlayerAction = this.getPreviousPlayerAction();
      if(previousPlayerAction.action == 8){
        this.allInInLimit = true;
        if(previousPlayerAction.betAmount <= parseFloat(this.bigBlind * 2)){
          minRaisedAmount = parseFloat(this.bigBlind * 2);
        }
      }
      if(this.allInInLimit == true && previousPlayerAction.action == 3 && parseFloat(this.game.maxBetOnRaise) != raisedAmount && parseFloat(this.game.maxBetOnRaise) <= parseFloat(this.bigBlind * 2)){
        minRaisedAmount = parseFloat(this.game.maxBetOnRaise) + parseFloat(this.bigBlind * 2);
        this.allInInLimit = false;
      }
    }
    let isUnqualifiedRaise = this.game.isUnqualifiedRaise;

    if(raisedAmount == 0){ // Under The Gun Player Turn.
       minRaisedAmount = parseFloat(this.bigBlind * 2) - parseFloat(yourBet);
    }
    let playerRoundRaised = parseFloat(this.players[this.currentPlayer].roundRaisedAmount);

    console.log("/------------------------------------------------------------------------------------------/")
    console.log("player Name        : ",this.players[this.currentPlayer].playerName);
    console.log("Max Bet            : ",maxBet);
    console.log("Your Bet           : ",yourBet);
    console.log("Player Chips       : ",playerChips);
    console.log("RaisedAmount       : ",raisedAmount);
    console.log("Call Value         : ",parseFloat(maxBet - yourBet));
    console.log("Min Raised Amount  : ",minRaisedAmount);
    console.log("isUnqualified  : ",isUnqualifiedRaise);
    console.log("playerRoundRaised  : ",playerRoundRaised);
    console.log("/------------------------------------------------------------------------------------------/")

    // Check For All In
    if(playerChips <= parseFloat(maxBet - yourBet)){
      console.log("ALL In.......");
      if( ( playerRoundRaised > 0 && playerRoundRaised >=  minRaisedAmount && isUnqualifiedRaise == true ) || ( this.game.stopReraise == true ) ){
        console.log("**************reraise or allin is not allowed through allin******", playerRoundRaised, maxBet,yourBet, parseFloat(maxBet - yourBet)  )
        this.game.stopReraise = true;
        console.log("stopreraise or allin inn",this.game.stopReraise )
        return {
          allIn : false,
          allInAmount : 0,
          check : false,
          call : true,
          callAmount : parseFloat(maxBet - yourBet),
          raise : false,
          bet : false,
          betAmount : 0.00,
          minRaise : 0.0,
          maxRaise : 0.0
        }
      }
      return {
        allIn : true,
        allInAmount : parseFloat(playerChips),
        check : false,
        call : false,
        callAmount : 0.0,
        raise : false,
        bet : false,
        betAmount : 0.00,
        minRaise : 0.0,
        maxRaise : 0.0
      }
    }

    // Check for Call
    if(yourBet < maxBet){
      console.log("Call .......");
      if( parseFloat(maxBet - yourBet) < parseFloat(playerChips) && minRaisedAmount < parseFloat(playerChips) ){
        minRaisedAmount = (minRaisedAmount < parseFloat(playerChips)) ? minRaisedAmount : parseFloat(playerChips);

        console.log("stopreraise",this.game.stopReraise )
        if( ( playerRoundRaised > 0 && playerRoundRaised >=  minRaisedAmount && isUnqualifiedRaise == true ) || ( this.game.stopReraise == true ) ){
          console.log("**************reraise is not allowed******", playerRoundRaised, maxBet,yourBet, parseFloat(maxBet - yourBet)  )
          this.game.stopReraise = true;
          console.log("stopreraise inn",this.game.stopReraise )
          return {
            allIn : false,
            allInAmount : 0,
            check : false,
            call : true,
            callAmount : parseFloat(maxBet - yourBet),
            raise : false,
            bet : false,
            betAmount : 0.00,
            minRaise : 0.0,
            maxRaise : 0.0
          }
        }
        console.log("in call raise fnction")
        if( this.limit == 'pot_limit'){
          if(minRaisedAmount > this.players[this.currentPlayer].chips ){
            return {
              allIn : true,
              allInAmount : parseFloat(playerChips),
              check : false,
              call : false,
              callAmount : 0.0,
              raise : false,
              bet : false,
              betAmount : 0.00,
              minRaise : 0.0,
              maxRaise : 0.0
            }
          }else{
            return {
              allIn : false,
              allInAmount : 0,
              check : false,
              call : true,
              callAmount : parseFloat(maxBet - yourBet),
              raise : true,
              bet : false,
              betAmount : 0.00,
              minRaise : parseFloat(minRaisedAmount),
              maxRaise : parseFloat(playerChips)
            }
          }
        }else if(this.limit == 'limit'){
          if(minRaisedAmount > this.players[this.currentPlayer].chips ){
            return {
              allIn : true,
              allInAmount : parseFloat(playerChips),
              check : false,
              call : false,
              callAmount : 0.0,
              raise : false,
              bet : false,
              betAmount : 0.00,
              minRaise : 0.0,
              maxRaise : 0.0
            }
          }else{
            if(this.betCounter == 4){
              return {
                allIn : false,
                allInAmount : 0,
                check : false,
                call : true,
                callAmount : parseFloat(maxBet - yourBet),
                raise : false,
                bet : false,
                betAmount: 0.00,
                minRaise : 0.00,
                maxRaise : 0.00
              }
            }else{
              return {
                allIn : false,
                allInAmount : 0,
                check : false,
                call : true,
                callAmount : parseFloat(maxBet - yourBet),
                raise : true,
                bet : false,
                betAmount: 0.00,
                minRaise : parseFloat(minRaisedAmount),
                maxRaise : parseFloat(playerChips)
              }
            }
          }
        }else{
          return {
            allIn : false,
            allInAmount : 0,
            check : false,
            call : true,
            callAmount : parseFloat(maxBet - yourBet),
            raise : true,
            bet : false,
            betAmount : 0.00,
            minRaise : parseFloat(minRaisedAmount),
            maxRaise : parseFloat(playerChips)
          }
        }

      }else{

        if( ( playerRoundRaised > 0 && playerRoundRaised >=  minRaisedAmount && isUnqualifiedRaise == true ) || ( this.game.stopReraise == true ) ){
          console.log("**************reraise is not allowed through call in else function******", playerRoundRaised, maxBet,yourBet, parseFloat(maxBet - yourBet)  )
          this.game.stopReraise = true;
          console.log("stopreraise inn else ",this.game.stopReraise )
          return {
            allIn : false,
            allInAmount : 0,
            check : false,
            call : true,
            callAmount : parseFloat(maxBet - yourBet),
            raise : false,
            bet : false,
            betAmount : 0.00,
            minRaise : 0.0,
            maxRaise : 0.0
          }
        }

        return {
          allIn : true,
          allInAmount : parseFloat(playerChips),
          check : false,
          call : true,
          callAmount : parseFloat(maxBet - yourBet),
          raise : false,
          bet : false,
          betAmount : 0.00,
          minRaise : 0.0,
          maxRaise : 0.0
        }

      }
    }

    // Check for Check

    if(yourBet == maxBet){
      console.log("Check .......");
      let room = this;
      console.log("room.game.bets: ", room.game.bets);

      if(room.game.bets.length > 0){
        var totalBetAmt = 0.00
        for(var i=0; i<room.game.bets.length; i++){
          totalBetAmt += room.game.bets[i];
        }
        console.log("Check ....... totalBetAmt: ", totalBetAmt);
      }

      minRaisedAmount = (minRaisedAmount < parseFloat(playerChips)) ? minRaisedAmount : parseFloat(playerChips);
      if(this.roundName != "Preflop" && parseInt(totalBetAmt) == 0 ){
        if(room.limit == 'pot_limit'){
          if(minRaisedAmount >= this.players[this.currentPlayer].chips ){
            return {
              allIn : true,
              allInAmount : parseFloat(playerChips),
              check : true,
              call : false,
              callAmount : 0.0,
              raise : false,
              bet : false,
              betAmount : 0.00,
              minRaise : 0.0,
              maxRaise : 0.0
            }
          }else{
            return {
              allIn : false,
              check : true,
              call : false,
              callAmount : 0.0,
              raise : false,
              bet : true,
              betAmount : parseFloat(minRaisedAmount),
              minRaise : parseFloat(minRaisedAmount),
              maxRaise : (parseFloat(room.game.pot) > parseFloat(this.players[this.currentPlayer].chips)) ? parseFloat(this.players[this.currentPlayer].chips) : parseFloat(room.game.pot)
            }
          }
        }else if(room.limit == 'limit'){
          if(minRaisedAmount > this.players[this.currentPlayer].chips ){
            return {
              allIn : true,
              allInAmount : parseFloat(playerChips),
              check : true,
              call : false,
              callAmount : 0.0,
              raise : false,
              bet : false,
              betAmount : 0.00,
              minRaise : 0.0,
              maxRaise : 0.0
            }
          }else{
            if((room.game.roundName == 'Turn' || room.game.roundName == 'River') && (parseFloat(2 * room.bigBlind) > this.players[this.currentPlayer].chips)){
              return {
                allIn : true,
                allInAmount : parseFloat(playerChips),
                check : true,
                call : false,
                callAmount : 0.0,
                raise : false,
                bet : false,
                betAmount : 0.00,
                minRaise : 0.0,
                maxRaise : 0.0
              }
            }else{
              return {
                allIn : false,
                check : true,
                call : false,
                callAmount : 0.0,
                raise : false,
                bet : true,
                betAmount: (room.game.roundName == 'Turn' || room.game.roundName == 'River') ? parseFloat(2 * room.game.bigBlind) : room.game.bigBlind,
                minRaise : (room.game.roundName == 'Turn' || room.game.roundName == 'River') ? parseFloat(2 * room.game.bigBlind) : room.game.bigBlind,
                maxRaise : (room.game.roundName == 'Turn' || room.game.roundName == 'River') ? parseFloat(2 * room.game.bigBlind) : room.game.bigBlind
              }
            }
          }
        }else{
          return {
            allIn : false,
            check : true,
            call : false,
            callAmount : 0.0,
            raise : false,
            bet : true,
            betAmount : parseFloat(minRaisedAmount),
            minRaise : parseFloat(minRaisedAmount),
            maxRaise : parseFloat(playerChips)
          }
        }
      }else{
        if(minRaisedAmount >= this.players[this.currentPlayer].chips && (room.limit == 'limit' || room.limit == 'pot_limit')){
          return {
            allIn : true,
            allInAmount : parseFloat(playerChips),
            check : true,
            call : false,
            callAmount : 0.0,
            raise : false,
            bet : false,
            betAmount : 0.00,
            minRaise : 0.0,
            maxRaise : 0.0
          }
        }else{
          return {
            allIn : false,
            check : true,
            call : false,
            callAmount : 0.0,
            raise : true,
            bet : false,
            betAmount : 0.00,
            minRaise : parseFloat(minRaisedAmount),
            maxRaise : parseFloat(playerChips)
          }
        }
       
      }
    }

  }
  
  getDefaultButtons() {
    let buttonArray = [];
      for (let i = 0; i < this.players.length; i += 1) {
        if(this.players[this.currentPlayer].id != this.players[i].id){
          buttonArray.push({
            playerId : this.players[i].id,
            sitOutNextHand :  this.players[i].sitOutNextHand,
            sitOutNextBigBlind :  this.players[i].sitOutNextBigBlind,
            isFold :  this.players[i].isFold,
            isCheck :  this.players[i].isCheck,
            isCall :  this.players[i].isCall,
          })
        }
      }
    return buttonArray;
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


   // Playing Player Lenght
   async roomPlayerLength(room){
    let playersLength = 0;
    for(let i=0; i < room.players.length; i++){
      if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal') {
        playersLength++;
      }
    }
    return playersLength;
   }


   async roomDealerPositionSet(room,idDealerIgnore){

    
    let playersLength = 0;
    for(let i=0; i < room.players.length; i++){
      if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal') {
        playersLength++;
      }
    }




    if(idDealerIgnore == false){
      if(room.dealer == -1){
        console.log("First Time Game Play :");
        room.dealer = room.players[0].seatIndex;
      }
  
      console.log("Old Dealer Seatindex :",room.dealer);
      // Find Next Dealer By Seatindex
      let newDealerFound = false;
   
      for(let i=0; i < room.players.length; i++){
        if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal') {
          if(room.players[i].seatIndex > room.dealer){
            room.dealer = room.players[i].seatIndex;
            newDealerFound = true;
            room.dealerIndex = i;
            break;
          }
        }
      }
  
      if(newDealerFound == false){
        for(let i=0; i < room.players.length; i++){
          if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal') {
            if(room.players[i].seatIndex < room.dealer){
              room.dealer = room.players[i].seatIndex;
              room.dealerIndex = i;
            }
          }
        }
      }
    }else{
      for(let i=0; i < room.players.length; i++){
        if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal') {
          if(room.players[i].seatIndex == room.dealer){
            room.dealerIndex = i;
          }
        }
      }
    }

    console.log("New Dealer Seatindex :",room.dealerIndex);

    //Identify Small and Big Blind player index
    room.smallBlindIndex = room.dealerIndex + 1;
    if (room.smallBlindIndex >= playersLength) {
      room.smallBlindIndex = 0;
    }
    if (room.smallBlindIndex >= playersLength) {
      room.smallBlindIndex -= playersLength;
    }
    room.bigBlindIndex = room.dealerIndex + 2;
    if (room.bigBlindIndex >= playersLength) {
      //room.bigBlindIndex -= playersLength;
      room.bigBlindIndex == room.smallBlindIndex+1;
    }
    if (room.bigBlindIndex >= playersLength) {
      room.bigBlindIndex -= playersLength;
    }


    console.log("--------------------After SB and BB assign----------------------------------");
    console.log("---Dealer :::", room.players[room.dealerIndex].playerName);
    console.log("--- SB    :::", room.players[room.smallBlindIndex].playerName);
//    console.log("--- BB    :::", room.players[room.bigBlindIndex].playerName);
    console.log("-- current player", room.currentPlayer)
    console.log("----------------------------------------------------------------------");


      return room;
  }


}



module.exports = Room



