let btnDone = createButtonNode("Done", () => {
    console.log("joining ...");
});

let btnCreateGame = createButtonNode("Create", () => {
    addElementToMain(btnDone, false);
});

let btnJoinGame = createButtonNode("Join", () => {
    addElementToMain(btnDone, false);
});

let btnStart = createButtonNode("Start", () => {
    addElementToMain(btnCreateGame, false);
    addElementToMain(btnJoinGame);
});

addElementToMain(btnStart);