const Sys = require('../../Boot/Sys');
const bcrypt = require('bcryptjs');
module.exports = {

    getByData: async function(req, res){ 
    	try{
    		let getData = await Sys.App.Services.NewServices.getByData({}, {firstname: 1}, { sort: {createdAt:-1}, limit:2, skip:1 } ); 
    		return res.json(getData); 
    	}catch(e){
    		console.log("Error===========",e);
    		return res.json(e.message);
    	} 
    		
    },

    getSingleData: async function(req, res){ 
    	try{
    		let getData = await Sys.App.Services.NewServices.getSingleData({_id: req.body.id}, {firstname: 1, email: 1} ); 
    		return res.json(getData); 
    	}catch(e){
    		console.log("Error===========",e);
    		return res.json(new Error(e));
    	} 
    		
    },

    getById: async function(req, res){ 
    	try{
    		let getData = await Sys.App.Services.NewServices.getById(req.body.id, {firstname: 1, email: 1}); 
    		return res.json(getData); 
    	}catch(e){
    		console.log("Error===========",e);
    		return res.json(new Error(e));
    	} 
    		
    },

    getCount: async function(req, res){ 
    	try{
    		let getData = await Sys.App.Services.NewServices.getCount({}); 
    		return res.json(getData); 
    	}catch(e){
    		console.log("Error===========",e);
    		return res.json(new Error(e));
    	} 
    		
    },

    getAgents: async function(req, res){
      try{
        let start = parseInt(req.body.start);
        let length = parseInt(req.body.length);
        let search = req.body.value;

        // query to get particular agent or admin's sub-agents
        

        let query = {};
        let populateWith = {};

        if (search != '') {
            query = {  email: { $regex: '.*' + search + '.*' }  };
        } else {
            query = {   };
        }

      let agentCount = await Sys.App.Services.NewServices.getCount(query);
      //let agentCount = agentsC.length;
      let data = await Sys.App.Services.NewServices.getByData( query, null, {skip: start, limit: length,sort:{createdAt:-1}} );
      var obj = {
        'draw': req.query.draw,
        'recordsTotal': agentCount,
        'recordsFiltered': agentCount,
        'data': data
      };
      res.send(obj);
      }catch(e){
        console.log("Error===========",e);
        return res.json(new Error(e));
      }
    },

    insertData: async function(req, res){
    	try{
    		let insertAgent=await Sys.App.Services.NewServices.insertData(
	    	{
	    	  username: req.body.username,
	    	  password : bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null),
	    	  firstname: req.body.firstname,
	    	  lastname: req.body.lastname,
	    	  mobile: req.body.mobile,
	    	  email: req.body.email,
	    	  commission: req.body.commission,
	    	  status: req.body.status,
	    	  parentId: req.body.parentId,
	    	  //level: req.body.level,
	    	  //role: 'Agent',
	    	}
	    	);
    		return res.json(insertAgent); 
    	}catch(e){
    		console.log("Error===========",e);
    		return res.json(new Error(e));
    	} 
    	
    },

    insertData: async function(req, res){
    	try{
    		let insertAgent=await Sys.App.Services.NewServices.insertData(
	    	{
	    	  username: req.body.username,
	    	  password : bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null),
	    	  firstname: req.body.firstname,
	    	  lastname: req.body.lastname,
	    	  mobile: req.body.mobile,
	    	  email: req.body.email,
	    	  commission: req.body.commission,
	    	  status: req.body.status,
	    	  parentId: req.body.parentId,
	    	  //level: req.body.level,
	    	  //role: 'Agent',
	    	}
	    	);
    		return res.json(insertAgent); 
    	}catch(e){
    		console.log("Error===========",e);
    		return res.json(new Error(e));
    	} 
    	
    },

    deleteData: async function(req, res){
      try{
        let agent = await Sys.App.Services.NewServices.getByData({_id: req.body.id});
        console.log("==========",agent, agent.length);
        if(agent.length > 0){
          let deletedData=await Sys.App.Services.NewServices.deleteData(req.body.id);
          return res.send(deletedData);
        }else{
          return res.send("error");
        }

      }catch(e){
        console.log("Error===========",e);
        return res.json(new Error(e));
      }
    },

    aggregateQuery: async function(req, res){
    	try{
    		/*let platformQuery =[
    		    
    		    {
    		        "$group":{
    		            "_id":{"platform":"$platform"},"count":{"$sum":1}
    		        }
    		    },
    		    {"$project":{
    		        "count":1,
    		        
    		        "percentage":{
    		            "$multiply":[
    		                {"$divide":[100,25]},"$count"
    		            ]
    		        }

    		        }
    		    }
    		];*/
    		let platformQuery =[
    		    /*{
    		    	"$match":{
    		    		email:'nayan@yahoo.com'
    		    	}
    		    },	*/	    
    		    {
    		        "$group":{
    		            "_id":{"gender":"$gender"},"count":{"$sum":1}
    		        }
    		    },
    		    

    		];
    		let data = await Sys.App.Services.NewServices.aggregateQueryCount(platformQuery);
    		return res.json(data);
    	}catch(e){
    		console.log("Error===========",e);
    		return res.json(new Error(e));
    	}
    },

    getPopulatedData: async function(req, res){
    	try{
    	  let agent = await Sys.App.Services.NewServices.getByData({_id: req.body.id});
    	  

    	}catch(e){
    	  console.log("Error===========",e);
    	  return res.json(new Error(e));
    	}	
    },

    playerGameStats: async function(req, res){
        try{
            try{
               
               let data  = await Sys.App.Services.GameService.getGameDatatableTest({players: { $elemMatch: { id: "5d91d0f632c6c709c287f6df" } } });
               console.log(data);
               let final= [];
               if(data.length > 0){
                for(let g = 0; g < data.length; g++ ){
                    let obj ={};
                    obj.gameNumber = data[g].gameNumber;
                    obj.roomNumber = data[g].roomId;
                    obj.createdAt = data[g].createdAt;
                    for( let p = 0; p< data[g].players.length; p++){
                        if(data[g].players[p].id == "5d91d0f632c6c709c287f6df"){
                            obj.afterBalance = data[g].players[p].chips;
                        }
                    }
                    obj.beforeBalance = 0;
                    for( let h = 0; h< data[g].history.length; h++){
                        if(data[g].history[h].playerId == "5d91d0f632c6c709c287f6df"){
                            obj.beforeBalance = ( data[g].history[h].betAmount + data[g].history[h].remaining );
                            break;
                        }
                    }
                    if(obj.beforeBalance == 0){
                        console.log("when beforebalance is zero", data[g].gameNumber);
                        obj.beforeBalance = obj.afterBalance;
                    }

                    final.push(obj);
                }
               }
               return res.render('player/playerStatsTest',{
                final: final,
              });
            }catch(e){
               console.log(e);
               return new Error("Error",e);
            }
        }catch(e){
            console.log("error", e);
        }
    },

    multipleWinner: async function(req, res){
        try{
            let data = await Sys.App.Services.GameService.getByData({"winnerDetails.3": { "$exists": true } });
            let winnerGameArray = [];
            if(data.length > 0){
                for(let g = 0; g < data.length; g++){
                    winnerGameArray.push(data[g]._id)
                }
                res.json(winnerGameArray);
            }
        }catch(e){  
            console.log("error in multipleWinner");
        }
    }

  

}