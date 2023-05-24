const res = [
    { name: "Bob Stone", points: 30 },
    { name: "John Wickernoodle", points: 30 },
    { name: "John B", points: 5 },
    { name: "Logan Wickernoodle", points: 10 },
    { name: "Bobby pins", points: 5 },
    { name: "Chris P bacon", points: 30 },
]

async function fetchGame() {
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('gameId');

    console.log(myParam)

    let response = await fetch(`/game/leaderboard?gameId=${myParam}`);
    // let data = response["leaderboard"];
    console.log("hello!")
    // console.log(response);
    console.log(response.json());
    // return data.user.name;
}

function loadLeaderBoard(items) {
    items.sort((a, b) => b["points"] - a["points"]);

    const table = document.getElementById("results");   

    let order = 0;
    
    // Loop through
    for (let i = 0; i < items.length; i++) {
        if (i != 0 && items[i].points != items[i - 1]?.points) {
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
        points.innerHTML = items[i].points;
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

loadLeaderBoard(res);
fetchGame();
