// Set up our otuList, where the index is the otu ID and the value in the list is the description
let otuList = [];
Plotly.d3.json("/otu", function(error, data) {
    if (error) return console.warn(error);
    otuList.push(data);
});
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

/*Create a function called optionChanged to handle the change event when a new sample is selected 
(i.e. fetch data for the newly selected sample).*/
function optionChanged(route) {
    console.log(route);
    Plotly.d3.json(`/samples/${route}`, function(error, data) {
        if (error) return console.warn(error);
        updatePlotly(data);
    })
}

function updatePlotly(newdata) {
    let Pie = document.querySelector("#pie");
    let sampleValues = newdata[0].sample_values.splice(0,10);
    let otuIds = newdata[0].otu_ids.splice(0,10);
    let hoverText = []
    for (let i = 0; i < 10; i++) {
        let search = otuIds[i];
        hoverText.push(otuList[0][search]);
    }
    console.log(sampleValues);
    console.log(otuIds);
    Plotly.restyle(Pie, "values", [sampleValues]);
    Plotly.restyle(Pie, "labels", [otuIds]);
    Plotly.restyle(Pie, "hovertext", [hoverText]);
}

// Plot the default route (BB_940) once the page loads
let defaultUrl = "/samples/BB_940";

Plotly.d3.json(defaultUrl, function(error, data) {
    if (error) return console.warn(error);
    let sampleValues = data[0].sample_values.splice(0,10);
    let otuIds = data[0].otu_ids.splice(0,10);
    let hoverText = []
    for (let i = 0; i < 10; i++) {
        let search = otuIds[i];
        hoverText.push(otuList[0][search]);
    };
    let trace = [{
        type: "pie",
        values: sampleValues,
        labels: otuIds,
        hovertext: hoverText
    }];
    let Pie = document.querySelector("#pie");
    Plotly.plot(Pie, trace);
});