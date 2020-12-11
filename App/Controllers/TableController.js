var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');

module.exports = {
  
  /**
   * Cash Game Tournament
   */
	texas: async function(req,res){
		try {
			var data = {
				App : Sys.Config.App.details,Agent : req.session.details,
				error: req.flash("error"),
				success: req.flash("success"),
        cashTexasActive : 'active',
				type: 'normal',
        tableType : 'req.params.tableType'
			};
			return res.render('cashGame/poker-texas/texas',data);
    }
    catch (e) {
			console.log("Error",e);
		}
	},

	getCashGamePoker: async function(req,res){
    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;

      let query = {};
      if (search != '') {
        query = {isTournamentTable : false, name: { $regex: '.*' + search + '.*' }, gameType: req.params.type, tableType: req.params.tableType};
      }
      else {
        query = {isTournamentTable : false, gameType: req.params.type, tableType: req.params.tableType  };
      }
      console.log('Query:',query);
      let roomC = await Sys.App.Services.RoomServices.getRoomData(query);
      let roomCount = roomC.length;
      var sort = {smallBlind:1};
      let data = await Sys.App.Services.RoomServices.getRoomDatatable(query, length, start, sort);
      
      var obj = {
        'draw': req.query.draw,
        'recordsTotal': roomCount,
        'recordsFiltered': data.length,
        'data': data
      };
      res.send(obj);
    }
    catch (e) {
      console.log("Error in getCashGamePoker :", e);
      return new Error(e);
    }
  },

  CashPokerDelete: async function(req,res){
    try {
      let table = await Sys.App.Services.RoomServices.getSingleRoomData({_id: req.body.id});
      if (table || table.length >0) {
        await Sys.App.Services.RoomServices.deleteRoom(req.body.id)
        return res.send("success");
      }
      else {
        return res.send("error");
      }
    }
    catch (e) {
      console.log("Error",e);
    }
  },

  omaha: async function(req,res){
    try {
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        cashOmahaActive : 'active',
        type: 'normal',
        tableType : 'omaha'
      };
      return res.render('cashGame/poker-omaha/omaha',data);
    }
    catch (e) {
      console.log("Error",e);
    }
  },

  /**
   * Sit && Go Tournament
   */
  texasSitGoTour: async function(req,res){
    try {
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        sitTexasActive : 'active',
        type: 'normal',
        tableType : 'texas'
      };
      return res.render('cashGame/poker-texas/texas',data);
    }
    catch (e) {
      console.log("Error",e);
    }
  },

  getPokerSitGoTour: async function(req,res){
    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;

      let query = {};
      if (search != '') {
        query = { name: { $regex: '.*' + search + '.*' } ,gameType : req.params.type , tableType : req.params.tableType};
      }
      else {
        query = { gameType : req.params.type , tableType : req.params.tableType};
      }
      
      let roomC = await Sys.App.Services.RoomServices.getRoomData(query);
      let roomCount = roomC.length;
      let data = await Sys.App.Services.RoomServices.getRoomDatatable(query, length, start);

      var obj = {
        'draw': req.query.draw,
        'recordsTotal': roomCount,
        'recordsFiltered': roomCount,
        'data': data
      };
      res.send(obj);
    }
    catch (e) {
      console.log("Error",e);
    }
  },

  pokerDeleteSitGoTour: async function(req,res){
    try {
      let table = await Sys.App.Services.RoomServices.getSingleRoomData({_id: req.body.id});
      if (table || table.length >0) {
        await Sys.App.Services.RoomServices.deleteRoom(req.body.id)
        return res.send("success");
      }
      else {
        return res.send("error");
      }
    }
    catch (e) {
      console.log("Error",e);
    }
  },

  omahaSitGoTour: async function(req,res){
    try {
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        sitOmahaActive : 'active',
        type: 'normal',
        tableType : 'omaha'
      };
      return res.render('cashGame/poker-omaha/omaha',data);
    }
    catch (e) {
      console.log("Error",e);
    }
  },

  /**
   * Regular Tournament
   */
  texasRegularTou: async function(req,res){
    try {
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        regulayActive : 'active',
        type: 'normal',
        tableType : 'texas'
      };
      return res.render('cashGame/poker-texas/texas',data);
    }
    catch (e) {
      console.log("Error",e);
    }
  },

  getPokerRegularTou: async function(req,res){
    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;

      let query = {};
      if (search != '') {
        query = { name: { $regex: '.*' + search + '.*' } ,gameType : req.params.type , tableType : req.params.tableType};
      } else {
        query = { gameType : req.params.type , tableType : req.params.tableType};
      }
      
      let roomC = await Sys.App.Services.RoomServices.getRoomData(query);
      let roomCount = roomC.length;
      let data = await Sys.App.Services.RoomServices.getRoomDatatable(query, length, start);

      var obj = {
        'draw': req.query.draw,
        'recordsTotal': roomCount,
        'recordsFiltered': roomCount,
        'data': data
      };
      res.send(obj);
    }
    catch (e) {
      console.log("Error",e);
    }
  },

  pokerDeleteRegularTou: async function(req,res){
    try {
      let table = await Sys.App.Services.RoomServices.getSingleRoomData({_id: req.body.id});
      if (table || table.length >0) {
        await Sys.App.Services.RoomServices.deleteRoom(req.body.id)
        return res.send("success");
      }
      else {
        return res.send("error");
      }
    }
    catch (e) {
      console.log("Error",e);
    }
  },

  omahaRegularTou: async function(req,res){
    try {
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        regulayOmahaActive : 'active',
        type: 'normal',
        tableType : 'omaha'
      };
      return res.render('cashGame/poker-omaha/omaha',data);
    }
    catch (e) {
      console.log("Error",e);
    }
  },


  /* game: async function(req,res){
    try {
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        type: 'normal',
        tableType : 'texas'
      };
      return res.render('cashGame/poker-texas/gameHistory',data);
    }
    catch (e){
      console.log("Error",e);
    }
  }, */


  /* gameHistory: async function(req,res){
    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      // let search = req.query.search.value;
      let search = '';

      let query = {};
      if (search != '') {
        query = { email: { $regex: '.*' + search + '.*' },gameType : req.params.type , tableType : req.params.tableType };
      }
      else {
        query = {gameType : req.params.type , tableType : req.params.tableType };
      }

      let gameC = await Sys.App.Services.GameService.getByData(query);
      let gameCount = gameC.length;
      let data = await Sys.App.Services.GameService.getGameDatatable(query, length, start);
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
  }, */
}