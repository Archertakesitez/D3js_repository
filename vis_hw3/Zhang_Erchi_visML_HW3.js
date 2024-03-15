//DO NOT CHANGE THIS FUNCTION
function add_svg(wrapper) 
{
  var svg = d3.select(wrapper).select("svg");

  if (svg.empty())
    svg = d3.select(wrapper).append("svg");
  else
    svg.selectAll("*").remove();

  return svg.attr("width", 300).attr("height", 300);
}

//DO NOT CHANGE THIS FUNCTION
function set_update(div_id, _)
{

  comm.call({n: 5})
  setInterval(function(){ comm.call({n: 5}) }, 2000);
}


function draw_regression(wrapper, data)
{
  console.log("Hello");
  var margin = {top: 20, right: 30, bottom: 35, left: 40},
        width = 500,
        height = 300-margin.top;
  dataset = data["data"]
  let svg = add_svg(wrapper);
  const xScale = d3.scaleLinear()
                 .domain(d3.extent(dataset, d => d.x)).nice()
                 .range([margin.left, width-margin.right]);
  const yScale = d3.scaleLinear()
  .domain(d3.extent(dataset,d => d.y)).nice()
  .range([height-margin.top,margin.bottom]);
  const xAxis = d3.axisBottom(xScale);

  svg.append('g')
      // move x-axis down to the bottom
      .attr('transform', `translate(0,${height-margin.top})`)
      .call(xAxis)
    .append("text")
    .attr("fill", "#000") 
    .attr("transform", `translate(${width/2-margin.left},10)`) 
    .attr("x", -20) // Position relative to the axis line
    .attr("dy", "0.71em") 
    .attr("text-anchor", "end") 
    .style("font-size","10px")
    .text("y");
  const yAxis = d3.axisLeft(yScale);
  svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", `translate(${-margin.left},${height/2-15}) rotate(-90)`) // Rotate the text for vertical orientation
    .attr("x", -20) 
    .attr("dy", "0.71em") 
    .attr("text-anchor", "end") 
    .style("font-size","10px")
    .text("predicted y");
  svg.append('text')
      .attr('fill', 'black')
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'hanging')
      .attr('font-weight', 'bold')
      .style("font-size", "14px")
      .text('linear regression plot');
  svg.append('line')
    .attr('x1',xScale(0))
    .attr('y1',yScale(73.37))
    .attr('x2',xScale(1000))
    .attr('y2',yScale(73.37+1000*0.518))
    .attr("stroke", "black") // Line color
    .attr("stroke-width", 2);
  svg.selectAll("circle")
   .data(dataset)
   .enter()
   .append("circle")
   .attr("cx", d => xScale(d.x))
   .attr("cy", d => yScale(d.y))
   .attr("r", 1);
}

function draw_bi_bars(wrapper, data)
{
  var margin = {top: 20, right: 20, bottom: 30, left: 100},
    width = 1000 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
  data = data["data"]
  dataset = d3.sort(data, (d) => Math.abs(d.value))
  dataset.forEach(obj => {
  let firstKey = Object.keys(obj)[1]; 
  obj[firstKey] = parseFloat(obj[firstKey]).toFixed(2); 
});
  let svg = add_svg(wrapper);
  const xScale = d3.scaleLinear()
    .domain(d3.extent(dataset, d => d.value))
    .range([margin.left, width*0.3]);
  const yScale = d3.scaleBand()
    .domain(dataset.map(d => d.name))
    .range([height, 0])
    .padding(0.1);
  svg.selectAll(".bar")
    .data(dataset)
    .enter().append("rect")
    .attr("class", d => d.value > 0 ? "bar positive" : "bar negative")
    .attr("fill", (d) => d3.schemeRdBu[3][d.value > 0 ? 0 : 2])
    .attr("y", d => yScale(d.name) + yScale.bandwidth() / 2 +6)
    .attr("x", d => xScale(Math.min(0, d.value)))
    .attr("width", d => Math.abs(xScale(d.value) - xScale(0)))
    .attr("height", yScale.bandwidth()/1.8);
  svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
    .selectAll()
    .data(dataset)
    .join("text")
      .attr("text-anchor", d => d.value < 0 ? "end" : "start")
      .attr("x", (d) => xScale(d.value) + Math.sign(d.value - 0) * 4)
      .attr("y", (d) => yScale(d.name) + yScale.bandwidth() )
      .attr("dy", "0.35em")
      .text(d => Math.abs(d.value));
  svg.append('text')
      .attr('fill', d3.schemeRdBu[3][2])
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'hanging')
      .attr('font-weight', 'bold')
      .style("font-size", "14px")
      .text('class 0');
  svg.append('text')
      .attr('fill', d3.schemeRdBu[3][0])
      .attr('x',250)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'hanging')
      .attr('font-weight', 'bold')
      .style("font-size", "14px")
      .text('class 1');
  svg.append("g")
    .attr("transform", `translate(${xScale(0)},0)`)
    .call(d3.axisLeft(yScale).tickSize(0).tickPadding(6))
    .call(g => g.selectAll(".tick text").filter((d, i) => dataset[i].value > 0)
        .attr("text-anchor", "start")
        .attr("x", 6));
}




function draw_shap(wrapper, data){
  var margin = {top: 30, right: 50, bottom: 35, left: 45},
        width = 305,
        height = 300-margin.top;
  const dataset = data["data"]
  let svg = add_svg(wrapper);
  const colorScale = d3.scaleLinear()
                 .domain([0,0.25])
                 .range(['blue', 'red'])
                 .clamp(true);
  var defs = svg.append("defs");
//Append a linearGradient element to the defs and give it a unique id
var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");
  linearGradient
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");
const legendWidth = height-margin.top;
const legendHeight = 10;
const legendMargin = {top: 10, right: 20, bottom: 20, left: 40};
linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "red"); //light blue

//Set the color for the end (100%)
linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "blue"); //dark blue
//Draw the rectangle and fill with gradient
svg.append("rect")
    .attr("width", height-margin.top-margin.bottom)
    .attr("height", 5)
    .attr("transform", `translate(${width-margin.right},${margin.bottom}) rotate(90)`)
    .style("fill", "url(#linear-gradient)");
  const legendScale = d3.scaleLinear()
  .domain([0,0.25])
  .range([height-margin.top,margin.bottom]);

const legendAxis = d3.axisRight(legendScale)
  .ticks(5) // Adjust the number of ticks based on your preference
  .tickFormat(d3.format(".2f")); // Format for the labels

svg.append("g")
  .attr("class", "legendAxis")
  .attr("transform", `translate(${width-margin.right},0)`)
  .call(legendAxis)
  .append("text")
    .attr("fill", "#000")
    .attr("transform", `translate(20,${height/2-55}) rotate(-90)`) // Rotate the text for vertical orientation
    .attr("x", -40) 
    .attr("dy", "1.6em") 
    .attr("text-anchor", "end") 
    .style("font-size","12px")
    .text("Fnlwgt");
  const xScale = d3.scaleLinear()
                 .domain(d3.extent(dataset, d => d.a_val)).nice()
                 .range([margin.left, width-margin.right]);
  const yScale = d3.scaleLinear()
  .domain(d3.extent(dataset,d => d.s_val)).nice()
  .range([height-margin.top,margin.bottom]);
  const xAxis = d3.axisBottom(xScale);
  svg.append('g')
      .attr('transform', `translate(0,${height-margin.top})`)
      .call(xAxis)
    .append("text")
    .attr("fill", "#000") 
    .attr("transform", `translate(${width/2+5},10)`) 
    .attr("x", 0) // Position relative to the axis line
    .attr("dy", "1.2em") 
    .attr("text-anchor", "end") 
    .style("font-size","12px")
    .text("Age");
  const yAxis = d3.axisLeft(yScale);
  svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", `translate(${-margin.left},${height/2-55}) rotate(-90)`) // Rotate the text for vertical orientation
    .attr("x", -20) 
    .attr("dy", "0.71em") 
    .attr("text-anchor", "end") 
    .style("font-size","12px")
    .text("Shap Value for Age");
  svg.append('text')
      .attr('fill', 'black')
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'hanging')
      .attr('font-weight', 'bold')
      .style("font-size", "12px")
      .text('dependence plot');
  svg.selectAll("circle")
   .data(dataset)
   .enter()
   .append("circle")
   .attr("cx", d => xScale(d.a_val))
   .attr("cy", d => yScale(d.s_val))
   .attr("r", 2)
   .style("fill", d=>colorScale(d.f_val));
}