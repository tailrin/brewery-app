

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





$(populateStates());
