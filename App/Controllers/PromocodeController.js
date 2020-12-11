var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');

module.exports = {
   
    promocode: async function(req, res){
      try {

        var data = {
          App : Sys.Config.App.details,Agent : req.session.details,
          error: req.flash("error"),
          success: req.flash("success"),
          promocodeActive : 'active'
        };
        return res.render('promocode/promocode',data);
      } catch (e) {
        console.log("Error",e);
      }
    },

    addPromocode: async function(req, res){
      try {

        var data = {
          App : Sys.Config.App.details,Agent : req.session.details,
          error: req.flash("error"),
          success: req.flash("success"),
        };
        return res.render('promocode/addPromocode',data);
      } catch (e) {
        console.log("Error",e);
      }
    },

    addPromocodePostData:async function(req, res){
      try{
        let fileName;
        if (req.files) {
          let image = req.files.image;
          var re = /(?:\.([^.]+))?$/;
          var ext = re.exec(image.name)[1];
          fileName = Date.now()+'.'+ext;
              
          image.mv('./public/promocode/'+fileName, function(err) {
            if (err){
              req.flash('error', 'Error Uploading Profile Avatar');
              console.log("error");
              return res.redirect('/promocode');
            }
          });
        }
        await Sys.App.Services.PromocodeServices.insertPromocodeData(
          {
            name: req.body.name,
            status: req.body.status,
            code: req.body.code,
            image: 'promocode/'+fileName
          }
        )
        req.flash('success','Promocode Added.');
        res.redirect("/promocode");

      }catch (e){
        console.log("Error",e);

      }
    },

    getPromocode: async function(req, res){
    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;

      let query = {};
      if (search != '') {
        query = { code: { $regex: '.*' + search + '.*' } };
        } else {
          query = { };
        }

        let promocodeCount = await Sys.App.Services.PromocodeServices.getPromocodeCount(query);
        //let stacksCount = stacksC.length;
        let data = await Sys.App.Services.PromocodeServices.getPromocodeDatatable(query, length, start);
        var obj = {
          'draw': req.query.draw,
          'recordsTotal': promocodeCount,
          'recordsFiltered': promocodeCount,
          'data': data
        };
        res.send(obj);
      } catch (e) {
        console.log("Error",e);
      }
    },

    editPromocode:async function(req,res){
      try{
      let promocode = await Sys.App.Services.PromocodeServices.getSinglePromocodeData({_id: req.params.id});
      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        agentActive : 'active',
        promocode: promocode,
      };
      return res.render('promocode/addPromocode',data);
      }catch(e){
        console.log("Error", e);
        return new Error("Error", e);
      }
    },

    editPromocodePostData: async function(req,res){
        try {
          let promocode = await Sys.App.Services.PromocodeServices.getSinglePromocodeData({_id: req.params.id});
          let fileName;
          if (promocode) {
              if (req.files.image) {
                 let image = req.files.image;
                 var re = /(?:\.([^.]+))?$/;
                 var ext = re.exec(image.name)[1];
                 fileName = 'promocode/'+Date.now()+'.'+ext;
                     
                 image.mv('./public/'+fileName, function(err) {
                   if (err){
                     req.flash('error', 'Error Uploading Profile Avatar');
                     console.log("error");
                     return res.redirect('/promocode');
                   }
                 });
              }else{
                fileName = promocode.image;
              }
              await Sys.App.Services.PromocodeServices.updatePromocodeData(
                {
                  _id: req.params.id
                },{
                    name: req.body.name,
                    status: req.body.status,
                    code: req.body.code,
                    image: fileName
                }
              )
              req.flash('success','Promocode updated successfully');
              res.redirect('/promocode');

          }else {
            req.flash('error', 'Promocode not updated successfully');
            res.redirect('/promocode/add');
            return;
          }
          // req.flash('success', 'Player Registered successfully');
          // res.redirect('/');
        } catch (e) {
            console.log("Error",e);
        }
    },

    deletePromocode: async function(req, res){
        try {
            let promocode = await Sys.App.Services.PromocodeServices.getSinglePromocodeData({_id: req.body.id});
            if (promocode || promocode.length >0) {
              await Sys.App.Services.PromocodeServices.deletePromocode(req.body.id)
              return res.send("success");
            }else {
              return res.send("error");
            }
          } catch (e) {
              console.log("Error",e);
          }
    }

}