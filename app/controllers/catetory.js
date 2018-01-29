var Catetory = require('../models/catetory');
var _ = require('underscore');

//admin page
// exports.new = function(req, res) {
//   res.render('catetory_admin', {
//     title: 'imooc 后台分类录入页',
//     catetory: {}
//   });
// }

//admin post catetory
exports.save = function(req, res) {
  var id = req.body._id;
  var catetoryObj = req.body;
  var _catetory;

  if(id) {
    Catetory.findById(id, function(err, catetory) {
      if(err) {
        console.log(err);
      }

      _catetory = _.extend(catetory, catetoryObj);
      _catetory.save(function(err, catetory) {
        if(err) {
          console.log(err);
        }

        res.json({"status": 1, "data": {"count": 1, "catetory": catetory}});
      });
    });
  }
  else {
    _catetory = new Catetory(catetoryObj);

    _catetory.save(function(err, catetory) {
      if(err) {
        console.log(err)
      }
      //res.redirect('/admin/catetory/list');
      res.json({"status": 1, "data": {"count": 1, "catetory": catetory}});
    });
  }
}

//catetorylist page
exports.list = function(req, res) {
  Catetory.fetch(function(err, catetories){
    if(err) {
      console.log(err)
    }
    // res.render('catetorylist', {
    //   title: 'imooc 分类列表页',
    //   catetories: catetories
    // });
    res.json({"status": 1, "data": {"catetories": catetories}});
  });
}

exports.del = function(req, res) {
  var id = req.query.id;

  if(id) {
    Catetory.remove({_id: id}, function(err, catetory) {
      if(err) {
        console.log(err);
      }

      res.json({"status": 1, "data": {"count": 1}});
    });
  }
}

exports.update = function(req, res) {
  var id = req.query.id;
  //console.log(id);

  Catetory.findById(id, function(err, catetory) {
    if(err) {
      console.log(err);
    }

    res.json({"status": 1, "data": {"count": 1, "catetory": catetory}});
  });
}
