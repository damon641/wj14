var Sys = require('../../Boot/Sys');
const moment = require('moment');

module.exports = {
    home: async function(req, res) {
        try {

            /*let activeGames = await Sys.App.Services.GameService.getByData({status: 'Running'});
            let activeTables = await Sys.App.Services.RoomServices.getByData({status: 'Running'});
            let newUsers = await Sys.App.Services.PlayerServices.getLimitPlayer({status: 'Running'});*/
            let query = {};
            // convert timestamp to date time format
            /*for (var k = 0; k < newUsers.length; k++) {
              let dt = new Date(newUsers[k].createdAt);
              let createdAt = dt.toUTCString();
              newUsers[k].createdAt = createdAt;
            }*/

            var date = new Date();
            var today = date.getFullYear() + "-" + parseInt(date.getMonth() + 1) + "-" + date.getDate();
            var yesterday = date.getFullYear() + "-" + parseInt(date.getMonth() + 1) + "-" + parseInt(date.getDate() - 1);
            var tommorow = date.getFullYear() + "-" + parseInt(date.getMonth() + 1) + "-" + parseInt(date.getDate() + 1);
            var winnerId = [];

            // let todayGames = await load('App/Models/Game').find({createdAt: {'>': new Date(yesterday), '<': new Date(tommorow) }});
            /*query = { createdAt: {$gte: new Date(yesterday),$lte: new Date(tommorow) } };
            let todayGames = await Sys.App.Services.GameService.getByData(query);

            for (var i = 0; i < todayGames.length; i++) {
              if(todayGames[i].winners[0]){
                  winnerId[i] = todayGames[i].winners[0].playerId;
              }
            }*/

            //let winnersToday = await Sys.App.Services.PlayerServices.getByData({id: winnerId});
            //query = { status: 'active' };
            //let activePlayers = await  Sys.App.Services.PlayerServices.getByData(query);
            /*var topWinnerId = [];
            let topperWinner = await Sys.App.Services.GameService.getByData({status: 'Finished'});

            for (var j = 0; j < topperWinner.length; j++) {
              if(topperWinner[j].winners[0]){
                  topWinnerId[j] = topperWinner[j].winners[0].playerId;
              }
              
            }

            let topFiveWinner = await Sys.App.Services.PlayerServices.getByData({id: topWinnerId});*/

            let latestPalyer = await Sys.App.Services.PlayerServices.getLimitPlayer({});
            //console.log("before",latestPalyer);
            // convert timestamp to date time format
            for (var m = 0; m < latestPalyer.length; m++) {
                let dt = new Date(latestPalyer[m].createdAt);
                latestPalyer[m].createdAtFormated = moment(dt).format('YYYY/MM/DD');
            }


            // Total game Played
            let getTotalGamePlayed = await Sys.App.Services.GameService.getGameCount();
            let getTotalPlayer = await Sys.App.Services.PlayerServices.getPlayerCount();
            let getTotalOnlinePlayers = Sys.Io.engine.clientsCount;
            let getTopPlayers = await Sys.App.Services.PlayerServices.getLimitedPlayerWithSort({}, 8, 'chips', -1);
            //console.log("total player",getTotalPlayer.length);
            /*var platformdataObj={};
            if(getTotalPlayer != 0){
                let platformQuery =[
                    
                    {
                        "$group":{
                            "_id":{"platform":"$status"},"count":{"$sum":1}
                        }
                    },
                    {"$project":{
                        "count":1,
                        "percentage":{
                            "$multiply":[
                                {"$divide":[100,getTotalPlayer]},"$count"
                            ]
                        }
                        }
                    }
                ];
                let getPlatformdata = await Sys.App.Services.PlayerServices.aggregateQuery(platformQuery);
                    platformdataObj.android=getPlatformdata.filter(platform => platform._id.status == 'active');
                    platformdataObj.ios=getPlatformdata.filter(platform => platform._id.status == 'inactive');
            }*/

            //dates of 31 days
            let endDate = moment().format("DD MMMM  Y"); // total 31 days report
            let startDate = moment().subtract(30, 'days').format("DD MMMM  Y");

            //START: get running game count 23-08-2019 chirag
            var totalPlayingPly = 0;
            var runningRoom = await Sys.App.Services.RoomServices.getRoomData({ 'status': 'Running' });
            for (var i = 0; i < runningRoom.length; i++) {
                var roomPlayers = runningRoom[i].players;
                for (var j = 0; j < roomPlayers.length; j++) {
                    if (roomPlayers[j].status != 'Left') {
                        totalPlayingPly += 1;
                    }
                }
            }

            console.log("Total playing player: ", totalPlayingPly);
            console.log("Total running room: ", runningRoom.length);

            //END: get running game count 23-08-2019 chirag

            // console.log("req.session.details: ", req.session.details);

            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                //activeGames: activeGames,
                //activeTables: activeTables,
                //newUsers: newUsers,
                //winnersToday: winnersToday,
                //activePlayers: activePlayers,
                // topFiveWinner: topFiveWinner,
                classActive: 'active',
                user: req.session.details,
                latestPalyer: latestPalyer,

                totalGamePlayed: module.exports.convertBigNumber(getTotalGamePlayed),
                toalPlayer: getTotalPlayer,
                totalOnlinePlayers: getTotalOnlinePlayers,
                topPlayers: getTopPlayers,
                //platformData:platformdataObj,
                chartStartDate: startDate,
                chartEndDate: endDate,
                totalPlayingPly: totalPlayingPly,
                totalRunningGame: runningRoom.length,
            };
            return res.render('templates/dashboard', data);
        } catch (e) {
            console.log("Error", e);
        }
    },
    graph: async function(req, res) {
        try {
            let endDate = moment().format("DD MMMM  Y"); // total 31 days report	
            let startDate = moment().subtract(30, 'days').format("DD MMMM  Y");
            var data = {
                App: Sys.Config.App.details,
                Agent: req.session.details,
                error: req.flash("error"),
                success: req.flash("success"),
                classActive: 'active',
                user: req.session.details,
                chartStartDate: startDate,
                chartEndDate: endDate,
            };
            return res.render('templates/graph', data);
        } catch (e) {
            console.log("Error", e);
        }
    },

    convertBigNumber: function(number) {
        if (number >= 1000000) {
            let newValue = number;
            const suffixes = ["", "K", "M", "B", "T"];
            let suffixNum = 0;
            while (newValue >= 1000) {
                newValue /= 1000;
                suffixNum++;
            }

            newValue = newValue.toPrecision(3);

            newValue += suffixes[suffixNum];
            return newValue;
        }
        return number;


    },

    /* getMonthlyPlayedGameChart:async function(req, res){
         let endDate =  moment().add(1,'days').format("YYYY-MM-DD");  // total 31 days report
         let startDate = moment().subtract(30, 'days').format("YYYY-MM-DD");
        
         let dateDiff =( moment().diff(moment().subtract(31, 'days')) ); //  because range dont take last value
         
         console.log("start", startDate);
         console.log("end date", endDate); 
         let query =[
                     { 
                         $match: { 
                             createdAt: { 
                                 $gte: new Date(startDate), 
                                 $lt: new Date(endDate) 
                                 
                              } 
                         }
                     },
                     {$addFields:{
                         
                          createdAt: {$subtract: [
                              '$createdAt',
                              {$add: [
                                  {$multiply: [{$hour: '$createdAt'}, 3600000]},
                                  {$multiply: [{$minute: '$createdAt'}, 60000]},
                                  {$multiply: [{$second: '$createdAt'}, 1000]},
                                  {$millisecond: '$createdAt'}
                              ]}
                          ]},
                          dateRange:{$map:{
                             input:{ $range:[0, moment(dateDiff).unix(), 60*60*24] },
                             as: "asCuRange",
                             in:{$multiply:["$$asCuRange",  1000 ]}
                          }},
                          
                     }},
         
                     {$addFields:{ 
                       dateRange:{$map:{
                         input:"$dateRange",
                         in:{$add:[new Date(startDate),  "$$this" ]}
                       }},
                     }},
                     {$unwind:"$dateRange"},
                     {$group:{
                       _id:{date:"$dateRange"},
                       count:{$sum:{$cond:[{$eq:["$dateRange","$createdAt"]},1,0]}}
                     }},
                     {$sort:{_id:1}},
                     {$project:{
                       _id:0,
                       createdAt:"$_id",
                       total:"$count",
                     }}
                  
         ];
         
         let monthlyGamePlayed = await Sys.App.Services.GameService.aggregateQuery(query);
         //console.log("game played**********888", monthlyGamePlayed);
         let dailyGamePlayedArray = [];
         let dateArray = [];
         for(user of monthlyGamePlayed)
         {
             dailyGamePlayedArray.push(user.total);
             dateArray.push(moment(user.createdAt.date).format("DD-MM"));
             
         }
         //console.log("array", dailyGamePlayedArray,dateArray )
         return res.json({dailyGamePlayedArray: dailyGamePlayedArray, dateArray: dateArray});
     },*/

    getMonthlyPlayedGameChart: async function(req, res) {
        let endDate = moment().add(1, 'days').format("YYYY-MM-DD"); // total 31 days report
        let startDate = moment().subtract(30, 'days').format("YYYY-MM-DD");

        let dateDiff = (moment().diff(moment().subtract(31, 'days'))); //  because range dont take last value

        console.log("start", startDate);
        console.log("end date", endDate);
        let query = [{
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lt: new Date(endDate)

                    }
                }
            },
            /*{
                $addFields:{
                    createdAt: {
                        $subtract: [
                            '$createdAt',
                            {
                                $add: [
                                    {$multiply: [{$hour: '$createdAt'}, 3600000]},
                                    {$multiply: [{$minute: '$createdAt'}, 60000]},
                                    {$multiply: [{$second: '$createdAt'}, 1000]},
                                    {$millisecond: '$createdAt'}
                                ]
                            }
                        ]
                    },
                    dateRange:{$map:{
                        input:{ $range:[0, moment(dateDiff).unix(), 60*60*24] },
                        as: "asCuRange",
                        in:{$multiply:["$$asCuRange",  1000 ]}
                    }},
                }
            },
            {
                $addFields:{ 
                    dateRange:{
                        $map:{
                            input:"$dateRange",
                            in:{$add:[new Date(startDate),  "$$this" ]}
                        }
                    },
                }
            },
            {$unwind:"$dateRange"},*/
            {
                $group: {
                    _id: {
                        $add: [
                            { $dayOfYear: "$createdAt" },
                        ]
                    },
                    createdAt: { $first: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            /*{
                $project:{
                    _id:0,
                    createdAt:"$_id",
                    total:"$count",
                }
            }*/

        ];

        let monthlyGamePlayed = await Sys.App.Services.GameService.aggregateQuery(query);


        let dailyGamePlayedArray = [];
        let dateArray = [];
        for (user of monthlyGamePlayed) {
            console.log("game played**********888", user);
            dailyGamePlayedArray.push(user.count);
            dateArray.push(moment(user.createdAt).format("DD-MM"));

        }
        //console.log("array", dailyGamePlayedArray,dateArray )
        return res.json({ dailyGamePlayedArray: dailyGamePlayedArray, dateArray: dateArray });
    },


    getGameUsageChart: async function(req, res) {
        let getTotalPlayer = await Sys.App.Services.PlayerServices.getPlayerCount();
        var platformdataObj = {};
        if (getTotalPlayer != 0) {
            let platformQuery = [

                {
                    "$group": {
                        "_id": { "platform_os": "$platform_os" },
                        "count": { "$sum": 1 } //status as platform 
                    }
                },
                {
                    "$project": {
                        "count": 1,

                        "percentage": {
                            "$multiply": [
                                { "$divide": [100, getTotalPlayer] }, "$count"
                            ]
                        }

                    }
                }
            ];

            let getPlatformdata = await Sys.App.Services.PlayerServices.aggregateQuery(platformQuery);
            console.log("getPlatformdata :", getPlatformdata)
            platformdataObj.android = getPlatformdata.filter(platform => platform._id.platform_os == 'android');
            platformdataObj.ios = getPlatformdata.filter(platform => platform._id.platform_os == 'ios');
            platformdataObj.webCount = getPlatformdata.filter(platform => platform._id.platform_os == 'other' || platform._id.platform_os == null).reduce((partial_sum, a) => partial_sum.count + a.count);


            // platformdataObj.android=getPlatformdata.filter(platform => platform._id.platform == 'android');
            // platformdataObj.web=getPlatformdata.filter(platform => platform._id.platform == 'web');
            // platformdataObj.ios=getPlatformdata.filter(platform => platform._id.platform == null);
        }

        console.log("platform", platformdataObj)
        res.json(platformdataObj);
    },


    getNotificationCount: async function(req, res) {
        try {
            const [newWithdrawReq, newDepositReceipt] = await Promise.all([
                Sys.App.Services.PlayerServices.getNewWithdrawCount({ seen: false }),
                Sys.App.Services.PlayerServices.getNewDepositCount({ seen: false }),
            ]);
            return res.json({
                withdrawCount: newWithdrawReq,
                depositCount: newDepositReceipt,
            });
        } catch (err) {
            console.log(err);
        }
    },
}