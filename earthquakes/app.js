var earthquakeApp = angular.module('earthquakeApp', []);
// controller business logic
earthquakeApp.controller('AppCtrl', function AppCtrl($scope, $http) {

	// initialize the model
	$scope.minmagnitude = 1;
	$scope.maxmagnitude = 10;
	$scope.freeze = false;
	$scope.currentDataPoint = '';
	$scope.showreport = false;
	$scope.scale = 1000000;
	$scope.details = {};
	$scope.details.mag = 10;
	$scope.startdate = {
		year: 2014,
		month: 11,
		day: 16
	};
	$scope.enddate = {
		year: 2014,
		month: 11,
		day: 23
	};
	$scope.active = 0;

	var url = "http://comcat.cr.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=magnitude&callback=JSON_CALLBACK";
	$scope.url = url;

	$scope.getEarthquakeData = function() {
		var startDate = new Date($scope.startdate.year, $scope.startdate.month - 1, $scope.startdate.day);
		var endDate = new Date($scope.enddate.year, $scope.enddate.month - 1, $scope.enddate.day);
		$scope.url = url + "&minmagnitude=" + $scope.minmagnitude + "&maxmagnitude=" + $scope.maxmagnitude;
		$scope.url += "&starttime=" + startDate.toISOString() + "&endtime=" + endDate.toISOString();
		$scope.freeze = true;
		$http.jsonp($scope.url).
		success(function(data) {
			// attach this data to the $scope
			$scope.data = data;
			console.log(data);

			// clear the error messages
			$scope.error = '';
			$scope.freeze = false;
		}).
		error(function(data, status) {
			$scope.freeze = false;
			if (status === 404) {
				$scope.error = 'You killed kenny';
			} else {
				$scope.error = 'Error: ' + status;
			}
		});
	};

	$scope.sichuan = function() {
		$scope.scale = 1000000;
		// $scope.startdate = {year:2008,month:5,day:11};
		// $scope.enddate = {year:2008,month:5,day:14};
		$scope.startdate = {
			year: 2008,
			month: 5,
			day: 1
		};
		$scope.enddate = {
			year: 2008,
			month: 5,
			day: 30
		};

		$scope.scale = 100000000;
		$scope.getEarthquakeData();
	};

	$scope.tohoku = function() {
		$scope.scale = 1000000;
		$scope.startdate = {
			year: 2011,
			month: 3,
			day: 10
		};
		$scope.enddate = {
			year: 2011,
			month: 3,
			day: 13
		};
		$scope.getEarthquakeData();
	};

	$scope.haiti = function() {
		$scope.scale = 1000000;
		$scope.startdate = {
			year: 2010,
			month: 1,
			day: 11
		};
		$scope.enddate = {
			year: 2010,
			month: 1,
			day: 14
		};
		$scope.getEarthquakeData();
	};

	// get the commit data immediately
	$scope.getEarthquakeData();
});

earthquakeApp.directive('eqVisualisation', function() {
	// define constants and helpers used for the directive
	// ...
	return {
		restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
		scope: false,
		link: function(scope, element, attrs) {

			var width = 1000;
			var height = 500;

			var proj = d3.geo.mercator().rotate([-180, 0]);
			var path = d3.geo.path().projection(proj);
			var correct = [];


			var svg = d3.select(element[0])
				.append("svg")
				.attr("width", width)
				.attr("height", height);

			d3.json('world.json', function(json) {

				svg.selectAll('path')
					.data(json.features)
					.enter()
					.append('path')
					.attr("d", path)
					.attr("class", "country")
					.attr("id", function(d) {
						return d.properties.sovereignt;
					});

			});

			// whenever the bound 'exp' expression changes, execute this
			scope.$watch('data', function(newVal, oldVal) {
				svg.selectAll('circle').remove();
				//.transition().duration(2000)

				if (!newVal) {
					return;
				}

				var circle = svg.selectAll('#quake')
					.data(newVal.features)
					.enter()
					.append('circle')
					.attr("cx", function(d) {
						// THIS IS AN OBVIOUSLY STUPID WAY TO DO THIS AND NEEDS TO BE FIXED!!
						try {
							return /^M([\d]*.[\d]*),/.exec(path(d))[1];
						} catch (e) {
							console.log(path(d));
							return;
						}
					})
					.attr("cy", function(d) {
						//var result = /,([\d]*.[\d]*)m/.exec(path(d)[1]);
						try {
							return /,(-?[\d]*.[\d]*)m/.exec(path(d))[1];
						} catch (e) {
							console.log(path(d));
							return;
						}
					})
					.attr("fill", "url(#myAwesomeGradient)")
					.attr("class", "quake")
					.attr("id", function(d) {
						return d.properties.id;
					})
					.attr('r', function(d) {
						var unscaled = Math.pow(10, d.properties.mag);
						return unscaled / scope.scale;
					})
					.style("visibility", function() {
						var rad = d3.select(this).attr('r');
						if (rad > 15 && newVal > oldVal) {
							return "hidden";
						} else {
							return "visible";
						}
					})
					.attr('fill', function(d) {
						if (d.properties.mag < 4.9) {
							return ('blue');
						} else if (d.properties.mag < 5.9) {
							return ('purple');
						} else if (d.properties.mag < 6.9) {
							return ('red');
						} else {
							return ('black');
						}
					})
					.attr('opacity', function(d) {
						if (d.properties.mag < 4.9) {
							return 0.1;
						} else if (d.properties.mag < 5.9) {
							return 0.1;
						} else if (d.properties.mag < 6.9) {
							return 0.3;
						} else {
							return 0.8;
						}
					})
					.attr('class', function(d) {
						return d.properties.time;
					})
					.on('mouseover', function(d) {
						scope.$apply(function() {
							scope.details = d.properties;
						});
					})
					.on('mouseleave', function(d) {
						scope.$apply(function() {
							scope.details = {};
						});
					});
			});

			scope.$watch('scale', function(newVal, oldVal) {
				var prop = newVal / oldVal;

				svg.selectAll('circle')
					.transition()
					.style("visibility", function() {
						var circle = d3.select(this);
						var rad = circle.attr('r');
						var colour = circle.attr('fill');
						if (colour === "blue" && rad * prop > 10) {
							return "hidden";
						} else if (colour === "purple" && rad * prop > 50) {
							return "hidden";
						} else if (colour === "red" && rad * prop > 100) {
							return "hidden";
						} else if (rad * prop > 700) {
							return "hidden";
						} else {
							return "visible";
						}
					})
					.attr("r", function() {
						return d3.select(this).attr("r") * prop;
					});
			});
		}
	};
});


earthquakeApp.directive('eqScatter', function() {
	// define constants and helpers used for the directive
	// ...
	return {
		restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
		scope: false,
		link: function(scope, element, attrs) {

			var width = 1000;
			var height = 300;
			var margin = 50;

			var svg = d3.select(element[0])
				.append("svg")
				.attr("width", width)
				.attr("height", height);

			scope.$watch('data', function(newVal, oldVal) {

				d3.selectAll("eq-scatter > svg > *").remove();

				svg.selectAll("circle")
					.data(newVal.features)
					.enter()
					.append("circle");

				var x_extent = d3.extent(newVal.features, function(d) {
					return d.properties.time
				});
				var x_scale = d3.scale.linear().range([margin, width - margin]).domain(x_extent);

				var y_extent = d3.extent(newVal.features, function(d) {
					return d.properties.mag
				});
				var y_scale = d3.scale.linear().range([height - margin, margin]).domain(y_extent);

				d3.selectAll("eq-scatter > svg > circle")
					.attr("cx", function(d) {
						return x_scale(d.properties.time)
					})
					.attr("cy", function(d) {
						return y_scale(d.properties.mag)
					})
					.attr("r", function(d) {
						return d.properties.mag
					})
					.attr('fill', function(d) {
						if (d.properties.mag < 4.9) {
							return ('blue');
						} else if (d.properties.mag < 5.9) {
							return ('purple');
						} else if (d.properties.mag < 6.9) {
							return ('red');
						} else {
							return ('black');
						}
					})
					.on('mouseover', function(d) {
						scope.$apply(function() {
							scope.details = d.properties;
						});
						d3.select('.' + d.properties.time).fill("green");
					})
					.on('mouseleave', function(d) {
						scope.$apply(function() {
							scope.details = {};
						});
						d3.select('.' + d.properties.time).fill("green");
					})
					.attr('class', function(d) {
						return d.properties.time;
					})
					.attr('opacity', function(d) {
						if (d.properties.mag < 4.9) {
							return 0.1;
						} else if (d.properties.mag < 5.9) {
							return 0.1;
						} else if (d.properties.mag < 6.9) {
							return 0.3;
						} else {
							return 0.8;
						}
					});

				var x_axis = d3.svg.axis().scale(x_scale)
					.ticks(3)
					.tickFormat(function(d) {
						var date = new Date(d);
						return date.toString();
					});

				d3.select("eq-scatter > svg").append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + (height - margin) + ")").call(x_axis);

				var y_axis = d3.svg.axis().scale(y_scale).orient("left");
				d3.select("eq-scatter > svg").append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + margin + ", 0 )").call(y_axis);

				d3.select(".x.axis").append("text")
					.text("Time")
					.attr("x", (width / 2) - margin)
					.attr("y", margin / 1.5);

				d3.select(".y.axis")
					.append("text")
					.text("Magnitude")
					.attr("transform", "rotate (-90, -43, 0) translate(-280)");
			});
		}
	};
});
