//app.js - D3 Homework - Data Journalism and D3 - Randy Dettmer 2020/05/26
var svgWidth = 960;
var svgHeight = 640;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial parameters for x and y axis
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(Demodata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Demodata, d => d[chosenXAxis]) * 0.8,
      d3.max(Demodata, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);
  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(Demodata, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(Demodata, d => d[chosenYAxis]) * 0.8,
      d3.max(Demodata, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);
  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// function used to add text to scatter plot circles
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
  return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xlabel;
  if (chosenXAxis === "poverty") {
    xlabel = "Poverty:";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Age:";
  }
  else {
    xlabel = "Income:";
  }

  var ylabel;
  if (chosenYAxis === "obesity") {
    ylabel = "Obesity:";
  }
  else if (chosenYAxis === "smokes") {
    ylabel = "Smokes:";
  }
  else {
    ylabel = "Lacks Healthcare:";
  }

// modify format for each x axis
function styleX(value, chosenXAxis) {
  if (chosenXAxis === "poverty") {
    return `${value}%`;
  }
  else if (chosenXAxis === "age") {
    return `${value}`;
  }
  else {
    return `${d3.format("$,.0f")(value)}`;
  }
}

// step 1: initialize tooltip + + + + + + + + + + + + +
  var toolTip = d3.tip()
    .attr("class", "d3-tip") //connect to style in D3Style.css file
    .offset([50, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${ylabel} ${d[chosenYAxis]}%`);
    });

// step 2: create the tooltip in circleGroup
  circlesGroup.call(toolTip);

// step 3: create "mouseover" event listener to display tooltip
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })

 // step 4: create "mouseout" event listener to hide tooltip
    .on("mouseout", function(data, index) {
      toolTip.hide(data);   
    });
  return circlesGroup;
} 
// end of tooltip + + + + + + + + + + + + +

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(Demodata, err) {
  if (err) throw err;

  // parse data
  Demodata.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // x and y LinearScale function above csv import
  var xLinearScale = xScale(Demodata, chosenXAxis);
  var yLinearScale = yScale(Demodata, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(Demodata)
    .enter()
    .append("circle")
    .classed ("stateCircle", true) //connect with D3Style.css file
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10);

  // append initial circle text
  var textGroup = chartGroup.selectAll(".stateText")
    .data(Demodata)
    .enter()
    .append("text")
    .classed("stateText", true) //connect with D3Style.css file
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", "0.4em") // align labels with ticks
    //.attr("opacity", ".5") deactivated becuase it makes the text hard to read
    .attr("font-size", "10px")
    .text(function(d){return d.abbr});
  
  // Create group for three x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width/2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

 
  // Create group for three y-axis labels
  var ylabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${0 - margin.left/4}, ${height/2})`);

  var obesityLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", -20)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obese (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", -40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", -60)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener - - - - - - X here
  xlabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;
      //console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(Demodata, chosenXAxis);

      // updates x axis with transition
      xAxis = renderXAxis(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates text with new x values
      textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenXAxis === "age") {
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      } 
      else if (chosenXAxis === "poverty") {
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }  
     else {
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
      } 
    }
  });

  // y axis labels event listener - - - - - - Y here
	ylabelsGroup.selectAll("text")
	  .on("click", function() {
		// get value of selection
		var value = d3.select(this).attr("value");
		if (value !== chosenYAxis) {

		// replaces chosenYAxis with value
		chosenYAxis = value;
		//console.log(chosenYAxis)

		// functions here found above csv import = = = = = = = = = = = =
		// updates y scale for new data
		yLinearScale = yScale(Demodata, chosenYAxis);

     // updates y axis with transition
     yAxis = renderYAxis(yLinearScale, yAxis);

     // updates circles with new y values
     circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

     // updates text with new y values
     textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

     // updates tooltips with new info
     circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

     // changes classes to change bold text
     if (chosenYAxis === "obesity") {
       obesityLabel
         .classed("active", true)
         .classed("inactive", false);
       smokesLabel
         .classed("active", false)
         .classed("inactive", true);
       healthcareLabel
         .classed("active", false)
         .classed("inactive", true);
     } 
     else if (chosenYAxis === "smokes") {
       obesityLabel
         .classed("active", false)
         .classed("inactive", true);
       smokesLabel
         .classed("active", true)
         .classed("inactive", false);
       healthcareLabel
         .classed("active", false)
         .classed("inactive", true);
     }  
      else {
       obesityLabel
         .classed("active", false)
         .classed("inactive", true);
       smokesLabel
         .classed("active", false)
         .classed("inactive", true);
       healthcareLabel
         .classed("active", true)
         .classed("inactive", false);
     } 
   } 
    });
}).catch(function(error) {
  console.log(error);
});
