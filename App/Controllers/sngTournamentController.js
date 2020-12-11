var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');

const moment = require('moment');
module.exports = {

  /**
    SNG Tournament 
  **/

  sngTournament: async function (req, res){
    try {
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        sngTournamentActive : 'active',
        GameManagementMenu: 'active menu-open'
      };
      return res.render('sitGoTournament/sngTournament',data);
    }
    catch (e){
      console.log(e);
    }
  },

  getSngTournament: async function (req, res){
    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;

      let query = {};
      if (search != '') {
        let capital = search;
        query = { name: { $regex: '.*' + search + '.*' } };
      } else {
        query = { };
      }
      query.isDelete=false
      let tournament = await Sys.App.Services.sngTournamentServices.getSngTournamentCount(query);
      //let tournament = tournamentC.length;
      let data = await Sys.App.Services.sngTournamentServices.getTouDatatable(query, length, start);
      var obj = {
        'draw': req.query.draw,
        'recordsTotal': tournament,
        'recordsFiltered': tournament,
        'data': data
      };
      res.send(obj);
    }
    catch (e){
      console.log("Error",e);
      return new Error('Error',e);
    }
  },

  addSngTournament: async function (req, res){
    try {
      let stacks = await Sys.App.Services.StacksServices.getByData({});
      let blindLevels = await Sys.App.Services.blindLevelsServices.getBlindLevelsData({});
      let minutes = [];
      let minPlayers = [];
      let maxPlayers = [];
      for(let i=1; i<=60;i++){
        minutes.push(i);
      }

      for(let i=2; i<=Sys.Config.App.maxPlayers;i++){
        minPlayers.push(i);
      }

       for(let i=3; i<=Sys.Config.App.maxPlayers;i++){
        maxPlayers.push(i);
      }

      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        tournamentActive : 'active',
        minutes : minutes,
        minPlayers: minPlayers,
        maxPlayers: maxPlayers,
        stacks : stacks,
        blindLevels : blindLevels
      };
      return res.render('sitGoTournament/addSngTournament',data);
    }
    catch (e){
      console.log(e);
    }
  },

  addSngTournamentPostData: async function (req, res){
    try {
     if(req.body.isFreeRoll == 'true'){
        if(req.body.buy_in > 0 || req.body.entry_fee >0 ){
          req.flash('error','Buyin and Entry free must be Zero for Freeroll Tournament.');
          return res.redirect('/sng-tournament/addSngTournament'); 
        }
      }
     let tournamentCount = await Sys.App.Services.sngTournamentServices.getSngTournamentCount({});
     if(tournamentCount instanceof Error){
      req.flash('error', 'Error Fetching Room Count');
    }
    let tableNumber = parseInt(tournamentCount + 1);

    let sngTournamet =  await Sys.App.Services.sngTournamentServices.insertTourData({
        name                 : req.body.name,
        notification         : req.body.notification,
        game                 : req.body.game,
        gameType             : req.body.gameType,
        stacks               : req.body.stacks,
        buy_in               : req.body.buy_in,
        stacks_chips         : req.body.stacks_chips,
        entry_fee            : req.body.entry_fee,
        fee                  : req.body.fee,
        // rebuy_time           : req.body.rebuy_time,
        breaks_time          : req.body.breaks_time,
        game_speed           : req.body.game_speed,
        min_players          : 2,
        max_players          : req.body.max_players,
        description          : req.body.description,
        tournamentNumber   : 'SPSNG'+tableNumber,
        blind_levels_rise_time  : req.body.blind_levels_rise_time,
        blindLevels          : req.body.blindLevels,
        status : 'Waiting',
        isCashGame : req.body.isCashGame,
        isFreeRoll          : req.body.isFreeRoll,
      });

    if(sngTournamet){

      let stacksData = await Sys.App.Services.StacksServices.getStacksData({ _id: req.body.stacks });
      if(!stacksData || stacksData instanceof Error){
        req.flash('error', 'Error Fetching Stacks Data');
      }


      let roomCount = await Sys.App.Services.RoomServices.getCountTable({});
      if(roomCount instanceof Error){
        req.flash('error', 'Error Fetching Room Count');
      }
      let tableNumber = parseInt(roomCount + 1);

      let newTableData = await Sys.App.Services.RoomServices.insertTableData({
        isTournamentTable : true,
        tournamentType    : 'sng',
        tournament        : sngTournamet.id,
        name              : req.body.name,
        notification      : req.body.notification,
        smallBlind        : stacksData.minStack,
        bigBlind          : stacksData.maxStack,
        smallBlindIndex   : 0,
        bigBlindIndex     : 0,
        minPlayers        : 2,
        maxPlayers        : req.body.max_players,
        rackPercent       : Sys.Setting.rakePercenage,
        // minBuyIn          : parseFloat(stacksData.minStack*10),
        // maxBuyIn          : parseFloat(stacksData.maxStack*50),
        minBuyIn          : 0,
        maxBuyIn          : 0,
        tableNumber       : 'T'+tableNumber,
        status            : "Waiting",
        owner             : 'admin',
        dealer            : 0,
        turnBet           : [],
        players           : [],
        gameWinners       : [],
        gameLosers        : [],
        game              : null,
        currentPlayer     : 0,
        limit             : req.body.game,
        tableType         : req.body.gameType,
        timerStart        : false
      });

      if(newTableData instanceof Error){
        req.flash('error', newTableData.message);
      }
      else{
        req.flash('success', 'Table Created Successfully.');
      }

      req.flash('success','Sit & Go Tournaments Created Successfully.');
      res.redirect('/sng-tournament');

    }else{
      req.flash('error','Sit & Go Tournaments Have Some Issue.');
      res.redirect('/sng-tournament');
    }




     

    }
    catch (e){
      console.log('Error',e);
    }
  },

  editSngTournament: async function (req, res){
    try {
      let tournament = await Sys.App.Services.sngTournamentServices.getTourData({_id : req.params.id, 'status': { '$in': ['Finished', 'Waiting'] } });
      let stacks = await Sys.App.Services.StacksServices.getByData({});
      let blindLevels =  await Sys.App.Services.blindLevelsServices.getBlindLevelsData({});
      let minutes = [];
      let minPlayers = [];
      let maxPlayers = [];
      for(let i=1; i<=60;i++){
        minutes.push(i);
      }

      for(let i=2; i<=Sys.Config.App.maxPlayers;i++){
        minPlayers.push(i);
      }

       for(let i=3; i<=Sys.Config.App.maxPlayers;i++){
        maxPlayers.push(i);
      }

      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        tournamentActive : 'active',
        tournament : tournament,
        minutes : minutes,
        minPlayers: minPlayers,
        maxPlayers: maxPlayers,
        stacks : stacks,
        blindLevels: blindLevels,
      };
      return res.render('sitGoTournament/addSngTournament',data);
    }
    catch (e){
      console.log("Error",e);
    }
  },

  editSngTournamentPostData: async function (req, res){
    try {console.log("edit post data", req.body)
      let tournament = await Sys.App.Services.sngTournamentServices.getTourData({_id : req.params.id,'status': { '$in': ['Finished', 'Waiting']}});
      if(tournament){
        
        await Sys.App.Services.sngTournamentServices.updateTourData({
                _id: req.params.id
              }, {
                name                 : req.body.name,
                notification         : req.body.notification,
                // game                 : req.body.game,
                // stacks               : req.body.stacks,
                gameType             : req.body.gameType,
                // buy_in               : req.body.buy_in,
                stacks_chips         : req.body.stacks_chips,
                // entry_fee            : req.body.entry_fee,
                // fee                  : req.body.fee,
                //rebuy_time           : req.body.rebuy_time,
                breaks_time          : req.body.breaks_time,
                game_speed           : req.body.game_speed,
                min_players          : 2,
                max_players          : req.body.max_players,
                description          : req.body.description,
                blind_levels_rise_time  : req.body.blind_levels_rise_time,
                blindLevels          : req.body.blindLevels,
                isFreeRoll          : tournament.isFreeRoll, 
                status : 'Waiting',
                isCashGame : req.body.isCashGame,
        });
        req.flash('success','Tournaments updated successfully');
        res.redirect('/sng-tournament');
      }
      else{
        req.flash('error','Tournaments is not updated successfully');
        res.redirect('/sng-tournament');     
      }
    }
    catch (e){
      console.log("Error",e);
    }
  },

  deleteSngTournament: async function (req, res){
    try {
      let tournament = await Sys.App.Services.sngTournamentServices.getTourData({_id: req.body.id});
      if (tournament || tournament.length >0) {
        if(tournament.status=="Waiting"){           
          for (let index = 0; index < tournament.players.length; index++) {
            let playerDetails = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: tournament.players[index] });
            if(playerDetails){
            tournament.tournamentTotalChips =  parseFloat(tournament.tournamentTotalChips - parseFloat(tournament.buy_in  + tournament.entry_fee ))
            let traNumber = + new Date()
            await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
              'receiverId': playerDetails._id,
              'sessionId': tournament.playersSestionIds[index],
              'receiverRole' : "player",
              'providerId': "-",
              'providerRole': 'tournament',
              'providerEmail': "tournament ",
              chips: parseFloat(tournament.entry_fee + tournament.buy_in),
              'remark' : 'Return Entry Fee on tournament Cancel',
              'transactionNumber':  'DEP-'+ traNumber,
              'uniqId':playerDetails.uniqId,
              'beforeBalance' : eval( parseFloat(playerDetails.chips).toFixed(2) ),
              'afterBalance' : eval( (parseFloat(playerDetails.chips ) + parseFloat(tournament.entry_fee) + parseFloat(tournament.buy_in))),
              'type':  'deposit',
              'category'				:'credit',
              'status': 'success',
            });
          }
          }
          await Sys.App.Services.PlayerServices.updateMultiplePlayerData({ _id: { $in: tournament.players } },
             { $inc: { chips: parseFloat(tournament.entry_fee + tournament.buy_in) },
              });
              await Sys.App.Services.sngTournamentServices.updateTourData({ _id: tournament._id }, { players: [],playersSestionIds:[],status: 'Cancel'})
            }
          await Sys.App.Services.sngTournamentServices.updateTourData({ _id: tournament._id }, { tournamentTotalChips: tournament.tournamentTotalChips,isDelete:true
        })
        // await Sys.App.Services.sngTournamentServices.delete(req.body.id)
        return res.send("success");
      } else {
        return res.send("error");
      }
    }
    catch (e) {
      console.log("Error",e);
    }
  },

  SngTournamentReport: async function(req, res){
    try {
      let sng_tournament = await Sys.App.Services.sngTournamentServices.getPopulatedData({_id: req.params.id}, null, null, 'stacks');
      let gameCount = await Sys.App.Services.GameService.aggregateQuery( [{ $match: { roomId: { $in: sng_tournament[0].rooms } } },{$count:"totalGame"}]);
      console.log("sng tournament", sng_tournament)
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        sng_tournament: sng_tournament[0],
        gameCount: (gameCount.length > 0) ? gameCount[0].totalGame : 0,
      };
      return res.render('sitGoTournament/report',data);
    }
    catch (e){
      console.log(e);
    }
  },

  getSngTournamentPlayers: async function(req, res){
    try {
      let sng_tournament = await Sys.App.Services.sngTournamentServices.getByData({_id: req.params.id});
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;

      let query = {};
      if (search != '') {
        let capital = search;
        query = { '_id': { $in: sng_tournament[0].players }, username: { $regex: '.*' + search + '.*' } };
      } else {
        query = { '_id': { $in: sng_tournament[0].players } };
      }
      let tournament = await Sys.App.Services.PlayerServices.getPlayerCount(query);
      let data = await Sys.App.Services.PlayerServices.getPlayerDatatable(query, length, start);
      var obj = {
        'draw': req.query.draw,
        'recordsTotal': tournament,
        'recordsFiltered': tournament,
        'data': data
      };
      res.send(obj);
    }
    catch (e){
      console.log("Error",e);
      return new Error('Error',e);
    }
  },

  getSngTournamentRooms: async function(req, res){
    try {
      let sng_tournament = await Sys.App.Services.sngTournamentServices.getByData({_id: req.params.id});
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      
      let query = { '_id': { $in: sng_tournament[0].rooms } };
      
      let rooms = await Sys.App.Services.RoomServices.getCountTable(query);
      let data = await Sys.App.Services.RoomServices.getRoomDatatable(query, length, start);

      var obj = {
        'draw': req.query.draw,
        'recordsTotal': rooms,
        'recordsFiltered': rooms,
        'data': data
      };
      res.send(obj);
    }
    catch (e){
      console.log("Error",e);
      return new Error('Error',e);
    }
  },

  getSngTournamentGame: async function(req, res){
    try {
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        gameId: req.params.id,
        error: req.flash("error"),
        success: req.flash("success"),
        tournamentActive : 'active',
        GameManagementMenu: 'active menu-open'
      };
      return res.render('sitGoTournament/sngGameList',data);
    }
    catch (e){
      console.log(e);
    }
  },

  getSngTournamentGameData: async function(req, res){
    try {console.log("rrrrrr", req.params.id)
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;
      let val = 'PCG';
      let query = {};
      if (search != '') {
        query = { roomId: req.params.id , gameNumber: { $regex: '.*' + search + '.*' }};
      } else {
        query = { roomId: req.params.id};
      }

      
      let gameCount = 0;
      let data = await Sys.App.Services.GameService.getGameDatatable(query, length, start);
      gameCount =  data.length;
      var obj = {
        'draw': req.query.draw,
        'recordsTotal': gameCount,
        'recordsFiltered': gameCount,
        'data': data
      };
      res.send(obj);
    }
    catch (e) {
      console.log("Error",e);
    }
  },

}