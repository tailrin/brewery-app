// Global Variables
const breweries = [];

function loadGoogleMapsLibrary(){
    $.getScript(window.atob("aHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2pzP2tleT1BSXphU3lCWlJWMEJmM2s5N1M0dnpsOXc1UDlJV1hqM0djeFNRNE0mbGlicmFyaWVzPXBsYWNlcw=="), function () {
      console.log("script loaded")
     });
 }

 function initAutoComplete(){
    const autocomplete = new google.maps.places.Autocomplete(document.getElementById("starting-location"), {types: ['geocode']});
    autocomplete.setFields(['address_component']);
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
        initAutoComplete();
    });


    
}

function handleBreweries(){
    const origin = $('#starting-location').val();
    const results = [];
    breweries.forEach(brewery => {
        brewery.distanceToLook = $(`#distance-list option:selected`).val();
        const destination = `${brewery.street}, ${brewery.postal_code}`
        checkDistance(origin, destination).then(function(response){
            if(callback(response, brewery)){
                results.push(callback(response, brewery));
            }
            displayResults(results);
        }).catch(function(err){
            if(`${err}`.includes('TypeError: Cannot read property')){
                $('#starting-location-label').html('<span class="red">Address was not found: </span>Please try another address');
            }
        });
    });
    
  }

function checkDistance(origin, destination){
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
    if(results.length === 0){
        $('#results-list').html(`<li><h3>No results to display</h3></li>`)
    }else{
        results.sort(function(a, b) {
            return a.distance - b.distance;
        });
        results.forEach(result => {
            arr.push(createResultItem(result));
        });
        $('#results-list').html(arr.join(""));
    }
    $('#display-results').removeClass("hidden");
}

function createResultItem(result){
    const address = `${result.street.split(" ").join("+")}+${result.postal_code}`
    const arr = [`<li>`];
    if(result.website_url){
        arr.push(`<a src="${result.website_url}"><h3>${result.name}</h3></a>`)
    }else{
        arr.push(`<h3>${result.name}</h3>`)
    }
    if(result.brewery_type){arr.push(`<h4>Brewery Type: ${result.brewery_type}</h4>`)}
    if(result.street){
        arr.push(`<p><a href="https://www.google.com/maps/search/?api=1&query=${address}" target="_blank">
        ${result.street}, ${result.city}, ${result.state}</a><br>`)
    }else{
        arr.push(`<p><a href="https://www.google.com/maps/search/?api=1&query=${address}" target="_blank">${result.city}, ${result.state}</a><br>`)
    }
    if(result.website_url){arr.push(`<a href="${result.website_url}" class="website" target="_blank">${result.website_url}</a><br>`)}
    if(result.phone){arr.push(`Phone: <a href="tel:${result.phone}">${formatPhoneNumber(result.phone)}</a><br></br>`)}
    arr.push(`Distance: ${result.distance} miles</p></li>`)
    return arr.join("");

}

function handleSearchForm(){
    $('#search-form').submit(event => {
        event.preventDefault();
        const address = $('#starting-location').val();
        if(address === "Starting location"){
            $('#starting-location-label').html('<span class="red">This is required information: </span>Please put in a valid address');
        }else{
            $('#starting-location-label').html('Starting location')
            handleBreweries();
        }
    })
}

function formatPhoneNumber(phoneNumber){
    return `(${phoneNumber.substring(0, 3)}) ${phoneNumber.substring(3,6)}-${phoneNumber.substring(6)}`
}



$(populateStates());
$(loadGoogleMapsLibrary());
$(handleStateForm());
$(handleSearchForm());















