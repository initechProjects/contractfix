angular.module('app.services', [])

.factory('Auth', function ($http, $location, $window) {
  // todo
  // auth service responsible for authenticating our user
  // by exchanging the user's username and password
  // for a JWT from the server
  // that JWT is then stored in localStorage 
  // after you login/signup open devtools, click resources,
  // then localStorage and you'll see your token from the server

   var getData = function(){
    var token = $window.localStorage.getItem('token');
    var profile = $window.localStorage.getItem('profile');

    return $http({
      method: 'GET',
      url: '/user' + profile,
      headers: {token: token}

    }).then(function(resp){
      console.log(resp.data);
      return resp.data;
    })
  };


  var login = function (user) {
    return $http({
      method: 'POST',
      url: '/login',
      data: {
        userName: user.username,
        password: user.password
      }
    })
    .then(function (resp) {
      if(resp.status !== 200){
        alert(resp.data);
      };
      var storageItem = {
        token: resp.data.token,
        userId: resp.data.userId
      };
      console.log(resp.data);
      return storageItem;
    });
  };

  var signup = function (user) {
    return $http({
      method: 'POST',
      url: '/user',
      data: {
        userName: user.username,
        password: user.password
      }
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
    return !!$window.localStorage.getItem('profile') && !!$window.localStorage.getItem('token');
  };

  return {
    login: login,
    signup: signup,
    isAuth: isAuth,
  };

})

