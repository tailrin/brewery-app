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
            const url = `https://api.openbrewerydb.org/breweries?by_state=${chosenState}&page=${i}&per_page=50`;
            fetch(url).then(response => response.json()).then(responseJson => {
                responseJson.forEach(brewery => {
                    if (responseJson.length === 0){
                        i = 20;
                    } else{
                        breweries.push(brewery);
                    }
            });
        });
        console.log(breweries);
        }

    });
    
}





$(populateStates());
$(handleStateForm());
