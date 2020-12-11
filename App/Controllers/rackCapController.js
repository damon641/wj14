var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');

module.exports = {
	rakeCap: async function(req,res){
		try {
        
			var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
				error: req.flash("error"),
				success: req.flash("success"),
        RakeCapActive : 'active'
			};
			return res.render('cashGame/rakeCap',data);
		} catch (e) {
			console.log("Error",e);
		}
	},

	getRackCape: async function(req,res){

		try {
			let start = parseInt(req.query.start);
			let length = parseInt(req.query.length);
			let search = req.query.search.value;

			let query = {};
			if (search != '') {
				let capital = search;
           
                query = { stack: { $regex: '.*' + search + '.*' } };
            } else {
            	query = { };
            }

            let stacksCount = await Sys.App.Services.RackCapServices.getRakeCapCount(query);
            //let stacksCount = stacksC.length;
            let data = await Sys.App.Services.RackCapServices.getRakeCapDatatable(query, length, start);
            
            
            var obj = {
            	'draw': req.query.draw,
            	'recordsTotal': stacksCount,
            	'recordsFiltered': stacksCount,
            	'data': data
            };
            res.send(obj);
        } catch (e) {
        	console.log("Error",e);
        }
    },

    addRackCap: async function(req,res){
    	try {
        let stacks = await Sys.App.Services.StacksServices.getStacksDatatable();
        stacks.map(z=>{
          z.stack=z.minStack+"/"+z.maxStack;
        })
			var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        stacks:stacks,
				error: req.flash("error"),
				success: req.flash("success"),
        RakeCapActive : 'active'
			};
			return res.render('cashGame/addRakeCap',data);
		} catch (e) {
			console.log("Error",e);
		}
    },

    postRakeCap: async function(req,res){
    	try{
          console.log(req.body)
        let data = await Sys.App.Services.RackCapServices.getRakeCapDatatable({stack:req.body.stack});
        if(data.length)
        {
          req.flash('error', 'Already Rake Cape added');
          res.redirect("/cashgames/rakeCap");
          return;

        }
    	 await Sys.App.Services.RackCapServices.insertStacksData(
              {
                stack: req.body.stack,
                rake: req.body.rake,
                player2Cap: req.body.player2Cap,
                player3Cap: req.body.player3Cap,
                player5Cap: req.body.player5Cap,
              }
            )
            req.flash('success','Rake Cap create successfully');
            res.redirect("/cashgames/rakeCap");

    	}catch (e){
    		console.log("Error",e);

    	}
    },

    getRackCapDelete: async function(req,res){
    	try {
        console.log("id","req.body.id",req.body.id);
        
          let RackCap = await Sys.App.Services.RackCapServices.getRakeCapData({_id: req.body.id});
          console.log(RackCap);
          
          if (RackCap || RackCap.length >0) {
            await Sys.App.Services.RackCapServices.deleteRackCap(req.body.id)
            return res.send("success");
          }else {
            return res.send("error");
          }
        } catch (e) {
            console.log("Error",e);
        }
    },

    editRackCap: async function(req,res){
    	 try {
        let stacks = await Sys.App.Services.StacksServices.getStacksDatatable();
        stacks.map(z=>{
          z.stack=z.minStack+"/"+z.maxStack;
        })
        
        let rackCap = await Sys.App.Services.RackCapServices.getRakeCapData({_id: req.params.id});

        return res.render('cashGame/addRakeCap',{App : Sys.Config.App.details,Agent : req.session.details,stacks:stacks,rackCap: rackCap , RakeCapActive : 'active'});
        // res.send(player);
      } catch (e) {
        console.log("Error",e);
      }

    },

    editRackCapPostData: async function(req,res){
        try {
          let stacks = await Sys.App.Services.RackCapServices.getRakeCapData({_id: req.params.id});
          console.log("in stacks ")
          if (stacks) {
            console.log(stacks)
              await Sys.App.Services.RackCapServices.updateRackCapData(
                {
                  _id: req.params.id
                },{
                  stack: req.body.stack,
                  rake: req.body.rake,
                  player2Cap: req.body.player2Cap,
                  player3Cap: req.body.player3Cap,
                  player5Cap: req.body.player5Cap,
                }
              )
              req.flash('success','Rake Cap update successfully');
              res.redirect('/cashGames/rakeCap');

          }else {
            req.flash('error', 'Rake Cap not update successfully');
            res.redirect('/cashGames/rakeCap');
            return;
          }
          // req.flash('success', 'Player Registered successfully');
          // res.redirect('/');
        } catch (e) {
            console.log("Error",e);
        }
    },
}