var Sys = require('../../../Boot/Sys');
var bcrypt = require('bcryptjs');

module.exports = {
  /**
          Cash Game Tournament

  **/


	add: async function(req,res){
		// return view.render(this.ViewPath + 'backend/table/add',{type:'texas' });
		return res.render('sitGoTournament/add',data);
	},


	addTable: async function(req,res){
    // validation rules
    // const rules = {
    //   name        : 'required',
		// 	smallBlind  : 'required',
		// 	bigBlind    : 'required',
		// 	// minPlayers  : 'required',
		// 	// maxPlayers  : 'required',
		// 	minBuyIn    : 'required',
		// 	rackPercent : 'required',
		// 	rackAmount  : 'required',
		// 	type				: 'required',
    //   prizePool   : 'required',
    //   entryChips  : 'required',
    //   gameLimit : 'required',
    //   // tableType    : 'required'
    // }
    // const messages = {
    //   'name.required'         :'Please Enter Table Name',
		// 	'smallBlind.required'   :'Please Enter Small Blind',
		// 	'bigBlind.required'     :'Please Enter Big Blind',
		// 	// 'minPlayers.required'   :'Please Enter Minimum Players',
		// 	// 'maxPlayers.required'   :'Please Enter Maximum Players',
		// 	'minBuyIn.required'		  :'Please Enter Minimum Buy In',
		// 	'rackPercent.required'  :'Please Enter Rack Percentage',
		// 	'rackAmount.required'   :'Please Enter Rack Amount',
		// 	'type.required'         :'Please Select Type',
    //   'prizePool.required'    :'Please Enter Prize Pool',
    //   'entryChips.required'   :'Please Enter Entry Chips',
		// 	'gameLimit.required'  :'Please Select Is Limit',
    //   // 'tableType.required'    :'Please Select Is tableType'
    // }
    // const validation = await validate(request.all(), rules, messages);
    // // validation check
    // if (validation.fails()) {
    //   session.withErrors(validation.messages());
    //   return response.redirect('back');
    // }


		let tableCount = await Sys.App.Services.RoomServices.getCount();
    let tableNumber = tableCount + 1;
    let minPlayers = 2;
    let maxPlayers = 9;
    let tableType = 'SitnGoTournament';

	    let startDate = request.body.startDate;
    // response.send(request.body.tableType); return false;



    let data = {
      	tableType     : tableType,
				gameType 			: 'texas',
				currencyType	:	request.body.currencyType,
	      name          : request.body.name,
	      smallBlind    : request.body.smallBlind,
	      bigBlind      : request.body.bigBlind,
      	minPlayers    : minPlayers,
      	maxPlayers    : maxPlayers,
      	// minPlayers    : request.body.minPlayers,
      	// maxPlayers    : request.body.maxPlayers,
	      rackPercent   : request.body.rackPercent,
	      rackAmount    : request.body.rackAmount,
	      minBuyIn      : request.body.minBuyIn,
				maxBuyIn      : request.body.maxBuyIn,
	      // maxBuyIn      : (request.body.maxBuyIn) ? parseInt(request.body.maxBuyIn) : ' ',
      	tableNumber   : "SitGo-"+tableNumber,
	      type          : request.body.type,
	      prizePool     : request.body.prizePool,
	      entryChips    : request.body.entryChips,
      	status        : "Waiting",
      	owner         : 'admin',
      	winningCount  : 0,
      	dealer        : 0,
      	turnBet       : [],
      	players       : [],
      	gameWinners   : [],
      	gameLosers    : [],
      	game          : null,
      	currentPlayer : 0,
	      gameLimit   : request.body.gameLimit,
      startDate     : Date.parse(startDate)
    }
		await Sys.App.Services.RoomServices.insertRoomData(data);

		// response.redirect('/backend/'+request.body.gametype+'/table');
		res.redirect('/sit-go-tournament');
  },

	startTournamentCron: async function(req,res){
		let currentDayTime = new Date();
    let time = currentDayTime.getFullYear()+"-"+('0' + parseInt(currentDayTime.getMonth()+1)).slice(-2)+"-"+('0' + currentDayTime.getDate()).slice(-2)+"T"+('0' + currentDayTime.getHours()).slice(-2)+":"+('0' + currentDayTime.getMinutes()).slice(-2)+"";
    time = String(Date.parse(time));


    // let time = "1531222200000";
    // let time = "1531974600000";
    // response.send(console.log(Date.parse(time))); return false;
    // let time = "2018-06-15T07:37";
    // var rooms = await load('Games/Crypto/Services/RoomService').search({ startDate: { startsWith: Date.parse(time) } , tableType: { '!=': 'Normal' } });
    var rooms = await Sys.App.Services.RoomServices.getRoomData({ startDate: time , tableType: { '!=': 'Normal' }, owner: "admin" });
    // var rooms = await load('Games/Crypto/Services/RoomService').search({ tableType: { '!=': 'Normal' }, owner: "admin" });
    if (!rooms) {
      let message = "No Rooms Found";
      console.log("No Room Found on Perticular Time");
      return message;
    }
    for (var i = 0; i < rooms.length; i++) {
      let room = await Sys.App.Services.RoomServices.getSingleRoomData({_id: rooms[i].id}); // Just Get Table Data With Formate.
      if (room.players) {

        let playersCount = 0
        room.players.forEach(function (player) {
        	if (player.status != 'Left') {
        		playersCount += 1
        	}
        })

        if (room.status != 'Running' && playersCount >= room.minPlayers) {
        // if (room.status != 'Running' && playersCount >= room.minPlayers) {
        // console.log('playersCount', playersCount);
          if (!room.game) {
            Logger.info('Tournament object not present')
            if (Sys.Timers[room.id]) {
              Sys.Timers[room.id] = setTimeout(function () {
                console.log('start game called');
                room.StartGame();
              }, 2000)
            } else {
              Sys.Timers[room.id] = {}
              Sys.Timers[room.id] = setTimeout(function () {
                console.log('start game called');
                room.StartGame();
              }, 2000)
            }
          }
        }
      }

    }


    // let todayPlusTen = new Date();
    // todayPlusTen.setHours(todayPlusTen.getMinutes() + 10);
    // let todayPlusTenTime = todayPlusTen.getFullYear()+"-"+('0' + parseInt(todayPlusTen.getMonth()+1)).slice(-2)+"-"+('0' + todayPlusTen.getDate()).slice(-2)+"T"+('0' + todayPlusTen.getHours()).slice(-2)+":"+('0' + todayPlusTen.getMinutes()).slice(-2)+"";
    // todayPlusTenTime = String(Date.parse(time));
    // var upcomingRooms = await load('Games/Crypto/Services/RoomService').search({ startDate: todayPlusTenTime , tableType: { '!=': 'Normal' }, owner: "admin" });
    // if (!upcomingRooms) {
    //   let message = "No Rooms Found";
    //   console.log("No Upcoming Room Found on Perticular Time");
    //   return message;
    // }
    // for (var i = 0; i < upcomingRooms.length; i++) {
    //   let upcomingRoomPlayers = await load('App/Models/TournamentRegistration').find({ roomId: upcomingRooms[i].id, status: "Approve" }); // Just Get Approved player List
    //   for (var j = 0; j < upcomingRoomPlayers.length; j++) {
    //     let player = await load('App/Models/Player').findOne({ id: upcomingRoomPlayers[j].playerId });
    //     load('Server/WsFacade').io.in(player.socketId).emit('PokerTournamentStart', upcomingRooms[i]);  // to emit socket
    //     // upcomingRoomPlayers[i]
    //   }
    // }
    // response.send(rooms);
    // load('Server/WsFacade').io.in(player.socketId).emit('PokerPlayerChipsUpdated', details);  // to emit socket
    // console.log(rooms);
    // return false;
	},



















 //
 // texas: async function(req,res){
 // 	try {
 //
 // 		var data = {
 // 			App : Sys.Config.App.details,
 // 			error: req.flash("error"),
 // 			success: req.flash("success"),
 //        cashTexasActive : 'active',
 // 			type: 'cash',
 //        tableType : 'texas'
 // 		};
 // 		return res.render('cashGame/poker-texas/texas',data);
 // 	} catch (e) {
 // 		console.log("Error",e);
 // 	}
 // },
 //
 //
 // getCashGamePoker: async function(req,res){
 //      // res.send(req.query.start); return false;
 //        try {
 //          let start = parseInt(req.query.start);
 //          let length = parseInt(req.query.length);
 //          let search = req.query.search.value;
 //
 //          let query = {};
 //          if (search != '') {
 //            let capital = search;
 //            query = { email: { $regex: '.*' + search + '.*' } ,gameType : req.params.type , tableType : req.params.tableType};
 //          } else {
 //            query = { gameType : req.params.type , tableType : req.params.tableType};
 //          }
 //
 //          let roomC = await Sys.App.Services.RoomServices.getRoomData(query);
 //          let roomCount = roomC.length;
 //          let data = await Sys.App.Services.RoomServices.getRoomDatatable(query, length, start);
 //
 //          var obj = {
 //            'draw': req.query.draw,
 //            'recordsTotal': roomCount,
 //            'recordsFiltered': roomCount,
 //            'data': data
 //          };
 //                res.send(obj);
 //        } catch (e) {
 //            console.log("Error",e);
 //        }
 //    },
 //
 //
 //    CashPokerDelete: async function(req,res){
 //      try {
 //          let table = await Sys.App.Services.RoomServices.getSingleRoomData({_id: req.body.id});
 //          if (table || table.length >0) {
 //            await Sys.App.Services.RoomServices.deleteRoom(req.body.id)
 //            return res.send("success");
 //          }else {
 //            return res.send("error");
 //          }
 //        } catch (e) {
 //            console.log("Error",e);
 //        }
 //    },
 //
 //    omaha: async function(req,res){
 //      try {
 //
 //        var data = {
 //          App : Sys.Config.App.details,
 //          error: req.flash("error"),
 //          success: req.flash("success"),
 //          cashOmahaActive : 'active',
 //          type: 'cash',
 //          tableType : 'omaha'
 //        };
 //        return res.render('cashGame/poker-omaha/omaha',data);
 //      } catch (e) {
 //        console.log("Error",e);
 //      }
 //    },
 //
 //
 //     /**
 //              Sit && Go Tournament
 //
 //  **/
 //
 //    texasSitGoTour: async function(req,res){
 //    	try {
 //
 //       var data = {
 //         App : Sys.Config.App.details,
 //         error: req.flash("error"),
 //         success: req.flash("success"),
 //         sitTexasActive : 'active',
 //         type: 'cash',
 //         tableType : 'texas'
 //       };
 //       return res.render('cashGame/poker-texas/texas',data);
 //    	} catch (e) {
 //      	console.log("Error",e);
 //    	}
 //  	},
 //
 //
 //  getPokerSitGoTour: async function(req,res){
 //      // res.send(req.query.start); return false;
 //        try {
 //          let start = parseInt(req.query.start);
 //          let length = parseInt(req.query.length);
 //          let search = req.query.search.value;
 //
 //          let query = {};
 //          if (search != '') {
 //            let capital = search;
 //            query = { email: { $regex: '.*' + search + '.*' } ,gameType : req.params.type , tableType : req.params.tableType};
 //          } else {
 //            query = { gameType : req.params.type , tableType : req.params.tableType};
 //          }
 //
 //          let roomC = await Sys.App.Services.RoomServices.getRoomData(query);
 //          let roomCount = roomC.length;
 //          let data = await Sys.App.Services.RoomServices.getRoomDatatable(query, length, start);
 //
 //          var obj = {
 //            'draw': req.query.draw,
 //            'recordsTotal': roomCount,
 //            'recordsFiltered': roomCount,
 //            'data': data
 //          };
 //                res.send(obj);
 //        } catch (e) {
 //            console.log("Error",e);
 //        }
 //  },
 //
 //
 //  pokerDeleteSitGoTour: async function(req,res){
 //    try {
 //        let table = await Sys.App.Services.RoomServices.getSingleRoomData({_id: req.body.id});
 //        if (table || table.length >0) {
 //          await Sys.App.Services.RoomServices.deleteRoom(req.body.id)
 //          return res.send("success");
 //        }else {
 //          return res.send("error");
 //        }
 //      } catch (e) {
 //          console.log("Error",e);
 //      }
 //  },
 //
 //  omahaSitGoTour: async function(req,res){
 //    try {
 //
 //      var data = {
 //        App : Sys.Config.App.details,
 //        error: req.flash("error"),
 //        success: req.flash("success"),
 //        sitOmahaActive : 'active',
 //        type: 'cash',
 //        tableType : 'omaha'
 //      };
 //      return res.render('cashGame/poker-omaha/omaha',data);
 //    } catch (e) {
 //      console.log("Error",e);
 //    }
 //  },
 //
 //
 //
 //  /**
 //   Regular Tournament
 //  **/
 //
 //  texasRegularTou: async function(req,res){
 //    try {
 //
 //      var data = {
 //        App : Sys.Config.App.details,
 //        error: req.flash("error"),
 //        success: req.flash("success"),
 //        regulayActive : 'active',
 //        type: 'regular',
 //        tableType : 'texas'
 //      };
 //      return res.render('regularTournament/poker-texas/texas',data);
 //    } catch (e) {
 //      console.log("Error",e);
 //    }
 //  },
 //
 //  addTable: async function(req,res){
 //    try{
 //          let room = null;
 //
 //            /**
 //             * USD : 1
 //             * BTC : 0.00016
 //             * LTC
 //             * BCH
 //             * ETH
 //             * XRP
 //             * CPE
 //             */
 //
 //
 //            let roomObj = {
 //                "tableType" 	  : 'texas',
 //                "currencyType"  : 'BTC',
 //                "gameType" 	    : 'texas',
 //                "name"			    : 'Texas Room',
 //                "dealer"        : 0,
 //                "smallBlind"	  : 0.00010,
 //                "bigBlind"		  : 0.00020,
 //                "minPlayers"	  : 2,
 //                "maxPlayers"	  : 6,
 //                "rackPercent"   : 10,
 //                "rackAmount" 	  : 0,
 //                "minBuyIn"		  : 0.00100,
 //                "maxBuyIn"		  : 0.01000,
 //                "status"        : "Waiting",
 //                "type"			    : 'texas',
 //                "owner" 		    : "user",
 //                "turnBet"       : [],
 //                "players"       : [],
 //                "gameWinners"   : [],
 //                "gameLosers"    : [],
 //                "game"          : null,
 //                "currentPlayer" : 0,
 //                "gameLimit"	  : false
 //            };
 //
 //            room = await Sys.Game.Crypto.Services.RoomServices.create(roomObj);
 //            if (!room) {
 //                return {
 //                    status: 'fail',
 //                    result: null,
 //                    message: 'No Room Created.',
 //                    statusCode: 401
 //                }
 //            }
 //
 //  				room = await Sys.Game.Crypto.Services.RoomServices.get(room.id); // Just Get Table Data With Formate.
 //
 //
 //          var data = {
 //            App : Sys.Config.App.details,
 //            error: req.flash("error"),
 //            success: req.flash("success"),
 //            regulayActive : 'active',
 //            type: 'cash',
 //            tableType : 'texas'
 //          };
 //          return res.render('regularTournament/poker-texas/texas',data);
 //
 //    }catch (e){
 //      console.log(e);
 //    }
 // },
 //
 // addTexasRegualrTou: async function(req,res){
 //    try{
 //         let stacks = await Sys.App.Services.StacksServices.getByData({});
 //        let minPlayer = [];
 //            for(let i=2; i<=6;i++){
 //                minPlayer.push(i);
 //            }
 //        var data = {
 //          App : Sys.Config.App.details,
 //          error: req.flash("error"),
 //          success: req.flash("success"),
 //          regulayActive : 'active',
 //          type: 'regular',
 //          tableType : 'texas',
 //          stacks : stacks,
 //          minPlayer : minPlayer
 //
 //        };
 //        return res.render('regularTournament/poker-texas/add',data);
 //    }catch (e){
 //      console.log('Error',e);
 //    }
 //  },
 //
 //
 //  postAddTexasRegular: async function(req,res){
 //      try{
 //        let minBuy = {};
 //        let maxBuy = {};
 //        let query = {'tableNumber' : new RegExp('CPX', 'i')};
 //        let tableCount = await Sys.App.Services.RoomServices.getByData(query);
 //        let tableNumber = tableCount.length + 1;
 //        let stacks = await Sys.App.Services.StacksServices.getStacksData({_id : req.body.stacks});
 //        if(req.body.limit == 'limit'){
 //            minBuy = stacks.maxStack * 10;
 //            maxBuy = 0;
 //        }else{
 //            minBuy = stacks.maxStack * 40;
 //            maxBuy = stacks.maxStack * 100;
 //        }
 //          await Sys.App.Services.RoomServices.insertRoomData(
 //              {
 //                tableType : 'regular',
 //                gameType : 'texas',
 //                currencyType : req.body.currency,
 //                name: req.body.name,
 //                dealer        : 0,
 //                smallBlind: stacks.minStack,
 //                bigBlind: stacks.maxStack,
 //                minPlayers: "2",
 //                maxPlayers: req.body.max_players,
 //                rackPercent   : 10,
 //                rackAmount    : 0,
 //                minBuyIn      : minBuy,
 //                maxBuyIn      : maxBuy,
 //                status        : "Waiting",
 //                type: req.body.gameType,
 //                turnBet       : [],
 //                players       : [],
 //                gameWinners   : [],
 //                gameLosers    : [],
 //                game          : null,
 //                currentPlayer : 0,
 //                // gameLimit   : false,
 //                gameLimit: req.body.limit,
 //                tableNumber : 'CPX'+tableNumber,
 //                stacks: req.body.stacks,
 //              }
 //            )
 //            req.flash('success','Table create successfully');
 //            res.redirect('/regular-tournament/texas');
 //
 //      }catch (e){
 //        console.log("Error",e);
 //      }
 //  },
 //
 //  editTexasRegular: async function(req,res){
 //       try{
 //      let room = await Sys.App.Services.RoomServices.getSingleRoomData({_id : req.params.id});
 //      let stacks = await Sys.App.Services.StacksServices.getByData({});
 //      let minPlayer = [];
 //          for(let i=2; i<=6;i++){
 //              minPlayer.push(i);
 //          }
 //      var data = {
 //        App : Sys.Config.App.details,
 //        error: req.flash("error"),
 //        success: req.flash("success"),
 //        regulayActive : 'active',
 //        type: 'regular',
 //        tableType : 'texas',
 //        stacks : stacks,
 //        room : room,
 //        minPlayer : minPlayer
 //
 //      };
 //      return res.render('regularTournament/poker-texas/add',data);
 //    }catch (e){
 //      console.log("Error",e);
 //    }
 //  },
 //
 //  postEditTexasRegular: async function(req,res){
 //      try{
 //        let minBuy = {};
 //        let maxBuy = {};
 //        let table = await Sys.App.Services.RoomServices.getSingleRoomData({_id : req.params.id});
 //        let stacks = await Sys.App.Services.StacksServices.getStacksData({_id : req.body.stacks});
 //        if(req.body.limit == 'limit'){
 //            minBuy = stacks.maxStack * 10;
 //            maxBuy = null;
 //        }else{
 //            minBuy = stacks.maxStack * 40;
 //            maxBuy = stacks.maxStack * 100;
 //        }
 //        if(table){
 //          await Sys.App.Services.RoomServices.updateRoomData(
 //              {
 //                _id : req.params.id
 //              },
 //              {
 //                name: req.body.name,
 //                smallBlind: stacks.minStack,
 //                bigBlind: stacks.maxStack,
 //                maxPlayers: req.body.max_players,
 //                type: req.body.gameType,
 //                currencyType : req.body.currency,
 //                minBuyIn      : minBuy,
 //                maxBuyIn      : maxBuy,
 //                stacks: req.body.stacks,
 //              }
 //            )
 //            req.flash('success','Table update successfully');
 //            res.redirect('/regular-tournament/texas');
 //        }else{
 //            req.flash('error','Table not update successfully');
 //            res.redirect('/regular-tournament/texas');
 //        }
 //
 //      }catch (e){
 //        console.log("Error",e);
 //      }
 //  },
 //
 //
 //  getPokerRegularTou: async function(req,res){
 //      // res.send(req.query.start); return false;
 //        try {
 //          let start = parseInt(req.query.start);
 //          let length = parseInt(req.query.length);
 //          let search = req.query.search.value;
 //
 //          let query = {};
 //          if (search != '') {
 //            let capital = search;
 //            query = { email: { $regex: '.*' + search + '.*' } ,gameType : req.params.type , tableType : req.params.tableType};
 //          } else {
 //            query = { gameType : req.params.tableType , tableType : req.params.type};
 //          }
 //          let roomC = await Sys.App.Services.RoomServices.getRoomData(query);
 //          let roomCount = roomC.length;
 //          let data = await Sys.App.Services.RoomServices.getRoomDatatable(query, length, start);
 //
 //          var obj = {
 //            'draw': req.query.draw,
 //            'recordsTotal': roomCount,
 //            'recordsFiltered': roomCount,
 //            'data': data
 //          };
 //                res.send(obj);
 //        } catch (e) {
 //            console.log("Error",e);
 //        }
 //    },
 //
 //
 //
 //  pokerDeleteRegularTou: async function(req,res){
 //    try {
 //        let table = await Sys.App.Services.RoomServices.getSingleRoomData({_id: req.body.id});
 //        if (table || table.length >0) {
 //          await Sys.App.Services.RoomServices.deleteRoom(req.body.id)
 //          return res.send("success");
 //        }else {
 //          return res.send("error");
 //        }
 //      } catch (e) {
 //          console.log("Error",e);
 //      }
 //  },
 //
 //  omahaRegularTou: async function(req,res){
 //    try {
 //
 //      var data = {
 //        App : Sys.Config.App.details,
 //        error: req.flash("error"),
 //        success: req.flash("success"),
 //        regulayOmahaActive : 'active',
 //        type: 'cash',
 //        tableType : 'omaha'
 //      };
 //      return res.render('cashGame/poker-omaha/omaha',data);
 //    } catch (e) {
 //      console.log("Error",e);
 //    }
 //  },



}
