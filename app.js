var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multipart = require('connect-multiparty');
var session = require('express-session');
var serveStatic = require('serve-static');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var mongoStore = require('connect-mongo')(session);
var morgan = require('morgan');
var port = process.env.PORT || 3000;
var app = express();
var dbUrl = 'mongodb://localhost:27017/imooc';

mongoose.Promise = global.Promise;
mongoose.connect(dbUrl, {useMongoClient: true});

//models loading
var models_path = __dirname + '/app/models';
var walk = function(path) {
  fs
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file;
      var stat = fs.statSync(newPath);

      if(stat.isFile()) {
        if(/(.*)\.(js|coffee)/.test(file)) {
          require(newPath);
        }
      }
      else if(stat.isDirectory()) {
        walk(newPath);
      }
    });
}
walk(models_path);

app.set('port', port);
app.set('views', './app/views/pages');
app.engine('html', require('ejs').__express);
//app.set('view engine', 'jade');
app.set('view engine', 'html');
app.use(serveStatic(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(multipart());
app.use(session({
  secret: 'imooc',
  store: new mongoStore({
    url: dbUrl,
    collection: 'sessions'
  }),
  resave: false,
  saveUninitialized: true
}));
app.locals.moment = require('moment');

if('development' == app.get('env')) {
  app.set('showStackError', true);
  app.use(morgan(':method :url :status'));
  app.locals.pretty = true;
  //mongoose.set('debug', true);
}

require('./config/routes')(app);

app.listen(port);
console.log('imooc start on port ' + port);
