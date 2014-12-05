var Network = function(myConfig) {
	var mywidth, myheight, myactorcolour, myfilmcolour, myactorradius, myfilmradius, mycharge, mydistance;

	if (myConfig) {
		mywidth = myConfig.width;
		myheight = myConfig.height;
		myactorradius = myConfig.actorRadius;
		myfilmradius = myConfig.filmRadius;
		myactorcolour = myConfig.actorColour;
		myfilmcolour = myConfig.filmColour;
		mycharge = myConfig.charge;
		mydistance = myConfig.distance;
	}

	var width = mywidth || 1000;
	var height = myheight || 1000;
	var actorRadius = myactorradius || 5;
	var filmRadius = myfilmradius || 5;
	var actorColour = myactorcolour || "#40B8AF";
	var filmColour = myfilmcolour || "#B2577A";
	var charge = mycharge || -100;
	var linkDistance = mydistance || 50;
	var theSelection = "";

	var force = d3.layout.force();

	var allData = [];
	var linkedByIndex = {};
	var linksG = null,
		nodesG = null;

	var node = null,
		link = null;

	var curNodesData = [],
		curLinksData = [];

	var groupCenters = null;

	var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

	var network = function (selection, data) {
		allData = setupData(data);
		theSelection = selection;

		var vis = d3.select(selection).append("svg")
					.attr("width", width)
					.attr("height", height);

		var defs = vis.append("defs");

		linksG = vis.append("g").attr("id", "links");
		nodesG = vis.append("g").attr("id", "nodes");

		force.size([width,height]);

		force.on("tick", forceTick)
        .charge(charge)
        .linkDistance(linkDistance);

		update();
	};

	var update = function() {
		curNodesData = allData.nodes;
		curLinksData = allData.links;

		force.nodes(curNodesData);

		updateNodes();
		force.links(curLinksData);
		updateLinks();

		force.start();
	};

	var setupData = function(data) {

		data.nodes.forEach(function(n) {
			n.x = Math.floor(Math.random()*width);
			n.y = Math.floor(Math.random()*height);
			n.radius = 5;
		});

		nodesMap = mapNodes(data.nodes);

		data.links.forEach(function (l) {
			l.source = nodesMap.get(l.source);
			l.target = nodesMap.get(l.target);

			linkedByIndex[l.source.id+","+l.target.id] = 1;
		});

		return data;

	};

	var mapNodes = function (nodes) {
		var nodesMap = d3.map();
		nodes.forEach(function (n) {
			nodesMap.set(n.id, n);
		});
		return nodesMap;
	};

	var updateNodes = function () {
		node = nodesG.selectAll("circle.node")
					.data(curNodesData, function (d) {
						return d.id;
					});

		node.enter().append("circle")
			.attr("class", "node")
			.attr("cx", function(d){ return d.x; })
			.attr("cy", function(d){ return d.y; })
			.attr("r", function(d){return d.type === "actor" ? actorRadius : filmRadius; })
			.attr("id", function(d){return d.id; })
			.style("fill", function(d){return d.type === "actor" ? actorColour : filmColour;})
			.style("stroke", "black")
			.style("stroke-width", 1.0).on("mouseover", function (d) {
				d3.select(theSelection + " > svg").append("text")
				.text(d.name.replace(/&amp;/g, '&'))
				.attr("x", d.x+3)
				.attr("y", d.y+10)
				.attr("id", "nodedescription");
			})
			.on("mouseleave", function (d) {
				d3.select("#nodedescription").remove();
			})
			.on("click", function (d) {
				//location = "http://en.wikipedia.org/wiki/" + d.id;
				var win = window.open("http://en.wikipedia.org/wiki/" + d.id.replace(/&amp;/g, '&'), '_blank');
				win.focus();
			});

		node.exit().remove();
	};

	var updateLinks = function() {
		link = linksG.selectAll("line.link")
			.data(curLinksData, function(d) {return d.source.id+"_"+d.target.id;});

		link.enter().append("line")
			.attr("class", "link")
			.attr("stroke", "#ddd")
			.attr("stroke-opacity", 0.8)
			.attr("x1", function(d) {return d.source.x;})
			.attr("y1", function(d) {return d.source.y;})
			.attr("x2", function(d) {return d.target.x;})
			.attr("y2", function(d) {return d.target.y;});

		link.exit().remove();
	};

	var forceTick = function (err) {
		node.attr("cx", function(d) { return d.x;})
			.attr("cy", function(d) { return d.y;});

		link.attr("x1", function(d) { return d.source.x;})
			.attr("y1", function(d) { return d.source.y;})
			.attr("x2", function(d) { return d.target.x;})
			.attr("y2", function(d) { return d.target.y;});
	};

	function zoomed() {
		d3.select(selection + " > svg").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}

	return network;
};
