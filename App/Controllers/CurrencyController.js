  var Sys = require('../../Boot/Sys');

  module.exports = {

    currency: async function(req, res) {
          try {
              var data = {
                  App: Sys.Config.App.details,
                  Agent: req.session.details,
                  error: req.flash("error"),
                  success: req.flash("success"),
                  setting: await Sys.App.Services.SettingsServices.getSettingsData()
                  
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
                      currencyCode: {
                          $regex: '.*' + search + '.*'
                      }
                  };
              } else {
                  query = {};
              }
              let currency = await Sys.App.Services.CurrencyServices.getCurrencyCount(query);
              let data = await Sys.App.Services.CurrencyServices.getCurrencyDatatable(query, length, start);
              var obj = {
                  'draw': req.query.draw,
                  'recordsTotal': currency,
                  'recordsFiltered': currency,
                  'data': data
              };
              res.send(obj);
          } catch (e) {
              console.log("Error", e);
              return new Error('Error', e);
          }
      },

      getLiveCurrencyData: async function(req, res) {
        try {
            let resp = await Sys.App.Services.CurrencyServices.getLiveCurrencyData();
            if (resp === false) {
                req.flash('error','Error while refreshing currency');    
            } else {
                req.flash('success','Currency refreshed successfully');
            }            
            return res.redirect('currency');    
        } catch (e) {
            console.log("Error", e);
            return new Error('Error', e);
        }
    },

    updateCurrencySetting: async function(req, res) {
        try {
            let settings = await Sys.App.Services.SettingsServices.getSettingsData({_id: req.body.id});
        if (settings) {
            await Sys.App.Services.SettingsServices.updateSettingsData({
            _id: req.body.id
            }, {
            ratePerChip: req.body.ratePerChip
            });
        }

        req.flash('success','Currency update successfully');
        return res.redirect('currency');    
        } catch (e) {
            console.log("Error", e);
            return new Error('Error', e);
        }
    }
  }