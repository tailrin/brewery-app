// Global Variables
const breweries = [];

function loadGoogleMapsLibrary(){
    $.getScript(window.atob("aHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2pzP2tleT1BSXphU3lDTE1oVWFnd2hlU0hmcFQ0TnRGUjNWWFlOUFVzRXBrbFU="), function () {
      console.log("script loaded")
     });
 }

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

    $('#starting-location').click(event => {
        $(event.currentTarget).val('');
    });
    
}

function handleBreweries(){
    //$('#results-list').empty();
    const origin = $('#starting-location').val();
    const results = [];
    breweries.forEach(brewery => {
        brewery.distanceToLook = $(`#distance-list option:selected`).val();
        const destination = `${brewery.street}, ${brewery.postal_code}`
        checkDistance(origin, destination, brewery).then(function(response){
        if(callback(response, brewery)){results.push(callback(response, brewery));
        displayResults(results);}
        
      });
    });
    
  }

function checkDistance(origin, destination, brewery){
  const service = new google.maps.DistanceMatrixService();
  const dfd = $.Deferred();
  service.getDistanceMatrix(
  {
    origins: [origin],
    destinations: [destination],
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.IMPERIAL
  }, function(response, status){
        if (status == google.maps.DistanceMatrixStatus.OK){
            dfd.resolve(response);
        }else{
            dfd.reject(status);
        }
  });
  return dfd.promise();
}

function callback(response, brewery) {
    const distanceToLook = brewery.distanceToLook;
    const distance = parseInt(response.rows[0].elements[0].distance.text.split(" ")[0].split(",").join(""), 10);
    if(distance <= distanceToLook){
      brewery.distance = distance;  
      return brewery;
    }
}

function getIndex(id){
    return breweries.findIndex(brewery => brewery.id === id);
}



function displayResults(results){
    const arr = [];
    results.forEach(result => {
        arr.push(createResultItem(result));
    });
    $('#results-list').html(arr.join(""));
    $('#display-results').removeClass("hidden");
}

function createResultItem(result){
    const address = `${result.street.split(" ").join("+")}+${result.postal_code}`
    console.log("item was created")
    return `<li>
    <h3>${result.name}</h3>
    <h4>Brewery Type: ${result.brewery_type}</h4>
    <p><a href="https://www.google.com/maps/search/?api=1&query=${address}">
    ${result.street}, ${result.city}, ${result.state}</a><br>
    <a href="${result.website_url}">${result.website_url}</a><br>
    <br>
    Phone Number: <a href="tel:${result.phone}">${result.phone}</a><br>
    Distance: ${result.distance} miles
    </p>
    </li>`
}

function handleSearchForm(){
    $('#search-form').submit(event => {
        event.preventDefault();
        $('#results-list').empty();
        handleBreweries();
        
    })
}





$(populateStates());
$(loadGoogleMapsLibrary());
$(handleStateForm());
$(handleSearchForm());















