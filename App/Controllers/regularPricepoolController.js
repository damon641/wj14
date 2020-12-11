var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');

const moment = require('moment');
module.exports = {

  /**
    SNG Tournament 
  **/

  regularPricePool: async function (req, res){
    try {
      let query ={};
      let pricepoolCount = await Sys.App.Services.regularPricepoolServices.getPricePoolCount(query);
      let pricepool = await Sys.App.Services.regularPricepoolServices.getPricePoolData(query);
      console.log(pricepool);
      let winner_places = ['place_1','place_2','place_3','place_4','place_5','place_6','place_7','place_8','place_9','place_10','place_11_15','place_16_20','place_21_27','place_28_36','place_37_45','place_46_63','place_64_81','place_82_99','place_100_126','place_127_153','place_154_189','place_190_225','place_226_306','place_307_378','place_379_450','place_451_600','place_601_750','Action'];
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        regularPricepoolActive : 'active',
        pricepoolManagementMenu: 'active menu-open',
        pricepoolCount: pricepoolCount,
        pricepool: pricepool,
        winner_places: winner_places
        
      };
      return res.render('regularTournament/pricepool',data);
    }
    catch (e){
      console.log(e);
    }
  },
  addregularPricePool: async function(req, res){
    try{
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        agentActive : 'active',
        isEdit: false
      };
      return res.render('regularTournament/addPricepool',data);
    }catch(e){
      console.log("Error", e);
      return new Error("Error", e);
    }
  },

  getRegularPricePool: async function(req, res){
    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;

      let query = {};
      if (search != '') {
        query = {  };
      } else {
        query = {  };
      }
           
      let pricepoolCount = await Sys.App.Services.regularPricepoolServices.getPricePoolCount(query);
      let data = await Sys.App.Services.regularPricepoolServices.getPricePoolDatatable(query, length, start);
            
      var obj = {
        'draw': req.query.draw,
        'recordsTotal': pricepoolCount,
        'recordsFiltered': pricepoolCount,
        'data': data
      };
        res.send(obj);
      } catch (e) {
        console.log("Error",e);
      }
  },

  addregularPricePoolPostData: async function(req, res){
      try {
        let pricepool = await Sys.App.Services.regularPricepoolServices.getPricePoolCount({minPlayers: req.body.minPlayers,maxPlayers: req.body.maxPlayers});
        if (pricepool >0) {
          req.flash('error', 'This Entry Already Present');
          res.redirect('/price-pool/regularTournament/add');
          return;

        }else {

          await Sys.App.Services.regularPricepoolServices.insertPricePoolData({
            minPlayers: req.body.minPlayers,
            maxPlayers: req.body.maxPlayers,
            place_1: req.body.placeFirst,
            place_2: req.body.placeSecond,
            place_3: req.body.placeThird,
            place_4: req.body.placeForth,
            place_5: req.body.placeFifth,
            place_6: req.body.placeSixth,
            place_7: req.body.placeSeventh,
            place_8: req.body.placeEigth,
            place_9: req.body.placeNine,
            place_10: req.body.placeten,
            place_11_15: req.body.place11_15,
            place_16_20: req.body.place16_20,
            place_21_27: req.body.place21_27,
            place_28_36: req.body.place28_36,
            place_37_45: req.body.place37_45,
            place_46_63: req.body.place46_63,
            place_64_81: req.body.place64_81,
            place_82_99: req.body.place82_99,
            place_100_126: req.body.place100_126,
            place_127_153: req.body.place127_153,
            place_154_189: req.body.place154_189,
            place_190_225: req.body.place190_225,
            place_226_306: req.body.place226_306,
            place_307_378: req.body.place307_378,
            place_379_450: req.body.place379_450,
            place_451_600: req.body.place451_600,
            place_601_750: req.body.place601_750
            // isFreeRoll: req.body.isFreeRoll,
           
          });
          req.flash('success','Pricepool created successfully');
          res.redirect('/price-pool/regularTournament');
        }
      }
      catch (e){
        req.flash('error','Error Adding Pricepool');
        res.redirect('/price-pool/regularTournament/add');
        console.log("Error in Pricepool :", e);
      }
  },

  lengthTwoPropertyFormatter: function(property){
    let min = property.toString()[0] + 1;
    let max = ( parseInt( property.toString()[0] ) + 1 ) + '0';
    return 'place'+ '_'+min+ '_'+max;
  },

  lengthThreePropertyFormatter: function(property){
    let min = property.toString()[0] + '01';
    let max = ( parseInt( property.toString()[0] ) + 1 ) + '00';
    return 'place'+ '_'+min+ '_'+max;
  },

  getpercentage:async function(req, res){
    let property = req.body.property;
    var finalProperty ='';
    if(property.toString().length ==2){
      
      if( property== 10){
        finalProperty ='place'+ '_'+property;
      }
      else if(property.toString().slice(-1) == '0' && property!= 10){
        property--;
        finalProperty = module.exports.lengthTwoPropertyFormatter(property); 
      }else{
        finalProperty = module.exports.lengthTwoPropertyFormatter(property); 
      }
     
      
    }else if(property.toString().length ==3){
      
      if(property == '100'){
        property--;
        finalProperty = module.exports.lengthTwoPropertyFormatter(property); 
      }
      else if(property.toString().slice(-1) == '0' && property != '100'){
        property--;
        finalProperty = module.exports.lengthThreePropertyFormatter(property); 
      }else{
        finalProperty = module.exports.lengthThreePropertyFormatter(property); 
      }
        
    }else{
      finalProperty ='place'+ '_'+property;
    }
    
    let data = await Sys.App.Services.regularPricepoolServices.getPricePoolDataSelect({minPlayers:req.body.minPlayers,maxPlayers:req.body.maxPlayers},finalProperty);
    //console.log(data);
    res.send(data);
  },

  getTournamentPlayersPercentage: async function(req, res){
    try{

      let tournamentId = '5c23547dc24a762dfc3ff718';
      let roomId = 123;

      console.log("<<======= Tournament Finished =======>>");
			let tournament = await Sys.Game.Reguler.Texas.Services.TournamentServices.getById(tournamentId);
			if (!tournament) {
				return {	status: 'fail',	result: null,message: "Tournament not found",	statusCode: 401	};
			}
            
            let payOutRecords = await Sys.Game.Reguler.Texas.Services.pricePoolServices.getPricePoolDataSelect( {maxPlayers: { $gte:  tournament.players.length} } );
                if(payOutRecords[0]){
                    let prisePoolArray = [];
                    for (let [key, value] of Object.entries(payOutRecords[0].toObject())) {
                      if(value == 0){  break; }
                      if(key.includes('place_')){
                        prisePoolArray.push({
                          key : key,
                          value : value
                        })
                      }
                    }
               
                    let playout = [];
                    for(let i=0; i < prisePoolArray.length ; i++){
                      var expArry = prisePoolArray[i].key.split("place_");
                      if(expArry[1].includes('_')){
                        let subArry = expArry[1].split("_");
                        for(let j=subArry[0];j<=subArry[1];j++){
                          playout.push(prisePoolArray[i].value);
                        }
                      }else{
                        playout.push(prisePoolArray[i].value);
                      }
                    } 
                    console.log("playout ->",playout);

                    let totalPayout = eval( parseFloat(tournament.buy_in * tournament.players.length).toFixed(2) );

                    console.log("totalPayout ->",totalPayout);


                    let first = true;
            
                    for(let i = 0; i < playout.length; i++){
              
                        let player = await Sys.Game.Reguler.Texas.Services.PlayerServices.getById(tournament.tournamentLosers[i]);
                        
                        let pay = eval( parseFloat(totalPayout*playout[i]/100).toFixed(2) );

                        if(first){
                            first = false;
                            await Sys.Io.of(Sys.Config.Namespace.CashRegularTexas).to(roomId).emit('RegularTournamentFinished',{
                                id        :  player.id,
                                username  :  player.username, 
                                avatar    :  player.profilePicId, 
                                winningChips : pay
                            });
                            console.log("First Winner :",player.username);
                        }                
        
                        tournament.tournamentWinners.push({
                          id        :  player.id,
                          username  :  player.username, 
                          avatar    :  player.profilePicId, 
                          winningChips : pay
                        });
                  
                        // Update Player Chips
                        await Sys.Game.Reguler.Texas.Services.PlayerServices.update(player.id,{ chips: eval( parseFloat( parseFloat(player.chips) + parseFloat(pay) ).toFixed(2) ) });


                    }
        
                    //Clear Room & other data.
                    for(let i=0;i<tournament.rooms.length;i++){
                        console.log("Clear Room :",tournament.rooms[i])
                        let room = await Sys.Game.Reguler.Texas.Services.RoomServices.get(tournament.rooms[i]);
                        room.status = 'Closed';
                        room.game = null; 
                        room = await Sys.Game.Reguler.Texas.Services.RoomServices.update(room);
                    }
                    clearTimeout(Sys.Timers[tournamentId]);
                    console.log("tournament.tournamentWinners :",tournament.tournamentWinners)
                    await Sys.Game.Reguler.Texas.Services.TournamentServices.updateTourData({_id: tournamentId},{status:'Finished',tournamentWinners : tournament.tournamentWinners});
        
                    res.send(playout); 

                }else{
                    console.log('No Playout Found!')
                    res.send("no Data"); 
                }


    //   let maxP = req.body.maxPlayers;
    //   console.log("M:",maxP)
    //   let data = await Sys.App.Services.regularPricepoolServices.getPricePoolDataSelect( {maxPlayers: { $gte: maxP } } );
    //   let finalData = data[0];
    //  // console.log("finalData",finalData);
    
    //   let prisePoolArray = [];
    //   for (let [key, value] of Object.entries(finalData.toObject())) {
    //     if(value == 0){  break; }
    //     if(key.includes('place_')){
    //       prisePoolArray.push({
    //         key : key,
    //         value : value
    //       })
    //     }
    //   }
 
    //   let playout = [];
    //   for(let i=0; i < prisePoolArray.length ; i++){
    //     var expArry = prisePoolArray[i].key.split("place_");
    //     if(expArry[1].includes('_')){
    //       let subArry = expArry[1].split("_");
    //       for(let j=subArry[0];j<=subArry[1];j++){
    //         playout.push(prisePoolArray[i].value);
    //       }
    //     }else{
    //       playout.push(prisePoolArray[i].value);
    //     }
    //   }

    //   console.log("playout :",playout);
 
       //res.send(playout); 

    }catch(e){
      console.log("error",e);
    }
    
  },


  deleteregularPricePool: async function(req,res){
    try {
      let pricepool = await Sys.App.Services.regularPricepoolServices.getPricePoolData({_id: req.body.id});
      if (pricepool || pricepool.length >0) {
        await Sys.App.Services.regularPricepoolServices.deletePricePool(req.body.id);
        req.flash('success','Pricepool Deleted successfully');
        //res.redirect('/price-pool/regularTournament');

        return res.send("success");
      }else {
        return res.send("error");
      }
    } catch (e) {
      console.log("Error while Deleting pricepool",e);
      req.flash('error','Error Deleting Pricepool');
      res.redirect('/price-pool/regularTournament');
    }
  },

  editregularPricePool: async function(req, res){
    try {
        let pricepool = await Sys.App.Services.regularPricepoolServices.getSinglePricePoolData({_id: req.params.id});
        var data = {
           App : Sys.Config.App.details,Agent : req.session.details,
           error: req.flash("error"),
           success: req.flash("success"),
           playerActive : 'active',
           pricepool: pricepool,
           isEdit: true
         };
        return res.render('regularTournament/addPricepool',data);
      // res.send(player);
    } catch (e) {
      console.log("Error",e);
    }
  },

  editregularPricePoolPostData: async function(req, res){
    try {
      let pricepool = await Sys.App.Services.regularPricepoolServices.getPricePoolData({_id: req.params.id});
      if (pricepool && pricepool.length >0) {

            await Sys.App.Services.regularPricepoolServices.updatePricePoolData(
            {
              _id: req.params.id
              },{
                minPlayers: req.body.minPlayers,
                maxPlayers: req.body.maxPlayers,
                place_1: req.body.placeFirst,
                place_2: req.body.placeSecond,
                place_3: req.body.placeThird,
                place_4: req.body.placeForth,
                place_5: req.body.placeFifth,
                place_6: req.body.placeSixth,
                place_7: req.body.placeSeventh,
                place_8: req.body.placeEigth,
                place_9: req.body.placeNine,
                place_10: req.body.placeten,
                place_11_15: req.body.place11_15,
                place_16_20: req.body.place16_20,
                place_21_27: req.body.place21_27,
                place_28_36: req.body.place28_36,
                place_37_45: req.body.place37_45,
                place_46_63: req.body.place46_63,
                place_64_81: req.body.place64_81,
                place_82_99: req.body.place82_99,
                place_100_126: req.body.place100_126,
                place_127_153: req.body.place127_153,
                place_154_189: req.body.place154_189,
                place_190_225: req.body.place190_225,
                place_226_306: req.body.place226_306,
                place_307_378: req.body.place307_378,
                place_379_450: req.body.place379_450,
                place_451_600: req.body.place451_600,
                place_601_750: req.body.place601_750
                // isFreeRoll: req.body.isFreeRoll,
              }
              )
            req.flash('success','Pricepool updated successfully');
            res.redirect('/price-pool/regularTournament');

          }else {
            req.flash('error', 'No Pricepool found');
            res.redirect('/price-pool/regularTournament');
            return;
          }
      } catch (e) {
        console.log("Error",e);
      }
  }

 /* sngPricePoolUpdate: async function(req, res){
    try {
      let pricepool = await Sys.App.Services.sngPricepoolServices.getPricepoolData({_id: req.body.id});
      if (pricepool) {
        await Sys.App.Services.sngPricepoolServices.updatePricepoolData({
          _id: req.body.id
        }, {
          winner: req.body.winner,
          firstRunnerUp: req.body.firstRunnerUp, 
          secondRunnerUp: req.body.secondRunnerUp,
        });
        req.flash('success','Pricepool updated successfully');
        res.redirect('/price-pool/sngTournament');
      }
      else{
        req.flash('error','Error Updating Pricepool');
        res.redirect('/price-pool/sngTournament');
      }
    }
    catch (e){
      req.flash('error','Error Updating Pricepool');
      res.redirect('/price-pool/sngTournament');
      console.log("Error in Pricepool :", e);
    }
  }*/
  

}