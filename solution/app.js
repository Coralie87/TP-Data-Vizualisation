async function fetchData() {
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson');
    const data = await response.json();
    return data;
}

fetchData().then(data => {
    const processedData = processData(data);
    createWorldMap(processedData);
    createMagnitudeHistogram(processedData);
    createTimeSeries(processedData);
    createMagnitudeDepthScatter(processedData);
});

function processData(data) {
    return data.features.map(earthquake => ({
        latitude: earthquake.geometry.coordinates[1],
        longitude: earthquake.geometry.coordinates[0],
        magnitude: earthquake.properties.mag,
        time: new Date(earthquake.properties.time),
        depth: earthquake.geometry.coordinates[2]
    }));
}

function createWorldMap(data) {
    const mapData = [{
        type: 'scattergeo',
        mode: 'markers',
        text: data.map(d => `Magnitude: ${d.magnitude}`),
        lon: data.map(d => d.longitude),
        lat: data.map(d => d.latitude),
        marker: {
            size: data.map(d => d.magnitude * 2),
            color: data.map(d => d.magnitude),
            colorscale: 'Viridis',
            colorbar: {
                title: 'Magnitude'
            }
        }
    }];

    const mapLayout = {
        title: 'Emplacements des séismes',
        geo: {
            projection: {
                type: 'natural earth'
            }
        }
    };

    Plotly.newPlot('earthquakeMap', mapData, mapLayout);
}

function createMagnitudeHistogram(data) {
    const histogramData = [{
        x: data.map(d => d.magnitude),
        type: 'histogram',
    }];

    const histogramLayout = {
        title: 'Distribution des magnitudes des séismes',
        xaxis: { title: 'Magnitude' },
        yaxis: { title: 'Nombre de séismes' }
    };

    Plotly.newPlot('magnitudeHistogram', histogramData, histogramLayout);
}

function createTimeSeries(data) {
    const occurrences = {};
    data.forEach(d => {
        const date = d.time.toISOString().split('T')[0];
        occurrences[date] = (occurrences[date] || 0) + 1;
    });

    const timeSeriesData = [{
        x: Object.keys(occurrences),
        y: Object.values(occurrences),
        type: 'scatter',
        mode: 'lines+markers'
    }];

    const timeSeriesLayout = {
        title: 'Occurrences de séismes par jour',
        xaxis: { title: 'Date' },
        yaxis: { title: 'Nombre de séismes' }
    };

    Plotly.newPlot('timeSeries', timeSeriesData, timeSeriesLayout);
}

function createMagnitudeDepthScatter(data) {
    const scatterData = [{
        x: data.map(d => d.magnitude),
        y: data.map(d => d.depth),
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 5,
            color: data.map(d => d.magnitude),
            colorscale: 'Viridis',
            colorbar: {
                title: 'Magnitude'
            }
        }
    }];

    const scatterLayout = {
        title: 'Magnitude vs Profondeur des séismes',
        xaxis: { title: 'Magnitude' },
        yaxis: { title: 'Profondeur (km)' }
    };

    Plotly.newPlot('magnitudeDepthScatter', scatterData, scatterLayout);
}
