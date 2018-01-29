var Movie = require('../models/movie');
var Catetory = require('../models/catetory');
var Comment = require('../models/comment');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

//detail page
exports.detail = function(req, res) {
  var id = req.query.id;

  Movie.update({_id: id}, {$inc: {pv: 1}}, function(err) {
    if(err) {
      console.log(err);
    }
  });
  Movie.findById(id, function(err, movie) {
    if(err) {
      console.log(err)
    }
    Comment
      .find({movie: id})
      .populate({path: 'from', select: 'name'})
      .populate({path: 'reply.from', select: 'name'})
      .populate({path: 'reply.to', select: 'name'})
      .exec(function(err, comments) {
        // res.render('detail', {
        //   title: 'imooc ' + movie.title,
        //   movie: movie,
        //   comments: comments
        // });
        res.json({"status": 1, "data": {movie, comments}});
     });
  });
}

//admin page
exports.new = function(req, res) {
  Catetory
    .find({})
    .exec(function(err, catetories) {
      // res.render('admin', {
      //   title: 'imooc 后台录入页',
      //   catetories: catetories,
      //   movie: {}
      // });
      if(err) {
        console.log(err);
      }

      res.json({"status": 1, "data": {"catetories": catetories}});
    });
}

//admin update movie
exports.update = function(req, res) {
  var id = req.query.id;

  if(id) {
    Movie.findById(id, function(err, movie) {
      Catetory.find({}, function(err, catetories) {
        // res.render('admin', {
        //   title: 'imooc 后台更新页',
        //   movie: movie,
        //   catetories: catetories
        // });
        res.json({"status": 1, "data": {"count": 1, "movie": movie, "catetories": catetories}});
      });
    });
  }
}

//admin poster
exports.savePoster = function(req, res, next) {
  var posterData = req.files.uploadPoster;
  var filePath = posterData.path;
  var originalFilename = posterData.originalFilename;

  //console.log(req.files);
  if(originalFilename) {
    fs.readFile(filePath, function(err, data) {
      var timestamp = Date.now();
      var type = posterData.type.split('/')[1];
      var poster = timestamp + '.' + type;
      var newPath = path.join(__dirname, '../../', '/public/upload/' + poster);
      //console.log(newPath);

      fs.writeFile(newPath, data, function(err) {
        req.poster = poster;
        next();
      });
    });
  }
  else {
    next();
  }
}

//admin post movie
exports.save = function(req, res) {
  var id = req.body._id;
  var movieObj = req.body;
  var _movie;

  // if(req.poster) {
  //   movieObj.poster = req.poster;
  // }

  if(id) {
    Movie.findById(id, function(err, movie) {
      if(err) {
        console.log(err)
      }

      _movie = _.extend(movie, movieObj);
      _movie.save(function(err, movie) {
        if(err) {
          console.log(err)
        }

        //res.redirect('/movie/' + movie._id);
        res.json({"status": 1, "data": {"count": 1, "movie": movie}});
      });
    });
  }
  else {

    _movie = new Movie(movieObj);

    var catetoryId = movieObj.catetory;
    var catetoryName = movieObj.catetoryName;

    _movie.save(function(err, movie) {
      if(err) {
        console.log(err)
      }

      //console.log(movie);

      if(catetoryId) {
        Catetory.findById(catetoryId, function(err, catetory) {
          catetory.movies.push(movie._id);

          catetory.save(function(err, catetory) {
            //res.redirect('/movie/' + movie._id);
            res.json({"status": 1, "data": {"count": 1, "movie": movie}});
          });
        });
      }
      else if(catetoryName) {
        var catetory = new Catetory({
          name: catetoryName,
          movies: [movie._id]
        })

        catetory.save(function(err, catetory) {
          movie.catetory = catetory._id;
          movie.save(function(err, catetory) {
            //res.redirect('/movie/' + movie._id);
            res.json({"status": 1, "data": {"count": 1, "movie": movie}});
          });
        });
      }
    });
  }
}

//list page
exports.list = function(req, res) {
  Movie
    .find({})
    .populate({path: 'catetory', select: 'name'})
    .sort('meta.updateAt')
    .exec(function(err, movies) {
      if(err) {
        console.log(err);
      }
      // res.render('list', {
      //   title: 'imooc 列表页',
      //   movies: movies
      // });
      res.json({"status": 1, "data": {"movies": movies}});
    });
}

//list delete movie
exports.del = function(req, res) {
  var id = req.query.id;

  if(id) {
    Movie.remove({_id: id}, function(err, movie) {
      if(err) {
        console.log(err);
      }
      else {
        res.json({"status": 1, "data": {"count": 1}});
      }
    });
  }
}
