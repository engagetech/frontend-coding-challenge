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
    $scope.data = costdata[0];
    $scope.headerClickHandler({sortBy: 'name'});
	});

  function updateProviders() {
    $scope.providers = ($scope.sortField === 'name') ? $scope.data.providers : $scope.data.providers.concat($scope.data.directContractors);
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
    $scope.showDirectContractorsLine = $scope.sortField === 'name';
    updateProviders();
  };

}])

.filter('percentageFilter', function () {
  return function (value, count) {
    var toReturn = (value) ? value : 0;
    if (value && value.hasOwnProperty('Total')) { // checking for compliance stats
      toReturn = (value.Total) ? value.Total : 0;
    }
    return parseFloat(toReturn.toFixed(count)) + '%';
  }
})

.filter('currencyFilter', function ($filter) {
  return function (value) {
    return value ? $filter('currency')(value, '', 0) : '-';
  }
})

.directive('providerRow', function () {
  return{
    replace:true,
    scope: {
      providerRow: '='
    },
    template: '<div class="body-row">' +
                '<div>{{providerRow.name}}</div>'+
                '<div>{{providerRow.workerCount}}</div>'+
                '<div>{{providerRow.complianceStats | percentageFilter:0}}</div>'+
                '<div>{{providerRow.grossPayTotal*0.01 | currencyFilter}}</div>'+
                '<div>{{providerRow.payRollAdminTotal*0.01 | currencyFilter}}</div>'+
                '<div>{{providerRow.labourCostTotal*0.01 | currencyFilter}}</div>'+
                '<div>{{providerRow.rebatesTotal | percentageFilter:1 }}</div>'+
              '</div>'

  }
});

