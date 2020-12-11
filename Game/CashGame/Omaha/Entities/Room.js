var Sys = require('../../../../Boot/Sys');
let moment = require('moment');
class Room {
  constructor(id, tableType, currencyType, name, smallBlind, bigBlind,dealerIndex,smallBlindIndex,bigBlindIndex, minPlayers, maxPlayers, minBuyIn, maxBuyIn, type, gameLimit, status, dealer, players, gameWinners, gameLosers, turnBet, game, currentPlayer, rackPercent, rackAmount, expireTime, owner, tableNumber,timerStart,limit,gameType,isCashGame,otherData,isTournamentTable,tournamentType,tournament, oldPlayers, lastFoldedPlayerIdArray, tempStatus, oldDealerIndex, oldSmallBlindIndex, oldBigBlindIndex,waitingPlayers, turnTime,timeBank, betCounter, allInInLimit) {

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

          room.players.push(new Sys.Game.CashGame.Omaha.Entities.Player().createObject(player));

        });
      }
    this.gameWinners = [];
    if (gameWinners && Array.isArray(gameWinners) ) {
      room.gameWinners = gameWinners
    }
    this.gameLosers = [];
    if (gameLosers) {
      gameLosers.forEach(function (player) {
       room.gameLosers.push(new Sys.Game.CashGame.Omaha.Entities.Player().createObject(player));

      });
    }
    this.turnBet = {};
    if (turnBet) {
      room.turnBet = turnBet;
    }
    // other variables
    this.game = null;

    if (game) {

      this.game = new Sys.Game.CashGame.Omaha.Entities.Game().createObject(game);

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
    this.oldPlayers = [];
    if (oldPlayers && Array.isArray(oldPlayers)) {
      room.oldPlayers = [];
      oldPlayers.forEach(function (player) {

        room.oldPlayers.push(new Sys.Game.CashGame.Omaha.Entities.Player().createObject(player));

      });
    }
    this.lastFoldedPlayerIdArray = [];
    if (lastFoldedPlayerIdArray && Array.isArray(lastFoldedPlayerIdArray) ) {
      room.lastFoldedPlayerIdArray = lastFoldedPlayerIdArray
    }
    //this.previousGameNumber = previousGameNumber;
    //this.previousGameId = previousGameId;
    this.tempStatus = (tempStatus) ? tempStatus : "Waiting";
    this.oldDealerIndex = oldDealerIndex;
    this.oldSmallBlindIndex = oldSmallBlindIndex;
    this.oldBigBlindIndex = oldBigBlindIndex;
    this.waitingPlayers = [];
    if (waitingPlayers && Array.isArray(waitingPlayers)) {
      room.waitingPlayers = [];
      waitingPlayers.forEach(function (player) {

        room.waitingPlayers.push(new Sys.Game.CashGame.Omaha.Entities.Player().createObject(player));

      });
    };
    this.turnTime = turnTime;
    this.timeBank = timeBank;
    this.betCounter = 0;
    this.allInInLimit = false;
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
      room.oldPlayers,
      room.lastFoldedPlayerIdArray,
      //room.previousGameNumber,
      //room.previousGameId,
      room.tempStatus,
      room.oldDealerIndex,
      room.oldSmallBlindIndex,
      room.oldBigBlindIndex,
      room.waitingPlayers,
      room.turnTime,
      room.timeBank,
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
      oldPlayers : [],
      lastFoldedPlayerIdArray: [],
      //previousGameNumber: this.previousGameNumber,
      //previousGameId: this.previousGameId,
      tempStatus: this.tempStatus,
      oldDealerIndex : this.oldDealerIndex,
      oldSmallBlindIndex : this.oldSmallBlindIndex,
      oldBigBlindIndex : this.oldBigBlindIndex,
      waitingPlayers: [],
      turnTime: this.turnTime,
      timeBank : this.timeBank,
      betCounter : this.betCounter,
      allInInLimit : this.allInInLimit
    }
    if (this.players.length > 0) {
      this.players.forEach(function (player) {
        room.players.push(new Sys.Game.CashGame.Omaha.Entities.Player().createObject(player));
      })
    }
    if (this.gameLosers.length > 0) {
      this.gameLosers.forEach(function (player) {
        room.gameLosers.push(new Sys.Game.CashGame.Omaha.Entities.Player().createObject(player));
      });
    }
    if (this.game) {
      room.game = this.game.toJson();
    }
    if (this.oldPlayers.length > 0) {
      this.oldPlayers.forEach(function (player) {
        room.oldPlayers.push(new Sys.Game.CashGame.Omaha.Entities.Player().createObject(player));
      })
    }
    if (this.waitingPlayers.length > 0) {
      this.waitingPlayers.forEach(function (player) {
        room.waitingPlayers.push(new Sys.Game.CashGame.Omaha.Entities.Player().createObject(player));
      })
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

  AddPlayer(id, socketId, playerName, avatar, fb_avatar, chips, seatIndex, autoBuyin, subscribeTime,longitude,latitude,waitForBigBlindCheckbox,waitForBigBlindCheckboxValue,uniqId,sessionId, timeBank, timeBankDate) {

    let room = this;
    console.log("AddPlayer room: ", room);
    console.log("AddPlayer chips: ", chips);
    console.log("AddPlayer room.minBuyIn: ", room.minBuyIn);
    if (chips >= room.minBuyIn) {
      let player = new Sys.Game.CashGame.Omaha.Entities.Player(id, socketId,seatIndex, playerName, avatar, fb_avatar, "Waiting", chips,0,chips,false,false,false,[],autoBuyin,0,false,false,false,false,false,null,null, subscribeTime, false, false,false, 0,false, false, false, false, longitude,latitude,0,waitForBigBlindCheckbox,waitForBigBlindCheckboxValue,false, uniqId,sessionId,false, timeBank, false, timeBankDate);
     // console.log("Player -> :",player)
      this.players.push(player);
    }
    return room; // Return Room
  }

  waitingAddPlayer(id, socketId, playerName, avatar, fb_avatar, chips, seatIndex, autoBuyin, subscribeTime,longitude,latitude,waitForBigBlindCheckbox,waitForBigBlindCheckboxValue,uniqId,sessionId, timeBank, timeBankDate) {

    let room = this;
    console.log("AddPlayer room.minBuyIn: ", room.minBuyIn);
    if (chips >= room.minBuyIn) {
      let waitingPlayer = new Sys.Game.CashGame.Omaha.Entities.Player(id, socketId,seatIndex, playerName, avatar, fb_avatar, "Waiting", chips,0,chips,false,false,false,[],autoBuyin,0,false,false,false,false,false,null,null, subscribeTime, false, false,false, 0,false, false, false, false, longitude,latitude,0,waitForBigBlindCheckbox,waitForBigBlindCheckboxValue,false,uniqId,sessionId,false, timeBank, false, timeBankDate);
      console.log("Waiting Player -> :",waitingPlayer)
      this.waitingPlayers.push(waitingPlayer);

      this.waitingPlayers.sort(function (a, b) {
        return a.seatIndex - b.seatIndex;
      });

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
      let m_start_date = moment(new Date(Sys.Setting.maintenance.maintenance_start_date)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format("YYYY-MM-DD HH:mm");
			let m_end_date = moment(new Date(Sys.Setting.maintenance.maintenance_end_date)).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format("YYYY-MM-DD HH:mm");
			let current_date = moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format("YYYY-MM-DD HH:mm");
			console.log("m_start_date: ", m_start_date);
			console.log("m_end_date: ", m_end_date);
			console.log("current_date: ", current_date);

			if ( (current_date >= m_start_date && current_date <= m_end_date && Sys.Setting.maintenance.status == 'active') || Sys.Setting.maintenance.quickMaintenance == "active" ) {
				room.tempStatus = "Waiting";
				Sys.Game.Common.Controllers.RoomController.playerRemoveBySystem(room);
			}else{

      console.log("/$$$$$$$$$$$$$$$$$$NEW GAME START$$$$$$$$$$$$$$$$$$$$$$$$/")
      console.log("||  ROOM ")
      console.log("/$$$$$$$$$$$$$$$$$$NEW GAME START$$$$$$$$$$$$$$$$$$$$$$$$/")

     let room = this
     let playingCounter = 0;
     let playingKey = 0;
     room.otherData.isPreventMultipleTurn = false;
     for(let w = room.waitingPlayers.length -1 ; w >= 0 ;w--){
      if(room.waitingPlayers[w].waitForBigBlindCheckbox == true && room.waitingPlayers[w].waitForBigBlindCheckboxValue == false){
         room.players.push(room.waitingPlayers[w]);
         room.waitingPlayers.splice(w,1); 
      }
    }
    for(let p = room.players.length -1; p >= 0; p--){
      if(room.players[p].status == 'Waiting' && room.players[p].waitForBigBlindCheckbox == true && room.players[p].waitForBigBlindCheckboxValue == true){
        room.waitingPlayers.push(room.players[p]);
        room.players.splice(p,1);
      }
    }

    await this.sbBb(room);
     for (let p in room.players) {
       if (room.players[p].status == 'Waiting') {
         room.players[p].status = 'Playing';
       }
       room.players[p].considerLeftedPlayer = false;
     }
     console.log("room players while starting game", room.players)
     console.log("/************** Removed Left Player ***********************/")
     /*for (let i = room.players.length-1; i >= 0; i--) {
        if (room.players[i].status == 'Left') {
            console.log("Removed Name  : ",room.players[i].playerName)
            room.players.splice(i,1);
        }
     }*/


     for (let i = room.players.length-1; i >= 0; i--) {
      let date = new Date()
      let timestamp1 = date.getTime();
      let sessionId= room.players[i].uniqId + "-" + room.tableNumber+"-" +timestamp1
        if (room.players[i].status == 'Left') {
          console.log("Removed Name  : ",room.players[i].playerName,room.players[i].id)
          let removedPlayerID = room.players[i].id;
          room.players[i].sitOutNextHand = false;
          room.players[i].sitOutNextBigBlind = false;
          room.players[i].defaultActionCount = 0;
          room.players[i].oldPlayerLeftTime = new Date();
          room.players[i].considerLeftedPlayer = false;

          //let dataPlayer = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(room.players[i].id);
          console.log("room.players[i].isAllinPlayersChipsAssigned in game finish", room.players[i].isAllinPlayersChipsAssigned)
          if (removedPlayerID == room.players[i].id && room.players[i].isAllinPlayersChipsAssigned == false && room.players[i].status == 'Left'){
            await Sys.Game.CashGame.Texas.Controllers.PlayerController.assignCashToPlayers(room, removedPlayerID, false);
            console.log("assignCashToPlayers called and now remove player from startGame");
          }
          /*if (dataPlayer && room.players[i].isAllinPlayersChipsAssigned == false) {
              console.log("Chips",dataPlayer.chips,room.players[i].extraChips,room.players[i].chips);
              
              let chips = 0;
              if(room.players[i].extraChips > 0) {console.log("extra chips of lefted player in startGame", room.players[i].id, room.players[i].extraChips);
                chips = parseFloat(dataPlayer.chips) + parseFloat(room.players[i].chips) + parseFloat(room.players[i].extraChips);
                let traNumber = + new Date()
                await Sys.Game.CashGame.Omaha.Services.ChipsServices.insertData({
                  sessionId:room.players[i].sessionId,
                  transactionNumber: 'DEP-' + traNumber,
                  uniqId:room.players[i].uniqId,
                  username:room.players[i].username,
                  user_id:room.players[i].id,
                  chips: parseFloat(room.players[i].chips),
                  previousBalance:parseFloat(dataPlayer.chips) + parseFloat(room.players[i].extraChips),
                  afterBalance: parseFloat(dataPlayer.chips) + parseFloat(room.players[i].extraChips) + parseFloat(room.players[i].chips),
                  type:"leftChips",
                  remark:"game left",
                  category:"credit"
                });
                room.players[i].sessionId=sessionId;

                let playerUpdate = await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(room.players[i].id, { chips: chips, extraChips: 0 });
                traNumber = + new Date()
                await Sys.Game.CashGame.Omaha.Services.ChipsServices.insertData({
                  sessionId: sessionId,
                  uniqId:room.players[i].uniqId,
                  username:room.players[i].username,
                  chips: parseFloat(parseFloat(room.players[i].chips) + parseFloat(room.players[i].extraChips)),
                  previousBalance:parseFloat(dataPlayer.chips) + parseFloat(room.players[i].extraChips) + parseFloat(room.players[i].chips),
                  afterBalance: parseFloat(dataPlayer.chips) - parseFloat(room.players[i].chips) + parseFloat(room.players[i].extraChips),
                  type:"addChips",
                  user_id:room.players[i].id,
                  transactionNumber: 'DE-' + traNumber,
                  remark:"re Buy-in add chips",
                  category:"debit"
                });
                 traNumber = + new Date()
                await Sys.Game.CashGame.Omaha.Services.ChipsServices.insertData({
                  sessionId:room.players[i].sessionId,
                  uniqId:room.players[i].uniqId,
                  username:room.players[i].username,
                  user_id:room.players[i].id,
                  chips:   parseFloat(room.players[i].extraChips) + parseFloat(room.players[i].chips),
                  previousBalance:dataPlayer.chips,
                  afterBalance: parseFloat(chips),
                  type:"leftChips",
                  remark:"game left",
                  transactionNumber: 'DEP-' + traNumber,
                  category:"credit"
                });
                room.players[i].extraChips = 0;
              }else{
                let traNumber = + new Date()
                chips = parseFloat(dataPlayer.chips) + parseFloat(room.players[i].chips);
                let playerUpdate = await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(room.players[i].id, { chips: chips });
                await Sys.Game.CashGame.Omaha.Services.ChipsServices.insertData({
                  sessionId:room.players[i].sessionId,
                  uniqId:room.players[i].uniqId,
                  username:room.players[i].username,
                  user_id:room.players[i].id,
                  chips:  parseFloat(room.players[i].chips),
                  previousBalance:dataPlayer.chips,
                  afterBalance: parseFloat(chips),
                  type:"leftChips",
                  remark:"game left",
                  transactionNumber: 'DEP-' + traNumber,
                  category:"credit"
                });
              }

              
              room.players[i].isAllinPlayersChipsAssigned = true;
          }*/
          if (removedPlayerID == room.players[i].id && room.players[i].status == 'Left' && room.players[i].isAllinPlayersChipsAssigned == true) {
            if(room.oldPlayers){
              console.log("in firstttttt")
              const index = room.oldPlayers.findIndex((e) => e.id === room.players[i].id);
              if (index === -1) {
                  room.oldPlayers.push(room.players[i].toJson());
              } else {
                  room.oldPlayers[index] = room.players[i].toJson();
              }
            }else{
              console.log("in secondddd", room.players[i])
              room.oldPlayers.push(room.players[i].toJson());
            }
            room.players.splice(i,1);
          }
         

        }
      
       
     }

     for (let j = room.waitingPlayers.length-1; j >= 0; j--) {
      if (room.waitingPlayers[j].status == 'Left') {
          console.log("Removed Name  : ",room.waitingPlayers[j].playerName,room.waitingPlayers[j].id)

          room.waitingPlayers[j].sitOutNextHand = false;
          room.waitingPlayers[j].sitOutNextBigBlind = false;
          room.waitingPlayers[j].defaultActionCount = 0;
          room.waitingPlayers[j].oldPlayerLeftTime = new Date();
          room.waitingPlayers[j].considerLeftedPlayer = false;
          room.waitingPlayers[j].waitForBigBlindCheckbox = false;
          room.waitingPlayers[j].waitForBigBlindCheckboxValue = false;

          let dataPlayer = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(room.waitingPlayers[j].id);
          console.log("room.waitingPlayers[j].isAllinPlayersChipsAssigned in game finish", room.waitingPlayers[j].isAllinPlayersChipsAssigned)
          if (dataPlayer && room.waitingPlayers[j].isAllinPlayersChipsAssigned == false) {
              console.log("Chips",dataPlayer.chips,room.waitingPlayers[j].chips);
              
              let chips = 0;
              if(room.waitingPlayers[j].extraChips > 0) {console.log("extra chips of lefted player in startGame", room.waitingPlayers[j].id, room.waitingPlayers[j].extraChips);
                chips = parseFloat(dataPlayer.chips) + parseFloat(room.waitingPlayers[j].chips) + parseFloat(room.waitingPlayers[j].extraChips);
                let playerUpdate = await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(room.waitingPlayers[j].id, { chips: chips, extraChips: 0 });
                room.waitingPlayers[j].extraChips = 0;
              }else{
                chips = parseFloat(dataPlayer.chips) + parseFloat(room.waitingPlayers[j].chips);
                let playerUpdate = await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(room.waitingPlayers[j].id, { chips: chips });
              }

              // added by K@Y
              /*let transactionData = {
                user_id						:	room.waitingPlayers[j].id,
                username					: room.waitingPlayers[j].playerName,
                // gameId						:
                chips							:	data.chips,
                previousBalance		:	parseFloat(updatedPlayerChips.chips),
                // afterBalance
                category					:	'credit',
                type							:	'remove',
                remark						: 'Removing Lefted Player while starting Game'
              }*/
              //await Sys.Game.CashGame.Omaha.Services.ChipsServices.createTransaction(transactionData);
              room.waitingPlayers[j].isAllinPlayersChipsAssigned = true;
            }
          if(room.oldPlayers){
            console.log("in firstttttt")
            const index = room.oldPlayers.findIndex((e) => e.id === room.waitingPlayers[j].id);
            if (index === -1) {
                room.oldPlayers.push(room.waitingPlayers[j].toJson());
            } else {
                room.oldPlayers[index] = room.waitingPlayers[j].toJson();
            }
          }else{
            console.log("in secondddd", room.waitingPlayers[j])
            room.oldPlayers.push(room.waitingPlayers[j].toJson());
          }

          room.waitingPlayers.splice(j,1);

      }
   }
     console.log("/**************************************************/")



      let remainPlayerArray = [];
      for (let i = 0; i < room.players.length; i += 1) {
        if(room.players[i].status != 'Ideal' && room.players[i].status != 'Left' && room.players[i].status != 'Waiting'){
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

      room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);

     let playersLength =  await room.roomPlayerLength(room);
     console.log("Playing Player Length : ", playersLength);

     if(playersLength == 1 && room.waitingPlayers.length > 0){
        for(let j = 0; j < room.waitingPlayers.length; j++){
          room.waitingPlayers[j].status = 'Playing';
          room.players.splice(room.players.findIndex(x => x.status == 'Ideal'),0,room.waitingPlayers[j])
        }
        room.waitingPlayers = [];
     }
     playersLength =  await room.roomPlayerLength(room);

     for (let i = 0; i < room.players.length; i++) {
      let date = new Date()
      let timestamp1 = date.getTime();
      let sessionId= room.players[i].uniqId + "-" + room.tableNumber+"-" +timestamp1;
       if (room.players[i].status != 'Left' && room.players[i].extraChips != 0) {
        let dataPlayer = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(room.players[i].id); 
        let traNumber = + new Date()

        await Sys.Game.CashGame.Omaha.Services.ChipsServices.insertData({
          sessionId:room.players[i].sessionId,
          uniqId:room.players[i].uniqId,
          username:room.players[i].playerName,
          user_id:room.players[i].id,
          chips: parseFloat(room.players[i].chips),
          previousBalance:parseFloat(dataPlayer.chips) + parseFloat(room.players[i].extraChips),
          afterBalance: parseFloat(dataPlayer.chips)  + parseFloat(room.players[i].chips) + parseFloat(room.players[i].extraChips) ,
          type:"leftChips",
          remark:"game left",
          transactionNumber: 'DEP-' + traNumber,
          category:"credit"
        });
            room.players[i].chips = parseFloat(room.players[i].chips) + parseFloat(room.players[i].extraChips); // Add Rebuyin Chips to Orignal Account.
            room.players[i].sessionId=sessionId;
            traNumber = + new Date()
            await Sys.Game.CashGame.Omaha.Services.ChipsServices.insertData({
              sessionId: room.players[i].sessionId,
              uniqId:room.players[i].uniqId,
              username:room.players[i].playerName,
              chips: room.players[i].chips,
              user_id:room.players[i].id,
              previousBalance:parseFloat(dataPlayer.chips)  + parseFloat(room.players[i].chips),
              afterBalance: parseFloat(dataPlayer.chips)  + parseFloat(room.players[i].chips) - parseFloat(room.players[i].chips),
              type:"addChips",
              transactionNumber: 'DE-' + traNumber,
              remark:"re Buy-in add chips",
              category:"debit"
            });
            console.log("/************** EXTRA CHIPS ***********************/")
            console.log("| Name  : ",room.players[i].playerName)
            console.log("| Extra Chips : ",room.players[i].extraChips)
            console.log("| Chips : ",room.players[i].chips)
            console.log("/**************************************************/")
            room.players[i].entryChips = parseFloat(room.players[i].entryChips) + parseFloat(room.players[i].extraChips);
            room.players[i].extraChips = 0;
            if (room.players[i].status != 'Ideal' && room.players[i].status != 'Waiting') { // ???
              room.players[i].status = 'Playing';
              room.players[i].idealPlayer = false;
            }
       }

     }

     // Select Dealer/SB/BB
     if(playersLength >= room.minPlayers){
      room = await room.roomDealerPositionSet(room,false);
    }else{
      clearTimeout(Sys.Timers[room.id]);
      clearInterval(Sys.Timers[room.id]);
      console.log("removed error",room.game, playersLength)
      room.status = 'Finished';
      room.game = null;
      //room.status = false;
      console.log("Minimum player not found while calculating dealer position");
      room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
      return false;
    }


     console.log("--------------------Bib Blind Remove----------------------------------");
     console.log("---", room.players[room.bigBlindIndex].playerName);
     console.log("----------------------------------------------------------------------");


      console.log("--------------------Smalll Bliende----------------------------------");
      console.log("---", room.players[room.smallBlindIndex].playerName);
      console.log("----------------------------------------------------------------------");



     if(room.players[room.bigBlindIndex].sitOutNextBigBlind == true){

      console.log("--------------------IN Big Blind Remove----------------------------------");
      console.log("---", room.players[room.bigBlindIndex].playerName);
      console.log("----------------------------------------------------------------------");

      room.gameLosers.push(room.players[room.bigBlindIndex]);

      room.players[room.bigBlindIndex].status = 'Ideal';
       //await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('PlayerLeft', { 'playerId':  room.players[room.bigBlindIndex].id, roomId: room.id });
      await Sys.Io.of(Sys.Config.Namespace.CashOmaha).to(room.id).emit('onIdealPlayer', { 'playerId': room.players[room.bigBlindIndex].id,status : true, roomId: room.id });
      // Big Blind Remove So Find New Big Blind Player.
      room.players[room.bigBlindIndex].idealTime = (room.players[room.bigBlindIndex].idealTime == null) ? new Date().getTime() : room.players[room.bigBlindIndex].idealTime;
      room.players[room.bigBlindIndex].defaultActionCount = 3;
       let remainPlayerArray = [];
       for (let i = 0; i < room.players.length; i += 1) {
         if(room.players[i].status != 'Ideal' && room.players[i].status != 'Waiting'){
           remainPlayerArray.push(room.players[i]);
         }
       }

       if(remainPlayerArray.length == 1 && room.waitingPlayers.length > 0){
        for(let i = 0; i < room.waitingPlayers.length; i++){
          room.waitingPlayers[i].status = 'Playing';
          remainPlayerArray.push(room.waitingPlayers[i]);
        }
        room.waitingPlayers = [];
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
   // console.log("---", room.players[room.bigBlindIndex].playerName);
    console.log("----------------------------------------------------------------------");


     console.log("--------------------Smalll Bliende----------------------------------");
     console.log("---", room.players[room.smallBlindIndex].playerName);
     console.log("----------------------------------------------------------------------");






    for (let i = 0; i < room.players.length; i++) {
       if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal' ) {
           playingCounter++; // Count How Many Player Playing Game.
           playingKey = i;
          if(room.players[i].waitForBigBlindCheckbox == true && room.players[i].waitForBigBlindCheckboxValue == true){
            room.players[i].waitForBigBlindCheckbox = false;
            room.players[i].waitForBigBlindCheckboxValue = false;
            room.players[i].skipDealer = false;
          }
       }
     }
     if(playingCounter == 1){ // if Only One Player in Table
         room.players[playingKey].status = 'Waiting'; // When Player is One Then Change Player Status
     }


     playersLength =  await room.roomPlayerLength(room);
     //rake Cap;
     room.otherData.playingPlayer = playersLength;
     // Remove Player Which Have Status Left


     room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);

     let rack = await Sys.App.Services.SettingsServices.getSettingsData({}); //get Application rack
    //if (room.game == null && playersLength >= this.minPlayers) {
    if ( playersLength >= this.minPlayers) {
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
         otherData : room.otherData,
         rakePercenage:parseFloat(rack.rakePercenage),
         adminExtraRakePercentage:  parseFloat(rack.adminExtraRakePercentage)

       };

      let game = await Sys.Game.CashGame.Omaha.Services.GameServices.create(gameobj);
       // console.log("Game :>",game);
      if(game){

        // Send Brodcast For New Updated Chips
        room = await Sys.Game.CashGame.Omaha.Controllers.RoomProcess.broadcastPlayerInfo(room);

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


        for (let rp = 0; rp < room.players.length; rp++) {

          console.log("room.players[rp].status: ", room.players[rp]);

          if (room.players[rp].status == 'Playing'){
            let transactionData = {
              user_id           : room.players[rp].id,
              username          : room.players[rp].playerName,
              gameId            : room.game.id,
              gameNumber        : room.game.gameNumber,
              //chips             : room.players[rp].chips,
              afterBalance      : room.players[rp].chips,
              category          : 'debit',
              type              : 'newhand',
              remark            : 'Game Starting Chips'
            }

            console.log("transactionData: ", transactionData);

            //await Sys.Game.CashGame.Omaha.Services.ChipsServices.createTransaction(transactionData);
          }
        }

      console.log("--------------------Bib Blind Remove----------------------------------");
      console.log("---Dealer :::", room.players[room.dealerIndex].playerName, room.game.gameNumber);
      console.log("--- SB    :::", room.players[room.smallBlindIndex].playerName, room.game.gameNumber);
      console.log("--- BB    :::", room.players[room.bigBlindIndex].playerName, room.game.gameNumber);
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


        let sbChips = 0;
        let bbChips = 0;
        if(room.players[room.smallBlindIndex].status == "Playing"){
          if(room.players[room.smallBlindIndex].waitForBigBlindCheckbox == true  && room.players[room.smallBlindIndex].waitForBigBlindCheckboxValue == false){
            console.log("ITS HERE 1",room.players[room.smallBlindIndex])
             if (room.players[room.smallBlindIndex].chips <= room.bigBlind) {
               bbChips = room.players[room.smallBlindIndex].chips;
               var previousBalance = room.players[room.smallBlindIndex].chips;
               room.players[room.smallBlindIndex].allIn = true;
               room.players[room.smallBlindIndex].talked = true;
               room.game.bets[room.smallBlindIndex] = parseFloat(room.players[room.smallBlindIndex].chips);
               room.game.history.push({
                 time: new Date(),
                 playerId: room.players[room.smallBlindIndex].id,
                 playerName: room.players[room.smallBlindIndex].playerName,
                 gameRound: room.game.roundName,
                 totalPot:0,
                 "boardCard":room.game.board.length ? room.game.board:"",
                 betAmount: parseFloat( parseFloat( room.players[room.smallBlindIndex].chips).toFixed(4) ),
                 totalBetAmount: parseFloat( parseFloat(room.bigBlind).toFixed(4) ),
                 playerAction: Sys.Config.Texas.AllIn,
                 remaining: 0
               })
               room.game.gameTotalChips= parseFloat(parseFloat(room.game.gameTotalChips) + parseFloat(room.players[room.smallBlindIndex].chips));
               room.players[room.smallBlindIndex].chips = 0
             } else {
               bbChips = room.bigBlind;
               var previousBalance = room.players[room.smallBlindIndex].chips;
               room.players[room.smallBlindIndex].chips -= room.bigBlind;
               room.game.gameTotalChips= parseFloat(parseFloat(room.game.gameTotalChips) + parseFloat(bbChips));
               room.game.bets[room.smallBlindIndex] = parseFloat(room.bigBlind);
               room.game.history.push({
                 time: new Date(),
                 playerId: room.players[room.smallBlindIndex].id,
                 playerName: room.players[room.smallBlindIndex].playerName,
                 gameRound: room.game.roundName,
                 totalPot:0,
                 "boardCard":room.game.board.length ? room.game.board:"",
                 betAmount: parseFloat( parseFloat( room.bigBlind).toFixed(4) ),
                 totalBetAmount: parseFloat( parseFloat(room.bigBlind).toFixed(4) ),
                 playerAction: Sys.Config.Texas.BigBlind,
                 remaining: parseFloat( parseFloat( room.players[room.smallBlindIndex].chips ).toFixed(4) )
               })
             }
          }else{
             console.log("ITS HERE 2",room.players[room.smallBlindIndex])
             if (room.players[room.smallBlindIndex].chips <= room.smallBlind) {
                 sbChips = room.players[room.smallBlindIndex].chips;
                 var previousBalance = room.players[room.smallBlindIndex].chips;
                 room.players[room.smallBlindIndex].allIn = true;
                 room.players[room.smallBlindIndex].talked = true;
                 room.game.bets[room.smallBlindIndex] = parseFloat(room.players[room.smallBlindIndex].chips);
                 room.game.history.push({
                   time: new Date(),
                   playerId: room.players[room.smallBlindIndex].id,
                   playerName: room.players[room.smallBlindIndex].playerName,
                   gameRound: room.game.roundName,
                   totalPot:0,
                   betAmount: parseFloat( parseFloat( room.players[room.smallBlindIndex].chips ).toFixed(4) ),
                   totalBetAmount: parseFloat( parseFloat( room.smallBlind ).toFixed(4) ),
                   playerAction: Sys.Config.Texas.AllIn,
                   remaining: 0,
                   "boardCard":room.game.board.length ? room.game.board:"",
                 })
                 room.game.gameTotalChips= parseFloat(parseFloat(room.game.gameTotalChips) + parseFloat(room.players[room.smallBlindIndex].chips));
                 room.players[room.smallBlindIndex].chips = 0;
             } else {
                 var previousBalance = room.players[room.smallBlindIndex].chips;
                 sbChips = room.smallBlind;
                 room.players[room.smallBlindIndex].chips -= room.smallBlind;
                 room.game.gameTotalChips= parseFloat(parseFloat(room.game.gameTotalChips) + parseFloat(sbChips));
                 room.game.bets[room.smallBlindIndex] = room.smallBlind;
                 room.game.history.push({
                   time: new Date(),
                   playerId: room.players[room.smallBlindIndex].id,
                   playerName: room.players[room.smallBlindIndex].playerName,
                   gameRound: room.game.roundName,
                   betAmount: parseFloat( parseFloat( room.smallBlind ).toFixed(4) ),
                   totalBetAmount: parseFloat( parseFloat( room.smallBlind).toFixed(4) ),
                   totalPot:0,
                   "boardCard":room.game.board.length ? room.game.board:"",
                   playerAction: Sys.Config.Texas.SmallBlind,
                   remaining: parseFloat( parseFloat(room.players[room.smallBlindIndex].chips).toFixed(4) )
                 })
              }
          }
        }  

       /* let transactionDataSB = {
          user_id: room.players[room.smallBlindIndex].id,
          username: room.players[room.smallBlindIndex].playerName,
          tableId: room.id,
          tableName: room.name,
          gameId: room.game.id,
          gameNumber: room.game.gameNumber,
          chips:  parseFloat(sbChips),
          previousBalance: parseFloat(previousBalance),
          afterBalance: parseFloat(room.players[room.smallBlindIndex].chips),
          category: 'debit',
          type: 'entry',
          remark: 'Small Blind',
          isTournament: 'No',
          isGamePot: 'yes'
        }
        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataSB);

        var totalGamePot = 0;
        for(var gp =0; gp<room.game.bets.length; gp++){
          totalGamePot += parseFloat(room.game.bets[gp]);
        }

        let transactionDataSBP = {
          user_id: room.players[room.smallBlindIndex].id,
          username: room.players[room.smallBlindIndex].playerName,
          tableId: room.id,
          tableName: room.name,
          gameId: room.game.id,
          gameNumber: room.game.gameNumber,
          chips:  parseFloat(totalGamePot),
          previousBalance: parseFloat(0),
          afterBalance: parseFloat(totalGamePot),
          category: 'credit',
          type: 'entry',
          remark: 'Game Pot',
          isTournament: 'No',
          isGamePot: 'yes'
        }
        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataSBP);

        console.log("omaha small blind totalGamePot: ", totalGamePot);*/

        if(room.players[room.bigBlindIndex].status == "Playing"){
          if (room.players[room.bigBlindIndex].chips <= room.bigBlind) {
              bbChips = room.players[room.bigBlindIndex].chips;
              var previousBalance = room.players[room.bigBlindIndex].chips;
              room.players[room.bigBlindIndex].allIn = true;
              room.players[room.bigBlindIndex].talked = true;
              room.game.bets[room.bigBlindIndex] = parseFloat(room.players[room.bigBlindIndex].chips);
              room.game.history.push({
                time: new Date(),
                playerId: room.players[room.bigBlindIndex].id,
                playerName: room.players[room.bigBlindIndex].playerName,
                gameRound: room.game.roundName,
                totalPot:0,
                "boardCard":room.game.board.length ? room.game.board:"",
                betAmount: parseFloat( parseFloat( room.players[room.bigBlindIndex].chips).toFixed(4) ),
                totalBetAmount: parseFloat( parseFloat(room.bigBlind).toFixed(4) ),
                playerAction: Sys.Config.Texas.AllIn,
                remaining: 0
              })
              room.game.gameTotalChips= parseFloat(parseFloat(room.game.gameTotalChips) + parseFloat(room.players[room.bigBlindIndex].chips));
              room.players[room.bigBlindIndex].chips = 0;
          } else {
              bbChips = room.bigBlind;
              var previousBalance = room.players[room.bigBlindIndex].chips;
              room.players[room.bigBlindIndex].chips -= room.bigBlind;
              room.game.gameTotalChips= parseFloat(parseFloat(room.game.gameTotalChips) + parseFloat(bbChips));
              room.game.bets[room.bigBlindIndex] = parseFloat(room.bigBlind);
              room.game.history.push({
                time: new Date(),
                playerId: room.players[room.bigBlindIndex].id,
                playerName: room.players[room.bigBlindIndex].playerName,
                gameRound: room.game.roundName,
                totalPot:0,
                "boardCard":room.game.board.length ? room.game.board:"",
                betAmount: parseFloat( parseFloat( room.bigBlind).toFixed(4) ),
                totalBetAmount: parseFloat( parseFloat(room.bigBlind).toFixed(4) ),
                playerAction: Sys.Config.Texas.BigBlind,
                remaining: parseFloat( parseFloat( room.players[room.bigBlindIndex].chips ).toFixed(4) )
              })
          }
        }  

        /*let transactionDataBB = {
          user_id: room.players[room.bigBlindIndex].id,
          username: room.players[room.bigBlindIndex].playerName,
          tableId: room.id,
          tableName: room.name,
          gameId: room.game.id,
          gameNumber: room.game.gameNumber,
          chips:  parseFloat(bbChips),
          previousBalance: parseFloat(previousBalance),
          afterBalance: parseFloat(room.players[room.bigBlindIndex].chips),
          category: 'debit',
          type: 'entry',
          remark: 'Big Blind',
          isTournament: 'No',
          isGamePot: 'no'
        }
        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataBB);
        

        var gamePortData = await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.getSingleData({isGamePot: 'yes', gameId: room.game.id});
        var currentTotalChips = (parseFloat(gamePortData.afterBalance) + parseFloat(bbChips));

        let transactionDataBBPot = {
          user_id: room.players[room.bigBlindIndex].id,
          username: room.players[room.bigBlindIndex].playerName,
          tableId: room.id,
          tableName: room.name,
          gameId: room.game.id,
          gameNumber: room.game.gameNumber,
          chips:  parseFloat(bbChips),
          previousBalance: parseFloat(gamePortData.afterBalance),
          afterBalance: parseFloat(currentTotalChips),
          category: 'credit',
          type: 'entry',
          remark: 'Game Pot',
          isTournament: 'No',
          isGamePot: 'yes'
        }
        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataBBPot);
        

        console.log("omaha big blind gamePortData: ", gamePortData);*/

        for(let i = 0; i < room.players.length; i++){
          if(room.players[i].waitForBigBlindCheckbox == true && room.players[i].waitForBigBlindCheckboxValue == false && room.players[i].status != 'Waiting' && i != room.smallBlindIndex && i != room.bigBlindIndex){
              if (room.players[i].chips <= room.bigBlind) {
              bbChips = room.players[i].chips;
              var previousBalance = room.players[i].chips;
              room.players[i].allIn = true;
              room.players[i].talked = true;
              room.game.bets[i] = parseFloat(room.players[i].chips);
              room.game.history.push({
                time: new Date(),
                playerId: room.players[i].id,
                playerName: room.players[i].playerName,
                gameRound: room.game.roundName,
                totalPot:0,
                "boardCard":room.game.board.length ? room.game.board:"",
                betAmount: parseFloat( parseFloat( room.players[i].chips).toFixed(4) ),
                totalBetAmount: parseFloat( parseFloat(room.bigBlind).toFixed(4) ),
                playerAction: Sys.Config.Texas.AllIn,
                remaining: 0
              })
              room.game.gameTotalChips= parseFloat(parseFloat(room.game.gameTotalChips) + parseFloat(room.players[i].chips));
              room.players[i].chips = 0
            } else {
              bbChips = room.bigBlind;
              var previousBalance = room.players[i].chips;
              room.players[i].chips -= room.bigBlind;
              room.game.gameTotalChips= parseFloat(parseFloat(room.game.gameTotalChips) + parseFloat(bbChips));
              room.game.bets[i] = parseFloat(room.bigBlind);
              room.game.history.push({
                time: new Date(),
                playerId: room.players[i].id,
                playerName: room.players[i].playerName,
                gameRound: room.game.roundName,
                totalPot:0,
                "boardCard":room.game.board.length ? room.game.board:"",
                betAmount: parseFloat( parseFloat( room.bigBlind).toFixed(4) ),
                totalBetAmount: parseFloat( parseFloat(room.bigBlind).toFixed(4) ),
                playerAction: Sys.Config.Texas.BigBlind,
                remaining: parseFloat( parseFloat( room.players[i].chips ).toFixed(4) )
              })
            }
          }
        }

        playersLength =  await room.roomPlayerLength(room);

        if (playersLength >= room.minPlayers) { 
           room.game.status = 'Running';
           room.status = 'Running';
           let gameStarted = await Sys.Game.CashGame.Omaha.Controllers.RoomProcess.newGameStarted(room);
           room.initNewRound();
        }else{
          console.log("game finished before card distribute");
          
          room.game.deck = [];
          room.gameWinners = [];
          room.gameLosers = [];
          await new Sys.Game.CashGame.Omaha.Entities.Deck().fillDeck(room.game.deck);
          for (let i = 0; i < room.players.length; i += 1) {
            if(room.players[i].status == 'Playing' && room.players[i].folded == false){
             room.players[i].cards.push(room.game.deck.pop());
             room.players[i].cards.push(room.game.deck.pop());
             room.players[i].cards.push(room.game.deck.pop());
             room.players[i].cards.push(room.game.deck.pop());
            }
          }
          console.log("room here", JSON.stringify(room.players))
          room.currentPlayer = room.dealerIndex + 3;
          let checkForEndOfRoundTemp = await Sys.Game.CashGame.Omaha.Controllers.PlayerProcess.checkForEndOfRound(room)
          console.log("statttttt", room.game.status,checkForEndOfRoundTemp )
          if (checkForEndOfRoundTemp === true || room.game.status == "ForceFinishedFolded" || room.game.status == "ForceFinishedAllIn") {
              console.log("progress called event if other player lefts the game")
              Sys.Game.CashGame.Omaha.Controllers.PlayerProcess.progress(room);
          }
        }

      }else{ // Shiv!@#
        console.log("Game Not Created. So Try Again...");
        room.StartGame();
      }

    }else{
        clearTimeout(Sys.Timers[room.id]);
        clearInterval(Sys.Timers[room.id]);
        console.log("removed error",room.game, playersLength)
        room.status = 'Finished';
        room.game = null;
        room.timerStart = false;
       // console.log("sitout next hand room", room);
        console.log("single Player Remain After Bib Blind Player Left. So Game Not starting...");
        room = await Sys.Game.CashGame.Omaha.Services.RoomServices.update(room);
        //console.log("sitout next hand after room", room)
    }

    }} catch (e) {
			console.log("Error In start Game : ", e);
		}


  }

  async initNewRound() {
    console.log("Init new Round");
    var room = this

    // Update Player Statistics

    for (let i = 0; i < room.players.length; i += 1) {
      let player = await Sys.Game.CashGame.Omaha.Services.PlayerServices.getById(room.players[i].id);
      if(!player.statistics) {
        player.statistics = {
          cashgame : {
            noOfPlayedGames : 0,
            totalWonGame : 0,
            totalLoseGame  : 0,
          },
          sng : {
            noOfPlayedGames : 0,
            totalWonGame : 0,
            totalLoseGame  : 0,
          },
          tournament : {
            noOfPlayedGames : 0,
            totalWonGame : 0,
            totalLoseGame  : 0,
          }
      }
      }
      player.statistics.cashgame.noOfPlayedGames++; 
      player.statistics.cashgame.totalLoseGame = parseInt(player.statistics.cashgame.noOfPlayedGames)-parseInt(player.statistics.cashgame.totalWonGame);
      await Sys.Game.CashGame.Omaha.Services.PlayerServices.update(player.id, { statistics: player.statistics });
    }

    console.log("Befor Fill Deck")
    room.game.deck = [];
    await new Sys.Game.CashGame.Omaha.Entities.Deck().fillDeck(room.game.deck);
    room.NewRound();
  };


  async NewRound() {
     console.log("New Round")
     var room = this;
     // removed because dealer is already assigned so can not make waiting player to playing player, do it on startGame
     /*for (var i in room.players) {
       if (room.players[i].status == 'Waiting') {
         room.players[i].status = 'Playing'
       }
     }*/
     room.gameWinners = [];
     room.gameLosers = [];

     //Deal 2 cards to each player
     for (let i = 0; i < room.players.length; i += 1) {
       //if(room.players[i].status != 'Ideal' && room.players[i].status != 'Left'){
        if(room.players[i].status == 'Playing'){
        /*if(i == 0){
          room.players[i].cards.push('JD');
          room.players[i].cards.push('AH');
        }else if(i == 1){
          room.players[i].cards.push('TD');
          room.players[i].cards.push('3C');
        }else{
          room.players[i].cards.push('AC');
          room.players[i].cards.push('JD');
        }*/
        room.players[i].cards.push(room.game.deck.pop());
        room.players[i].cards.push(room.game.deck.pop());
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
     console.log("---Dealer :::", room.players[room.dealerIndex].playerName, room.game.gameNumber);
     console.log("--- SB    :::", room.players[room.smallBlindIndex].playerName, room.game.gameNumber);
     console.log("--- BB    :::", room.players[room.bigBlindIndex].playerName, room.game.gameNumber);
     console.log("-- current player", room.currentPlayer, room.game.gameNumber)
     console.log("----------------------------------------------------------------------");


     console.log("Room Running");
     room.status = 'Running';
     // depriciated
     console.log("Bets ========================================================");
     console.log(room.game.bets);

     let newRoundStarted = Sys.Game.CashGame.Omaha.Controllers.RoomProcess.newRoundStarted(room);


  }


  /** Start : Current  Player  Turn Button Action  */
  //START: this code is original code comment 16-08-2019
  getCurrentTurnButtonAction() {

    console.log("Room Called");

    let maxBet = parseFloat(this.getMaxBet(this.game.bets));
    let yourBet = parseFloat(this.game.bets[this.currentPlayer]);
    let playerChips ;
    let raisedAmount = (this.turnBet.raisedAmount == undefined) ? 0 : this.turnBet.raisedAmount;
    let oldBet = parseFloat(this.game.bets[this.currentPlayer]);
    if(this.limit == 'pot_limit' || this.limit == "Hi-Lo-pot_limit")
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
    if((this.limit == 'limit' || this.limit == 'Hi-Lo-limit') && (this.game.roundName == 'Turn' || this.game.roundName == 'River' )){
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
        if( this.limit == 'pot_limit' || this.limit == "Hi-Lo-pot_limit")
        {
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
        }
        else if(this.limit == 'limit' || this.limit == "Hi-Lo-limit"){
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
        }
        else{
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
      console.log("ROUND NAMES",room.game.roundName)
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
        if(room.limit == 'pot_limit' || room.limit == "Hi-Lo-pot_limit"){
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
        }else if(room.limit == 'limit' || room.limit == "Hi-Lo-limit"){
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
  //END: this code is original code comment 16-08-2019

  //START: this code is only for testing 16-08-2019
  /*getCurrentTurnButtonAction() {

    console.log("Room Called");

    let maxBet = parseFloat(this.getMaxBet(this.game.bets));
    let yourBet = parseFloat(this.game.bets[this.currentPlayer]);
    let playerChips = parseFloat(this.players[this.currentPlayer].chips);
    let raisedAmount = (this.turnBet.raisedAmount == undefined) ? 0 : this.turnBet.raisedAmount;

    // myraiseAmount update @chetan
    //let minRaisedAmount = parseFloat(parseFloat(maxBet + raisedAmount) - yourBet);
    console.log("maxBetOnRaise in room", parseFloat( this.game.maxBetOnRaise) );
    let minRaisedAmount = parseFloat(parseFloat( parseFloat(this.game.maxBetOnRaise) + raisedAmount) - yourBet);


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
    console.log("/------------------------------------------------------------------------------------------/")

    // Check For All In
    if(playerChips <= parseFloat(maxBet - yourBet)){
      console.log("my code");
      console.log("ALL In.......");
      return {
        allIn : true,
        allInAmount : parseFloat(playerChips),
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
      if( parseFloat(maxBet - yourBet) < parseFloat(playerChips) && minRaisedAmount < parseFloat(playerChips) ){
        minRaisedAmount = (minRaisedAmount < parseFloat(playerChips)) ? minRaisedAmount : parseFloat(playerChips);

        console.log("stopreraise",this.game.stopReraise )
        // if( ( playerRoundRaised > 0 && playerRoundRaised >=  parseFloat(maxBet - yourBet) ) || ( this.game.stopReraise == true ) ){
        //   console.log("**************reraise is not allowed******", playerRoundRaised, maxBet,yourBet, parseFloat(maxBet - yourBet)  )
        //   this.game.stopReraise = true;
        //   console.log("stopreraise inn",this.game.stopReraise )
        //   console.log("sercamstances  code");
        //   return {
        //     allIn : false,
        //     allInAmount : 0,
        //     check : false,
        //     call : true,
        //     callAmount : parseFloat(maxBet - yourBet),
        //     raise : true,
        //     minRaise : 0.0,
        //     maxRaise : 0.0
        //   }
        // }
        console.log("in call raise fnction")

        return {
          allIn : false,
          allInAmount : 0,
          check : false,
          call : true,
          callAmount : parseFloat(maxBet - yourBet),
          raise : true,
          minRaise : parseFloat(minRaisedAmount),
          maxRaise : parseFloat(playerChips)
        }

      }else{
        return {
          allIn : false,
          allInAmount : 0,
          check : false,
          call : true,
          callAmount : parseFloat(maxBet - yourBet),
          raise : true,
          minRaise : parseFloat(maxBet - yourBet),
          maxRaise : parseFloat(playerChips),
        }

      }
    }

    // Check for Check

    if(yourBet == maxBet){
      console.log("Check .......");
      minRaisedAmount = (minRaisedAmount < parseFloat(playerChips)) ? minRaisedAmount : parseFloat(playerChips);
          return {
            allIn : false,
            check : true,
            call : false,
            callAmount : 0.0,
            raise : true,
            minRaise : parseFloat(minRaisedAmount),
            maxRaise : parseFloat(playerChips)
          }
    }

  }*/
  //END: this code is only for testing 16-08-2019

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
      if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal' && room.players[i].status != 'Waiting') {
        playersLength++;
      }
    }
    return playersLength;
   }


   async roomDealerPositionSet(room,idDealerIgnore){


    let playersLength = 0;
    for(let i=0; i < room.players.length; i++){
      if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal' && room.players[i].status != 'Waiting') {
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
        if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal' && room.players[i].status != 'Waiting') {
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
          if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal' && room.players[i].status != 'Waiting') {
            if(room.players[i].seatIndex < room.dealer){
              room.dealer = room.players[i].seatIndex;
              room.dealerIndex = i;
            }
          }
        }
      }
    }else{
      for(let i=0; i < room.players.length; i++){
        if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal' && room.players[i].status != 'Waiting') {
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

    let totalPlayers = 0;
    for (i = 0; i < room.players.length; i++) {
      if (room.players[i].status != 'Left' && room.players[i].status != 'Ideal') {
        totalPlayers++;
      }
    }

    for(let i = 0;i < room.players.length; i++){
      if(room.players[i].skipDealer == true){
      let skipDealerIndexes = [];
      skipDealerIndexes.push(i);
      console.log("SKIP DEALER",room.players.length)
        if(i == room.dealerIndex){
          room.dealerIndex = room.dealerIndex + 1;
          room.smallBlindIndex = room.smallBlindIndex + 1;
          room.bigBlindIndex = room.bigBlindIndex + 1;
          await this.skipDealer(room, skipDealerIndexes);

          if (room.dealerIndex >= playersLength) {
            room.dealerIndex = 0;
          }
          if (room.dealerIndex >= playersLength) {
            room.dealerIndex -= playersLength;
          }
          if (room.smallBlindIndex >= playersLength) {
            room.smallBlindIndex = 0;
          }
          if (room.smallBlindIndex >= playersLength) {
            room.smallBlindIndex -= playersLength;
          } 
          if (room.bigBlindIndex >= playersLength) {
            room.bigBlindIndex == room.smallBlindIndex + 1;
          }
          if (room.bigBlindIndex >= playersLength) {
            room.bigBlindIndex -= playersLength;
          }
        }
      }else{
        if(i == room.dealerIndex && totalPlayers > 2 && room.players[i].waitForBigBlindCheckbox == true && room.players[i].waitForBigBlindCheckboxValue == true){
          let skipDealerIndexes = [];
          skipDealerIndexes.push(i);
          room.dealerIndex = room.dealerIndex + 1;
          room.smallBlindIndex = room.smallBlindIndex + 1;
          room.bigBlindIndex = room.bigBlindIndex + 1;
          await this.skipDealer(room, skipDealerIndexes);
          if (room.dealerIndex >= playersLength) {
            room.dealerIndex = 0;
          }
          if (room.dealerIndex >= playersLength) {
            room.dealerIndex -= playersLength;
          }
          if (room.smallBlindIndex >= playersLength) {
            room.smallBlindIndex = 0;
          }
          if (room.smallBlindIndex >= playersLength) {
            room.smallBlindIndex -= playersLength;
          } 
          if (room.bigBlindIndex >= playersLength) {
            room.bigBlindIndex == room.smallBlindIndex + 1;
          }
          if (room.bigBlindIndex >= playersLength) {
            room.bigBlindIndex -= playersLength;
          }
        }else if(i == room.dealerIndex + 1 && totalPlayers == 2 && room.players[i].waitForBigBlindCheckbox ==  true && room.players[i].waitForBigBlindCheckboxValue == true){
          let skipDealerIndexes = [];
          skipDealerIndexes.push(i);
          console.log("IT IS SMALL BLIND INDEX")
          room.dealerIndex = room.dealerIndex + 1;
          room.smallBlindIndex = room.smallBlindIndex + 1;
          room.bigBlindIndex = room.bigBlindIndex + 1;
         // await this.skipDealer(room, skipDealerIndexes);
          if (room.dealerIndex >= playersLength) {
            room.dealerIndex = 0;
          }
          if (room.dealerIndex >= playersLength) {
            room.dealerIndex -= playersLength;
          }
          if (room.smallBlindIndex >= playersLength) {
            room.smallBlindIndex = 0;
          }
          if (room.smallBlindIndex >= playersLength) {
            room.smallBlindIndex -= playersLength;
          } 
          if (room.bigBlindIndex >= playersLength) {
            room.bigBlindIndex == room.smallBlindIndex + 1;
          }
          if (room.bigBlindIndex >= playersLength) {
            room.bigBlindIndex -= playersLength;
          }
        }
      }
    }
    if(room.dealer == room.oldDealerIndex){
      room.dealerIndex = room.dealerIndex + 1;
      room.smallBlindIndex = room.smallBlindIndex + 1;
      room.bigBlindIndex = room.bigBlindIndex + 1;
      if (room.dealerIndex >= playersLength) {
        room.dealerIndex = 0;
      }
      if (room.dealerIndex >= playersLength) {
        room.dealerIndex -= playersLength;
      }
      if (room.smallBlindIndex >= playersLength) {
        room.smallBlindIndex = 0;
      }
      if (room.smallBlindIndex >= playersLength) {
        room.smallBlindIndex -= playersLength;
      } 
      if (room.bigBlindIndex >= playersLength) {
        room.bigBlindIndex == room.smallBlindIndex+1;
      }
      if (room.bigBlindIndex >= playersLength) {
        room.bigBlindIndex -= playersLength;
      }
    }

    
    room.dealer = room.players[room.dealerIndex].seatIndex;

    console.log("ROOM PLAYERS LENGTH",room.players.length)
    console.log("DEALER INDEX",room.dealerIndex)
    console.log("SMALL BLIND INDEX",room.smallBlindIndex)
    console.log("BIG BLIND INDEX",room.bigBlindIndex)
    console.log("UPDATED DEALAR",room.dealer)
    console.log("-------------------")
    console.log("ROOM OLD DEALER INDEX",room.oldDealerIndex)
    console.log("ROOM OLD SB INDEX",room.oldSmallBlindIndex)
    console.log("ROOM OLD BB INDEX",room.oldBigBlindIndex)

    console.log("--------------------After SB and BB assign----------------------------------");
    console.log("---Dealer :::", room.players[room.dealerIndex].playerName);
    console.log("--- SB    :::", room.players[room.smallBlindIndex].playerName);
   // console.log("--- BB    :::", room.players[room.bigBlindIndex].playerName);
    console.log("-- current player", room.currentPlayer)
    console.log("----------------------------------------------------------------------");


      return room;
  }

  async sbBb(room){
    for(let i = 0; i < room.waitingPlayers.length; i++){
      if(room.waitingPlayers[i].waitForBigBlindCheckbox == true && room.waitingPlayers[i].waitForBigBlindCheckboxValue == true){
       let isConsiderAsPlayer = false;
       let seatIndex = [];
       seatIndex.push(room.waitingPlayers[i].seatIndex);
       console.log("SEAT INDEX",seatIndex)
       let playerOfCondition = [];
       for(let j = 0; j < seatIndex.length; j++){
          playerOfCondition = room.players.filter((x) => { return x.seatIndex < seatIndex[j] && x.status != 'Ideal'; });
            if(playerOfCondition.length == 0){
              playerOfCondition = room.players.filter((x) => { return x.seatIndex > seatIndex[j] && x.status != 'Ideal'; });
            }
       }
       for(let k = 0; k < playerOfCondition.length; k++){
         if(playerOfCondition[k].seatIndex == room.oldBigBlindIndex){
           console.log("PLAYER OF CONDITION",playerOfCondition)
           for(let l = 0; l < room.players.length; l++){
             if(room.waitingPlayers[i].seatIndex != 0 && playerOfCondition[playerOfCondition.length - 1].seatIndex != room.oldBigBlindIndex){
                isConsiderAsPlayer = false;
             }else if(room.waitingPlayers[i].seatIndex == 0  && playerOfCondition[playerOfCondition.length - 1].seatIndex != room.oldBigBlindIndex){
              isConsiderAsPlayer = false;
             }else{
                isConsiderAsPlayer = true;
                if(playerOfCondition[k].seatIndex == room.oldDealerIndex){
                  room.waitingPlayers[i].skipDealer = true;
                }
             }
           }
           if(isConsiderAsPlayer ==  true){
            room.players.push(room.waitingPlayers[i]);
            room.waitingPlayers.splice(i,1); 
           }
         }
       }
      }
    }
    return room;
  }

  async skipDealer(room, skipDealerIndexes){
    try {
      console.log("skipDealer function called", room.dealerIndex, skipDealerIndexes);
      if(skipDealerIndexes.includes(room.dealerIndex)){
        for (let j = room.dealerIndex; j < room.players.length; j++) {
          room.dealerIndex = room.dealerIndex + 1;
          room.smallBlindIndex = room.smallBlindIndex + 1;
          room.bigBlindIndex = room.bigBlindIndex + 1;
          if(!skipDealerIndexes.includes(room.dealerIndex)){
            break;
          }
        }
      }
      console.log("Roles after skipDealer function");
      console.log("D", room.dealerIndex);
      console.log("SB", room.smallBlindIndex);
      console.log("BB", room.bigBlindIndex);
      console.log("-------------------------------");
      return;
    } catch (error) {
      console.log("Catched Error in skipDealer", error);
      return;
    }
  }

}



module.exports = Room
