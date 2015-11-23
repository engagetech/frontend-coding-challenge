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

	$scope.sort = ['type', 'name'];
	
	// Initialise the REST api
	var rest = $restalchemy.init({ root: $rootScope.config.api.labourstats.root });
	rest.api = $rootScope.config.api.labourstats;
	
	rest.at(rest.api.costs).get().then(function(costdata) {
		console.log(costdata);
		
		var data = costdata[0];
		var combinedData = [];

		for(var i = 0; i < data.directContractors.length; i++){
			data.directContractors[i].type = 'direct_contractor';
		}

		$scope.combinedData = combinedData.concat(data.directContractors, data.providers);
		$scope.total = data.total[0];

		for(var i = 0; i < $scope.combinedData.length; i++){
			var provider = $scope.combinedData[i];
			if(!provider.complianceStats){
				provider.complianceStats = {};
				provider.complianceStats.Total = 0;
			}
			provider.workForce = ((provider.workerCount/$scope.total.workerCount)*100)
		};
	});

	$scope.setSort = function(){

		for(var i = 0; i<arguments.length; i++){
			if($scope.sort[i] == arguments[i] && arguments[i] != 'type'){
				$scope.sort[i] = '-' + arguments[i];
			} else if($scope.sort[i] == '-' + arguments[i]){
				$scope.sort[i] = arguments[i];
			} else {
				$scope.sort[i] = arguments[i];
			}
		}
		if(arguments.length == 1 && $scope.sort.length > 1){
			$scope.sort.splice(1);
		}

	}

	$scope.costCalculation = function(cost){
		if(cost){
			var calculatedCost = cost.toString().splice(-2,0,'.');
			return calculatedCost;
		}
	}

	String.prototype.splice = function( idx, rem, s ) {
	    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
	};

}]);
