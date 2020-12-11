var Sys = require('../../../../Boot/Sys');

class Player {
    constructor (id, socketId,seatIndex, playerName, avatar, fb_avatar,status, chips,extraChips,entryChips,folded,allIn,talked,cards,autoBuyin,defaultActionCount,isBot,isSidepot,sitOutNextHand,sitOutNextBigBlind,muck,idealTime, isDisplayedCard, roundRaisedAmount, isFold, isCheck, isCall, considerLeftedPlayer, isIdeal, foldedPlayerRemainingCount, isAlreadyActed) {
      
      this.id = id;
      this.socketId = socketId;
      this.seatIndex = seatIndex;
      this.playerName = playerName;
      this.avatar = avatar;
      this.fb_avatar = fb_avatar;
      this.status = status;
      this.chips = chips;
      this.extraChips = extraChips;
      this.entryChips = entryChips;
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
      this.muck = muck;
      this.idealTime = idealTime;
      this.isDisplayedCard = (isDisplayedCard) ? isDisplayedCard : false;
      this.roundRaisedAmount = (roundRaisedAmount) ? roundRaisedAmount : 0;
      this.isFold       = isFold;
      this.isCheck      = isCheck;
      this.isCall       = isCall;
      this.considerLeftedPlayer = considerLeftedPlayer || false;
      this.isIdeal = isIdeal || false;
      this.foldedPlayerRemainingCount = ( foldedPlayerRemainingCount ) ? foldedPlayerRemainingCount : 0;
      this.isAlreadyActed = ( isAlreadyActed ) ? isAlreadyActed: false;
    }

    createObject (player) {
        return new Player(
            player.id,
            player.socketId,
            player.seatIndex,
            player.playerName,
            player.avatar,
            player.fb_avatar,
            player.status,
            player.chips ,
            player.extraChips,
            player.entryChips,
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
            player.muck,
            player.idealTime,
            player.isDisplayedCard,
            player.roundRaisedAmount,
            player.isFold,
            player.isCheck,
            player.isCall,
            player.considerLeftedPlayer,
            player.isIdeal,
            player.foldedPlayerRemainingCount,
            player.isAlreadyActed,
        )
    }
    toJson() {
        var player = {
            id                  : this.id,
            socketId            : this.socketId,
            seatIndex           : this.seatIndex,
            playerName          : this.playerName,
            avatar              : this.avatar,
            fb_avatar           : this.fb_avatar,
            status              : this.status,
            chips               : this.chips,
            extraChips          : this.extraChips,
            entryChips          : this.entryChips,
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
            muck                : this.muck,
            idealTime           : this.idealTime,
            isDisplayedCard     : this.isDisplayedCard,
            roundRaisedAmount   : this.roundRaisedAmount,
            isFold              : this.isFold,
            isCheck             : this.isCheck,
            isCall              : this.isCall,
            considerLeftedPlayer: this.considerLeftedPlayer,
            isIdeal             : this.isIdeal,
            foldedPlayerRemainingCount: this.foldedPlayerRemainingCount,
            isAlreadyActed      :this.isAlreadyActed,
      }
        return player
    }
    getChips (cash) {
        this.chips += cash;
    }

    // Player actions: Check(), Fold(), Bet(bet), Call(), AllIn()
    async Check ( roomId,hasRaised ) {
        var checkAllow, v, i, maxBet;
        checkAllow = true;
        maxBet = this.getMaxBet(Sys.Rooms[roomId].game.bets)
        for (v = 0; v < Sys.Rooms[roomId].game.bets.length; v += 1) {
            if (Sys.Rooms[roomId].game.bets[v] !== 0) {
                checkAllow = false;
            }
        }

       /* var tabelId = Sys.Rooms[roomId].id;
        var tabelName = Sys.Rooms[roomId].name;
        var gameId = Sys.Rooms[roomId].game.id;
        var gameNumber = Sys.Rooms[roomId].game.gameNumber;

        // added by K@Y
        let transactionData = {
            user_id: this.id,
            username: this.playerName,
            gameId: gameId,
            gameNumber: gameNumber,
            tableId: tabelId,
            tableName: tabelName,
            chips: 0,
            previousBalance: parseFloat(this.chips),
            afterBalance: parseFloat(this.chips),
            category: 'debit',
            type: 'entry',
            remark: 'Check',
            isTournament: 'Yes',
            isGamePot: 'no'
        }

        console.log("omaha tournament check player transactionData: ", transactionData);
        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);

        var gamePortData = await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.getSingleData({isGamePot: 'yes', gameId: gameId});
        var currentTotalChips = (parseFloat(gamePortData.afterBalance) + parseFloat(0));

        let transactionDataPot = {
            user_id: this.id,
            username: this.playerName,
            gameId: gameId,
            gameNumber: gameNumber,
            tableId: tabelId,
            tableName: tabelName,
            chips:  parseFloat(0),
            previousBalance: parseFloat(gamePortData.afterBalance),
            afterBalance: parseFloat(currentTotalChips),
            category: 'credit',
            type: 'entry',
            remark: 'Game Pot',
            isTournament: 'Yes',
            isGamePot: 'yes'
        }
        console.log("omaha tournament check player transactionDataPot: ", transactionDataPot)
        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataPot);*/

        if (Sys.Rooms[roomId].game.bets[Sys.Rooms[roomId].currentPlayer] == maxBet) {
            for (i = 0; i < Sys.Rooms[roomId].players.length; i += 1) {
                if (this === Sys.Rooms[roomId].players[i]) {
                    this.talked = true;
                }
            }
           // console.log(Sys.Rooms[roomId].game.pot);// Shiv!@#
            // Sys.Rooms[roomId].game.pot = Sys.Rooms[roomId].game.pot;// Shiv!@#
            //Attemp to progress the game
            //let oldRaisedAmount = Sys.Rooms[roomId].turnBet.raisedAmount;
            let oldRaisedAmount = (Sys.Rooms[roomId].turnBet.raisedAmount == undefined) ? 0 : Sys.Rooms[roomId].turnBet.raisedAmount;
            Sys.Rooms[roomId].turnBet = {action: Sys.Config.Texas.Check, playerId: this.id,betAmount: 0, raisedAmount : oldRaisedAmount, hasRaised: hasRaised, totalBetAmount:parseFloat(Sys.Rooms[roomId].game.bets[Sys.Rooms[roomId].currentPlayer])}
            Sys.Rooms[roomId].game.history.push({
                "time": new Date(),
                "playerId": this.id,
                "playerName": this.playerName,
                "gameRound": Sys.Rooms[roomId].game.roundName,
                "betAmount": 0,
                "totalBetAmount": parseFloat( parseFloat( this.getTotalBet(roomId) ).toFixed(4) ),
                "playerAction": Sys.Config.Texas.Check,
                "hasRaised": parseFloat( parseFloat( hasRaised ).toFixed(4) ),
                "remaining": parseFloat( parseFloat( this.chips ).toFixed(4) )
            })
            Sys.Game.Reguler.Omaha.Controllers.PlayerProcess.progress(Sys.Rooms[roomId]);
        } else {
            console.log("Check not allowed, replay please");
        }
    }

    async Fold ( roomId,hasRaised) {
       // var i, bet;
        // for (i = 0; i < Sys.Rooms[roomId].players.length; i += 1) {
        //     if (this === Sys.Rooms[roomId].players[i]) {
        //         bet = parseFloat(Sys.Rooms[roomId].game.bets[i]);
        //         this.talked = true;
        //     }
        // }
        //Mark the player as folded
        this.folded = true;
        this.talked = true;

        let oldRaisedAmount = Sys.Rooms[roomId].turnBet.raisedAmount;
        Sys.Rooms[roomId].turnBet = {action: Sys.Config.Texas.Fold, playerId: this.id,betAmount: 0, raisedAmount : oldRaisedAmount, hasRaised: hasRaised, totalBetAmount:parseFloat(Sys.Rooms[roomId].game.bets[Sys.Rooms[roomId].currentPlayer])}
         Sys.Rooms[roomId].game.history.push({
            "time": new Date(),
            "playerId": this.id,
            "playerName": this.playerName,
            "gameRound": Sys.Rooms[roomId].game.roundName,
            "betAmount": 0,
            "totalBetAmount": parseFloat( parseFloat( this.getTotalBet(roomId) ).toFixed(4) ),
            "playerAction": Sys.Config.Texas.Fold,
            "hasRaised": parseFloat( parseFloat( hasRaised).toFixed(4) ),
            "remaining": parseFloat( parseFloat( this.chips ).toFixed(4) )
        })

        /*var tabelId = Sys.Rooms[roomId].id;
        var tabelName = Sys.Rooms[roomId].name;
        var gameId = Sys.Rooms[roomId].game.id;
        var gameNumber = Sys.Rooms[roomId].game.gameNumber;

        // added by K@Y
        let transactionData = {
            user_id: this.id,
            username: this.playerName,
            gameId: gameId,
            gameNumber: gameNumber,
            tableId: tabelId,
            tableName: tabelName,
            chips: 0,
            previousBalance: parseFloat(this.chips),
            afterBalance: parseFloat(this.chips),
            category: 'debit',
            type: 'entry',
            remark: 'Fold',
            isTournament: 'Yes',
            isGamePot: 'no'
        }

        console.log("regular tournament fold player transactionData: ", transactionData);
        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);*/

        // show card button broadcast
        console.log("roundName when folded", Sys.Rooms[roomId].game.roundName)
        if(this.folded ==true && this.status == 'Playing' && Sys.Rooms[roomId].game.roundName == 'River'){
            Sys.Rooms[roomId].lastFoldedPlayerIdArray.push(this.id);
             console.log("lastplayer folded id when folds", Sys.Rooms[roomId].lastFoldedPlayerIdArray)
        }

        // if(this.folded ==true && this.status == 'Playing'){
        //     console.log("FOLDED")
        //      Sys.Rooms[roomId].otherData.lastFoldedPlayerId =  this.id;
        //      console.log("lastplayer folded id when folds", Sys.Rooms[roomId].otherData.lastFoldedPlayerId);
        // }

        //Attemp to progress the game
        Sys.Game.Reguler.Omaha.Controllers.PlayerProcess.progress(Sys.Rooms[roomId]);
    }

    async Bet ( roomId, bet, hasRaised) {
        var i;
        let remainingChips = this.chips - bet;
        Sys.Log.info('--------Raised amount Game Id and playerID----------- : ' + Sys.Rooms[roomId].game.id, Sys.Rooms[roomId].currentPlayer);
        Sys.Log.info('Raised amount when BET remainingChips : ' + remainingChips);
        Sys.Log.info('Raised amount when BET chips: ' + this.chips);
        Sys.Log.info('Raised amount when BET bet: ' + bet);
        Sys.Log.info('--------Raised amount Game Id----------- : ' + Sys.Rooms[roomId].game.id);
        console.log("Remaining Chips", remainingChips)
        console.log("type of", typeof(remainingChips))
        if(parseFloat(remainingChips) < 0.05){
            Sys.Log.info('-------Goinng to allin even if raised by playerid---------- : ' + Sys.Rooms[roomId].game.id, Sys.Rooms[roomId].currentPlayer);
             console.log('You don\'t have enought chips --> ALL IN amount near to zero !!!',remainingChips);
             this.AllIn(roomId,hasRaised);
        }else{
            if (eval(parseFloat(this.chips).toFixed(2) ) > eval( parseFloat( bet).toFixed(2) ) ) {

                let maxBet = parseFloat(Sys.Rooms[roomId].getMaxBet(Sys.Rooms[roomId].game.bets));
                let yourBetOld = parseFloat(Sys.Rooms[roomId].game.bets[Sys.Rooms[roomId].currentPlayer]);
               // let minRaise = (Sys.Rooms[roomId].turnBet.raisedAmount == undefined) ? 0 : Sys.Rooms[roomId].turnBet.raisedAmount;


                // myraiseAmount update @chetan
                //let myRaisedAmount = parseFloat(bet - parseFloat(maxBet - yourBetOld));
                let myRaisedAmount = 0;
                if(Sys.Rooms[roomId].game.maxBetOnRaise != 0 && Sys.Rooms[roomId].game.isUnqualifiedRaise == true){
                    myRaisedAmount = parseFloat(bet - parseFloat(Sys.Rooms[roomId].game.maxBetOnRaise - yourBetOld));
                    console.log("myRasied in player if", myRaisedAmount)
                }else{
                    myRaisedAmount = parseFloat(bet - parseFloat(maxBet - yourBetOld));
                    console.log("myRasied in player else", myRaisedAmount)
                }



                let maxBetOnRaise =  parseFloat(bet) + parseFloat(yourBetOld)
                console.log("raise flow change maxbet", maxBet,  maxBetOnRaise);

                Sys.Rooms[roomId].game.maxBetOnRaise = maxBetOnRaise;
                console.log("maxBetOnRaise amount", Sys.Rooms[roomId].game.maxBetOnRaise)



                // set roundRaisedAmount

                this.roundRaisedAmount = parseFloat( bet - (maxBet - yourBetOld) )
                console.log("*********roundRaisedAmount*********",bet, maxBet, yourBetOld, (maxBet - yourBetOld), this.roundRaisedAmount );

                // if(minRaise == 0){ // Under The Gun Player Turn.
                //     //myRaisedAmount = parseFloat(bet - yourBetOld);
                //     myRaisedAmount = parseFloat(bet - parseFloat(maxBet - yourBetOld));
                // }else{
                //     minRaise = parseFloat(parseFloat(maxBet + minRaise) - yourBetOld);
                //     //myRaisedAmount  = parseFloat((bet - minRaise) + parseFloat(maxBet - yourBetOld));
                //     myRaisedAmount  = parseFloat(bet - parseFloat(maxBet - yourBetOld));
                // }

                // add to aggressor
                if(Sys.Rooms[roomId].game.roundName == 'River'){
                    Sys.Rooms[roomId].game.aggressorIdArray.push(this.id);
                    console.log("aggressorIdArray when someone bets", Sys.Rooms[roomId].game.aggressorIdArray);
                }


                console.log("/*************************************/");
                console.log("My Raised Amount       : ",myRaisedAmount)
                console.log("Bet                    : ",bet)
                console.log("/*************************************/")

                var previousBalance = 0;
                var deductChips = parseFloat(bet);
                for (i = 0; i < Sys.Rooms[roomId].players.length; i += 1) {
                    if (this === Sys.Rooms[roomId].players[i]) {
                        var previousBalance = parseFloat(Sys.Rooms[roomId].players[i].chips);
                        Sys.Rooms[roomId].game.bets[i] = parseFloat(parseFloat(Sys.Rooms[roomId].game.bets[i])+parseFloat(bet));
                        Sys.Rooms[roomId].players[i].chips =  parseFloat(parseFloat(Sys.Rooms[roomId].players[i].chips) - parseFloat(bet));
                        // Sys.Rooms[roomId].game.pot += parseFloat(bet); // Shiv!@#

                        var afterBalance = Sys.Rooms[roomId].players[i].chips;
                        this.talked = true;
                    }
                }


                //Attemp to progress the game
                Sys.Rooms[roomId].turnBet = {action: Sys.Config.Texas.Bet, playerId: this.id, betAmount: parseFloat(bet), raisedAmount : myRaisedAmount, hasRaised: hasRaised, totalBetAmount:parseFloat(Sys.Rooms[roomId].game.bets[Sys.Rooms[roomId].currentPlayer])}
                Sys.Rooms[roomId].game.history.push({
                    "time": new Date(),
                    "playerId": this.id,
                    "playerName": this.playerName,
                    "gameRound": Sys.Rooms[roomId].game.roundName,
                    "betAmount": parseFloat( parseFloat( bet ).toFixed(4) ),
                    "totalBetAmount":  parseFloat( parseFloat( this.getTotalBet(roomId) ).toFixed(4) ),
                    "playerAction": Sys.Config.Texas.Bet,
                    "hasRaised": parseFloat( parseFloat( hasRaised ).toFixed(4) ),
                    "remaining": parseFloat( parseFloat( this.chips ).toFixed(4) )
                })

                /*var tabelId = Sys.Rooms[roomId].id;
                var tabelName = Sys.Rooms[roomId].name;
                var gameId = Sys.Rooms[roomId].game.id;
                var gameNumber = Sys.Rooms[roomId].game.gameNumber;

                let transactionData = {
                    user_id: this.id,
                    username: this.playerName,
                    gameId: gameId,
                    gameNumber: gameNumber,
                    tableId: tabelId,
                    tableName: tabelName,
                    chips: parseFloat(deductChips),
                    previousBalance: parseFloat(previousBalance),
                    afterBalance: parseFloat(afterBalance),
                    category: 'debit',
                    type: 'entry',
                    remark: 'Raise',
                    isTournament: 'Yes',
                    isGamePot: 'no'
                }
                console.log("bet player transactionData: ", transactionData);
                await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);

                var gamePortData = await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.getSingleData({isGamePot: 'yes', gameId: gameId});
                var currentTotalChips = (parseFloat(gamePortData.afterBalance) + parseFloat(deductChips));

                let transactionDataPot = {
                    user_id: this.id,
                    username: this.playerName,
                    gameId: gameId,
                    gameNumber: gameNumber,
                    tableId: tabelId,
                    tableName: tabelName,
                    chips:  parseFloat(deductChips),
                    previousBalance: parseFloat(gamePortData.afterBalance),
                    afterBalance: parseFloat(currentTotalChips),
                    category: 'credit',
                    type: 'entry',
                    remark: 'Game Pot',
                    isTournament: 'Yes',
                    isGamePot: 'yes'
                }
                await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataPot);*/
               
                Sys.Game.Reguler.Omaha.Controllers.PlayerProcess.progress(Sys.Rooms[roomId]);
            } else {
                console.log('You don\'t have enought chips --> ALL IN !!!');
                this.AllIn(roomId,hasRaised);
            }
        }
    }

    async Call ( roomId, hasRaised) {
        let maxBet, i, playerRemainChips = 0;
        // let roomData = Sys.Game.CashGame.Omaha.Services.RoomServices.get(roomId.id)
       console.log("bets :",Sys.Rooms[roomId].game.bets)
        maxBet =  parseFloat(this.getMaxBet(Sys.Rooms[roomId].game.bets));

        // Shiv!@#
        for (i = 0; i < Sys.Rooms[roomId].players.length; i += 1) {
            if (this === Sys.Rooms[roomId].players[i]) {
                if (Sys.Rooms[roomId].game.bets[i] >= 0) {
                   playerRemainChips = maxBet - parseFloat(Sys.Rooms[roomId].game.bets[i]);
                }
            }
        }

        var previousBalance = 0;
        if (this.chips > playerRemainChips) { // Shiv!@#
            //Match the highest bet
            // var oldBet = 0;
            for (i = 0; i < Sys.Rooms[roomId].players.length; i += 1) {
                if (this === Sys.Rooms[roomId].players[i]) {
                    // if (Sys.Rooms[roomId].game.bets[i] >= 0) {
                    //     oldBet = parseFloat(Sys.Rooms[roomId].game.bets[i]);
                    //     //this.chips = parseFloat(parseFloat(this.chips) + parseFloat(Sys.Rooms[roomId].game.bets[i]));// Shiv!@#
                    // }
                    var previousBalance = this.chips;
                    this.chips = parseFloat(parseFloat(this.chips) - parseFloat(playerRemainChips));// Shiv!@#
                    // Sys.Rooms[roomId].game.pot += parseFloat(maxBet); // Shiv!@#
                    Sys.Rooms[roomId].game.bets[i] = parseFloat(maxBet);
                    this.talked = true;
                    console.log('If is setis fy in call',maxBet, playerRemainChips)

                    // check for roundRaisedAmount if player calls on raised amount
                    this.roundRaisedAmount = ( Sys.Rooms[roomId].turnBet.raisedAmount == undefined) ? 0 :  Sys.Rooms[roomId].turnBet.raisedAmount;
                    console.log("roundRaiseAmount in call", this.roundRaisedAmount)
                }
            }


            //Attemp to progress the game
            //Shiv!@# maxBet-oldBet
            let oldRaisedAmount = Sys.Rooms[roomId].turnBet.raisedAmount;
            Sys.Rooms[roomId].turnBet = {action: Sys.Config.Texas.Call, playerId: this.id, betAmount: parseFloat(playerRemainChips), raisedAmount : oldRaisedAmount, hasRaised: hasRaised, totalBetAmount:parseFloat(Sys.Rooms[roomId].game.bets[Sys.Rooms[roomId].currentPlayer])}
            Sys.Rooms[roomId].game.history.push({
                "time": new Date(),
                "playerId": this.id,
                "playerName": this.playerName,
                "gameRound": Sys.Rooms[roomId].game.roundName,
                "betAmount": parseFloat( parseFloat( playerRemainChips ).toFixed(4) ),  //Shiv!@#  maxBet-oldBet,
                "totalBetAmount": parseFloat( parseFloat( this.getTotalBet(roomId) ).toFixed(4) ),
                "playerAction": Sys.Config.Texas.Call,
                "hasRaised": parseFloat( parseFloat( hasRaised).toFixed(4) ),
                "remaining": parseFloat( parseFloat(this.chips).toFixed(4) )
            })

           /* var tabelId = Sys.Rooms[roomId].id;
            var tabelName = Sys.Rooms[roomId].name;
            var gameId = Sys.Rooms[roomId].game.id;
            var gameNumber = Sys.Rooms[roomId].game.gameNumber;

            let transactionData = {
                user_id: this.id,
                username: this.playerName,
                gameId: gameId,
                gameNumber: gameNumber,
                tableId: tabelId,
                tableName: tabelName,
                chips: parseFloat(playerRemainChips),
                previousBalance: parseFloat(previousBalance),
                afterBalance: parseFloat(this.chips),
                category: 'debit',
                type: 'entry',
                remark: 'Call',
                isTournament: 'Yes',
                isGamePot: 'no'
            }
            console.log("omaha tournament call player transactionData: ", transactionData);
            await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionData);

            var gamePortData = await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.getSingleData({isGamePot: 'yes', gameId: gameId});
            var currentTotalChips = (parseFloat(gamePortData.afterBalance) + parseFloat(playerRemainChips));

            let transactionDataPot = {
                user_id: this.id,
                username: this.playerName,
                gameId: gameId,
                gameNumber: gameNumber,
                tableId: tabelId,
                tableName: tabelName,
                chips:  parseFloat(playerRemainChips),
                previousBalance: parseFloat(gamePortData.afterBalance),
                afterBalance: parseFloat(currentTotalChips),
                category: 'credit',
                type: 'entry',
                remark: 'Game Pot',
                isTournament: 'Yes',
                isGamePot: 'yes'
            }
            console.log("omaha tournament call player transactionDataPot: ", transactionDataPot);
            await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataPot);*/
            
            Sys.Game.Reguler.Omaha.Controllers.PlayerProcess.progress(Sys.Rooms[roomId]);
        } else {
            console.log('You don\'t have enought chips -->(CALL) ALL IN !!!');
            this.AllIn(roomId, hasRaised);
        }
    }

    async AllIn ( roomId, hasRaised) {
        console.log('All IN called',hasRaised);
        var i, allInValue=0,myRaisedAmount = 0;
       // console.log("this ->",this);
       let maxBet =  parseFloat(this.getMaxBet(Sys.Rooms[roomId].game.bets));
       let yourBetOld = parseFloat(Sys.Rooms[roomId].game.bets[Sys.Rooms[roomId].currentPlayer]);
        // let roomData = Sys.Game.CashGame.Omaha.Services.RoomServices.get(roomId.id)
        for (i = 0; i < Sys.Rooms[roomId].players.length; i += 1) {
            if (this === Sys.Rooms[roomId].players[i]) {
                if (Sys.Rooms[roomId].players[i].chips !== 0) {
                  allInValue = parseFloat(Sys.Rooms[roomId].players[i].chips);
                  //console.log("allInValue->",allInValue);
                  //console.log("Sys.Rooms[roomId].game.bets[i] ->",Sys.Rooms[roomId].game.bets[i]);
                  // Sys.Rooms[roomId].game.pot += parseFloat(Sys.Rooms[roomId].players[i].chips); // Shiv!@#
                  Sys.Rooms[roomId].game.bets[i] += parseFloat(Sys.Rooms[roomId].players[i].chips);
                  Sys.Rooms[roomId].players[i].chips = 0;
                 // console.log("Sys.Rooms[roomId].game.bets[i] ->",Sys.Rooms[roomId].game.bets[i]);
                  this.allIn = true;
                  this.talked = true;

                  if(hasRaised == true){
                    myRaisedAmount = parseFloat(allInValue - parseFloat(maxBet - yourBetOld));
                    console.log("myRaisedAmount in player if", myRaisedAmount)

                    let maxBetOnRaise =  parseFloat(allInValue) + parseFloat(yourBetOld)
                    console.log("raise flow change maxbetONRAISE when all in through raise",  maxBetOnRaise);
                    Sys.Rooms[roomId].game.maxBetOnRaise = maxBetOnRaise;

                    // add to aggressor
                    if(Sys.Rooms[roomId].game.roundName == 'River'){
                    Sys.Rooms[roomId].game.aggressorIdArray.push(this.id);
                        console.log("aggressorIdArray when someone bets", Sys.Rooms[roomId].game.aggressorIdArray);
                    }
                  }else{
                    myRaisedAmount = Sys.Rooms[roomId].turnBet.raisedAmount;
                    console.log("myRaisedAmount in player else", myRaisedAmount)
                    // unqualified raise
                     Sys.Rooms[roomId].game.isUnqualifiedRaise =true;
                     console.log("isUnqualified in player", Sys.Rooms[roomId].game.isUnqualifiedRaise)
                  }
              }
            }
        }

        Sys.Rooms[roomId].turnBet = {action: Sys.Config.Texas.AllIn, playerId: this.id, betAmount: parseFloat(allInValue), raisedAmount : myRaisedAmount, hasRaised: hasRaised, totalBetAmount:parseFloat(Sys.Rooms[roomId].game.bets[Sys.Rooms[roomId].currentPlayer])}
        Sys.Rooms[roomId].game.history.push({
            "time": new Date(),
            "playerId": this.id,
            "playerName": this.playerName,
            "gameRound": Sys.Rooms[roomId].game.roundName,
            "betAmount": parseFloat( parseFloat( allInValue ).toFixed(4) ),
            "totalBetAmount": parseFloat( parseFloat( this.getTotalBet(roomId) ).toFixed(4) ),
            "playerAction": Sys.Config.Texas.AllIn,
            "hasRaised": parseFloat( parseFloat( hasRaised ).toFixed(4) ),
            "remaining": parseFloat( parseFloat(this.chips).toFixed(4) )
        })

        /*var tabelId = Sys.Rooms[roomId].id;
        var tabelName = Sys.Rooms[roomId].name;
        var gameId = Sys.Rooms[roomId].game.id;
        var gameNumber = Sys.Rooms[roomId].game.gameNumber;

        let transactionAllInData = {
            user_id: this.id,
            username: this.playerName,
            gameId: gameId,
            gameNumber: gameNumber,
            tableId: tabelId,
            tableName: tabelName,
            chips: parseFloat(allInValue),
            previousBalance: parseFloat(allInValue),
            afterBalance: parseFloat(0),
            category: 'debit',
            type: 'entry',
            remark: 'All In',
            isTournament: 'Yes',
            isGamePot: 'no'
        }
        console.log("omaha tournament all in player transactionAllInData: ", transactionAllInData);
        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionAllInData);

        var gamePortData = await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.getSingleData({isGamePot: 'yes', gameId: gameId});
        var currentTotalChips = (parseFloat(gamePortData.afterBalance) + parseFloat(allInValue));

        let transactionDataPot = {
            user_id: this.id,
            username: this.playerName,
            gameId: gameId,
            gameNumber: gameNumber,
            tableId: tabelId,
            tableName: tabelName,
            chips:  parseFloat(allInValue),
            previousBalance: parseFloat(gamePortData.afterBalance),
            afterBalance: parseFloat(currentTotalChips),
            category: 'credit',
            type: 'entry',
            remark: 'Game Pot',
            isTournament: 'Yes',
            isGamePot: 'yes'
        }
        await Sys.Game.CashGame.Texas.Services.PlayerAllTransectionService.createTransaction(transactionDataPot);*/
                    
        Sys.Game.Reguler.Omaha.Controllers.PlayerProcess.progress(Sys.Rooms[roomId]);
    }

    getTotalBet (roomId) {
      // let Sys.Rooms[roomId.id] = Sys.Game.Reguler.Omaha.Services.RoomServices.get(roomId.id)
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
