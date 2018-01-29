var User = require('../models/user');

//signup
// exports.showSignup = function(req, res) {
//   res.render('signup', {
//       title: '注册页面'
//   });
// }

exports.exists = function(req, res) {
  User.findOne({name: req.body.name}, function(err, user) {
    if(err) {
      console.log(err);
    }

    if(user) {
      res.json({"status": 1, "data": {"count": 1}});
    }
    else {
      res.json({"status": 1, "data": {"count": 0}});
    }
  });
}

exports.signup = function(req, res) {
  var _user = req.body;

  User.findOne({name: _user.name}, function(err, user) {
    if(err) {
      console.log(err);
    }

    var user = new User(_user);

    user.save(function(err, user) {
      if(err) {
        console.log(err);
      }

      //res.redirect('/signin');
      res.json({"status": 1, "data": user});
    });
  });
}

//signin
// exports.showSignin = function(req, res) {
//   res.render('signin', {
//       title: '登录页面'
//   });
// }
exports.signin = function(req, res) {
  var _user = req.body;
  var name = _user.name;
  var password = _user.password;

  User.findOne({name:name}, function(err, user) {
    if(err) {
      console.log(err)
    }

    user.comparePassowrd(password, function(err, isMatch) {
      if(err) {
        console.log(err)
      }

      if(isMatch) {
        //console.log("password is match");
        //req.session.user = user;

        //res.redirect('/');
        res.json({"status": 1, "data": {"count": 1, user}});
      }
      else {
        //console.log("password is not matched");
        //return res.redirect('/signin');
        res.json({"status": 1, "data": {"success": 0, "msg": "password is not matched"}});
      }
    });
  });
}

//logout
// exports.logout = function(req, res) {
//   delete req.session.user;
//   //delete app.locals.user;
//
//   res.redirect('/');
// }

//userlist page
exports.list = function(req, res) {
  User.fetch(function(err, users){
    if(err) {
      console.log(err)
    }
    // res.render('userlist', {
    //   title: 'imooc 用户列表页',
    //   users: users
    // });
    res.json({"status": 1, "data": {"users": users}});
  });
}

exports.delete = function(req, res) {
  //console.log(req.body);
  User.findOneAndRemove({_id: req.body.id}, function(err, user) {
    if(err) {
      console.log(err);
    }

    //console.log(user);
    res.json({"status": 1, "data": {"count": 1, user}});
  });
}

exports.update = function(req, res) {
  //console.log(req.body);
  User.update({_id: req.body.id}, {$set: {name: req.body.name, password: req.body.password}}, function(err) {
    if(err) {
      console.log(err);
    }

    res.json({"status": 1, "data": {"success": 1, "msg": "update success"}});
  });
}

exports.show = function(req, res) {
  //console.log(req.query);

  User.findOne({_id: req.query.id}, function(err, user) {
    if(err) {
      console.log(err);
    }

    //console.log(user);
    res.json({"status": 1, "data": {"count": 1, user}});
  });
}

exports.permission = function(req, res) {
  //res.json({"permissionList": ["normal user", "verified user", "professional user", "admin", "super_admin"]});

  User.findOne({name: req.body.name}, function(err, user) {
    if(err) {
      console.log(err);
    }

    if(user.role > 50) {
      res.json({"permissionList": ["super_admin", "admin", "professonal user", "verified user", "normal user"]});
    } else if(user.role > 10) {
      res.json({"permissionList": ["admin", "professonal user", "verified user", "normal user"]});
    } else if(user.role == 2) {
      res.json({"permissionList": ["professonal user", "verified user", "normal user"]});
    } else if(user.role == 1) {
      res.json({"permissionList": ["verified user", "normal user"]});
    } else if(user.role == 0) {
      res.json({"permissionList": ["normal user"]});
    }
  });
}

//signinRequired
exports.signinRequired = function(req, res, next) {
  var user = req.session.user;

  if(!user) {
    return res.redirect('/signin');
  }

  next();
}

//adminRequired
exports.adminRequired = function(req, res, next) {
  var user = req.session.user;

  if(user.role <= 10) {
    return res.redirect('/signin');
  }

  next();
}
