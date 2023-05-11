function addElementToMain(element, append=true) {
    let mainElement = document.getElementsByTagName("main")[0];

    if (!append)
        removeElementChildren(mainElement);

    mainElement.appendChild(element);
}

function removeElementChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.lastChild);
      }
}

function createButtonNode(textContent, action) {

    var returnNode = document.createElement("button");
    returnNode.textContent = textContent;
    returnNode.addEventListener("click", action);
    
    return returnNode;
}


