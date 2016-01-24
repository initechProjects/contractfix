var app = angular.module('app', [
    'ngRoute',
    'app.auth',
    'app.dashboard',
    'app.services',
    'app.editor',
    'app.forgotPassword',
    'app.resetPassword',
    'app.verifyemail',
    'app.signup2',
    'app.usersetting',
    'app.invitation',
    'app.templates',
    'app.signature'
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
    .when('/signup2', {
        templateUrl: 'app/auth/signup2.html',
        controller: 'signup2Controller'
    })
    .when('/verifyemail', {
        templateUrl: 'app/auth/verifyemail.html',
        controller: 'verifyEmailController'
    })
    .when('/forgotpassword', {
        templateUrl: 'app/settings/forgotpassword.html',
        controller: 'forgotPasswordController'
    })
    .when('/resetpassword', {
        templateUrl: 'app/settings/resetpassword.html',
        controller: 'resetPasswordController'
    })
    .when('/dashboard', {
        templateUrl: 'app/dashboard/dashboard.html',
        controller: 'DashboardController'
    })
    .when('/editor', {
        templateUrl: 'app/editor/editor.html',
        controller: 'EditorController',
        reloadOnSearch: false
    })
    .when('/contactus', {
        templateUrl: 'app/about/contactus.html',
    })
     .when('/howitworks', {
        templateUrl: 'app/about/howitworks.html',
    })
    .when('/whatisit', {
        templateUrl: 'app/about/whatisit.html'
    })
    .when('/usersetting', {
        templateUrl: 'app/settings/usersetting.html',
        controller: 'usersettingController'
    })
    .when('/invitation', {
        templateUrl: 'app/invitation/invitation.html',
        controller: 'invitationController'
    })
    .when('/templates', {
        templateUrl: 'app/templates/templates.html',
        controller: 'TemplatesController'
    })
    .when('/signatures', {
        templateUrl: 'app/signature/signature.html',
        controller: 'SignatureController'
    })
    .when('/signed', {
        templateUrl: 'app/signature/signature.html',
        controller: 'SignatureController'
    })

});



app.run(function ($rootScope, $location, Auth) {
  $rootScope.$on('$routeChangeStart', function (evt, next, current) {
    var isPublicRoute = ['/dashboard', '/editor'].indexOf(next.$$route.originalPath) === -1;
    if (next.$$route && !isPublicRoute && !Auth.isAuth()) {
      $location.path('/login');
    }
  });

  if (Auth.isAuth())
    Auth.refresh();
});
