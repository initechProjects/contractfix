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
        scope: resp.data.scope,
        fullname: resp.data.fullname
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
    })
    .catch(function(error) {
      return error;
    });
  };



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

    if (token)
      refresh(token);

    return !!token && !!expires && expires > Date.now();
  };

  var save = function(data) {
    $rootScope.token = data.token;
    $rootScope.expires = Date.now() + 900000; // now + 10 minutes
    $rootScope.username = data.username;
    localStorage.setItem('token', data.token);
    localStorage.setItem('expires', Date.now() + 900000);
    localStorage.setItem('username', data.username);
  };

  var refresh = (function() {
    var calledOnce = false;
    return function refreshToken(token) {
      console.log('refreshing');
      token = token || $rootScope.token || localStorage.getItem('token');

      $http({
        method: 'POST',
        url: '/refreshtoken',
        headers: {
          Authorization: 'Bearer ' + token
        }
      }).then(function success(res) {
        console.log(res);
        save(res.data);
        calledOnce = true;
      }, function error(res) {
        console.log(res);
      });

      if (!calledOnce) {
        calledOnce = true;
        setInterval(refreshToken.bind(null, token), 600000);
      }
    };
  })();

  return {
    login: login,
    signup: signup,
    resendEmail: resendEmail,
    isAuth: isAuth,
    forgotPassword: forgotPassword,
    save: save,
    refresh: refresh
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
