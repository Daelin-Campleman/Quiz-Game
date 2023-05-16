async function fetchName() {
    let response = await fetch("/auth/user");
    let data = await response.json();
    return data.user.name;
}

if (window.location.host.includes("-qa")) {
    console.log("This is QA environment");
}

document.getElementById("name-heading").innerHTML = "Welcome " + await fetchName()

document.getElementById("start-btn").addEventListener("click", function (event) {
    let provider = event.currentTarget.dataset.provider;

    window.location = `/auth/login/federated/${provider}`;

});