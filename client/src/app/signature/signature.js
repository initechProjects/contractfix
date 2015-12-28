angular.module('app.signature', [])


.controller('SignatureController', function ($scope, $rootScope, $sce, $window, $document, $location, Dashboard, $http) {

  $scope.user = $rootScope.fullname || localStorage.getItem('fullname');
  var token = $rootScope.token || localStorage.getItem('token');

  var ephemeralPublic;
  var ephemeralPrivate;
  var passphrase = chance.sentence();
  $scope.contract = {};
  $scope.contractText;
  var signaturePad;

  var options = {
    numBits: 1024,
    userId: $rootScope.username,
    passphrase: passphrase
  };

  openpgp.config.show_version = false;
  openpgp.config.show_comment = false;

  openpgp.generateKeyPair(options)
  .then(function(keypair) {
      ephemeralPrivate = keypair.privateKeyArmored;
      ephemeralPublic = keypair.publicKeyArmored;
  })
  .catch(function(error) {
    console.log(error);
  });

  $http({
    method: 'POST',
    url: '/findmycontracts',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  }).then(function(res) {
    $scope.contracts = res.data.filter(function(contract) { return contract.versions; });
    // $scope.showingDrafts = false;
    console.log(res.data);
  }, function(res) {
    console.log(res);
  });

  $scope.handleClick = function(id) {
    $http({
      method: 'POST',
      url: '/opencontract',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      data: {
        contractId: id
      }
    }).then(function(res) {
      $scope.contract = res.data;
      $scope.contractText = $sce.trustAsHtml($scope.contract.latest.text);
      console.log($scope.contract);
    }, function(res) {
      console.log(res);
    });
  };

  // $scope.signContract = function() {
  //   openpgp.config.show_version = false;
  //   openpgp.config.show_comment = false;

  //   var privateKey = openpgp.key.readArmored(ephemeralPrivate).keys[0];
  //   // console.log(privateKey.getPrimaryUser().user);
  //   privateKey.decrypt(passphrase);

  //   var message = $scope.contract.latest.text;

  //   openpgp.signClearMessage(privateKey, message)
  //   .then(function(result) {
  //       var newtext = result.match("-----BEGIN PGP SIGNATURE-----([\\s\\S]*?)-----END PGP SIGNATURE-----");
  //       console.log("with wrapper: \n" + newtext[0].trim());
  //       console.log("without wrapper: \n" + newtext[1].trim());
  //       // jQuery('#encryptedA').text(result);
  //   })
  //   .catch(function(error) {
  //     console.log(error);
  //   });
  // };

  $('#signatureModal').on('show.bs.modal', function (e) {
    signaturePad = $("#signature").jSignature({ 'UndoButton':true });
    $("#signature").resize();
  });

  $scope.sendForm = function() {
    openpgp.config.show_version = false;
    openpgp.config.show_comment = false;

    var privateKey = openpgp.key.readArmored(ephemeralPrivate).keys[0];
    // console.log(privateKey.getPrimaryUser().user);
    privateKey.decrypt(passphrase);

    var message = $scope.contract.latest.text;

    openpgp.signClearMessage(privateKey, message)
    .then(function(result) {
        var newtext = result.match("-----BEGIN PGP SIGNATURE-----([\\s\\S]*?)-----END PGP SIGNATURE-----");
        var datapair = signaturePad.jSignature("getData","svgbase64");

        var signature = {
          digital: newtext[0],
          image: "data:" + datapair.join(",")
        };
        console.log(signature);
    })
    .catch(function(error) {
      console.log(error);
    });

    $('#signatureModal').modal('hide');
  };

});
