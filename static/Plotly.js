/*Use the route /names to populate a dropdown select element with the list of sample names.
Use document.getElementById, document.createElement and append to populate the create option elements and append them to the dropdown selector.*/
let optionSelect = document.querySelector("#selDataset");
d3.json("/names", function(error, response) {
    if(error) return console.warn(error);
    let longness = response.length;
    for (let i = 0; i < longness; i++) {
        let options = document.createElement("option");
        options.innerText = response[i];
        options.value = response[i];
        optionSelect.append(options);
        // Or just do it on one line, but following directions
        // let options = d3.select("#selDataset").append("option").attr("value", response[i]).text(response[i]);
    }
});

// Set up our otuList, where the index is the otu ID and the value in the list is the description
let otuList = [];
Plotly.d3.json("/otu", function(error, data) {
    if (error) return console.warn(error);
    otuList.push(data);
});

/*Create a function called optionChanged to handle the change event when a new sample is selected 
(i.e. fetch data for the newly selected sample).*/
function optionChanged(route) {
    console.log(route);
    Plotly.d3.json(`/samples/${route}`, function(error, data) {
        if (error) return console.warn(error);
        updatePlotly(data);
    });
    d3.json(`/metadata/${route}`, function(error, data) {
        if (error) return console.warn(error);
        console.log(data);
        let $metadata = d3.select("#metadata");
        document.querySelector("#metadata").innerHTML = "";
        Object.entries(data).forEach(
            ([key, value]) => $metadata.append("div").text(`${key}: ${value}`)
        );
    });
    d3.json(`/wfreq/${route}`, function(error, data) {
        if (error) return console.warn(error);
        bonus(data);
    })
}

function updatePlotly(newdata) {
    let Pie = document.querySelector("#pie");
    let sampleValues = newdata[0].sample_values.splice(0,10);
    let otuIds = newdata[0].otu_ids.splice(0,10);
    let hoverText = [];
    for (let i = 0; i < 10; i++) {
        let search = otuIds[i];
        hoverText.push(otuList[0][search]);
    }
    Plotly.restyle(Pie, "values", [sampleValues]);
    Plotly.restyle(Pie, "labels", [otuIds]);
    Plotly.restyle(Pie, "hovertext", [hoverText]);
    let Bubble = document.querySelector("#bubble");
    Plotly.restyle(Bubble, "x", [newdata[0].otu_ids]);
    Plotly.restyle(Bubble, "y", [newdata[0].sample_values]);
}
function onLoad(otuList) {
    // Plot the default route (BB_940) once the page loads
    let defaultUrl = "/samples/BB_940";

    Plotly.d3.json(defaultUrl, function(error, data) {
        if (error) return console.warn(error);
        let sampleValues = data[0].sample_values.splice(0,10);
        let otuIds = data[0].otu_ids.splice(0,10);
        let hoverText = [];
        for (let i = 0; i < 10; i++) {
            let search = otuIds[i];
            hoverText.push(otuList[0][search]);
        }
        let trace1 = [{
            type: "pie",
            values: sampleValues,
            labels: otuIds,
            hovertext: hoverText
        }];
        let layout = {
            margin: {
                t: 0
            }
        };
        let Pie = document.querySelector("#pie");
        Plotly.plot(Pie, trace1, layout);

        // and now for the bubble chart
        //for (let i = 0, ii = otu)
        let trace2 = [{
            x: data[0].otu_ids,
            y: data[0].sample_values,
            mode: "markers",
            marker: {
                size: data[0].sample_values.map(num => {return num * 3}),
                color: data[0].otu_ids
            },
            text: otuList[0],
            type: "scatter"
        }];
        let layout2 = {
            showlegend: false,
            height: 500,
            width: 1200,
            margin: {t: 0},
            xaxis: {title: "OTU IDs"}
        }
        let Bubble = document.querySelector("#bubble");
        Plotly.plot(Bubble, trace2, layout2);
    });

    defaultUrl = "/metadata/BB_940"
    d3.json(defaultUrl, function(error, data) {
        if (error) return console.warn(error);
        let $metadata = d3.select("#metadata");
        Object.entries(data).forEach(
            ([key, value]) => $metadata.append("div").text(`${key}: ${value}`)
        );
    });
}
// BONUS
function bonus(freq) {
    // Enter a speed between 0 and 180
    freq2 = (freq-0.2)*20;
    // Trig to calc meter point
    let degrees = 180 - freq2,
        radius = .5;
    let radians = degrees * Math.PI / 180;
    let x = radius * Math.cos(radians);
    let y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    let mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    let path = mainPath.concat(pathX,space,pathY,pathEnd);

    let data = [{ type: 'scatter',
    x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'scrubs per week',
        text: freq,
        hoverinfo: 'text+name'},
    { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
    rotation: 90,
    text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                            'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                            'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                            'rgba(240, 240, 232, .5)', 'rgba(245, 245, 240, .5)',
                            'rgba(250, 250, 250, .5',
                            'rgba(255, 255, 255, 0)']},
    labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
    }];

    let layout = {
    shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
            color: '850000'
        }
        }],
    title: 'Belly Button Washing Frequency Scrubs per Week',
    height: 500,
    width: 500,
    xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('freq', data, layout);
}
d3.json('/wfreq/BB_940', function(error, data) {
    if (error) return console.warn(error);
    bonus(data);
})
onLoad(otuList);