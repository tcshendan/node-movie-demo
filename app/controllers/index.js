var Movie = require('../models/movie');
var Catetory = require('../models/catetory');

//index page
exports.index = function(req, res) {
  //console.log("user in session: ");
  //console.log(req.session.user);
  res.render('index');
}

//index page
exports.get = function(req, res) {
  Catetory
    .find({})
    .populate({
      path: 'movies',
      options: {limit: 6}
    })
    .exec(function(err, catetories) {
      if(err) {
        console.log(err)
      }
      //console.log(catetories);
      // res.render('index', {
      //   title: 'imooc 首页',
      //   catetories: catetories
      // });
      res.json({"status": 1, "data": catetories});
    });
}

//search page
exports.search = function(req, res) {
  console.log(req.query);
  var catId = req.query.cat;
  var q = req.query.q;
  var page = parseInt(req.query.p, 10) || 0;
  var count = 2;
  var index = page * count;

  if(catId) {
    Catetory
      .find({_id: catId})
      .populate({
        path: 'movies',
        select: 'title poster'
      })
      .exec(function(err, catetories) {
        if(err) {
          console.log(err)
        }

        var catetory = catetories[0] || {};
        var movies = catetory.movies || [];
        var results = movies.slice(index, index + count);

        // res.render('results', {
        //   title: 'imooc 结果列表页',
        //   keyword: catetory.name,
        //   currentPage: (page + 1),
        //   query: 'cat=' + catId,
        //   totalPage: Math.ceil(movies.length / count),
        //   movies: results
        // });
        res.json({"status": 1, "data": {"keyword": catetory.name, "currentPage": (page + 1), "query" : "cat=" + catId, "totalPage": Math.ceil(movies.length / count), "totalCount": movies.length, "movies": results}});
      });
  }
  else {
    Movie
      .find({title: new RegExp(q + '.*', 'i')})
      .exec(function(err, movies) {
        if(err) {
          console.log(err)
        }

        var results = movies.slice(index, index + count);

        // res.render('results', {
        //   title: 'imooc 结果列表页',
        //   keyword: q,
        //   currentPage: (page + 1),
        //   query: 'q=' + catId,
        //   totalPage: Math.ceil(movies.length / count),
        //   movies: results
        // });
        res.json({"status": 1, "data": {"keyword": q, "currentPage": (page + 1), "query": "q=" + q, "totalPage": Math.ceil(movies.length / count), "totalCount": movies.length, "movies": results}});
      });
  }
}
