HTMLWidgets.widget({

  name: "forceNetwork",

  type: "output",

  initialize: function(el, width, height) {

    d3.select(el).append("svg")
        .attr("width", width)
        .attr("height", height);

    return d3.layout.force();
  },

  resize: function(el, width, height, force) {

    d3.select(el).select("svg")
        .attr("width", width)
        .attr("height", height);

    force.size([width, height]).resume();
  },

  renderValue: function(el, x, force) {

    // alias options
    var options = x.options;
     var toggle = 0;

    // convert links and nodes data frames to d3 friendly format
    var links = HTMLWidgets.dataframeToD3(x.links);
    var nodes = HTMLWidgets.dataframeToD3(x.nodes);

    // get the width and height
    var width = el.offsetWidth;
    var height = el.offsetHeight;

   // var color = eval(options.colourScale);
	var color = d3.scale.category20();
    
    // create d3 force layout
    force
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(options.linkDistance)
      .charge(options.charge)
      .on("tick", tick)
      .start();

    // select the svg element and remove existing children
    var svg = d3.select(el).select("svg");
    svg.selectAll("*").remove();

    // add zooming if requested
    if (options.zoom) {
      svg
        .attr("pointer-events", "all")
        .call(d3.behavior.zoom().on("zoom", redraw));

      var vis = svg.append("svg:g");

      vis.append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", 'white');

      function redraw() {
        vis.attr("transform",
          "translate(" + d3.event.translate + ")"+
          " scale(" + d3.event.scale + ")");
    }
    } else {
      svg
        .attr("pointer-events", "auto")
        .call(d3.behavior.zoom().on("zoom", null));
    }

    // draw links
    var link = svg.selectAll(".link")
      .data(force.links())
      .enter().append("line")
      .attr("class", "link")
      .style("stroke", options.linkColour)
      .style("opacity", options.opacity)
      .style("stroke-width", eval("(" + options.linkWidth + ")"))
      .on("mouseover", function(d) {
          d3.select(this)
            .style("opacity", 1);
      })
      .on("mouseout", function(d) {
          d3.select(this)
            .style("opacity", options.opacity);
      });

    // draw nodes
    var node = svg.selectAll(".node")
      .data(force.nodes())
      .enter().append("g")
      .attr("class", "node")
      .style("fill", function(d) { return color(d.group); })
      .style("opacity", options.opacity)
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .call(force.drag);
     // .on('dblclick', connectedNodes);

    node.append("circle")
      .attr("r", 6)
      .style("stroke", "#fff")
      .style("opacity", options.opacity)
      .style("stroke-width", "1.5px");
    
	 node.append("title")
      .text(function(d) { return d.name; });
    
   /* node.append("svg:text")
      .attr("class", "nodetext")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name })
      .style("font", options.fontsize + "px serif")
      .style("opacity", 0)
      .style("pointer-events", "none");*/
 /* var legend = svg.selectAll(".legend")
        .data(color.domain())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 ")"; });
  
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);
  
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });*/
    
    function tick() {
      link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
    }

    function mouseover() {
      d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 16);
      d3.select(this).select("text").transition()
        .duration(750)
        .attr("x", 13)
        .style("stroke-width", ".5px")
        .style("font", options.clickTextSize + "px serif")
        .style("opacity", 1);
    }

    function mouseout() {
      d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 8);
      d3.select(this).select("text").transition()
        .style("opacity", 0);
    }
   
    var linkedByIndex = {};
    for (i = 0; i < force.nodes.length; i++) {
        linkedByIndex[i + "," + i] = 1;
    };
    force.links.forEach(function (d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });
    
    
    
    function neighboring(a, b) {
        return linkedByIndex[a.index + "," + b.index];
    }
    
    function connectedNodes() {
    
        if (toggle == 0) {
    
            d = d3.select(this).node().__data__;
            node.style("opacity", function (o) {
                return neighboring(d, o) | neighboring(o, d) ? 1 : 0.15;
            });
            toggle = 1;
        } else {
            node.style("opacity", 1);
            toggle = 0;
        }
    }
  },
});
