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

function draw_circle(wrapper, data)
{
  let svg = add_svg(wrapper);

  //TO DO 
}

function draw_regression(wrapper, data)
{
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
  //TO DO 
}