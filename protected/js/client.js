const wsURL = window.location.host.includes("localhost") ? `ws://${window.location.host}/` : `wss://${window.location.host}/`;
const socket = new WebSocket(wsURL);

let timer;
let joinCode = "";

async function fetchName() {
    let response = await fetch("/auth/user");
    let data = await response.json();
    return data.user.name;
}

async function fetchPlayer() {
    let response = await fetch("/auth/user");
    let data = await response.json();
    return data;
}

// on socket connection
socket.onopen = () => {
    // check if url containers the parameter create or join
    let urlParams = new URLSearchParams(window.location.search);
    let create = urlParams.get('create');
    let join = urlParams.get('join');

    if(create != null && join == null){
        // TODO: Show game options first

        showGameOptions();

        //createGame();
    } else if(create == null && join != null){
        document.getElementById('join-code-header').textContent = "Enter the game pin to join";

        createJoinCodeForm(join);
    } else if(create == null && join == null){
        window.location = "/home";
    }
}

let playerID = "";
socket.onmessage = async (event) => {
    console.log(`Message received: ${event.data}`)
    let response = JSON.parse(event.data);

    if (response['joinCode'] != undefined && response['isHost'] == undefined) {
        joinCode = response['joinCode'];

        document.getElementById('join-code').innerHTML = "";

        let joinCodeEl = document.createElement('h3');
        joinCodeEl.textContent = joinCode;
        let qrCode = document.createElement('img');
        let link = "";
        if(window.location.host.includes("-qa")){
            link = `http://quizwizzyzilla-qa.azurewebsites.net/home/game?join=${joinCode}`;
        } else {
            link = `http://quiz.stuffs.co.za/home/game?join=${joinCode}`;
        }
        qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?data=${link}&size=200x200&bgcolor=ffffff&color=380036&margin=5`;
        document.getElementById('join-code').appendChild(joinCodeEl);
        document.getElementById('join-code').appendChild(qrCode);
        document.getElementById('join-code-header').textContent = "Use this code to join this game or scan the QR code";

        createPlayerList();

        let li = document.createElement('li');
        li.textContent = await fetchName();

        document.getElementById('player-list').appendChild(li);

        let startBtn = document.getElementById("start-btn");
        startBtn.onclick = startGame;
        startBtn.classList.remove("hidden");
    } else if (response['message'] == "New Player Joined Game"){
        //console.log(response);

        document.getElementById('player-list').innerHTML = "";
        
        let liHeader = document.createElement('li');
        liHeader.textContent = "Players";
        document.getElementById('player-list').appendChild(liHeader);

        for (let i = 0; i < response['players'].length; i++) {
            // create li and append to ul
            let li = document.createElement('li');
            li.textContent = response['players'][i]['name'];
            document.getElementById('player-list').appendChild(li);
        }
    } else if (response['requestType'] === "JOIN") {
        if (response['success']) {
            showWaitingScreen();
        } else {
            alert(response['message']);
        }
    }
    else if (response['text'] != undefined){
        document.getElementById("join-code-header").textContent = "";
        let question = response['text']['text'];
        let answers = response['options'];
        let questionNumber = response['questionNumber'];
        let roundNumber = response['roundNumber'];
        let questionTime = response['roundTime'];

        document.getElementById("question").classList.remove("hidden");
        document.getElementById("answers").classList.remove("hidden");
        document.getElementById("join-code-header").classList.add("hidden");
        document.getElementById("join-code").classList.add("hidden");
        document.getElementById("actions").classList.add("hidden");
        document.getElementById("player-list").classList.add("hidden");
        document.getElementById("start-btn").classList.add("hidden");
        document.getElementById("logo-img").classList.add("hidden");
        document.getElementById("loader").classList.add("hidden");


        document.getElementById("questionRound").textContent = `Question ${questionNumber} - Round ${roundNumber}`;

        let questionElem = document.getElementById("question-text");
        questionElem.textContent = question;

        for(let i = 0; i < 4; i++){
            let answer = answers[i];
            let answerElem = document.getElementById("answer-" + (i+1));
            answerElem.textContent = answer;
            answerElem.classList.remove("disabled");
            answerElem.classList.remove("selected");
        }

        startTimer(questionTime);
    } else if (response['message'] == "ROUND OVER"){
        let isHost = response['isHost'];
        
        if(isHost){
            document.getElementById("question").classList.add("hidden");
            document.getElementById("answers").classList.add("hidden");
            document.getElementById("join-code-header").classList.remove("hidden");
            document.getElementById("actions").classList.remove("hidden");
            document.getElementById("questionRound").textContent = "";

            document.getElementById("join-code-header").textContent = "Waiting for next round to start...";
            document.getElementById("actions").innerHTML = "";


            document.getElementById("logo-img").classList.remove("hidden");

            // create start round button and append to #actions
            let startRound = document.createElement('button');
            startRound.textContent = "Start Round";
            startRound.classList.add("btn");
            document.getElementById('actions').appendChild(startRound);
            startRound.onclick = () => {
                nextRound(response["joinCode"]);
            };
        } else {
            document.getElementById("question").classList.add("hidden");
            document.getElementById("answers").classList.add("hidden");
            document.getElementById("join-code-header").classList.remove("hidden");
            document.getElementById("actions").classList.remove("hidden");
            document.getElementById("questionRound").textContent = "";
            document.getElementById("loader").classList.remove("hidden");
    
            document.getElementById("join-code-header").textContent = "Waiting for next round to start...";
        }
    } else if (response['message'] == "GAME OVER"){
        console.log(response);
        let playerDetails = response['playerDetails'];

        localStorage.setItem("playerDetails", playerDetails);

        window.location = "/home/leaderboard.html?gameId=" + response['gameId'];
    }
};

async function createGame() {
    let numQuestions = Number(document.getElementById("number-of-questions").value);
    let numRounds = Number(document.getElementById("number-of-rounds").value);
    let time = Number(document.getElementById("time-per-questions").value);
    let difficultyEasy = document.getElementById("question-difficulty-easy").checked;
    let difficultyMedium = document.getElementById("question-difficulty-medium").checked;
    let difficultyHard = document.getElementById("question-difficulty-hard").checked;

    let difficultyString = difficultyEasy ? "easy," : "";
    difficultyString += difficultyMedium ? "medium," : "";
    difficultyString += difficultyHard ? "hard," : "";

    if(difficultyString == ""){
        difficultyString = "easy,medium,hard";
    } else {
        difficultyString = difficultyString.slice(0, -1);
    }

    let user = await fetchPlayer();
    socket.send(JSON.stringify({
        questionsPerRound: numQuestions,
        numberOfRounds: numRounds,
        roundLength: time*1000,
        difficulties: difficultyString,
        player: user['user'],
        requestType: "CREATE"
    }));

    document.getElementById("game-options").classList.add("hidden");
}

function nextRound(joinCode) {
    console.log('Sending next round')
    socket.send(JSON.stringify({
        requestType: "NEXT ROUND",
        joinCode: joinCode,
    }));
}

function showWaitingScreen() {
    document.getElementById('join-code-header').textContent = "Waiting for game to start...";
    document.getElementById('join-code').innerHTML = "";
    document.getElementById('actions').innerHTML = "";
    document.getElementById("loader").classList.remove("hidden");
    document.getElementById("logo-img").classList.remove("hidden");
}

/**
 * Simple POC of broadcasting messages to stored live games
 * Can be used to send new questions etc.
 */
function startGame() {
    console.log(`joinCode: ${joinCode}`)
    socket.send(
        JSON.stringify({
            requestType: "START",
            joinCode: joinCode
        })
    );
}

async function joinGame() {
    joinCode = getjoinCodeFromInputs();
    let user = await fetchPlayer();
    socket.send(JSON.stringify({
        joinCode: joinCode,
        player: user['user'],
        requestType: "JOIN"
    }));
}

async function sendAnswer(answer) {
    let user = await fetchPlayer();
    socket.send(JSON.stringify({
        answer: answer,
        requestType: "ANSWER",
        joinCode: joinCode,
        player: user['user']
    }));
}

function createJoinCodeForm(givenCode){
    let form = document.createElement('form');
    form.method = "get";
    form.id = "digit-group";
    form.setAttribute('data-group-name', 'digits');
    form.setAttribute('data-autosubmit', 'true');
    form.setAttribute('autocomplete', 'off');

    for(let i = 1; i <= 5; i++){
        let input = document.createElement('input');
        input.type = "text";
        input.id = `digit-${i}`;
        input.name = `digit-${i}`;
        input.className = "singleInput";
        input.maxLength = 1;

        if(i < 5){
            input.setAttribute('data-next', `digit-${i+1}`);
        }

        if(i > 1){
            input.setAttribute('data-previous', `digit-${i-1}`);
        }

        if(givenCode != null && givenCode.length == 5){
            input.value = givenCode.charAt(i-1);
        }

        form.appendChild(input);
    }

    document.getElementById('join-code').appendChild(form);

    document.getElementById('join-code').classList.add("join");

    // add join button below the form
    let joinButton = document.createElement('button');
    joinButton.type = "submit";
    joinButton.id = "join-btn";
    joinButton.textContent = "Join";
    joinButton.classList.add('btn');

    if(givenCode != null && givenCode.length == 5){
        joinButton.classList.remove('disabled');
        joinButton.disabled = false;
    } else {
        joinButton.classList.add('disabled');
        joinButton.disabled = true;
    }

    

    document.getElementById('actions').appendChild(joinButton);

    // add event listener to each input inside the form
    let digitGroup = document.getElementById('digit-group');

    let inputs = digitGroup.getElementsByTagName('input');

    Array.from(inputs).forEach(input => {
        input.addEventListener('keyup', (event) => {
            // get data-next and data-previous attributes
            let next = event.target.getAttribute('data-next');
            let previous = event.target.getAttribute('data-previous');

            if(event.keyCode === 8 || event.keyCode === 37){
                if(previous != null){
                    let previousInput = document.getElementById(previous);
                    previousInput.focus();
                }
            } else if((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode === 39){
                if(next != null){
                    let nextInput = document.getElementById(next);
                    if(input.value != ""){
                        nextInput.focus();
                    }
                    
                }
            }

            let isValid = Array.from(inputs).every(input => { return input.value != ""; });

            if(isValid){
                document.getElementById('digit-group').classList.add('valid');
                document.getElementById("join-btn").disabled = false;
                document.getElementById("join-btn").classList.remove('disabled');
            } else {
                document.getElementById('digit-group').classList.remove('valid');
                document.getElementById("join-btn").disabled = true;
                document.getElementById("join-btn").classList.add('disabled');
            }
        });
    });

    joinButton.addEventListener('click', joinGame);
}

function getjoinCodeFromInputs(){
    let digitGroup = document.getElementById('digit-group');

    let inputs = digitGroup.getElementsByTagName('input');

    let tmpjoinCode = "";

    Array.from(inputs).forEach(input => {
        tmpjoinCode += input.value;
    });

    return tmpjoinCode.toUpperCase();
}

function createPlayerList(){
    let playerList = document.getElementById("player-list");

    playerList.classList.remove("hidden");

    let liHeader = document.createElement('li');
    liHeader.textContent = "Players";
    playerList.appendChild(liHeader);

    document.body.appendChild(playerList);
}

function startTimer(time){
    try {
        clearInterval(timer);
    } catch (error) {
        console.log("No timer");
    }

    document.getElementById("timer").classList.remove("hidden");

    let deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + time/1000);

    timer = setInterval(() => {
        let now = new Date();
        let t = deadline.getTime() - now.getTime();

        let seconds = Math.floor((t % (1000 * 60)) / 1000);

        document.getElementById("time-remaining").textContent = seconds;
        document.getElementsByClassName("timer-remaining")[0].style.width = (seconds*1000 / time)*100 + "%";

        if(t < 0){
            clearInterval(timer);
            document.getElementById("time-remaining").textContent = "Time's up!";
            document.getElementsByClassName("timer-remaining")[0].style.width = "100%";
            document.getElementById("timer").classList.add("hidden");
        }
    }, 100);
}

function showGameOptions(){
    let place = document.getElementById("game-options");
    place.classList.remove("hidden");
}

document.getElementById("create-game").addEventListener("click", createGame);

for(let i = 0; i < 4; i++){
    let btn = document.getElementById(`answer-${i+1}`);
    btn.addEventListener("click", (event) => {
        let allBtns = document.getElementsByClassName("answer-btn");
        Array.from(allBtns).forEach(btn2 => {
            if(btn != btn2){
                btn2.classList.add("disabled");
                btn2.classList.remove("selected");
            } else {
                btn2.classList.remove("disabled");
                btn2.classList.add("selected");
            }
        });

        console.log(event.currentTarget.textContent);
        sendAnswer(event.currentTarget.textContent);
    });
}



function test(event){
    let next = event.target.getAttribute('data-next');
            let previous = event.target.getAttribute('data-previous');

            if(event.keyCode === 8 || event.keyCode === 37){
                if(previous != null){
                    let previousInput = document.getElementById(previous);
                    previousInput.focus();
                }
            } else if((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode === 39){
                if(next != null){
                    let nextInput = document.getElementById(next);
                    if(input.value != ""){
                        nextInput.focus();
                    }
                    
                }
            }

            let isValid = Array.from(inputs).every(input => { return input.value != ""; });

            if(isValid){
                document.getElementById('digit-group').classList.add('valid');
                document.getElementById("join-btn").disabled = false;
                document.getElementById("join-btn").classList.remove('disabled');
            } else {
                document.getElementById('digit-group').classList.remove('valid');
                document.getElementById("join-btn").disabled = true;
                document.getElementById("join-btn").classList.add('disabled');
            }
}