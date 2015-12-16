angular.module('app.services', [])

.factory('Auth', function ($http, $location, $window) {

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
      data: {
        userName: user.username,
        password: user.password
      }
    })
    .then(function (resp) {
      var storageItem = {
        token: resp.data.token,
        username: resp.data.username,
        scope: resp.data.scope
      };
      if(resp.data.token === undefined){
        return resp.data;
      }
      return storageItem;
    })
    .catch(function(error){
      //console.log(error.data.message);
      return error.data.message;
    })
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
        userName: resp.data.username
      };
      return storageItem;
    });
  };


  return {
    login: login,
    signup: signup
  };

})

