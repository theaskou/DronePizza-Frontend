const appElement = document.getElementById("app");

fetchDeliveries();

setInterval(fetchDeliveries, 60000);

function fetchAsJSON(url) {
    return fetch(url).then(response => response.json())
}

async function fetchDeliveries() {
    const deliveries = await fetchAsJSON("http://localhost:8080/deliveries");
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const headerBarHTML = `<div class="container-fluid">
        <div>Sidst opdateret: ${hours}:${minutes}:${seconds}</div>
        <button id="addDroneButton">Opret drone</button>
    </div>`

    const tableHead = `
    <table>
        <thead>
            <tr>
                <th>Ordre nr.</th>
                <th>Forventet leveringstid</th>
                <th>Drone nr.</th>
                <th>Adresse</th>
                <th>Pizza</th>
                <th>Pris</th>
            </tr>
        </thead>
        <tbody>
    `

    let tableBody = "";
    deliveries.forEach((delivery) => {
        const addDroneButtonHTML = `<button id="${delivery.deliveryID}">Tilføj drone</button>`

        tableBody += `
            <tr>
                <td>${delivery.deliveryID}</td>
                <td>${delivery.expectedDeliveryTime}</td>
                <td>${delivery.drone ? delivery.drone.droneID : addDroneButtonHTML}</td>
                <td>${delivery.deliveryAddress}</td>
                <td>${delivery.pizza.pizzaName}</td>
                <td>${delivery.pizza.pizzaPrice}</td>
            </tr>
        `
    })

    const tableFooter = `
    </tbody>
    </table>
    `

    const tableHTML = tableHead + tableBody + tableFooter;

    appElement.innerHTML = headerBarHTML + tableHTML;

    appElement.querySelector("#addDroneButton").addEventListener("click", () => addNewDroneHandler());

    // Add eventListeners to buttons calling addDroneHandler with id
    const buttons = appElement.querySelectorAll("tbody > tr > td > button");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", () => addDroneHandler(buttons[i].id));
    }
}

async function addDroneHandler(deliveryID){
    fetch(`http://localhost:8080/deliveries/schedule/${deliveryID}`, {method: "POST"}).then(() => fetchDeliveries());
}

function addNewDroneHandler(){
    fetch(`http://localhost:8080/drones/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Include the request payload if required
    }).then((response) => response.json()).then((data)=> window.alert(`Drone oprettet ✅ (ID: ${data.droneID} · Status: ${data.operationalStatus} · UUID: ${data.serialUUID} · Station: ${data.station.stationID})`));
}