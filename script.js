const contractData = [];
let sortColumn = null;
let sortDirection = 'asc';

const addContractBtn = document.getElementById("addContractBtn");
const clearDeliveredBtn = document.getElementById("clearDeliveredBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const contractTable = document.getElementById("contractTable");
const tableBody = contractTable.getElementsByTagName("tbody")[0];
const addContractForm = document.getElementById("addContractForm");
const saveContractBtn = document.getElementById("saveContractBtn");
const cancelBtn = document.getElementById("cancelBtn");
const pickupSelect = document.getElementById("pickup");
const destinationSelect = document.getElementById("destination");
const amountInput = document.getElementById("amount");
const notesInput = document.getElementById("notes");
const totalCargoDiv = document.getElementById("totalCargo");
const shipDropdown = document.getElementById("shipDropdown");

const editContractForm = document.getElementById("editContractForm");
const updateContractBtn = document.getElementById("updateContractBtn");
const editCancelBtn = document.getElementById("editCancelBtn");
const editContractIndexInput = document.getElementById("editContractIndex");
const editPickupSelect = document.getElementById("editPickup");
const editDestinationSelect = document.getElementById("editDestination");
const editAmountInput = document.getElementById("editAmount");
const editNotesInput = document.getElementById("editNotes");

// Ship data 
const shipData = {
    "M2 Hercules Starlifter": 522,
    "Constellation Taurus": 168,
    "Starlancer MAX": 224,
    "Freelancer MAX": 120,
    "Zeus Mk II CL": 128,
    "Freelancer": 66,
    "C1 Spirit": 64,
    "Hull E": 98304,
    "Hull D": 20736,
    "Javelin": 5400,
    "Hull C": 4608,
    "Kraken": 3792,
    "Merchantman": 2880,
    "Ironclad": 1536,
    "Ironclad Assault": 1152,
    "C2 Hercules Starlifter": 696,
    "Caterpillar": 576,
    "Polaris": 576,
    "Endeavor": 500,
    "Carrack": 456,
    "Liberator": 400,
    "890 Jump": 388,
    "Hull B": 384,
    "Orion": 384,
    "Railen": 320,
    "Genesis Starliner": 300,
    "Starfarer": 291,
    "Starfarer Gemini": 291,
    "Odyssey": 252,
    "Crucible": 230,
    "A2 Hercules Starlifter": 216,
    "Reclaimer": 180,
    "Starlancer BLD": 128,
    "Mercury Star Runner": 114,
    "Starlancer TAC": 96,
    "RAFT": 96,
    "Constellation Aquila": 96,
    "MOLE": 96,
    "Constellation Andromeda": 96,
    "Constellation Phoenix": 80,
    "Corsair": 72,
    "Hull A": 64,
    "Galaxy": 64,
    "Expanse": 64,
    "Nautilus": 64,
    "Perseus": 50,
    "Cutlass Black": 46,
    "600i Explorer": 44,
    "400i": 42,
    "Hammerhead": 40,
    "Freelancer DUR": 36,
    "Prospector": 32,
    "Zeus Mk II ES": 32,
    "Valkyrie Liberator": 30,
    "Valkyrie": 30,
    "Apollo Medivac": 28,
    "Apollo Triage": 28,
    "Nomad": 24,
    "600i Touring": 20
};

// Populate ship dropdown
for (const shipName in shipData) {
    const option = document.createElement("option");
    option.value = shipName;
    option.text = `${shipName} (${shipData[shipName]} SCU)`;
    shipDropdown.appendChild(option);
}

// Load data from local storage on page load
const storedContractData = localStorage.getItem("contractData");
if (storedContractData) {
    contractData.push(...JSON.parse(storedContractData));
    updateTable();
}

addContractBtn.addEventListener("click", () => {
    addContractForm.classList.remove("hidden");
});

cancelBtn.addEventListener("click", () => {
    addContractForm.classList.add("hidden");
});

// Function to show the notification
function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.classList.add("show");
    notification.classList.remove("hidden");

    // Start fade out after 2 seconds
    setTimeout(() => {
        notification.classList.add("fade-out");
    }, 2000);

    // Hide completely after fade out
    setTimeout(() => {
        notification.classList.add("hidden");
        notification.classList.remove("show");
        notification.classList.remove("fade-out");
    }, 2500); // 2.5 seconds to account for 0.5s fade out
}

function updateTotalCargo() {
    let totalCargo = 0;
    for (const contract of contractData) {
        if (!isNaN(parseInt(contract.amount))) {
            totalCargo += parseInt(contract.amount);
        }
    }

    // Get selected ship's capacity
    const selectedShip = shipDropdown.value;
    const shipCapacity = shipData[selectedShip];

    // Calculate percentage of cargo used
    const percentageUsed = Math.round((totalCargo / shipCapacity) * 100); // Calculate and round to whole number

    // Update total cargo text and color
    totalCargoDiv.textContent = `Total Cargo: ${totalCargo} of ${shipCapacity} SCU (${percentageUsed}%)`;

    totalCargoDiv.classList.remove("total-cargo-green", "total-cargo-yellow", "total-cargo-red");
    if (totalCargo <= shipCapacity / 2) {
        totalCargoDiv.classList.add("total-cargo-green");
    } else if (totalCargo > shipCapacity / 2 && totalCargo <= shipCapacity) {
        totalCargoDiv.classList.add("total-cargo-yellow");
    } else {
        totalCargoDiv.classList.add("total-cargo-red");
    }
}

function updateTable() {
    // Clear existing table data
    tableBody.innerHTML = "";

    // Sort data if sortColumn is set
    if (sortColumn) {
        contractData.sort((a, b) => {
            const aValue = a[sortColumn].toLowerCase();
            const bValue = b[sortColumn].toLowerCase();
            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    // Add updated data to the table
    for (let i = 0; i < contractData.length; i++) {
        const contract = contractData[i];
        const row = tableBody.insertRow();
        const pickupCell = row.insertCell();
        const destinationCell = row.insertCell();
        const amountCell = row.insertCell();
        const notesCell = row.insertCell();
        const pickedUpCell = row.insertCell();
        const deliveredCell = row.insertCell();
        const actionsCell = row.insertCell();

        row.addEventListener("mouseover", () => {
            row.classList.add("highlighted-row");
        });

        row.addEventListener("mouseout", () => {
            row.classList.remove("highlighted-row");
        });

        pickupCell.textContent = contract.pickup;
        destinationCell.textContent = contract.destination;
        amountCell.textContent = contract.amount;
        notesCell.textContent = contract.notes;

        // Add checkboxes for "Picked up" and "Delivered"
        const pickedUpCheckbox = document.createElement("input");
        pickedUpCheckbox.type = "checkbox";
        pickedUpCheckbox.checked = contract.pickedUp;
        pickedUpCheckbox.addEventListener("change", () => {
            contract.pickedUp = pickedUpCheckbox.checked;
            updateTable();
        });
        pickedUpCell.appendChild(pickedUpCheckbox);

        const deliveredCheckbox = document.createElement("input");
        deliveredCheckbox.type = "checkbox";
        deliveredCheckbox.checked = contract.delivered;
        deliveredCheckbox.addEventListener("change", () => {
            contract.delivered = deliveredCheckbox.checked;
            updateTable();
        });
        deliveredCell.appendChild(deliveredCheckbox);

        // Add Edit and Delete buttons
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            openEditContractForm(i);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            contractData.splice(i, 1);
            updateTable();
        });

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
    }

    updateTotalCargo();
}

function openEditContractForm(contractIndex) {
    const contract = contractData[contractIndex];
    editContractIndexInput.value = contractIndex;
    editPickupSelect.value = contract.pickup;
    editDestinationSelect.value = contract.destination;
    editAmountInput.value = contract.amount;
    editNotesInput.value = contract.notes;

    editContractForm.classList.remove("hidden");
}

updateContractBtn.addEventListener("click", () => {
    const contractIndex = parseInt(editContractIndexInput.value);
    const updatedContract = {
        pickup: editPickupSelect.value,
        destination: editDestinationSelect.value,
        amount: editAmountInput.value,
        notes: editNotesInput.value,
        pickedUp: contractData[contractIndex].pickedUp, // Preserve existing value
        delivered: contractData[contractIndex].delivered // Preserve existing value
    };

    contractData[contractIndex] = updatedContract;
    updateTable();
    editContractForm.classList.add("hidden");
    saveDataToLocalStorage();

    // Show success notification
    showNotification("Contract updated successfully!");
});

editCancelBtn.addEventListener("click", () => {
    editContractForm.classList.add("hidden");
});

saveContractBtn.addEventListener("click", () => {
    const newContract = {
        pickup: pickupSelect.value,
        destination: destinationSelect.value,
        amount: amountInput.value,
        notes: notesInput.value,
        pickedUp: false,
        delivered: false
    };

    contractData.push(newContract);
    updateTable();
    addContractForm.classList.add("hidden");

    // Clear form fields
    pickupSelect.value = "";
    destinationSelect.value = "";
    amountInput.value = "";
    notesInput.value = "";
    saveDataToLocalStorage();

    // Show success notification
    showNotification("Contract added successfully!");
});

clearDeliveredBtn.addEventListener("click", () => {
    for (let i = contractData.length - 1; i >= 0; i--) {
        if (contractData[i].delivered) {
            contractData.splice(i, 1);
        }
    }
    updateTable();
    saveDataToLocalStorage();

    // Show success notification
    showNotification("Delivered contracts cleared!");
});

clearAllBtn.addEventListener("click", () => {
    contractData.length = 0; // Clear all elements from the array
    updateTable();
    saveDataToLocalStorage();

    // Show success notification
    showNotification("All contracts cleared!");
});

// Add event listeners to table headers for sorting
const tableHeaders = contractTable.querySelectorAll("thead th");
tableHeaders.forEach(header => {
    header.addEventListener("click", () => {
        const sortKey = header.dataset.sortKey;
        if (sortKey) {
            if (sortColumn === sortKey) {
                // Toggle sort direction if clicking on the same column
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                // Set new sort column and default sort direction
                sortColumn = sortKey;
                sortDirection = 'asc';
            }

            // Update header classes for visual indicators
            tableHeaders.forEach(h => {
                h.classList.remove("sorted-asc");
                h.classList.remove("sorted-desc");
            });
            header.classList.add(sortDirection === 'asc' ? "sorted-asc" : "sorted-desc");

            updateTable();
        }
    });
});

// Add an event listener to the shipDropdown to update total cargo color when the selected ship changes
shipDropdown.addEventListener("change", updateTotalCargo);

// Add a function to save data to local storage
function saveDataToLocalStorage() {
    localStorage.setItem("contractData", JSON.stringify(contractData));
}