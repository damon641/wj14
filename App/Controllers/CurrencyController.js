  var Sys = require('../../Boot/Sys');
  const moment = require('moment');
  module.exports = {

      currency: async function(req, res) {
          try {
              var data = {
                  App: Sys.Config.App.details,
                  Agent: req.session.details,
                  error: req.flash("error"),
                  success: req.flash("success"),
                  rackActive: 'active',
              };
              return res.render('currency/currency', data);
          } catch (e) {
              console.log(e);
          }
      },

      getCurrencyData: async function(req, res) {
          try {
              let start = parseInt(req.query.start);
              let length = parseInt(req.query.length);
              let search = req.query.search.value;

              let query = {};
              if (search != '') {
                  let capital = search;
                  query = {
                      gameId: {
                          $regex: '.*' + search + '.*'
                      }
                  };
              } else {
                  query = {};
              }
              let rack = await Sys.App.Services.RackServices.getRackCount(query);
              //let rack = rackC.length;
              let data = await Sys.App.Services.RackServices.getRackDatatable(query, length, start);
              var obj = {
                  'draw': req.query.draw,
                  'recordsTotal': rack,
                  'recordsFiltered': rack,
                  'data': data
              };
              res.send(obj);
          } catch (e) {
              console.log("Error", e);
              return new Error('Error', e);
          }
      },
  }