var app = angular.module('app', [
    'ngRoute',
    'app.auth' 
    ]);


app.config(function($routeProvider, $httpProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'app/home/home.html',
    })
    .when('/login', {
    	templateUrl: 'app/auth/login.html',
    	controller: 'AuthController'
    })
    
});

