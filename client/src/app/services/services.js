angular.module('app.services', [])

.factory('Auth', function ($http, $location, $window) {
  // todo
  // auth service responsible for authenticating our user
  // by exchanging the user's username and password
  // for a JWT from the server
  // that JWT is then stored in localStorage 
  // after you login/signup open devtools, click resources,
  // then localStorage and you'll see your token from the server
  var login = function (user) {
    return $http({
      method: 'POST',
      url: '/login',
      data: user
    })
    .then(function (resp) {
      var storageItem = {
        token: resp.data.token,
        userId: resp.data.userId
      };
      return storageItem;
    });
  };

  var signup = function (user) {
    return $http({
      method: 'POST',
      url: '/user',
      data: user
    })
    .then(function (resp) {
      var storageItem = {
        token: resp.data.token,
        userId: resp.data.userId
      };
      return storageItem;
    });
  };

  var isAuth = function () {
    return !!$window.localStorage.getItem('contractFix_user') && !!$window.localStorage.getItem('contractFix_token');
  };

  return {
    login: login,
    signup: signup,
    isAuth: isAuth,
  };
})