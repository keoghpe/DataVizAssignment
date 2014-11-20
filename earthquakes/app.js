var earthquakeApp = angular.module('earthquakeApp', []);
// controller business logic
earthquakeApp.controller('AppCtrl', function AppCtrl ($scope, $http) {

  // initialize the model
  $scope.minmagnitude = 5;
  $scope.maxmagnitude = 10;
  $scope.freeze = false;
  $scope.currentDataPoint = '';
  $scope.showreport = false;
  $scope.scale = 1000000;
  $scope.details = {};
  $scope.details.mag = 10;
  $scope.startdate = {year:2014,month:4,day:15};
  $scope.enddate = {year:2014,month:5,day:15};

  var url = "http://comcat.cr.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=magnitude&callback=JSON_CALLBACK";
  $scope.url = url;

  $scope.getEarthquakeData = function () {
  	var startDate = new Date($scope.startdate.year, $scope.startdate.month-1, $scope.startdate.day);
  	var endDate = new Date($scope.enddate.year, $scope.enddate.month-1, $scope.enddate.day);
	$scope.url = url + "&minmagnitude=" + $scope.minmagnitude + "&maxmagnitude=" + $scope.maxmagnitude;
	$scope.url += "&starttime=" + startDate.toISOString()+ "&endtime=" + endDate.toISOString();
	$scope.freeze = true;
	$http.jsonp($scope.url).
	success(function (data) {
		// attach this data to the $scope
		$scope.data = data;
		console.log(data);

		// clear the error messages
		$scope.error = '';
		$scope.freeze = false;
	}).
	error(function (data, status) {
		$scope.freeze = false;
		if (status === 404) {
			$scope.error = 'You killed kenny';
		} else {
			$scope.error = 'Error: ' + status;
		}
	});
  };

  $scope.sichuan = function () {
  	$scope.startdate = {year:2008,month:5,day:1};
  	$scope.enddate = {year:2008,month:5,day:30};
  	$scope.scale = 100000000;
  	$scope.getEarthquakeData();
  };

  $scope.tohoku = function () {
  	$scope.startdate = {year:2011,month:3,day:1};
  	$scope.enddate = {year:2011,month:3,day:30};
  	$scope.getEarthquakeData();
  };

  $scope.haiti = function () {
  	$scope.startdate = {year:2010,month:1,day:1};
  	$scope.enddate = {year:2010,month:1,day:30};
  	$scope.getEarthquakeData();
  };

  // get the commit data immediately
  $scope.getEarthquakeData();
});

earthquakeApp.directive('eqVisualisation', function () {
  // define constants and helpers used for the directive
  // ...
  return {
    restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
    scope: false,
    link: function (scope, element, attrs) {

		var width = 1000;
		var height = 500;

		var proj = d3.geo.mercator().rotate([-180,0]);
		var path = d3.geo.path().projection(proj);
		var correct = [];


		var svg = d3.select(element[0])
			.append("svg")
				.attr("width", width)
				.attr("height", height);

		d3.json('world.json', function(json){

			svg.selectAll('path')
			.data(json.features)
			.enter()
			.append('path')
			.attr("d", path)
			.attr("class", "country")
			.attr("id", function(d){
				return d.properties.sovereignt;
			});

		});

		var gradient = svg
			.append("radialGradient")
			.attr("id","myAwesomeGradient")
			.attr("cx", "50%")
			.attr("cy", "50%")
			.attr("r", "50%")
			.attr("fx", "50%")
			.attr("fy", "50%");

		gradient
		.append("stop")
		.attr("offset", "0%")
		.attr("style", "stop-color:rgba(255,0,0,.3)");

		gradient
		.append("stop")
		.attr("offset", "100%")
		.attr("style", "stop-color:rgba(255,255,255,0.01)");

		// whenever the bound 'exp' expression changes, execute this 
		scope.$watch('data', function (newVal, oldVal) {
			svg.selectAll('circle').remove();
			//.transition().duration(2000)

			if (!newVal) {
				return;
			}

			var circle = svg.selectAll('#quake')
			.data(newVal.features)
			.enter()
			.append('circle')
			.attr("cx", function (d) {
				// THIS IS AN OBVIOUSLY STUPID WAY TO DO THIS AND NEEDS TO BE FIXED!!
				try{
					return /^M([\d]*.[\d]*),/.exec(path(d))[1];
				} catch(e){
					console.log(path(d));
					return;
				}
			})
			.attr("cy", function (d) {
				//var result = /,([\d]*.[\d]*)m/.exec(path(d)[1]);
				try{
					return /,(-?[\d]*.[\d]*)m/.exec(path(d))[1];
				} catch(e){
					console.log(path(d));
					return;
				}
			})
			.attr("fill","url(#myAwesomeGradient)")
			.attr("class", "quake")
			.attr("id", function (d){
				return d.properties.id;
			})
			.attr('r', function (d) {
				var unscaled = Math.pow(10, d.properties.mag);
				return unscaled/scope.scale;
			})
			.style("visibility", function () {
				var rad = d3.select(this).attr('r');
				if (rad>15 && newVal > oldVal) {
					return "hidden";
				} else {
					return "visible";
				}
			})
			.attr('fill', function (d) {
				if (d.properties.mag < 4.9) {
					return('blue');
				} else if(d.properties.mag < 5.9){
					return('purple');
				} else if(d.properties.mag < 6.9){
					return('red');
				} else{
					return('black');
				}
			})
			.attr('opacity', function (d) {
				return 0.5;
			})
			.on('mouseover', function (d) {
				scope.$apply(function () {
					console.log(d.properties);
					scope.details = d.properties;
				});
			})
			.on('mouseleave', function (d) {
				scope.$apply(function() {
					scope.details = {};
				});
			});
		});

		scope.$watch('scale', function (newVal, oldVal) {
			var prop = newVal / oldVal;
			svg.selectAll('circle')
			.transition()
			.style("visibility", function () {
				var rad = d3.select(this).attr('r');
				if (rad*prop>300) {
					return "hidden";
				} else {
					return "visible";
				}
			})
			.attr("r", function(){
				return d3.select(this).attr("r")*prop;
			})
			.attr('opacity', function (d) {
				if(d3.select(this).attr('r')>100){
					return 0.05;
				} else if(d3.select(this).attr('r')>20){
					return 0.1;
				}
				return 0.5;
				//return d3.select(this).attr("opacity")*prop;
			});
		});
    }
  	};
});