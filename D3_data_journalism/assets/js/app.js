//app.js - D3 Homework - Data Journalism and D3 - Randy Dettmer 2020/05/19
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

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(Demodata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Demodata, d => d[chosenXAxis]),
      d3.max(Demodata, d => d[chosenXAxis])
    ])
    .range([0, width]);
  return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;
  if (chosenXAxis === "poverty") {
    label = "Poverty:";
  }
  else if (chosenXAxis === "age") {
    label = "Age:";
  }
  else {
    label = "Income";
  }

// step 1: initialize tooltip
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .style("display","block")
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
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

  // xLinearScale function above csv import
  var xLinearScale = xScale(Demodata, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([20, d3.max(Demodata, d => d.obesity)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

/* - not sure where these go to put state codes on dots
    .data(Deomodata)
    .enter()
    .append("text")  //test here now
    .text(d => d.abbr) // test here now
*/

  // append initial circles - circle text doesn't work here
  var circlesGroup = chartGroup.selectAll("circle")
    .data(Demodata)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.age))
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // Create group for three x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

 /*  - y-axis labels    
  var obeseLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 60)
    .attr("y", 0)
    .attr("value", "obese") // value to grab for event listener
    .classed("active", true)
    .text("Obese (%)");

  var smokesLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 40)
    .attr("y", 0)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var healthcareLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 20)
    .attr("y", 0)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");
*/

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
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
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

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
}).catch(function(error) {
  console.log(error);
});
