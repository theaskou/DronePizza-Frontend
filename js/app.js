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
        <button id="simulateNewOrderButton" class="secondary">Simuler bestilling</button>
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
                <th></th>
            </tr>
        </thead>
        <tbody>
    `

    let tableBody = "";
    deliveries.forEach((delivery) => {
        const addDroneButtonHTML = `<button id="${delivery.deliveryID}" class="add-drone-button">Tilføj drone</button>`

        tableBody += `
            <tr>
                <td>${delivery.deliveryID}</td>
                <td>${delivery.expectedDeliveryTime.slice(0, 5)}</td>
                <td>${delivery.drone ? delivery.drone.droneID : addDroneButtonHTML}</td>
                <td>${delivery.deliveryAddress}</td>
                <td>${delivery.pizza.pizzaName}</td>
                <td>${delivery.pizza.pizzaPrice}</td>
                <td><button id="${delivery.deliveryID}" class="simulate-delivery-button secondary">Simuler levering</button></td>
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

    appElement.querySelector("#simulateNewOrderButton").addEventListener("click", () => simulateNewOrder());

    const addDroneButtons = appElement.querySelectorAll("tbody > tr > td > button.add-drone-button");
    for (let i = 0; i < addDroneButtons.length; i++) {
        addDroneButtons[i].addEventListener("click", () => addDroneHandler(addDroneButtons[i].id));
    }

    const simulateDeliveryButtons = appElement.querySelectorAll("tbody > tr > td > button.simulate-delivery-button");
    for (let i = 0; i < simulateDeliveryButtons.length; i++) {
        simulateDeliveryButtons[i].addEventListener("click", () => simulateDeliveryHandler(simulateDeliveryButtons[i].id))
    }
}

async function addDroneHandler(deliveryID) {
    fetch(`http://localhost:8080/deliveries/schedule/${deliveryID}`, {method: "POST"}).then(() => fetchDeliveries());
}

function simulateNewOrder() {
    const newOrder = {
        "deliveryAddress": "Delivery Address #2341",
        "pizza": {
            "pizzaID": 1,
            "pizzaName": "Margherita",
            "pizzaPrice": 65
        }
    }
    fetch(`http://localhost:8080/deliveries/add`, {
        method: "POST", headers: {
            'Content-Type': 'application/json',
        }, body: JSON.stringify(newOrder)
    }).then(() => fetchDeliveries());
}

function addNewDroneHandler() {
    fetch(`http://localhost:8080/drones/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Include the request payload if required
    }).then((response) => response.json()).then((data) => window.alert(`Drone oprettet ✅ (ID: ${data.droneID} · Status: ${data.operationalStatus} · UUID: ${data.serialUUID} · Station: ${data.station.stationID})`));
}

async function simulateDeliveryHandler(deliveryID) {
    fetch(`http://localhost:8080/deliveries/finish/${deliveryID}`, {method: "POST"}).then(() => fetchDeliveries());
}