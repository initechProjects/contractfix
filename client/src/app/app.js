var app = angular.module('app', [
    'ngRoute',
    'app.auth',
    'app.dashboard',
    'app.services',
    'app.editor'
    ]);


app.config(function($routeProvider, $httpProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'app/home/home.html',
    })
    .when('/login', {
    	templateUrl: 'app/auth/login.html',
    	controller: 'AuthController',
    })
    .when('/signup', {
        templateUrl: 'app/auth/signup.html',
        controller: 'AuthController'
    })
    .when('/verifyemail', {
        templateUrl: 'app/auth/verifyemail.html',
        controller: 'AuthController'
    })
    .when('/resetpassword', {
        templateUrl: 'app/auth/resetpassword.html',
        controller: 'AuthController'
    })
    .when('/dashboard', {
        templateUrl: 'app/dashboard/dashboard.html',
        controller: 'DashboardController'
    })
    .when('/editor', {
        templateUrl: 'app/editor/editor.html',
        controller: 'EditorController'
    })
    .when('/about', {
        templateUrl: 'app/about/about.html',
    })
    .otherwise({
      redirectTo: '/'
    });
});



// app.run(function ($rootScope, $location, Auth) {
//   // here inside the run phase of angular, our services and controllers
//   // have just been registered and our app is ready
//   // however, we want to make sure the user is authorized
//   // we listen for when angular is trying to change routes
//   // when it does change routes, we then look for the token in localstorage
//   // and send that token to the server to see if it is a real user or hasn't expired
//   // if it's not valid, we then redirect back to signin/signup
//   $rootScope.$on('$routeChangeStart', function (evt, next, current) {
//     if (next.$$route && !Auth.isAuth()) {
//       $location.path('/login');
//     }
//   });
// })
