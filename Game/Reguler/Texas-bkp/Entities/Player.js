var Sys = require('../../../../Boot/Sys');

class Player {
    constructor (id, socketId, seatIndex,playerName, avatar, appid,status, chips,folded,allIn,talked,cards,autoBuyin,defaultActionCount,isBot,isSidepot,sitOutNextHand,sitOutNextBigBlind) {
      
      this.id = id;
      this.socketId = socketId;
      this.seatIndex = seatIndex;
      this.playerName = playerName;
      this.avatar = avatar;
      this.appid = appid;
      this.status = status;
      this.chips = chips;
      this.folded = (folded)?folded:false;
      this.allIn = (allIn)?allIn:false;
      this.talked = (talked)?talked:false;
      this.cards = (cards)?cards:[];
      this.autoBuyin = autoBuyin|0;
      this.defaultActionCount = (defaultActionCount)?defaultActionCount:0;
      this.isBot = isBot || false;
      this.isSidepot = isSidepot || false;
      this.sitOutNextHand = sitOutNextHand || false;
      this.sitOutNextBigBlind = sitOutNextBigBlind || false;
    }

    createObject (player) {
        return new Player(
            player.id,
            player.socketId,
            player.seatIndex,
            player.playerName,
            player.avatar,
            player.appid,
            player.status,
            player.chips ,
            player.folded ,
            player.allIn ,
            player.talked ,
            player.cards,
            player.autoBuyin,
            player.defaultActionCount,
            player.isBot,
            player.isSidepot,
            player.sitOutNextHand,
            player.sitOutNextBigBlind,
        )
    }
    toJson() {
        var player = {
            id                  : this.id,
            socketId            : this.socketId,
            seatIndex           : this.seatIndex,
            playerName          : this.playerName,
            avatar              : this.avatar,
            appid               : this.appid,
            status              : this.status,
            chips               : this.chips,
            folded              : this.folded,
            allIn               : this.allIn,
            talked              : this.talked,
            cards               : this.cards,
            autoBuyin           : this.autoBuyin,
            defaultActionCount  : this.defaultActionCount,
            isBot               : this.isBot,
            isSidepot           : this.isSidepot,
            sitOutNextHand      : this.sitOutNextHand,
            sitOutNextBigBlind  : this.sitOutNextBigBlind,
      }
        return player
    }
    getChips (cash) {
        this.chips += cash;
    }

    // Player actions: Check(), Fold(), Bet(bet), Call(), AllIn()
    Check ( roomId,hasRaised ) {
        var checkAllow, v, i, maxBet;
        checkAllow = true;
        maxBet = this.getMaxBet(Sys.Rooms[roomId].game.bets)
        for (v = 0; v < Sys.Rooms[roomId].game.bets.length; v += 1) {
            if (Sys.Rooms[roomId].game.bets[v] !== 0) {
                checkAllow = false;
            }
        }
        if (Sys.Rooms[roomId].game.bets[Sys.Rooms[roomId].currentPlayer] == maxBet) {
            for (i = 0; i < Sys.Rooms[roomId].players.length; i += 1) {
                if (this === Sys.Rooms[roomId].players[i]) {
                    this.talked = true;
                }
            }
           // console.log(Sys.Rooms[roomId].game.pot);// Shiv!@#
            // Sys.Rooms[roomId].game.pot = Sys.Rooms[roomId].game.pot;// Shiv!@#

             

            //Attemp to progress the game
            Sys.Rooms[roomId].turnBet = {action: Sys.Config.Texas.Check, playerId: this.id,betAmount: 0, hasRaised: hasRaised}
            Sys.Rooms[roomId].game.history.push({
                "time": new Date(),
                "playerId": this.id,
                "playerName": this.playerName,
                "gameRound": Sys.Rooms[roomId].game.roundName,
                "betAmount": 0,
                "totalBetAmount": this.getTotalBet(roomId),
                "playerAction": Sys.Config.Texas.Check,
                "hasRaised": hasRaised,
                "remaining": this.chips
            })
            Sys.Game.Reguler.Texas.Controllers.PlayerProcess.progress(Sys.Rooms[roomId]);
        } else {
            console.log("Check not allowed, replay please");
        }
    }

    Fold ( roomId,hasRaised) {
        var i, bet;
        for (i = 0; i < Sys.Rooms[roomId].players.length; i += 1) {
            if (this === Sys.Rooms[roomId].players[i]) {
                bet = parseInt(Sys.Rooms[roomId].game.bets[i], 10);
                this.talked = true;
            }
        }
        //Mark the player as folded
        this.folded = true;
        Sys.Rooms[roomId].turnBet = {action: Sys.Config.Texas.Fold, playerId: this.id,betAmount: 0,hasRaised: hasRaised}
        Sys.Rooms[roomId].game.history.push({
            "time": new Date(),
            "playerId": this.id,
            "playerName": this.playerName,
            "gameRound": Sys.Rooms[roomId].game.roundName,
            "betAmount": 0,
            "totalBetAmount": this.getTotalBet(roomId),
            "playerAction": Sys.Config.Texas.Fold,
            "hasRaised": hasRaised,
            "remaining": this.chips
        })
        //Attemp to progress the game
        Sys.Game.Reguler.Texas.Controllers.PlayerProcess.progress(Sys.Rooms[roomId]);
    }

    Bet( roomId, bet, hasRaised) {
        var i;
          if (this.chips > bet) {
            for (i = 0; i < Sys.Rooms[roomId].players.length; i += 1) {
                if (this === Sys.Rooms[roomId].players[i]) {

                    Sys.Rooms[roomId].game.bets[i] = parseInt(parseInt(Sys.Rooms[roomId].game.bets[i])+parseInt(bet));
 
                    Sys.Rooms[roomId].players[i].chips =  parseInt(parseInt(Sys.Rooms[roomId].players[i].chips) - parseInt(bet));
                    // Sys.Rooms[roomId].game.pot += parseInt(bet); // Shiv!@#
                    this.talked = true;
                }
            }

            //Attemp to progress the game
            Sys.Rooms[roomId].turnBet = {action: Sys.Config.Texas.Bet, playerId: this.id, betAmount: bet,hasRaised: hasRaised}
            Sys.Rooms[roomId].game.history.push({
                "time": new Date(),
                "playerId": this.id,
                "playerName": this.playerName,
                "gameRound": Sys.Rooms[roomId].game.roundName,
                "betAmount": bet,
                "totalBetAmount": this.getTotalBet(roomId),
                "playerAction": Sys.Config.Texas.Bet,
                "hasRaised": hasRaised,
                "remaining": this.chips
            })
            Sys.Game.Reguler.Texas.Controllers.PlayerProcess.progress(Sys.Rooms[roomId]);
        } else {
            console.log('You don\'t have enought chips --> ALL IN !!!');
            this.AllIn(roomId,hasRaised);
        }
    }

    Call ( roomId, hasRaised) {
        let maxBet, i, playerRemainChips = 0;
        // let roomData = Sys.Game.Reguler.Texas.Services.RoomServices.get(roomId.id)
       console.log("bets :",Sys.Rooms[roomId].game.bets)
        maxBet =  parseInt(this.getMaxBet(Sys.Rooms[roomId].game.bets));

        // Shiv!@#
        for (i = 0; i < Sys.Rooms[roomId].players.length; i += 1) {
            if (this === Sys.Rooms[roomId].players[i]) {
                if (Sys.Rooms[roomId].game.bets[i] >= 0) {
                   playerRemainChips = maxBet - parseInt(Sys.Rooms[roomId].game.bets[i]);
                }
            }
        }


        if (this.chips > playerRemainChips) { // Shiv!@#
            //Match the highest bet
            // var oldBet = 0;
            for (i = 0; i < Sys.Rooms[roomId].players.length; i += 1) {
                if (this === Sys.Rooms[roomId].players[i]) {
                    // if (Sys.Rooms[roomId].game.bets[i] >= 0) {
                    //     oldBet = parseInt(Sys.Rooms[roomId].game.bets[i]);
                    //     //this.chips = parseInt(parseInt(this.chips) + parseInt(Sys.Rooms[roomId].game.bets[i]));// Shiv!@#
                    // }
                    
                    this.chips = parseInt(parseInt(this.chips) - parseInt(playerRemainChips));// Shiv!@#
                    // Sys.Rooms[roomId].game.pot += parseInt(maxBet); // Shiv!@#
                    Sys.Rooms[roomId].game.bets[i] = parseInt(maxBet);
                    this.talked = true;
                    console.log('If is setis fy in call',maxBet, playerRemainChips)
                }
            }
          

            //Attemp to progress the game
            //Shiv!@# maxBet-oldBet
            Sys.Rooms[roomId].turnBet = {action: Sys.Config.Texas.Call, playerId: this.id, betAmount: playerRemainChips, hasRaised: hasRaised}
            Sys.Rooms[roomId].game.history.push({
                "time": new Date(),
                "playerId": this.id,
                "playerName": this.playerName,
                "gameRound": Sys.Rooms[roomId].game.roundName,
                "betAmount": playerRemainChips,  //Shiv!@#  maxBet-oldBet,
                "totalBetAmount": this.getTotalBet(roomId),
                "playerAction": Sys.Config.Texas.Call,
                "hasRaised": hasRaised,
                "remaining": this.chips
            })
            Sys.Game.Reguler.Texas.Controllers.PlayerProcess.progress(Sys.Rooms[roomId]);
        } else {
            console.log('You don\'t have enought chips -->(CALL) ALL IN !!!');
            this.AllIn(roomId, hasRaised);
        }
    }

    AllIn ( roomId, hasRaised) {
        console.log('All IN called',hasRaised);
        let i, allInValue=0;
       // console.log("this ->",this);
        // let roomData = Sys.Game.Reguler.Texas.Services.RoomServices.get(roomId.id)
        for (i = 0; i < Sys.Rooms[roomId].players.length; i += 1) {
            if (this === Sys.Rooms[roomId].players[i]) {
                if (Sys.Rooms[roomId].players[i].chips !== 0) {
                  allInValue = parseInt(Sys.Rooms[roomId].players[i].chips);
                  console.log("allInValue->",allInValue);
                  console.log("Sys.Rooms[roomId].game.bets[i] ->",Sys.Rooms[roomId].game.bets[i]);
                  // Sys.Rooms[roomId].game.pot += parseInt(Sys.Rooms[roomId].players[i].chips); // Shiv!@#
                  Sys.Rooms[roomId].game.bets[i] += parseInt(Sys.Rooms[roomId].players[i].chips);
                  Sys.Rooms[roomId].players[i].chips = 0;
                  console.log("Sys.Rooms[roomId].game.bets[i] ->",Sys.Rooms[roomId].game.bets[i]);
                  this.allIn = true;
                  this.talked = true;
              }
          }
      }

        //Attemp to progress the game
        Sys.Rooms[roomId].turnBet = {action: Sys.Config.Texas.AllIn, playerId: this.id, betAmount: allInValue,hasRaised: hasRaised}
        Sys.Rooms[roomId].game.history.push({
            "time": new Date(),
            "playerId": this.id,
            "playerName": this.playerName,
            "gameRound": Sys.Rooms[roomId].game.roundName,
            "betAmount": allInValue,
            "totalBetAmount": this.getTotalBet(roomId),
            "playerAction": Sys.Config.Texas.AllIn,
            "hasRaised": hasRaised,
            "remaining": this.chips
        })
        Sys.Game.Reguler.Texas.Controllers.PlayerProcess.progress(Sys.Rooms[roomId]);
    }

    getTotalBet (roomId) {
      // let Sys.Rooms[roomId.id] = Sys.Game.Reguler.Texas.Services.RoomServices.get(roomId.id)
        let total = 0;
        let self = this
        Sys.Rooms[roomId].game.history.forEach(function(element) {
            if(element.playerId == self.id){
                total = total + element.betAmount
            }
        });
        return total
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

}
module.exports = Player
