window.onload = function() {
    document.getElementById("first").className += "loaded-first";
    document.getElementById("second").className += "loaded-second";
    document.getElementById("third").className += "loaded-third";
}

const res = [
    { name: "Bob Stone", points: 15 },
    { name: "John Wickernoodle", points: 20 },
    { name: "John B", points: 5 },
    { name: "Logan Wickernoodle", points: 10 },
    { name: "Bobby pins", points: 5 },
    { name: "Chris P bacon", points: 30 },
]

function loadLeaderBoard(items) {
    items.sort((a, b) => b["points"] - a["points"]);

    const table = document.getElementById("results");
    const first = document.getElementById("first");
    const second = document.getElementById("second");
    const third = document.getElementById("third");
    
    first.innerHTML += items[0].name;
    second.innerHTML += items[1].name;
    third.innerHTML += items[2].name;    

    for (let i = 0; i < items.length; i++) {
        let row = table.insertRow();
        let number = row.insertCell(0);
        let name = row.insertCell(1);
        let points = row.insertCell(2);

        name.className = "name";
        points.className = "points";
        number.className = "number";

        name.innerHTML = items[i].name;
        points.innerHTML = items[i].points;
        number.innerHTML = i+1;
    }
}
loadLeaderBoard(res);