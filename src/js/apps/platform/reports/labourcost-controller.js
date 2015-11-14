"use strict";

/******************************************************************************************

Labour Cost Report controller

******************************************************************************************/

var app = angular.module("labourcost.controller", []);

app.controller("ctrlLabourCost", ["$rootScope", "$scope", "$timeout", "restalchemy", "navigation", function LabourCostCtrl($rootScope, $scope, $timeout, $restalchemy, $navigation) {
	// Set the navigation tabs
	$navigation.select({
		forward: "reports",
		selected: "labourreport"
	});
	
	// Initialise the REST api
	var rest = $restalchemy.init({ root: $rootScope.config.api.labourstats.root });
	rest.api = $rootScope.config.api.labourstats;
	
	rest.at(rest.api.costs).get().then(function(costdata) {
	});

  init();
  function init() {
    $scope.reverseSort = false;
    $scope.sortField = 'name';
  }

  $scope.columnsHeaders = [
    {label: 'payroll provider', sortBy: 'name', cssClass:''},
    {label: 'worker', sortBy: 'workerCount', cssClass:''},
    {label: 'compliance score', sortBy: 'complianceStats', cssClass:''},
    {label: 'gross pay (£)', sortBy: 'grossPayTotal', cssClass:''},
    {label: 'payroll admin (£)', sortBy: 'payRollAdminTotal', cssClass:''},
    {label: 'labour cost (£)', sortBy: 'labourCostTotal', cssClass:''},
    {label: 'work force', sortBy: 'rebatesTotal', cssClass:''}
  ];

  $scope.headerClickHandler = function (header) {
    $scope.reverseSort = !$scope.reverseSort;
    $scope.sortField = header.sortBy;
  };
}]);
