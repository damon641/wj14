var Sys = require('../../Boot/Sys');
var bcrypt = require('bcryptjs');
var FroalaEditor = require('wysiwyg-editor-node-sdk/lib/froalaEditor.js');
module.exports = {
  news: async function(req,res){
    try {

      var data = {
        App : Sys.Config.App.details,Agent : req.session.details,
        error: req.flash("error"),
        success: req.flash("success"),
        newsActive : 'active'
      };
      return res.render('news/news',data);
    } catch (e) {
      console.log("Error",e);
    }
  },

  getNews: async function(req,res){

    try {
      let start = parseInt(req.query.start);
      let length = parseInt(req.query.length);
      let search = req.query.search.value;

          let query = {};
          if (search != '') {
              query = { title: { $regex: '.*' + search + '.*' } };
          } else {
            query = { };
          }

          let newsCount = await Sys.App.Services.newsServices.getNewsCount(query);
          //let stacksCount = stacksC.length;
          let data = await Sys.App.Services.newsServices.getNewsDatatable(query, length, start);
          var obj = {
            'draw': req.query.draw,
            'recordsTotal': newsCount,
            'recordsFiltered': newsCount,
            'data': data
          };
          res.send(obj);
        } catch (e) {
          console.log("Error",e);
        }
  },

  addNews: async function(req,res){
      try {

            var data = {
              App : Sys.Config.App.details,Agent : req.session.details,
              error: req.flash("error"),
              success: req.flash("success"),
            };
          return res.render('news/addNews',data);
      } catch (e) {
        console.log("Error",e);
      }
  },

  postNews: async function(req,res){
    try{
  
     await Sys.App.Services.newsServices.insertNewsData(
            {
              title: req.body.title,
              shortDesc: req.body.shortDesc,
              longDesc: req.body.longDesc,
            }
          )
          req.flash('success','News created successfully');
          res.redirect("/news");

    }catch (e){
      console.log("Error",e);

    }
  },

  getNewsDelete: async function(req,res){
    try {
        let news = await Sys.App.Services.newsServices.getSingleNewsData({_id: req.body.id});
        
        if (news) {
          await Sys.App.Services.newsServices.deleteNews(req.body.id)
          return res.send("success");
        }else {
          return res.send("error");
        }
      } catch (e) {
          console.log("Error",e);
      }
  },

  editNews: async function(req,res){
      try {
        let news = await Sys.App.Services.newsServices.getSingleNewsData({_id: req.params.id});
        var data = {
           App : Sys.Config.App.details,Agent : req.session.details,
           error: req.flash("error"),
           success: req.flash("success"),
           news: news,
         };
        return res.render('news/addNews',data);
      // res.send(player);
      } catch (e) {
      console.log("Error",e);
      }
  },

  editNewsPostData: async function(req,res){
      try {
        let news = await Sys.App.Services.newsServices.getSingleNewsData({_id: req.params.id});
        if (news) {

            await Sys.App.Services.newsServices.updateNewsData(
              {
                _id: req.params.id
              },{
                 title: req.body.title,
                shortDesc: req.body.shortDesc,
                longDesc: req.body.longDesc,
              }
            )
            req.flash('success','News updated successfully');
            res.redirect('/news');

        }else {
          req.flash('error', 'News not update successfully');
          res.redirect('/news/addNews');
          return;
        }
        // req.flash('success', 'Player Registered successfully');
        // res.redirect('/');
      } catch (e) {
          console.log("Error",e);
      }
  },

  uploadEditorImage: async function(req, res){
    try {
      console.log("image upload");
     /* image.mv('./public/news/'+fileName, async function(err) {
        if (err){
          if (err) {
            console.log(err);
            return res.send(JSON.stringify(err));
          }
          res.send(data);
        }*/
        FroalaEditor.Image.upload(req, '/news/', function(err, data) {
         
          if (err) {
            console.log(err);
            return res.send(JSON.stringify(err));
          }
        console.log("data",data);
          res.send(data);
        });
    } catch (e) {
        console.log("Error",e);
    }
  }

}