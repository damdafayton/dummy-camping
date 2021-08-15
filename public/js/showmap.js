const campMapParse = campMap
// console.log('token: ', mapToken)
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'mapshow', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: campMapParse.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

const markerHeight = 45;
const markerRadius = 10;
const linearOffset = 25;
const popupOffsets = {
    'top': [0, 0],
    'top-left': [0, 0],
    'top-right': [0, 0],
    'bottom': [0, -markerHeight],
    'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
    'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
    'left': [markerRadius, (markerHeight - markerRadius) * -1],
    'right': [-markerRadius, (markerHeight - markerRadius) * -1]
};

new mapboxgl.Marker()
    .setLngLat(campMapParse.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: popupOffsets })
            .setHTML(
                `<h3>${campMapParse.title}</h3><p>${campMapParse.location}</p>`
            )
    )
    .addTo(map)

    const nav = new mapboxgl.NavigationControl({
        visualizePitch: true
    });
    map.addControl(nav, 'bottom-right');
// Create a new marker.
// const marker = new mapboxgl.Marker()
//     .setLngLat(campMapParse.geometry.coordinates)
//     .addTo(map);


// const popup = new mapboxgl.Popup({ offset: popupOffsets, className: 'my-class' })
//     .setLngLat(campMapParse.geometry.coordinates)
//     .setHTML(`<h6>${campMapParse.title}</h6><p>${campMapParse.location}</p>`)
//     .setMaxWidth("300px")
//     .addTo(map)
    // .on('open', () => {
    //     console.log('popup was opened')
// console.log('map', campMapParse.geometry.coordinates)