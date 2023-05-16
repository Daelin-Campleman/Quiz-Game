async function fetchName() {
    let response = await fetch("/auth/user");
    let data = await response.json();
    return data.user.name;
}

if (window.location.host.includes("-qa")) {
    console.log("This is QA environment");
}

document.getElementById("name-heading").innerHTML = "Welcome " + await fetchName()

document.getElementById("start-btn").addEventListener("click", function () {
    document.getElementById("error-message").textContent = "Doing fake AD stuff...";
    document.getElementById("start-btn").disabled = true;
    // 2 second delay
    setTimeout(function () {
        window.location = "/home";
    }, 2000);
});