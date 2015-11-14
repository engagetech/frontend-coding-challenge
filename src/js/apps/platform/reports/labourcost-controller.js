"use strict";

/******************************************************************************************

Labour Cost Report controller

******************************************************************************************/

var app = angular.module("labourcost.controller", []);

app.controller("ctrlLabourCost", ["$rootScope", "$scope", "$timeout", "restalchemy", "navigation", "$filter",  function LabourCostCtrl($rootScope, $scope, $timeout, $restalchemy, $navigation, $filter) {
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
    $scope.headerClickHandler($scope.columnsHeaders[0], 0);
	});


  var sortingIndex = 0, sortField = 'name', reverseSort = true;

  function updateProviders() {
    var providers = (sortField === 'name') ? $scope.data.providers : $scope.data.providers.concat($scope.data.directContractors);
    $scope.providers = $filter('orderBy')(providers, providerSortFunction, reverseSort);
  }

  $scope.columnsHeaders = [
    {label: 'payroll provider', sortBy: 'name', cssClass:'', isSorting:true, reverse:false},
    {label: 'worker', sortBy: 'workerCount', cssClass:'', isSorting:false, reverse:true},
    {label: 'compliance score', sortBy: 'complianceStats.Total', cssClass:'', isSorting:false, reverse:true},
    {label: 'gross pay (£)', sortBy: 'grossPayTotal', cssClass:'', isSorting:false, reverse:true},
    {label: 'payroll admin (£)', sortBy: 'payRollAdminTotal', cssClass:'', isSorting:false, reverse:true},
    {label: 'labour cost (£)', sortBy: 'labourCostTotal', cssClass:'', isSorting:false, reverse:true},
    {label: 'work force', sortBy: 'rebatesTotal', cssClass:'', isSorting:false, reverse:true}
  ];

  $scope.headerClickHandler = function (header, newIndex) {
    if(newIndex !== sortingIndex) {
      header.isSorting = true;
      header.cssClass = '';
      reverseSort = header.reverse;
      sortField = header.sortBy;
      $scope.columnsHeaders[sortingIndex].isSorting = false;
      sortingIndex = newIndex;
    } else {
      reverseSort = !reverseSort;
    }
    header.cssClass = (reverseSort) ? '' : 'reversed-sort';
    $scope.showDirectContractorsLine = sortField === 'name';
    updateProviders();
  };

  function providerSortFunction (provider) {
    function evalItem(item, field) {
      var parts = field.split('.');
      var property = item;
      var i = 0, nonNull = true;
      while(i < parts.length && nonNull) {
        if(property[parts[i]]) {
          property = property[parts[i]];
          i++;
        } else {
          property = 0;
          nonNull = false;
        }
      }
      return property;
    }
    return evalItem(provider, sortField);
  }
}])

.filter('percentageFilter', function () {
  return function (value, count, subProperty) {
    var toReturn = (value) ? value : 0;
    if (value && value.hasOwnProperty(subProperty)) { // checking for compliance stats
      toReturn = (value[subProperty]) ? value[subProperty] : 0;
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
                '<div>{{providerRow.complianceStats | percentageFilter:0:"Total"}}</div>'+
                '<div>{{providerRow.grossPayTotal*0.01 | currencyFilter}}</div>'+
                '<div>{{providerRow.payRollAdminTotal*0.01 | currencyFilter}}</div>'+
                '<div>{{providerRow.labourCostTotal*0.01 | currencyFilter}}</div>'+
                '<div>{{providerRow.rebatesTotal | percentageFilter:1 }}</div>'+
              '</div>'

  }
});

