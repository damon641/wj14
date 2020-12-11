const Sys = require('../../Boot/Sys');
const mongoose = require('mongoose');
module.exports = {
	
	addStatisticPostdata: async function(req, res){
		try{
			let insertStatistics = await Sys.App.Services.gameStatisticsServices.insertData({
				'game': req.body.game,
				'player': req.body.player,
				'result': req.body.result,
				'chips': req.body.chips,
			});
			console.log(insertStatistics);
			res.send(insertStatistics)
		}catch(e){
			console.log("Error", e);
			req.flash('error','Problem Adding statistics data');
			return new Error("Error", e);
		}
	},

	getMonthlyGamePlayedByPlayerChart: async function(req,res){
	    console.log(req.params.id)
	    let query =[
	                { 
	                    $match: { 
							player : mongoose.Types.ObjectId(req.params.id),
	                        createdAt: { 
	                            $lte: new Date(new Date().getFullYear()+"-12-31"), 
	                            $gte: new Date(new Date().getFullYear()+"-01-01") 
	                         } 
	                    }
	                },
	                
	                {
	                    $group:{
	                        _id : {month:{$month: '$createdAt'}},
	                        count: {$sum: 1}
	                    }

	                },
	                {
	                    $project :{
	                        month: 1,
	                        count:1
	                    }
	                }

	    ];

	    // let wonQuery =[
	    //             { 
	    //                 $match: { 
	    //                     createdAt: { 
	    //                         $lte: new Date(new Date().getFullYear()+"-12-31"), 
	    //                         $gte: new Date(new Date().getFullYear()+"-01-01") 
	    //                      },
	    //                      result: 'Won', 
	    //                 }
	    //             },
	                
	    //             {
	    //                 $group:{
	    //                     _id : {month:{$month: '$createdAt'}},
	    //                     count: {$sum: 1}
	    //                 }

	    //             },
	    //             {
	    //                 $project :{
	    //                     month: 1,
	    //                     count:1
	    //                 }
	    //             }

	    // ];

	    // let lostQuery =[
	    //             { 
	    //                 $match: { 
	    //                     createdAt: { 
	    //                         $lte: new Date(new Date().getFullYear()+"-12-31"), 
	    //                         $gte: new Date(new Date().getFullYear()+"-01-01") 
	    //                      },
	    //                      result: 'Lost', 
	    //                 }
	    //             },
	                
	    //             {
	    //                 $group:{
	    //                     _id : {month:{$month: '$createdAt'}},
	    //                     count: {$sum: 1}
	    //                 }

	    //             },
	    //             {
	    //                 $project :{
	    //                     month: 1,
	    //                     count:1
	    //                 }
	    //             }

	    // ];
	    

	    let monthlyGamePlayed = await Sys.App.Services.gameStatisticsServices.aggregateQuery(query);
		let monthlyGamePlayedArray = [];
		console.log("monthlyGamePlayed ->",monthlyGamePlayed)
	    for(user of monthlyGamePlayed)
	    {
	        monthlyGamePlayedArray[user._id.month -1] = user.count;
	    }
	    
	    // let monthlyWonGame = await Sys.App.Services.gameStatisticsServices.aggregateQuery(wonQuery);
	    // let monthlyWonGameArray = [];
	    // for(user of monthlyWonGame)
	    // {
	        
	    //     monthlyWonGameArray[user._id.month -1] = user.count;
	        
	    // }
	    // let monthlyLostGame = await Sys.App.Services.gameStatisticsServices.aggregateQuery(lostQuery);
	    // let monthlyLostGameArray = [];
	    // for(user of monthlyLostGame)
	    // {
	        
	    //     monthlyLostGameArray[user._id.month -1] = user.count;
	        
		// }
		
		console.log("monthlyGamePlayedArray :",monthlyGamePlayedArray)

	    return res.json({monthlyGamePlayed: monthlyGamePlayedArray }); //  monthlyWonGame: monthlyWonGameArray, monthlyLostGame: monthlyLostGameArray 
  	},


}