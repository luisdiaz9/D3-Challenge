
//Limit margins
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .attr("class", "chart");

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var labelFrame = 110;
var labelPaddBot = 40;
var labelPaddLeft = 40;
var circRadius = 10;

//group which contains all three classes of 'chosenXAxis' in the HTML
svg.append("g").attr("class", "chosenXAxis");
var chosenXAxis = d3.select(".chosenXAxis");

//Print and update X labels
function xTextRefresh() {  chosenXAxis.attr(
    "transform",    "translate(" +
      ((width - labelFrame) / 2 + labelFrame) +
      ", " +      (height - labelPaddBot) +      ")"
  );
}

xTextRefresh();

//Define Objects in the X Axis: Poverty, Age and Income
chosenXAxis
  .append("text")
  .attr("y", -30)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("In Poverty (%)");

chosenXAxis
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");

chosenXAxis
  .append("text")
  .attr("y", 30)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("Household Income (Median)");

//Define Labels in the Y Axis: Obese, Smokes and Lacks Healthcare
var leftTextY = (height + labelFrame) / 2 - labelFrame;
//group which contains all three classes of 'chosenYAxis' in the HTML
svg.append("g").attr("class", "chosenYAxis");
var chosenYAxis = d3.select(".chosenYAxis");
//Print and update Y labels
function yTextRefresh() {
  chosenYAxis.attr(
    "transform",
    "translate(" + labelPaddLeft + ", " + leftTextY + ")rotate(-90)"
  );
}
yTextRefresh();

//Define object in the X Axis: Obese, Smokes and Lacks Healthcare
chosenYAxis
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Obese (%)");

chosenYAxis
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

chosenYAxis
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Lacks Healthcare (%)");

//Reads csv file and renders information
d3.csv("assets/data/data.csv").then(function(data) {
  render(data);
});

function render(Info) {
  var optionX = "income";
  var optionY = "healthcare";

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {

  var States = "<div>" + d.state + "</div>";
  var chosenY = "<div>" + optionY + ": " + d[optionY] + "%</div>";

  //gives format depending on the option to the Axis, either percentage or number format
  if (optionX === "poverty") {
        labelX = "<div>" + optionX + ": " + d[optionX] + "%</div>";
      }
  else {
          labelX = "<div>" + optionX + ": " + parseFloat(d[optionX]).toLocaleString("en") + "</div>";
      }
  var chosenY = "<div>" + optionY + ": " + d[optionY] + "%</div>";
      return States + chosenY;
    });
  svg.call(toolTip);

// function used for updating x-scale var upon click on axis label
  var xMin;
  var xMax;
  var yMin;
  var yMax;

  function xMinMax() {
    xMin = d3.min(Info, function(d) {
      return parseFloat(d[optionX]) * 0.90;
    });
    xMax = d3.max(Info, function(d) {
      return parseFloat(d[optionX]) * 1.10;
    });
  }

  function yMinMax() {
    yMin = d3.min(Info, function(d) {
      return parseFloat(d[optionY]) * 0.90;
    });
    yMax = d3.max(Info, function(d) {
      return parseFloat(d[optionY]) * 1.10;
    });
  }

  xMinMax();
  yMinMax();

  // The Domain is established from xMin to XMax
  var xScale = d3.scaleLinear()
    .domain([xMin, xMax])
    .range([labelFrame, width]);
  var yScale = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height - labelFrame, 0]);

  var xAxis = d3.axisBottom(xScale).ticks(10);
  var yAxis = d3.axisLeft(yScale).ticks(10);

  //Prints and updates the x and y Axis with the 
  svg.append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height  - labelFrame) + ")");
  svg.append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (labelFrame) + ", 0)");

  //Filters the class 'aText x active' or 'aText y active' and changes it to inactive.
  // The clickedText is activated and properties are read in the CSS file.
  function labelChange(axis, clickedText) {
    d3.selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);
    clickedText.classed("inactive", false).classed("active", true);
  }

  var dots = svg.selectAll("g dots").data(Info).enter();

  dots.append("circle")
    .attr("cx", function(d) {
      return xScale(d[optionX]);
    })
    .attr("cy", function(d) {
      return yScale(d[optionY]);
    })
    .attr("r", circRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    .on("mouseover", function(d) {
      toolTip.show(d, this);
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select(this).style("stroke", "#e3e3e3");
    });

  dots.append("text")
    .text(function(d) {
      return d.abbr;
    })
    .attr("dx", function(d) {
      return xScale(d[optionX]);
    })
    .attr("dy", function(d) {
      return yScale(d[optionY]) + circRadius / 2.5;
    })
    .attr("font-size", circRadius)
    .attr("class", "stateText")
    .on("mouseover", function(d) {
      toolTip.show(d);
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

// If the option is inactivated, the range of the new axis is calculated, every dot and text is relocated.
//the method at the end actives the new option.
  d3.selectAll(".aText").on("click", function() {
    var self = d3.select(this);
    if (self.classed("inactive")) {
      var axis = self.attr("data-axis");
      var name = self.attr("data-name");

      if (axis === "x") {
        optionX = name;
        xMinMax();
        xScale.domain([xMin, xMax]);
        svg.select(".xAxis").transition().duration(300).call(xAxis);
        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()
            .attr("cx", function(d) {
              return xScale(d[optionX]);
            })
            .duration(300);
        });

        d3.selectAll(".stateText").each(function() {
          d3
            .select(this)
            .transition()
            .attr("dx", function(d) {
              return xScale(d[optionX]);
            })
            .duration(300);
        });

        labelChange(axis, self);
      }
      else {
        optionY = name;
        yMinMax();
        yScale.domain([yMin, yMax]);
        svg.select(".yAxis").transition().duration(300).call(yAxis);
        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()
            .attr("cy", function(d) {
              return yScale(d[optionY]);
            })
            .duration(300);
        });
        d3.selectAll(".stateText").each(function() {
          d3
            .select(this)
            .transition()
            .attr("dy", function(d) {
              return yScale(d[optionY]) + circRadius / 3;
            })
            .duration(300);
        });
        labelChange(axis, self);
      }
    }
  });
}