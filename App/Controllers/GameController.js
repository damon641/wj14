var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');
const moment = require('moment');
const mongoose = require('mongoose');
module.exports = {

  game: async function (req, res) {
    try {
      var data = {
        App: Sys.Config.App.details,
        Agent: req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        cashGameHistoryActive: 'active',
        type: 'normal',
        tableType: 'texas'
      };
      return res.render('cashGame/poker-texas/gameHistory', data);
    } catch (e) {
      console.log("Error", e);
    }
  },

  gameHistory: async function (req, res) {
    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;
      let val = 'PCG';
      let query = {};
      if (search != '') {
        let capital = search;
        query = {
          gameNumber: {
            $regex: '.*' + val + '.*'
          },
          gameNumber: {
            $regex: '.*' + search + '.*'
          }
        };
      } else {
        query = {
          gameNumber: {
            $regex: '.*' + val + '.*'
          }
        };
      }

      let gameCount = await Sys.App.Services.GameService.getGameCount(query);
      //let gameCount = gameC.length;
      let data = await Sys.App.Services.GameService.getGameDatatable(query, length, start);
      var obj = {
        'draw': req.query.draw,
        'recordsTotal': gameCount,
        'recordsFiltered': gameCount,
        'data': data
      };
      res.send(obj);
    } catch (e) {
      console.log("Error", e);
    }
  },

  tableHistory: async function (req, res) {
    try {
      // let game = await load('App/Models/Game').findOne({id : req.params.id});
      let game = await Sys.App.Services.GameService.getSingleGameData({
        _id: req.params.id
      });
      let allPlayer = game.players;
      let gameHistory = game.players;
      let history = game.history;
      let winner = game.winners;
      let count = 0;

      for (var j = 0; j < allPlayer.length; j++) {
        allPlayer[j].count = count = count + 1;
        for (var k = 0; k < allPlayer[j].cards.length; k++) {
          allPlayer[j].cards[k] = '<img src="/card/' + allPlayer[j].cards[k].toUpperCase() + '.png" width="70px">';
        }
      }

      for (var w = 0; w < winner.length; w++) {
        winner[w].count = count = count + 1;
        for (var wk = 0; wk < winner[w].hand.length; wk++) {
          winner[w].hand[wk] = '<img src="/card/' + winner[w].hand[wk].toUpperCase() + '.png" width="70px">';
        }
      }

      for (var h = 0; h < history; h++) {
        history[h].history = history[h].history;
      }

      for (var d = 0; d < game.deck.length; d++) {
        game.deck[d] = '<img src="/card/' + game.deck[d].toUpperCase() + '.png" width="70px">&nbsp;&nbsp;';
      }

      return res.render('cashGame/poker-texas/tableHistory', {
        players: allPlayer,
        gameHistory: gameHistory,
        winners: winner,
        games: game,
        historys: history
      });
    } catch (e) {
      console.log("Error", e);
    }
  },

  gameOmaha: async function (req, res) {
    try {
      var data = {
        App: Sys.Config.App.details,
        Agent: req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        cashOmActive: 'active',
        type: 'normal',
        tableType: 'omaha'
      };
      return res.render('cashGame/poker-omaha/gameHistory', data);
    } catch (e) {
      console.log("Error", e);
    }
  },

  getGameHistory: async function (req, res) {
    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;
      let val = 'POG';
      let query = {};
      if (search != '') {
        let capital = search;
        query = {
          gameNumber: {
            $regex: '.*' + val + '.*'
          },
          gameNumber: {
            $regex: '.*' + search + '.*'
          }
        };
      } else {
        query = {
          gameNumber: {
            $regex: '.*' + val + '.*'
          }
        };
      }

      let gameCount = await Sys.App.Services.GameService.getGameCount(query);
      //let gameCount = gameC.length;
      let data = await Sys.App.Services.GameService.getGameDatatable(query, length, start);

      var obj = {
        'draw': req.query.draw,
        'recordsTotal': gameCount,
        'recordsFiltered': gameCount,
        'data': data
      };
      res.send(obj);
    } catch (e) {
      console.log("Error", e);
    }
  },

  getTableHistoryOmaha: async function (req, res) {
    try {
      // let game = await load('App/Models/Game').findOne({id : req.params.id});
      let game = await Sys.App.Services.GameService.getSingleGameData({
        _id: req.params.id
      });
      let allPlayer = game.players;
      let gameHistory = game.players;
      let history = game.history;
      let winner = game.winners;
      let count = 0;

      for (var j = 0; j < allPlayer.length; j++) {
        allPlayer[j].count = count = count + 1;
        for (var k = 0; k < allPlayer[j].cards.length; k++) {
          allPlayer[j].cards[k] = '<img src="/card/' + allPlayer[j].cards[k].toUpperCase() + '.png" width="70px">';
        }
      }

      for (var w = 0; w < winner.length; w++) {
        winner[w].count = count = count + 1;
        for (var wk = 0; wk < winner[w].hand.length; wk++) {
          winner[w].hand[wk] = '<img src="/card/' + winner[w].hand[wk].toUpperCase() + '.png" width="70px">';
        }
      }

      for (var h = 0; h < history; h++) {
        history[h].history = history[h].history;
      }

      for (var d = 0; d < game.deck.length; d++) {
        game.deck[d] = '<img src="/card/' + game.deck[d].toUpperCase() + '.png" width="70px">&nbsp;&nbsp;';
      }

      return res.render('cashGame/poker-omaha/tableHistory', {
        players: allPlayer,
        gameHistory: gameHistory,
        winners: winner,
        games: game,
        historys: history
      });
    } catch (e) {
      console.log("Error", e)
    }
  },

  /**
   * Sit & Go Tournament
   */
  texasGameHistorySitGo: async function (req, res) {
    try {
      var data = {
        App: Sys.Config.App.details,
        Agent: req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        sitTexActive: 'active',
        type: 'sitgo',
        tableType: 'texas'
      };
      return res.render('sitGoTournament/poker-texas/gameHistory', data);
    } catch (e) {
      console.log("Error", e);
    }
  },

  gameHistorySitGo: async function (req, res) {
    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;
      let val = 'PCG';
      let query = {};
      if (search != '') {
        let capital = search;
        query = {
          gameNumber: {
            $regex: '.*' + val + '.*'
          },
          gameNumber: {
            $regex: '.*' + search + '.*'
          }
        };
      } else {
        query = {
          gameNumber: {
            $regex: '.*' + val + '.*'
          }
        };
      }

      let gameCount = await Sys.App.Services.GameService.getGameCount(query);
      //let gameCount = gameC.length;
      let data = await Sys.App.Services.GameService.getGameDatatable(query, length, start);
      var obj = {
        'draw': req.query.draw,
        'recordsTotal': gameCount,
        'recordsFiltered': gameCount,
        'data': data
      };
      res.send(obj);
    } catch (e) {
      console.log("Error", e);
    }
  },

  tableHistorySitGo: async function (req, res) {
    try {
      // let game = await load('App/Models/Game').findOne({id : req.params.id});
      let game = await Sys.App.Services.GameService.getSingleGameData({
        _id: req.params.id
      });
      let allPlayer = game.players;
      let gameHistory = game.players;
      let history = game.history;
      let winner = game.winners;
      let count = 0;

      for (var j = 0; j < allPlayer.length; j++) {
        allPlayer[j].count = count = count + 1;
        for (var k = 0; k < allPlayer[j].cards.length; k++) {
          allPlayer[j].cards[k] = '<img src="/card/' + allPlayer[j].cards[k].toUpperCase() + '.png" width="70px">';
        }
      }

      for (var w = 0; w < winner.length; w++) {
        winner[w].count = count = count + 1;
        for (var wk = 0; wk < winner[w].hand.length; wk++) {
          winner[w].hand[wk] = '<img src="/card/' + winner[w].hand[wk].toUpperCase() + '.png" width="70px">';
        }
      }

      for (var h = 0; h < history; h++) {
        history[h].history = history[h].history;
      }

      for (var d = 0; d < game.deck.length; d++) {
        game.deck[d] = '<img src="/card/' + game.deck[d].toUpperCase() + '.png" width="70px">&nbsp;&nbsp;';
      }

      return res.render('cashGame/poker-texas/tableHistory', {
        players: allPlayer,
        gameHistory: gameHistory,
        winners: winner,
        games: game,
        historys: history
      });
    } catch (e) {
      console.log("Error", e);
    }
  },

  gameHistoryOmahaSitGo: async function (req, res) {
    try {
      var data = {
        App: Sys.Config.App.details,
        Agent: req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        gameHistoryActive: 'active',
        type: 'normal',
        tableType: 'omaha'
      };
      return res.render('cashGame/poker-omaha/gameHistory', data);
    } catch (e) {
      console.log("Error", e);
    }
  },

  getGameHistorySitGo: async function (req, res) {
    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;
      let val = 'POG';
      let query = {};
      if (search != '') {
        let capital = search;
        query = {
          gameNumber: {
            $regex: '.*' + val + '.*'
          },
          gameNumber: {
            $regex: '.*' + search + '.*'
          }
        };
      } else {
        query = {
          gameNumber: {
            $regex: '.*' + val + '.*'
          }
        };
      }

      let gameCount = await Sys.App.Services.GameService.getGameCount(query);
      //let gameCount = gameC.length;
      let data = await Sys.App.Services.GameService.getGameDatatable(query, length, start);

      var obj = {
        'draw': req.query.draw,
        'recordsTotal': gameCount,
        'recordsFiltered': gameCount,
        'data': data
      };
      res.send(obj);
    } catch (e) {
      console.log("Error", e);
    }
  },

  getTableHistoryOmahaSitGo: async function (req, res) {
    try {
      // let game = await load('App/Models/Game').findOne({id : req.params.id});
      let game = await Sys.App.Services.GameService.getSingleGameData({
        _id: req.params.id
      });
      let allPlayer = game.players;
      let gameHistory = game.players;
      let history = game.history;
      let winner = game.winners;
      let count = 0;

      for (var j = 0; j < allPlayer.length; j++) {
        allPlayer[j].count = count = count + 1;
        for (var k = 0; k < allPlayer[j].cards.length; k++) {
          allPlayer[j].cards[k] = '<img src="/card/' + allPlayer[j].cards[k].toUpperCase() + '.png" width="70px">';
        }
      }

      for (var w = 0; w < winner.length; w++) {
        winner[w].count = count = count + 1;
        for (var wk = 0; wk < winner[w].hand.length; wk++) {
          winner[w].hand[wk] = '<img src="/card/' + winner[w].hand[wk].toUpperCase() + '.png" width="70px">';
        }
      }

      for (var h = 0; h < history; h++) {
        history[h].history = history[h].history;
      }

      for (var d = 0; d < game.deck.length; d++) {
        game.deck[d] = '<img src="/card/' + game.deck[d].toUpperCase() + '.png" width="70px">&nbsp;&nbsp;';
      }

      return res.render('cashGame/poker-omaha/tableHistory', {
        players: allPlayer,
        gameHistory: gameHistory,
        winners: winner,
        games: game,
        historys: history
      });
    } catch (e) {
      console.log("Error", e);
    }
  },

  /**
    Regular Tournament
  **/
  gameRegularTou: async function (req, res) {
    try {
      var data = {
        App: Sys.Config.App.details,
        Agent: req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        regulayActiveHi: 'active',
        sitActive: 'active',
        type: 'normal',
        tableType: 'texas'
      };
      return res.render('cashGame/poker-texas/gameHistory', data);
    } catch (e) {
      console.log("Error", e);
    }
  },

  gameHistoryRegularTou: async function (req, res) {
    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;
      let val = 'PCG';
      let query = {};
      if (search != '') {
        let capital = search;
        query = {
          gameNumber: {
            $regex: '.*' + val + '.*'
          },
          gameNumber: {
            $regex: '.*' + search + '.*'
          }
        };
      } else {
        query = {
          gameNumber: {
            $regex: '.*' + val + '.*'
          }
        };
      }

      let gameCount = await Sys.App.Services.GameService.getGameCount(query);
      //let gameCount = gameC.length;
      let data = await Sys.App.Services.GameService.getGameDatatable(query, length, start);
      var obj = {
        'draw': req.query.draw,
        'recordsTotal': gameCount,
        'recordsFiltered': gameCount,
        'data': data
      };
      res.send(obj);
    } catch (e) {
      console.log("Error", e);
    }
  },

  tableHistoryRegularTou: async function (req, res) {
    try {
      // let game = await load('App/Models/Game').findOne({id : req.params.id});
      let game = await Sys.App.Services.GameService.getSingleGameData({
        _id: req.params.id
      });
      let allPlayer = game.players;
      let gameHistory = game.players;
      let history = game.history;
      let winner = game.winners;
      let count = 0;

      for (var j = 0; j < allPlayer.length; j++) {
        allPlayer[j].count = count = count + 1;
        for (var k = 0; k < allPlayer[j].cards.length; k++) {
          allPlayer[j].cards[k] = '<img src="/card/' + allPlayer[j].cards[k].toUpperCase() + '.png" width="70px">';
        }
      }

      for (var w = 0; w < winner.length; w++) {
        winner[w].count = count = count + 1;
        for (var wk = 0; wk < winner[w].hand.length; wk++) {
          winner[w].hand[wk] = '<img src="/card/' + winner[w].hand[wk].toUpperCase() + '.png" width="70px">';
        }
      }

      for (var h = 0; h < history; h++) {
        history[h].history = history[h].history;
      }

      for (var d = 0; d < game.deck.length; d++) {
        game.deck[d] = '<img src="/card/' + game.deck[d].toUpperCase() + '.png" width="70px">&nbsp;&nbsp;';
      }

      return res.render('cashGame/poker-texas/tableHistory', {
        players: allPlayer,
        gameHistory: gameHistory,
        winners: winner,
        games: game,
        historys: history
      });
    } catch (e) {
      console.log("Error", e);
    }
  },

  gameOmahaRegularTou: async function (req, res) {
    try {
      var data = {
        App: Sys.Config.App.details,
        Agent: req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        regulayOmahaActiveHi: 'active',
        type: 'normal',
        tableType: 'omaha'
      };
      return res.render('cashGame/poker-omaha/gameHistory', data);
    } catch (e) {
      console.log("Error", e);
    }
  },

  getGameHistoryRegularTou: async function (req, res) {
    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;
      let val = 'POG';
      let query = {};
      if (search != '') {
        let capital = search;
        query = {
          gameNumber: {
            $regex: '.*' + val + '.*'
          },
          gameNumber: {
            $regex: '.*' + search + '.*'
          }
        };
      } else {
        query = {
          gameNumber: {
            $regex: '.*' + val + '.*'
          }
        };
      }

      let gameCount = await Sys.App.Services.GameService.getGameCount(query);
      //let gameCount = gameC.length;
      let data = await Sys.App.Services.GameService.getGameDatatable(query, length, start);

      var obj = {
        'draw': req.query.draw,
        'recordsTotal': gameCount,
        'recordsFiltered': gameCount,
        'data': data
      };
      res.send(obj);
    } catch (e) {
      console.log("Error", e);
    }
  },

  getTableHistoryOmahaRegularTou: async function (req, res) {
    try {
      // let game = await load('App/Models/Game').findOne({id : req.params.id});
      let game = await Sys.App.Services.GameService.getSingleGameData({
        _id: req.params.id
      });
      let allPlayer = game.players;
      let gameHistory = game.players;
      let history = game.history;
      let winner = game.winners;
      let count = 0;

      for (var j = 0; j < allPlayer.length; j++) {
        allPlayer[j].count = count = count + 1;
        for (var k = 0; k < allPlayer[j].cards.length; k++) {
          allPlayer[j].cards[k] = '<img src="/card/' + allPlayer[j].cards[k].toUpperCase() + '.png" width="70px">';
        }
      }

      for (var w = 0; w < winner.length; w++) {
        winner[w].count = count = count + 1;
        for (var wk = 0; wk < winner[w].hand.length; wk++) {
          winner[w].hand[wk] = '<img src="/card/' + winner[w].hand[wk].toUpperCase() + '.png" width="70px">';
        }
      }

      for (var h = 0; h < history; h++) {
        history[h].history = history[h].history;
      }

      for (var d = 0; d < game.deck.length; d++) {
        game.deck[d] = '<img src="/card/' + game.deck[d].toUpperCase() + '.png" width="70px">&nbsp;&nbsp;';
      }

      return res.render('cashGame/poker-omaha/tableHistory', {
        players: allPlayer,
        gameHistory: gameHistory,
        winners: winner,
        games: game,
        historys: history
      });
    } catch (e) {
      console.log("Error", e);
    }
  },

  allGameHistoryLimited: async function (req, res) {
    try {
      let game = await Sys.App.Services.GameService.getLimitedGame({});

      for (var m = 0; m < game.length; m++) {
        let dt = new Date(game[m].updatedAt);
        game[m].createdAtFormated = moment(dt).format('YYYY/MM/DD');
      }
      var obj = {
        'draw': req.query.draw,
        'data': game
      };
      res.send(obj);
    } catch (e) {
      console.log(e);
    }
  },

  allGameData: async function (req, res) {
    try {
      var data = {
        App: Sys.Config.App.details,
        Agent: req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        allGameHistory: 'active',
      };
      return res.render('game/game', data);
    } catch (e) {
      console.log("Error", e);
    }
  },

  getAllGameData: async function (req, res) {
    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let defaultEndDate = moment();
      let defaultStartDate = moment().subtract(24, 'hours');
      let search = req.query.search ? req.query.search.value : '';
      let type = req.query.type;
      let query = {createdAt: {
        $gte: new Date(defaultStartDate),
        $lt: new Date(defaultEndDate)
      },isTournamentTable:(type === 'true')};
      if (search != '') {
        query = {
          gameNumber: {
            $regex: '.*' + search + '.*'
          },isTournamentTable:(type === 'true')
        };
      }

      if (req.query.is_date_search == "yes" && search == '') {
        query = {
          createdAt: {
            $gte: req.query.start_date,
            $lt: req.query.end_date
          },isTournamentTable:(type === 'true')
        };
      }
      if (req.query.is_date_search == "yes" && search != '') {
        query = {
          gameNumber: {
            $regex: '.*' + search + '.*'
          },
          createdAt: {
            $gte: req.query.start_date,
            $lt: req.query.end_date
          },isTournamentTable:(type === 'true')
        };
      }
      let column = ['gameNumber', 'roomId', 'tableName', 'smallBlind', 'bigBlind', 'status', 'pot', 'createdAt'];
      let gameCount = await Sys.App.Services.GameService.getGameCount(query);
      let data = await Sys.App.Services.GameService.getAllGameDataTable(query, length, start, column);
      let tableName;
      // for (let i = 0; i < data.length; i++) { 
      //   if(data[i].isTournamentTable == false){
      //     tableName = await Sys.App.Services.RoomServices.getRoomDataColumns({_id:data[i].roomId},['name']);
      //   }else{
      //     if(data[i].tournamentType == 'regular'){
      //       tableName = await Sys.App.Services.TournamentServices.getTourDataColumns({_id:data[i].tournament},['name']);
      //     }else{
      //       tableName = await Sys.App.Services.sngTournamentServices.getSngTourDataColumns({_id:data[i].tournament},['name']);
      //     }
         
      //   }
      //   data[i]['tableName'] = (tableName.length > 0) ? tableName[0].name : '-';  
      // }
      var obj = {
        'draw': req.query.draw,
        'recordsTotal': gameCount,
        'recordsFiltered': gameCount,
        'data': data
      };
      res.send(obj);
    } catch (e) {
      console.log(e);
    }
  },
  rackDistribution: async function (req) {
    try {

    } catch (e) {
      console.log("Error in rackDistribution", e);
      return null;
    }
  },

  allGameHistory: async function (req, res) {
    try {
      let game = await Sys.App.Services.GameService.getSingleGameData({gameNumber:req.params.id});
      if (!game){
         game = await Sys.App.Services.GameService.getSingleGameData({_id:mongoose.Types.ObjectId(req.params.id)});
      }
      let dt = moment(new Date(game.createdAt)).format('YYYY/MM/DD,h:mm:ss a');
      let startTime = moment(game.createdAt);
      let endTime = moment(game.updatedAt);
      var duration = endTime.diff(startTime, 'minutes', true);
      let gameDates = {
        createdAt: dt,
        updatedAt: moment(new Date(game.updatedAt)).format('YYYY/MM/DD,h:mm:ss a'),
        gameDuration: duration.toFixed(2)
      }
      let allPlayer = game.players;
      let gameHistory = game.players;
      let history = game.history;
      let winner = game.winners;
      let totalBet = 0;
      let remaining_Chips = 0
      let distribution = []
      let AgentsRole = []
      //start code vatsal
      var totalRackOfTheGame = 0;

      let totalBetAmount = game.roundBets.reduce((a, b) => a + b, 0)
      if(!game.rakeCap.length){
      
        game.roundBets.map( bet =>{ 
        totalBet = bet ?  parseFloat(parseFloat(bet).toFixed(2)) + parseFloat(parseFloat( totalBet ).toFixed(4)): parseFloat(totalBet)
        })        
        totalRackOfTheGame=eval(parseFloat((parseFloat(totalBet) * parseFloat(game.rakePercenage)) / 100).toFixed(4));
    }else{
      totalRackOfTheGame=game.rakeCap[0].totalRackOfGame;
    }
       let RackDeductions = []
      totalBet = 0; 
      let totalRake = 0;
      let totalPot = {
        name: "Total Game Pot",
        action: "Pot",
        type: "Deposit",
        chips: game.pot
      }
      remaining_Chips = parseFloat(remaining_Chips + game.pot)
      distribution.push(totalPot);
      for (let index = 0; index < game.players.length; index++) {
        let player = {};
        player.playerName = game.players[index].playerName;
        player.bets = game.roundBets[index] ? parseFloat(game.roundBets[index]).toFixed(4) : "-"
        totalBet = player.bets && player.bets != '-' ? parseFloat(player.bets) + totalBet : totalBet
        player.plrRake = game.rakeDistribution.length ? game.roundBets[index] ? parseFloat(game.roundBets[index] / totalBetAmount * totalRackOfTheGame).toFixed(2) : " " : " "
        totalRake = game.rakeDistribution.length && game.roundBets[index] ? parseFloat(player.plrRake) + totalRake : totalRake
        player.agentRake = []
        // let rackData ={}  
        game.rakeDistribution.map(rakeDistribution => {
          let rackData = {}
          if (rakeDistribution.playerId == game.players[index].id && !rakeDistribution.adminChips) {
            rackData.name = rakeDistribution.email
            rackData.rackTo = parseFloat(rakeDistribution.totalRake).toFixed(4)
            rackData.role = rakeDistribution.role
            rackData.rackPercent = rakeDistribution.rackPercent
            player.agentRake.push(rackData)
          }
          AgentsRole.push({
            role: rakeDistribution.role,
            level: rakeDistribution.level
          })
        })

        RackDeductions.push(player)
      }




      let result = [];
      let map = new Map();
      for (const item of AgentsRole) {
        if (!map.has(item.level)) {
          map.set(item.level, true); // set any value to Map
          result.push({
            level: item.level,
            role: item.role
          });
        }
      }
      result.sort(function (a, b) {
        return a.level - b.level
      })
      console.log(result);


      game.rakeDistribution.map(rakeDistribution => {
        if (rakeDistribution.adminChips == true) {
          let player = {
            playerName: rakeDistribution.playerId,
            plrRake: parseFloat(rakeDistribution.totalRake).toFixed(4),
            agentRake: [{
              name: "admin",
              rackTo: parseFloat(rakeDistribution.totalRake).toFixed(4),
              role: "admin",
              rackPercent: rakeDistribution.rackPercent
            }],
          }
          RackDeductions.push(player)
          totalRake += parseFloat(rakeDistribution.totalRake)
        }
      })


      //vatsal code end
      for (var j = 0; j < allPlayer.length; j++) {
        //allPlayer[j].count = count = count + 1;
        for (var k = 0; k < allPlayer[j].cards.length; k++) {
          allPlayer[j].cards[k] = '<img src="/card/' + allPlayer[j].cards[k].toUpperCase() + '.png" width="50px">';
        }
      }
      for (var w = 0; w < winner.length; w++) {
        //winner[w].count = count = count + 1;
        let winnerChips = {
          name: "winner Chips " + winner[w].playerName,
          action: "Winner",
          type: "Deduct",
          chips: parseFloat(winner[w].amount - winner[w].rackAmount)
        }
        remaining_Chips = parseFloat(remaining_Chips - parseFloat(winner[w].amount - winner[w].rackAmount))

        distribution.push(winnerChips);
        for (var wk = 0; wk < winner[w].hand.length; wk++) {
          winner[w].hand[wk] = '<img src="/card/' + winner[w].hand[wk].toUpperCase() + '.png" width="50px">';
        }
      }

      for (var d = 0; d < history.length; d++) {
        if (history[d].boardCard != null) {
          if (history[d].playerAction == 10) {
            let TotalRake = {
              name: "Revert Chips " + history[d].playerName,
              action: "Revert",
              type: "Deduct",
              chips: parseFloat(history[d].totalPot).toFixed(4) - parseFloat(totalBet).toFixed(4)
            }
            remaining_Chips = parseFloat(remaining_Chips).toFixed(4) - parseFloat(history[d].totalPot - totalBet).toFixed(4)
            distribution.push(TotalRake);

            if (!winner.length) {
              let TotalRake = {
                name: "Winner Chips " + history[d].playerName,
                action: "Winner",
                type: "Deduct",
                chips: parseFloat(history[d].totalPot - parseFloat(history[d].totalPot - totalBet) - totalRake)
              }
              remaining_Chips = parseFloat(remaining_Chips - parseFloat(history[d].totalPot - parseFloat(history[d].totalPot - totalBet) - totalRake))
              distribution.push(TotalRake);
            }
          }
          history[d].totalPotValue = d != 0 ? history[d].playerAction == 10 ? parseFloat(history[d - 1].totalPotValue) : parseFloat(parseFloat(history[d - 1].totalPotValue) + parseFloat(history[d].betAmount)).toFixed(2) : parseFloat(history[d].betAmount)
          for (let l = 0; l < history[d].boardCard.length; l++) {
            history[d].boardCard[l] = '<img src="/card/' + history[d].boardCard[l].toUpperCase() + '.png" width="50px">&nbsp;&nbsp;';
          }
        }

        // let RevertChips={name:"revert "+winner[w].playerName , action:"revert ", type:"deduct",chips:parseFloat(winner[w].amount -winner[w].rackAmount)}
        // distribution.push(winnerChips);          
      }



      // for (var d = 0; d < game.deck.length; d++) {
      //   game.deck[d] = '<img src="/card/' + game.deck[d].toUpperCase() + '.png" width="50px">&nbsp;&nbsp;';
      // }

      for (var d = 0; d < game.board.length; d++) {
        game.board[d] = '<img src="/card/' + game.board[d].toUpperCase() + '.png" width="50px">&nbsp;&nbsp;';
      }
      for (var d = 0; d < game.winners.length; d++) {
        if (game.winners[d].bestCards != null) {
          for (let l = 0; l < game.winners[d].bestCards.length; l++) {
            game.winners[d].bestCards[l] = '<img src="/card/' + game.winners[d].bestCards[l].toUpperCase() + '.png" width="50px">&nbsp;&nbsp;';
          }
        }
      }
      if (totalRake) {
        let totalRakeData = {
          name: "Rake Chips",
          action: "Rake",
          type: "Deduct",
          chips: totalRake
        }
        remaining_Chips = parseFloat(remaining_Chips - totalRake)
        distribution.push(totalRakeData);
      }

      return res.render('game/gameHistory', {
        players: allPlayer,
        Agent: req.session.details,
        gameHistory: gameHistory,
        winners: winner,
        games: game,
        distribution: distribution,
        RackDeduction: RackDeductions,
        historys: history,
        gameDates: gameDates,
        AgentsRole: result,
        totalBet: totalBet != 0 ? parseFloat(totalBet).toFixed(2) : "",
        totalRakes: totalRake != 0 ? parseFloat(totalRake).toFixed(2) : "",
        remaining_Chips: remaining_Chips >= 0.01 || remaining_Chips <= -0.01 ? parseFloat(remaining_Chips).toFixed(2) : 0
      });
    } catch (e) {
      console.log("Error", e)
    }
  },
}