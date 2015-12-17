angular.module('app.services', [])

.factory('Auth', function ($http, $location, $window, $rootScope) {

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
      return error;
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
    
      return resp.data;
    });
  };

  //Todo: fix logic for verifyEmail
  var verifyEmail = function(user){
      return $http({
      method: 'POST',
      url: '/verifyemail',
      headers: {
        Authorization : "Bearer " + token,
        ContentType : "application/json"
      }
     })
    .then(function (resp) {
    
      return resp.data;
    });
  }

  var resendEmail = function (user) {
    return $http({
      method: 'POST',
      url: '/resendverificationemail',
      data: {
        userName: user.username,
        password: user.password
      }
    })
    .then(function (resp) {
      
      return resp.data;
    });
  };

  var forgotPassword = function (user) {
    return $http({
      method: 'POST',
      url: '/forgotpassword',
      data: {
        userName: user.username,
      }
    })
    .then(function (resp) {  
      return resp.data;
    });
  };

  var isAuth = function() {
    var token, expires;

    if ($rootScope.token && $rootScope.expires) {
      token = $rootScope.token;
      expires = $rootScope.expires;
    } else {
      token = localStorage.getItem('token');
      expires = parseInt(localStorage.getItem('expires'));
    }

    return !!token && !!expires && expires > Date.now();
  };

  return {
    login: login,
    signup: signup,
    resendEmail: resendEmail,
    isAuth: isAuth,
    verifyEmail: verifyEmail,
    forgotPassword: forgotPassword
  };

})

.factory('Dashboard', function ($http, $location, $window, $rootScope) {

  var findContracts = function (token) {
    return $http({
      method: 'POST',
      url: '/findmycontracts',
      headers: {
        Authorization : "Bearer " + token,
        ContentType : "application/json"
      }
    })
    .then(function (resp) {
      var storageItem = {
        contractID: contract.id,
        username: contract.users
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

  return {
    findContracts: findContracts
  };

})
