var Index = require('../app/controllers/index');
var User = require('../app/controllers/user');
var Movie = require('../app/controllers/movie');
var Comment = require('../app/controllers/comment');
var Catetory = require('../app/controllers/catetory');

module.exports = function(app) {
  //pre handle user
  app.use(function(req, res, next) {
    var _user = req.session.user;

    app.locals.user = _user;

    return next();
  });

  //Index
  app.get('/', Index.index);
  app.get('/api/movie/list', Index.get);

  //User
  app.post('/api/user/exists', User.exists);
  app.post('/api/user/signup', User.signup);
  app.post('/api/user/signin', User.signin);
  //app.get('/signup', User.showSignup);
  //app.get('/signin', User.showSignin);
  //app.get('/logout', User.logout);
  //app.get('/admin/user/list', User.signinRequired, User.adminRequired, User.list);
  app.get('/api/admin/user/list', User.list);
  app.post('/api/user/delete', User.delete);
  app.post('/api/user/update', User.update);
  app.get('/api/user/show', User.show);
  app.post('/api/UserPermission', User.permission);

  //Movie
  app.get('/api/movie/detail', Movie.detail);
  //app.get('/admin/movie/new', User.signinRequired, User.adminRequired, Movie.new);
  app.get('/api/admin/movie/new', Movie.new);
  //app.get('/admin/movie/update/:id', User.signinRequired, User.adminRequired, Movie.update);
  app.get('/api/admin/movie/update', Movie.update);
  //app.post('/admin/movie', User.signinRequired, User.adminRequired, Movie.savePoster, Movie.save);
  app.post('/api/admin/movie', Movie.save);
  //app.get('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.list);
  app.get('/api/admin/movie/list', Movie.list);
  //app.delete('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.del);
  app.delete('/api/admin/movie/list', Movie.del);

  //Comment
  //app.post('/user/comment', User.signinRequired, Comment.save);
  app.post('/api/user/comment', Comment.save);

  //Catetory
  //app.get('/admin/catetory/new', User.signinRequired, User.adminRequired, Catetory.new);
  //app.post('/admin/catetory', User.signinRequired, User.adminRequired, Catetory.save);
  app.post('/api/admin/catetory/add', Catetory.save);
  //app.get('/admin/catetory/list', User.signinRequired, User.adminRequired, Catetory.list);
  app.get('/api/admin/catetory/list', Catetory.list);
  app.delete('/api/admin/catetory/list', Catetory.del);
  app.get('/api/admin/catetory/update', Catetory.update);

  //results
  app.get('/api/results', Index.search);
}
