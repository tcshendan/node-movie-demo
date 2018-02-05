angular.module('myApp', ['ui.router', 'ngCookies'])
    .service('Cache', ['$cookies', function($cookies) {
        this.put = function(key, value) {
            $cookies.put(key, value);
        }
        this.get = function(key) {
            return $cookies.get(key);
        }
        this.remove = function(key) {
            $cookies.remove(key);
        }
    }])
    .factory('permissions', ['$http', '$q', function($http, $q) {
        return {
            hasPermission: function(permission, name) {
                var defered = $q.defer();

                if (permission && typeof(permission) == 'string') {
                    if (name) {
                        $http.post('/api/UserPermission', {
                                name: name
                            })
                            .then(function(res) {
                                defered.resolve(res.data.permissionList);
                            }, function(err) {
                                defered.reject(err);
                            });
                        return defered.promise;
                    }
                }
            }
        }
    }])
    .run(['$rootScope', '$state', 'permissions', 'Cache', function($rootScope, $state, permissions, Cache) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            var permission = toState.permission;
            var name = Cache.get('username');
            var permissionList;

            if (permission) {
                if (name) {
                    permissions.hasPermission(permission, name).then(function(data) {
                        permissionList = data;
                        if (!(permissionList.indexOf(permission) > -1)) {
                            //$state.transitionTo('signin');
                            //$state.go('signin');
                            if (permission == 'super_admin') {
                                alert('抱歉，您没有超级管理员的权限！');
                            } else if (permission == 'admin') {
                                alert('抱歉，您没有管理员的权限！');
                            }
                            window.location.href = 'http://localhost:3000/#!/main';
                        }
                    });
                } else {
                    alert('抱歉，请先去登录！');
                    window.location.href = 'http://localhost:3000/#!/user/signin';
                }
            }
        });

        $rootScope.UserInfo = Cache.get('username');

        $rootScope.search = function(q) {
            $state.go('search', {
                "q": q
            });
        }
    }])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('main', {
                url: '/main',
                templateUrl: 'template/movie/list.html',
                controller: 'mainController'
            })
            .state('movie', {
                url: '/movie/:id',
                templateUrl: 'template/movie/detail.html',
                controller: 'detailController'
            })
            .state('signup', {
                url: '/signup',
                templateUrl: 'template/signup.html',
                controller: 'signupController'
            })
            .state('signin', {
                url: '/user/signin',
                templateUrl: 'template/signin.html',
                controller: 'signinController'
            })
            .state('signout', {
                url: '/user/signout',
                controller: 'signoutController'
            })
            .state('userlist', {
                url: '/admin/user/list',
                templateUrl: 'template/user/list.html',
                controller: 'userlistController',
                permission: 'super_admin'
            })
            .state('deleteUser', {
                url: '/user/delete/:id',
                controller: 'deleteUserController',
                permission: 'super_admin'
            })
            .state('updateUser', {
                url: '/user/update/:id',
                templateUrl: 'template/user/update.html',
                controller: 'updateUserController',
                permission: 'super_admin'
            })
            .state('showUser', {
                url: '/user/show/:id',
                templateUrl: 'template/user/show.html',
                controller: 'showUserController',
                permission: 'super_admin'
            })
            .state('addMovie', {
                url: '/admin/movie/new',
                templateUrl: 'template/admin/admin.html',
                controller: 'addMovieController',
                permission: 'admin'
            })
            .state('movielist', {
                url: '/admin/movie/list',
                templateUrl: 'template/admin/list.html',
                controller: 'movieListController',
                permission: 'admin'
            })
            .state('deleteMovie', {
                url: '/admin/movie/delete/:id',
                controller: 'deleteMovieController',
                permission: 'admin'
            })
            .state('updateMovie', {
                url: '/admin/movie/update/:id',
                templateUrl: 'template/admin/admin.html',
                controller: 'updateMovieController',
                permission: 'admin'
            })
            .state('addCatetory', {
                url: '/admin/catetory/new',
                templateUrl: 'template/catetory/admin.html',
                controller: 'addCatetoryController',
                permission: 'admin'
            })
            .state('catetorylist', {
                url: '/admin/catetory/list',
                templateUrl: 'template/catetory/list.html',
                controller: 'catetoryListController',
                permission: 'admin'
            })
            .state('deleteCatetory', {
                url: '/admin/catetory/delete/:id',
                controller: 'deleteCatetoryController',
                permission: 'admin'
            })
            .state('updateCatetory', {
                url: '/admin/catetory/update/:id',
                templateUrl: 'template/catetory/admin.html',
                controller: 'updateCatetoryController',
                permission: 'admin'
            })
            .state('results', {
                url: '/results?cat=&p=',
                templateUrl: 'template/results.html',
                controller: 'resultsController'
            })
            .state('search', {
                url: '/search?q=',
                templateUrl: 'template/search.html',
                controller: 'searchController'
            })

        $locationProvider.hashPrefix('');
        $urlRouterProvider.otherwise('/main');
    }])
    .service('UserService', ['$http', '$state', '$q', 'Cache', function($http, $state, $q, Cache) {
        var me = this;

        me.signup_username_exists = false;
        me.signup_data = {};

        me.signin_username_not_exists = false;
        me.signin_data = {};

        me.signup = function(conf) {
            $http.post('/api/user/signup', conf)
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status) {
                        me.signup_data = {};
                        $state.go('signin');
                    }
                });
        }

        me.signin = function(conf) {
            $http.post('/api/user/signin', conf)
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status && res.data.data.count == 1) {
                        me.signin_data = {};
                        Cache.put('username', res.data.data.user.name);
                        Cache.put('userid', res.data.data.user._id);
                        $state.go('main');
                    }
                    if (res.data.status && res.data.data.success == 0) {
                        alert(res.data.data.msg);
                    }
                });
        }

        me.username_exists = function() {
            $http.post('/api/user/exists', {
                    name: me.signup_data.name
                })
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status && res.data.data.count == 1) {
                        me.signup_username_exists = true;
                    } else {
                        me.signup_username_exists = false;
                    }
                });
        }

        me.username_not_exists = function() {
            $http.post('/api/user/exists', {
                    name: me.signin_data.name
                })
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status && res.data.data.count == 0) {
                        me.signin_username_not_exists = true;
                    } else {
                        me.signin_username_not_exists = false;
                    }
                });
        }

        me.signout = function() {
            Cache.remove('username');
            Cache.remove('userid');
            $state.go('main');
        }

        me.all = function() {
            $http.get('/api/admin/user/list')
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status) {
                        var temp = res.data.data.users;
                        angular.forEach(temp, function(value, index) {
                            value.meta.updateAt = moment(value.meta.updateAt).format('MM/DD/YYYY');
                        });
                        me.users = temp;
                    }
                });
        }

        me.del = function(id) {
            $http.post('/api/user/delete', {
                    id: id
                })
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status && res.data.data.count == 1) {
                        $state.go('userlist');
                    }
                });
        }

        me.update_data = {};
        me.update = function(id) {
            me.update_data = {
                id: id,
                name: me.user_data.name,
                password: me.user_data.password
            };

            $http.post('/api/user/update', me.update_data)
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status && res.data.data.success == 1) {
                        alert(res.data.data.msg);
                        $state.go('userlist');
                    }
                });
        }

        me.show = function(id) {
            var defered = $q.defer();

            $http.get('/api/user/show?id=' + id)
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status && res.data.data.count == 1) {
                        //me.user_data = res.data.data.user;
                        defered.resolve(res.data.data.user);
                    }
                }, function(err) {
                    defered.reject(err);
                });
            return defered.promise;
        }

    }])
    .controller('signupController', ['$scope', '$rootScope', 'UserService', function($scope, $rootScope, UserService) {
        $rootScope.title = "注册页面";
        $scope.User = UserService;

        $scope.$watch(function() {
            return UserService.signup_data;
        }, function(n, o) {
            if (n.name != o.name) {
                UserService.username_exists();
            }
        }, true);

    }])
    .controller('signinController', ['$scope', '$rootScope', 'UserService', function($scope, $rootScope, UserService) {
        $rootScope.title = "登录页面";
        $scope.User = UserService;

        $scope.$watch(function() {
            return UserService.signin_data;
        }, function(n, o) {
            if (n.name && n.name != o.name) {
                UserService.username_not_exists();
            }
            if (!n.name) {
                UserService.signin_username_not_exists = false;
            }
        }, true);

    }])
    .controller('signoutController', ['$scope', 'UserService', function($scope, UserService) {
        UserService.signout();
    }])
    .controller('userlistController', ['$scope', '$rootScope', 'UserService', function($scope, $rootScope, UserService) {
        $rootScope.title = "用户列表页";

        $scope.User = UserService;
        UserService.all();
    }])
    .controller('deleteUserController', ['$scope', '$stateParams', 'UserService', function($scope, $stateParams, UserService) {
        //console.log($stateParams.id);
        UserService.del($stateParams.id);
    }])
    .controller('updateUserController', ['$scope', '$rootScope', '$stateParams', 'UserService', function($scope, $rootScope, $stateParams, UserService) {
        $rootScope.title = "用户修改页";

        $scope.User = UserService;
        //console.log($stateParams.id);
        UserService.show($stateParams.id).then(function(data) {
            $scope.update_data = data;
        });
    }])
    .controller('showUserController', ['$scope', '$rootScope', '$stateParams', 'UserService', function($scope, $rootScope, $stateParams, UserService) {
        $rootScope.title = "用户显示页";

        $scope.User = UserService;
        UserService.show($stateParams.id).then(function(data) {
            $scope.user_data = data;
        });
    }])
    .service('HttpService', ['$window', '$document', function($window, $document) {
        this.jsonp = function(url, data, callback) {
            var fnSuffix = Math.random().toString().replace('.', '');
            var cbFuncName = 'my_json_cb_' + fnSuffix;
            var querystring = url.indexOf('?') == -1 ? '?' : '&';
            for (var key in data) {
                querystring += key + '=' + data[key] + '&';
            }
            querystring += 'callback=' + cbFuncName;
            var scriptElement = $document[0].createElement('script');
            scriptElement.src = url + querystring;
            $window[cbFuncName] = function(data) {
                callback(data);
                $document[0].body.removeChild(scriptElement);
            };
            $document[0].body.appendChild(scriptElement);
        };
    }])
    .service('MovieService', ['$rootScope', '$http', '$state', 'HttpService', function($rootScope, $http, $state, HttpService) {
        var me = this;

        me.get = function() {
            $http.get('/api/movie/list')
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status) {
                        me.catetories = res.data.data;
                    }
                });
        }

        me.getDetail = function(id) {
            $http.get('/api/movie/detail?id=' + id)
                .then(function(res) {
                    console.log(res);
                    if (res.data.status) {
                        me.detail = res.data.data.movie;
                        me.comments = res.data.data.comments;
                        $rootScope.title = res.data.data.movie.title;
                    }
                });
        }

        me.getCatetory = function() {
            $http.get('/api/admin/movie/new')
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status) {
                        me.catetories = res.data.data.catetories;
                    }
                });
        }

        me.movie = {};
        me.getDouban = function(id) {
            if (id) {
                HttpService.jsonp('https://api.douban.com/v2/movie/subject/' + id, {}, function(data) {
                    //console.log(data);
                    me.movie.title = data.title;
                    me.movie.doctor = data.directors[0].name;
                    me.movie.country = data.countries[0];
                    me.movie.poster = data.images.large;
                    me.movie.year = data.year;
                    me.movie.summary = data.summary;
                });
            }
        }

        me.save = function(conf) {
            $http.post('/api/admin/movie', conf)
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status && res.data.data.count == 1) {
                        $state.go('movie', {
                            id: res.data.data.movie._id
                        });
                        me.movie = {};
                    }
                });
        }

        me.all = function() {
            $http.get('/api/admin/movie/list')
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status) {
                        var temp = res.data.data.movies;
                        angular.forEach(temp, function(value, index) {
                            value.meta.updateAt = moment(value.meta.updateAt).format('MM/DD/YYYY');
                        });
                        me.lists = temp;
                    }
                });
        }

        me.del = function(id) {
            $http.delete('/api/admin/movie/list?id=' + id)
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status && res.data.data.count == 1) {
                        $state.go('movielist');
                    }
                });
        }

        me.update = function(id) {
            $http.get('/api/admin/movie/update?id=' + id)
                .then(function(res) {
                    console.log(res);
                    if (res.data.status && res.data.data.count == 1) {
                        me.catetories = res.data.data.catetories;

                        var data = res.data.data.movie;
                        me.movie._id = data._id;
                        me.movie.catetory = data.catetory;
                        me.movie.title = data.title;
                        me.movie.doctor = data.doctor;
                        me.movie.country = data.country;
                        me.movie.poster = data.poster;
                        me.movie.year = data.year;
                        me.movie.summary = data.summary;
                    }
                });
        }
    }])
    .controller('mainController', ['$scope', '$rootScope', 'MovieService', 'Cache', function($scope, $rootScope, MovieService, Cache) {
        $rootScope.title = "首页";
        $rootScope.UserInfo = Cache.get('username');

        $scope.Movie = MovieService;
        MovieService.get();
    }])
    .controller('detailController', ['$scope', '$rootScope', '$stateParams', 'MovieService', 'Cache', function($scope, $rootScope, $stateParams, MovieService, Cache) {
        //console.log($stateParams.id);
        $scope.Movie = MovieService;
        MovieService.getDetail($stateParams.id);

        $scope.movie = {
            id: $stateParams.id
        };
        $scope.user = {
            name: Cache.get('username'),
            id: Cache.get('userid')
        };

    }])
    .controller('addMovieController', ['$scope', '$rootScope', 'MovieService', function($scope, $rootScope, MovieService) {
        $rootScope.title = "后台电影录入页";

        $scope.Movie = MovieService;
        MovieService.getCatetory();
    }])
    .controller('movieListController', ['$scope', '$rootScope', 'MovieService', function($scope, $rootScope, MovieService) {
        $rootScope.title = "后台电影列表页";

        $scope.Movie = MovieService;
        MovieService.all();
    }])
    .controller('deleteMovieController', ['$scope', '$stateParams', 'MovieService', function($scope, $stateParams, MovieService) {
        //console.log($stateParams.id);
        MovieService.del($stateParams.id);

    }])
    .controller('updateMovieController', ['$scope', '$rootScope', '$stateParams', 'MovieService', function($scope, $rootScope, $stateParams, MovieService) {
        $rootScope.title = "后台电影修改页";

        $scope.Movie = MovieService;
        MovieService.update($stateParams.id);
    }])
    .service('CatetoryService', ['$http', '$state', function($http, $state) {
        var me = this;

        me.all = function() {
            $http.get('/api/admin/catetory/list')
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status) {
                        var temp = res.data.data.catetories;
                        angular.forEach(temp, function(value, index) {
                            value.meta.updateAt = moment(value.meta.updateAt).format('MM/DD/YYYY');
                        });
                        me.catetories = temp;
                    }
                });
        }

        me.catetory = {};
        me.save = function(conf) {
            $http.post('/api/admin/catetory/add', conf)
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status && res.data.data.count == 1) {
                        $state.go('catetorylist');
                        me.catetory = {};
                    }
                });
        }

        me.del = function(id) {
            $http.delete('/api/admin/catetory/list?id=' + id)
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status && res.data.data.count == 1) {
                        $state.go('catetorylist');
                    }
                });
        }

        me.update = function(id) {
            $http.get('/api/admin/catetory/update?id=' + id)
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status && res.data.data.count == 1) {
                        var data = res.data.data.catetory;
                        me.catetory._id = data._id;
                        me.catetory.name = data.name;
                    }
                });
        }
    }])
    .controller('catetoryListController', ['$scope', '$rootScope', 'CatetoryService', function($scope, $rootScope, CatetoryService) {
        $rootScope.title = "后台分类列表页";

        $scope.Catetory = CatetoryService;
        CatetoryService.all();
    }])
    .controller('addCatetoryController', ['$scope', '$rootScope', 'CatetoryService', function($scope, $rootScope, CatetoryService) {
        $rootScope.title = "后台分类录入页";

        $scope.Catetory = CatetoryService;
    }])
    .controller('deleteCatetoryController', ['$scope', '$stateParams', 'CatetoryService', function($scope, $stateParams, CatetoryService) {
        //console.log($stateParams.id);
        CatetoryService.del($stateParams.id);

    }])
    .controller('updateCatetoryController', ['$scope', '$rootScope', '$stateParams', 'CatetoryService', function($scope, $rootScope, $stateParams, CatetoryService) {
        $rootScope.title = "后台分类修改页";

        $scope.Catetory = CatetoryService;
        CatetoryService.update($stateParams.id);
    }])
    .service('SearchService', ['$http', '$q', function($http, $q) {
        var me = this;

        me.search = function(url) {
            $http.get(url)
                .then(function(res) {
                    //console.log(res);
                    if (res.data.status) {
                        var data = res.data.data;
                        me.movies = data.movies;
                        me.keyword = data.keyword;
                        me.query = data.query;
                        me.totalCount = data.totalCount;
                        me.totalPage = data.totalPage;
                        me.currentPage = data.currentPage;
                    }
                });
        }

        me.go = function(query, page) {
            if ((page - 1) >= 0 && page <= me.totalPage) {
                $http.get('/api/results?' + query + '&p=' + (page - 1))
                    .then(function(res) {
                        //console.log(res);
                        if (res.data.status) {
                            var data = res.data.data;
                            me.movies = data.movies;
                            me.currentPage = data.currentPage;
                        }
                    });
            }
        }
    }])
    .controller('resultsController', ['$scope', '$rootScope', '$stateParams', 'SearchService', function($scope, $rootScope, $stateParams, SearchService) {
        $rootScope.title = "结果列表页";
        $scope.Search = SearchService;

        var url;
        if ($stateParams.cat && $stateParams.p) {
            url = '/api/results?cat=' + $stateParams.cat + '&p=' + $stateParams.p;
            SearchService.search(url);
        }
    }])
    .controller('searchController', ['$scope', '$rootScope', '$stateParams', 'SearchService', function($scope, $rootScope, $stateParams, SearchService) {
        $rootScope.title = "结果列表页";
        $scope.Search = SearchService;

        var url;
        if ($stateParams.q) {
            url = '/api/results?q=' + $stateParams.q;
            SearchService.search(url);
        }
    }])
    .service('CommentService', ['$http', '$state', function($http, $state) {
        var me = this;

        me.comment = {};
        me.save = function(conf) {
            me.comment.movie = me.movie_id;
            me.comment.from = me.user_id;
            $http.post('/api/user/comment', conf)
                .then(function(res) {
                    // console.log(res);
                    if (res.data.status && res.data.data.count == 1) {
                        $state.reload();
                        me.comment = {};
                    }
                });
        }

        me.reply = function(cid, tid) {
            me.comment.cid = cid;
            me.comment.tid = tid;
        }
    }])
    .directive('commentBlock', ['CommentService', function(CommentService) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                comments: '=movieComments',
                movie_id: '=movieId',
                user_id: '=userId'
            },
            templateUrl: 'template/comment.html',
            link: function(scope, elem, attr) {
                scope.Comment = CommentService;
                scope.Comment.movie_id = scope.movie_id;
                scope.Comment.user_id = scope.user_id;
            }
        }
    }]);
