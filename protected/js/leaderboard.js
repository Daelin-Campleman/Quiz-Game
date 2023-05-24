function loadLeaderBoard(items) {
    const table = document.getElementById("results");   
    let order = 0;
    
    // Loop through
    for (let i = 0; i < items.length; i++) {
        if (i != 0 && items[i].score != items[i - 1]?.score) {
            loadPodium(items[i].name, order+1, i + 1);
            order = i;
        }
        else {
            loadPodium(items[i].name, order, i + 1);
        }       
        
        let row = table.insertRow();
        let number = row.insertCell(0);
        let name = row.insertCell(1);
        let points = row.insertCell(2);
        
        name.className = "name";
        points.className = "points";
        number.className = "number";
        
        name.innerHTML = items[i].name;
        points.innerHTML = items[i].score;
        number.innerHTML = order+1;
    }
}

function loadPodium(name, result, position) {
    if (position > 3) {
        return;
    }

    const podium = document.getElementById(`podium${position}`);
    
    switch (result) {
        case 0:
            podium.className += "loaded-gold";
            break; 

        case 1:
            podium.className += "loaded-silver";
            break;
        
        case 2:
            podium.className += "loaded-bronze";
            break;
    }

    podium.innerHTML += name;
}

async function fetchGame() {
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('gameId');

    let response = await fetch(`/game/leaderboard?gameId=${myParam}`);
    let data = await response.json();

    loadLeaderBoard(JSON.parse(data.leaderboard))
}

fetchGame();
