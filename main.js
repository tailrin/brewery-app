// Global Variable
const breweries = [];

function populateStates(){
    const arr =[]
    states.forEach(state => {
        arr.push(createSelection(state));
    })
    $('#state-list').html(arr.join(""));
}

function createSelection(state){
    return `<option value="${state.name.toLowerCase().split(" ").join("_")}">${state.name}</option>`;
}

function handleStateForm(){
    $('#state-form').submit(event =>{
        event.preventDefault();
        const chosenState = $(`#state-list option:selected`).val();
    
        for (let i = 1; i < 20; i++){
            const breweryURL = `https://api.openbrewerydb.org/breweries?by_state=${chosenState}&page=${i}&per_page=50`;
            fetch(breweryURL).then(response => response.json()).then(responseJson => {
                responseJson.forEach(brewery => {

                    if (responseJson.length === 0){
                        i = 20;
                    } else{
                        breweries.push(brewery);
                    }
                });
            });
        }
        $('#state-form').addClass('hidden');
        $('#search-form').removeClass('hidden');
    });
    
}

function checkDistances(origin, destination){
    const key="AIzaSyB5VmGBC57nwC2jngt1l-iFo5OsTwxtqXs"
    const googleURL = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin}&destinations=${destination}&key=${key}`
    let distance = 0
    fetch(googleURL, {mode:'cors', headers: { 'Access-Control-Allow-Origin':'*' } }).then(response => response.json()).then(responseJson => {
        distance = responseJson.rows[0].elements[0].distance.text
    })
    return distance;
}

function displayResults(results){

}

function handleSearchForm(){
    $('#search-form').submit(event => {
        event.preventDefault();
        const distanceToLook = $(`#distance-list option:selected`).val();
        const origin = $('#starting-location').val().split(" ").join("+");
        const results = [];
        breweries.forEach(brewery => {
            const destination = `${brewery.street.split(" ").join("+")}+${brewery.postal_code}`
            if(checkDistances(origin, destination) < distanceToLook){
                results.push(brewery);
            }
        });
        displayResults();
    })
}





$(populateStates());
$(handleStateForm());
$(handleSearchForm());
