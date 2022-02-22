var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment');
module.exports = {

    /**
      Regular Tournament 
    **/

    RegularTournament: async function(req, res) {
        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                tournamentActive: 'active',
                GameManagementMenu: 'active menu-open'
            };
            return res.render('regularTournament/tournament', data);
        } catch (e) {
            console.log(e);
        }
    },

    getRegularTournament: async function(req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;

            let query = {};
            if (search != '') {
                let capital = search;
                query = { name: { $regex: '.*' + search + '.*' } };
            } else {
                query = { isDelete: false };
            }
            let tournament = await Sys.App.Services.TournamentServices.getTournamentCount(query);
            let data = await Sys.App.Services.TournamentServices.getTouDatatable(query, length, start);
            var obj = {
                'draw': req.query.draw,
                'recordsTotal': tournament,
                'recordsFiltered': tournament,
                'data': data
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
            return new Error('Error', e);
        }
    },

    addRegularTournament: async function(req, res) {
        try {
            let blindLevels = await Sys.App.Services.blindLevelsServices.getBlindLevelsData({});
            let minutes = [];
            let reBuyMinutes = [];
            let minPlayers = [];
            let maxPlayers = [];
            for (let i = 1; i <= 60; i++) {
                minutes.push(i);
            }
            for (let i = 0; i <= 60; i++) {
                reBuyMinutes.push(i);
            }

            for (let i = 2; i <= Sys.Config.App.maxPlayers; i++) {
                minPlayers.push(i);
            }

            for (let i = 3; i <= Sys.Config.App.maxPlayers; i++) {
                maxPlayers.push(i);
            }

            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                tournamentActive: 'active',
                minutes: minutes,
                reBuyMinutes: reBuyMinutes,
                minPlayers: minPlayers,
                maxPlayers: maxPlayers,
                blindLevels: blindLevels
            };
            return res.render('regularTournament/addTournament', data);
        } catch (e) {
            console.log(e);
        }
    },

    addRegularTournamentPostData: async function(req, res) {
        try {
            let roomCount = await Sys.App.Services.TournamentServices.getTournamentCount({});
            if (roomCount instanceof Error) {
                req.flash('error', 'Error Fetching Room Count');
            }
            let tableNumber = parseInt(roomCount + 1);
            // if(req.body.isFreeRoll == 'true'){
            //   if(req.body.buy_in > 0 || req.body.entry_fee >0 ){
            //     req.flash('error','Buyin and Entry free must be Zero for Freeroll Tournament.');
            //     return res.redirect('/regular-tournament/addRegularTournament'); 
            //   }
            // )
	console.log(typeof req.body.tournament_date_time);
	             console.log(req.body.tournament_date_time);
		console.log("date");
		var d = new Date();
		 var n = d.toUTCString();
            let resData = await Sys.App.Services.TournamentServices.insertTourData({
                name: req.body.name,
                notification: req.body.notification,
                buy_in: req.body.buy_in,
                stacks_chips: req.body.stacks_chips,
                entry_fee: req.body.entry_fee,
                fee: req.body.fee,
                rebuy_time: req.body.rebuy_time,
                breaks_time: req.body.breaks_time,
                gameType: req.body.gameType,
                limit: req.body.limit,
                game_speed: req.body.game_speed,
                min_players: req.body.min_players,
                max_players: req.body.max_players,
                register_from_date_time: req.body.register_from_date_time,
                tournament_date_time: req.body.tournament_date_time,
                description: req.body.description,
                blind_levels_rise_time: req.body.blind_levels_rise_time,
                status: 'Waiting',
                isCashGame: req.body.isCashGame,
                blindLevels: req.body.blindLevels,
                // isFreeRoll          : req.body.isFreeRoll,
                isDelete: false,
                tournamentNumber: 'SPTO' + tableNumber
            });
            console.log(resData);

            req.flash('success', 'Tournaments Created Successfully.');
            res.redirect('/regular-tournament');

        } catch (e) {
            console.log('Error', e);
        }
    },

    editRegularTournament: async function(req, res) {
        try {
            let tournament = await Sys.App.Services.TournamentServices.getTourData({ _id: req.params.id });
    
		let blindLevels = await Sys.App.Services.blindLevelsServices.getBlindLevelsData({});
            let minutes = [];
            let reBuyMinutes = [];
            let minPlayers = [];
            let maxPlayers = [];
            for (let i = 1; i <= 60; i++) {
                minutes.push(i);
            }
            for (let i = 0; i <= 60; i++) {
                reBuyMinutes.push(i);
            }
            for (let i = 2; i <= Sys.Config.App.maxPlayers; i++) {
                minPlayers.push(i);
            }

            for (let i = 3; i <= Sys.Config.App.maxPlayers; i++) {
                maxPlayers.push(i);
            }

            let tournament_registration_start = moment(tournament.register_from_date_time).format("YYYY-MM-DD HH:mm");
            let tournament_start = moment(tournament.tournament_date_time).format("YYYY-MM-DD HH:mm");

            /* var date2 = new Date(tournament.tournament_date_time), // 10:09 to
             date1 = new Date() // 10:20 is 11 mins

             //Get 1 day in milliseconds
             var one_day = 1000*60*60*24;

             // Convert both dates to milliseconds
             var date1_ms = date1.getTime();
             var date2_ms = date2.getTime();

             // Calculate the difference in milliseconds
             var difference_ms = date2_ms - date1_ms;
             //take out milliseconds
             difference_ms = difference_ms/1000;
             var seconds = Math.floor(difference_ms % 60);
             difference_ms = difference_ms/60; 
             var minutess = Math.floor(difference_ms % 60);
             difference_ms = difference_ms/60; 
             var hours = Math.floor(difference_ms % 24);  
             var days = Math.floor(difference_ms/24);
             date = hours+":"+minutess;*/

            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                tournamentActive: 'active',
                tournament: tournament,
                minutes: minutes,
                reBuyMinutes: reBuyMinutes,
                minPlayers: minPlayers,
                maxPlayers: maxPlayers,
                blindLevels: blindLevels,
                //date : date,
                tournament_registration_start: tournament_registration_start,
                tournament_start: tournament_start,
                isDelete: false
            };
            console.log("data", data)
            return res.render('regularTournament/addTournament', data);
        } catch (e) {
            console.log("Error", e);
        }
    },

    editRegularTournamentPostData: async function(req, res) {
        try {
            let tournament = await Sys.App.Services.TournamentServices.getTourData({ _id: req.params.id, status: { '$nin': ["Running", "Finished"] } });
            if (tournament){
		    var d = new Date().toString();
		    var d2 = req.body.tournament_date_time;
		   // var utc = d2.toUTCString();
		    console.log("Date", utc);
		    console.log(req.body.tournament_date_time);
                await Sys.App.Services.TournamentServices.updateTourData({
                    _id: req.params.id
                }, {
                    name: req.body.name,
                    notification: req.body.notification,
                    rebuy_time: req.body.rebuy_time,
                    breaks_time: req.body.breaks_time,
                    gameType: req.body.gameType,
                    game_speed: req.body.game_speed,
                    min_players: req.body.min_players,
                    max_players: req.body.max_players,
                    register_from_date_time: req.body.register_from_date_time,
                   tournament_date_time: req.body.tournament_date_time,
                 // tournament_date_time: d2,
			description: req.body.description,
                    blind_levels_rise_time: req.body.blind_levels_rise_time,
                    status: 'Waiting',
                    isCashGame: tournament.isCashGame,
                    blindLevels: req.body.blindLevels,
                    // isFreeRoll          : tournament.isFreeRoll 
                });

                req.flash('success', 'Tournaments updated successfully');
                res.redirect('/regular-tournament');
            } else {
                req.flash('error', 'Tournaments is not updated successfully or tournament status is finished or running');
                res.redirect('/regular-tournament');
            }
        } catch (e) {
            console.log("Error", e);
        }
    },

    deleteRegularTournament: async function(req, res) {
        try {
            let tournament = await Sys.App.Services.TournamentServices.getTourData({ _id: req.body.id });
            console.log(tournament, tournament.length);
            if (tournament || tournament.length > 0) {
                if (tournament.status == "Waiting") {
                    for (let index = 0; index < tournament.players.length; index++) {
                        console.log("tournament.players", tournament.players[index]);
                        let playerDetails = await Sys.App.Services.PlayerServices.getSinglePlayerData({ _id: tournament.players[index] });
                        console.log("playerDetails", playerDetails);
                        if (playerDetails) {
                            tournament.tournamentTotalChips = parseFloat(tournament.tournamentTotalChips - parseFloat(tournament.buy_in + tournament.entry_fee))
                            let traNumber = +new Date()
                            await Sys.App.Services.AllUsersTransactionHistoryServices.insertData({
                                'receiverId': playerDetails._id,
                                'sessionId': tournament.playersSestionIds[index],
                                'receiverRole': "player",
                                'providerId': "-",
                                'providerRole': 'tournament',
                                'providerEmail': "tournament ",
                                chips: parseFloat(tournament.entry_fee + tournament.buy_in),
                                'remark': 'Return Entry Fee on tournament Cancel',
                                'transactionNumber': 'DEP-' + traNumber,
                                'uniqId': playerDetails.uniqId,
                                'beforeBalance': eval(parseFloat(playerDetails.chips).toFixed(2)),
                                'afterBalance': eval((parseFloat(playerDetails.chips) + parseFloat(tournament.entry_fee) + parseFloat(tournament.buy_in))),
                                'type': 'deposit',
                                'category': 'credit',
                                'status': 'success',
                            });
                        }
                    }
                    await Sys.App.Services.PlayerServices.updateMultiplePlayerData({ _id: { $in: tournament.players } }, {
                        $inc: { chips: parseFloat(tournament.entry_fee + tournament.buy_in) },
                    });
                    await Sys.App.Services.TournamentServices.updateTourData({ _id: tournament._id }, { players: [], status: 'Cancel' })
                }
                await Sys.App.Services.TournamentServices.updateTourData({ _id: tournament._id }, {
                        tournamentTotalChips: tournament.tournamentTotalChips,
                        isDelete: true
                    })
                    // await Sys.App.Services.TournamentServices.delete(req.body.id)
                return res.send("success");
            } else {
                return res.send("error tournament is not found Or status is not waiting");
            }
        } catch (e) {
            console.log("Error", e);
        }
    },

    RegularTournamentReport: async function(req, res) {
        try {
            let reg_tournament = await Sys.App.Services.TournamentServices.getPopulatedData({ _id: req.params.id }, null, null, 'stacks');
            // let startTime = moment(reg_tournament[0].updatedAt);
            // let endTime = moment(reg_tournament[0].tournament_date);
            // console.log(startTime,"  minutes ", endTime);
            let date_time = {
                register_date: moment(reg_tournament[0].register_from).format("YYYY-MM-DD HH:mm"),
                tournament_date: moment(reg_tournament[0].tournament_date_time).format("YYYY-MM-DD HH:mm"),
                // duration : (endTime.diff(startTime, 'minutes', true)).toFixed(2) 
            }
            let gameCount = await Sys.App.Services.GameService.aggregateQuery([{ $match: { roomId: { $in: reg_tournament[0].rooms } } }, { $count: "totalGame" }]);

            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                reg_tournament: reg_tournament[0],
                reg_tournament_date: date_time,
                gameCount: (gameCount.length > 0) ? gameCount[0].totalGame : 0,
            };
            return res.render('regularTournament/report', data);
        } catch (e) {
            console.log(e);
        }
    },

    getTournamentPlayers: async function(req, res) {
        try {
            let reg_tournament = await Sys.App.Services.TournamentServices.getByData({ _id: req.params.id });
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;

            let query = {};
            if (search != '') {
                let capital = search;
                query = { '_id': { $in: reg_tournament[0].players }, username: { $regex: '.*' + search + '.*' } };
            } else {
                query = { '_id': { $in: reg_tournament[0].players } };
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
        } catch (e) {
            console.log("Error", e);
            return new Error('Error', e);
        }
    },

    getTournamentRooms: async function(req, res) {
        try {
            let reg_tournament = await Sys.App.Services.TournamentServices.getByData({ _id: req.params.id });
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);

            let query = { '_id': { $in: reg_tournament[0].rooms } };

            let rooms = await Sys.App.Services.RoomServices.getCountTable(query);
            let data = await Sys.App.Services.RoomServices.getRoomDatatable(query, length, start);
            var obj = {
                'draw': req.query.draw,
                'recordsTotal': rooms,
                'recordsFiltered': rooms,
                'data': data
            };
            res.send(obj);
        } catch (e) {
            console.log("Error", e);
            return new Error('Error', e);
        }
    },

    getRegularTournamentGame: async function(req, res) {
        try {
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                gameId: req.params.id,
                error: req.flash("error"),
                success: req.flash("success"),
                tournamentActive: 'active',
                GameManagementMenu: 'active menu-open'
            };
            return res.render('regularTournament/regularGameList', data);
        } catch (e) {
            console.log(e);
        }
    },

    getRegularTournamentGameData: async function(req, res) {
        try {
            let start = parseInt(req.query.start);
            let length = parseInt(req.query.length);
            let search = req.query.search.value;
            let val = 'PCG';
            let query = {};
            if (search != '') {
                query = { roomId: req.params.id, gameNumber: { $regex: '.*' + search + '.*' } };
            } else {
                query = { roomId: req.params.id };
            }

            let gameCount = 0;
            let data = await Sys.App.Services.GameService.getGameDatatable(query, length, start);
            gameCount = data.length;
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

}
