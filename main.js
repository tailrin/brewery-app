// Global Variables
const breweries = [];
const key = "QXBDYUx5MVA0dmRFVWNGQWxWWTRLQ1U0Q1VCMV84Q1NUQlNld0JZbGJwS2xpSDVxNTdiNHpkV29fdFdYdFJkaA=="

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

 
 function initAutoComplete(){
    const autocomplete = new google.maps.places.Autocomplete(document.getElementById("starting-location"), {types: ['geocode']});
    autocomplete.setFields(['address_component']);
 }    
Array.prototype.clone = function() {
	return this.slice(0);
};

 function getStateCode(stateName){
    return states[states.findIndex(state => state.name == stateName)].code
  }

  
// Create list for state selection dropdown
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

// Convert snake case to title case
function makeTitleCase (myState) {
	myState = myState.toLowerCase().split('_');
	for (var i = 0; i < myState.length; i++) {
		myState[i] = myState[i].charAt(0).toUpperCase() + myState[i].slice(1);
	}
	return myState.join(' ');
};



function handleStateForm(){
    $('#state-form').submit(event =>{
        event.preventDefault();
        breweries.splice(0, breweries.length);
        const chosenState = $(`#state-list option:selected`).val();
        for (let i = 1; i < 20; i++){
            const breweryURL = `https://api.openbrewerydb.org/breweries?by_state=${chosenState}&page=${i}&per_page=50`;
            fetch(breweryURL).then(response => response.json()).then(responseJson => {
                responseJson.forEach(brewery => {
                    if (responseJson.length === 0){
                        i = 20;
                    }else{
                        breweries.push(brewery);
                    }
                });
            });
        }
        $('#state-form').addClass('hidden');
        $('#search-form').removeClass('hidden');
        initAutoComplete();
        let instructionState = makeTitleCase(chosenState);
        $('#starting-label').text(`Enter your starting address in ${instructionState}.`);
    });


    
}

async function getLatLong(){
    breweries.forEach(brewery => {
      const url = `https://dev.virtualearth.net/REST/v1/Locations?key=${window.atob(key)}&CountryRegion=US&adminDistrict=${getStateCode(brewery.state)}&locality=${encodeURI(brewery.city)}&postalCode=${brewery.postal_code}&addressLine=${encodeURI(brewery.street.trim())}`;
  
      if(!brewery.latitude){
        sleep(100)
        fetch(url).then(response => response.json()).then(responseJson => {
          brewery.latitude = responseJson.resourceSets[0].resources[0].point.coordinates[0]
         brewery.longitude = responseJson.resourceSets[0].resources[0].point.coordinates[1]
      }).catch(err => {
          console.log(err); 
          console.log(url);
        });
      }
    })
  }
  
  function loadGoogleMapsLibrary(){
      $.getScript(window.atob("aHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL2pzP2tleT1BSXphU3lCWlJWMEJmM2s5N1M0dnpsOXc1UDlJV1hqM0djeFNRNE0mbGlicmFyaWVzPXBsYWNlcw=="), function () {
        console.log("script loaded")
       });
   }
  
  async function geocodeAddress(address){
    let dfd = $.Deferred();
    const service = new google.maps.Geocoder;
    service.geocode(
      {
        address: address
        }, function(response, status){
        sleep(150);
        if (status == 'OK'){
          dfd.resolve(response);
        }
          dfd.reject(status);
    });
    return dfd.promise();
  }

  // Convert snake case to title case
function makeTitleCase (myState) {
	myState = myState.toLowerCase().split('_');
	for (var i = 0; i < myState.length; i++) {
		myState[i] = myState[i].charAt(0).toUpperCase() + myState[i].slice(1);
	}
	return myState.join(' ');
};
  
  async function handleBreweries(){
    const destinationsA =[]
    const originsA = [];
    const results= [];
    $('.cta-button').val('Loading, please wait...');
    $('.cta-button').disabled = true;
    const url = `https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?key=${window.atob(key)}`
    await getLatLong();
    console.log('longitude and latitude gotten')
    await geocodeAddress($('#starting-location').val()).then(response => {
          originsA.push({
            latitude: response[0].geometry.location.toString().split(",")[0].split("(")[1],
            longitude: response[0].geometry.location.toString().split(",")[1].split(")")[0]
            });
    }).catch(err => console.log(err));
    console.log("starting address geocoded")
    breweries.forEach(brewery => {
      const dest = {
        latitude: brewery.latitude,
        longitude: brewery.longitude
        };
      destinationsA.push(dest);
    });
    const data = {origins: originsA, destinations: destinationsA, travelMode: 'driving', distanceUnit: 'mi'}
    await postData(url, data).then(response => {
      const responseResults = response.resourceSets[0].resources[0].results
      responseResults.forEach(result => {
        breweries[result.destinationIndex].distance = result.travelDistance;
        
      });
      breweries.forEach(brewery => {
        if(Math.round(brewery.distance) <= $(`#distance-list option:selected`).val() && (brewery.distance) >= 0){
          results.push(brewery);
        }
      });
    });
    displayResults(results);
  }
  
  async function postData(url, data) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': 'insertLengthOfHTTPBody'
      },
      body: JSON.stringify(data) 
    });
    return await response.json(); 
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
    $('.cta-button').val('Click to start');
    $('.cta-button').disabled = false;
}

// Check if values exist for each result key and print only if they exist
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
        handleBreweries();
    })
    $('.go_back').click(function (){
        $('#search-form').addClass('hidden');
        $('#state-form').removeClass('hidden');
        $('#display-results').addClass('hidden');
    })
    $('#beer-icon').click(function (){
        $('#search-form').addClass('hidden');
        $('#state-form').removeClass('hidden');
        $('#display-results').addClass('hidden');
    })
}

function formatPhoneNumber(phoneNumber){
    return `(${phoneNumber.substring(0, 3)}) ${phoneNumber.substring(3,6)}-${phoneNumber.substring(6)}`
}


$(populateStates());
$(loadGoogleMapsLibrary());
$(handleStateForm());
$(handleSearchForm());















