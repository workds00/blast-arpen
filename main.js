// Load the data from arpen.json and store it in a global variable
let DB = [];

// local storage variable to store the last sent phone number
let alreadySentPhone = JSON.parse(localStorage.getItem('phone')) || [];

async function fetchData() {
    try {
        const response = await fetch('https://workds00.github.io/blast-arpen/arpen.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        res = await response.json();
        DB = res.data.map((item, index) => {
            return {
                id: index,
                name: item.Nama,
                contract: item.noKontrak,
                unit: item.unit,
                phone1: item.TLP1,
                phone2: item.TLP2
            };
        });
        // Remove Loading Section Successfully Load Data
        const loadingSection = document.getElementById('loading-section');
        loadingSection.classList.add('d-none');
        // Show the main Section
        const mainSection = document.getElementById('main-section');
        mainSection.classList.remove('d-none');
        // Populate the table with data
        const tableBody = document.getElementById('table-body');
        DB.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    ${item.name}
                </td>
                <td>
                    <button class="btn-send btn btn-primary ${alreadySentPhone.includes(item.phone1) ? 'disabled' : ''}" blast="primary${item.id}">Send</button>
                </td>
                <td>
                    ${item.phone2 ? `<button class="btn-send btn btn-primary ${alreadySentPhone.includes(item.phone2) ? 'disabled' : ''}" blast="secondary${item.id}">Send</button>` : '-'}
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        // Handle errors here
        const loadingSection = document.getElementById('loading-section');
        const errorSection = document.getElementById('error-section');
        errorSection.classList.remove('d-none');
        loadingSection.classList.add('d-none');
        console.error('There has been a problem with your fetch operation:', error);
    }
}

fetchData();

// Handle Text Area Input
let message = "";
const textArea = document.getElementById('text-area');
textArea.addEventListener('input', (event) => {
    message = event.target.value;
    if (event.target.value === "Reset LS") {
        localStorage.removeItem('phone');
        alreadySentPhone = [];
        console.log('Local storage cleared');
    }
});

// Function to title case a string
function titleCase(str) {
    return str
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// generate message
function generateMessage(name, contract, unit) {
    return message
        .replaceAll('#name', titleCase(name))
        .replaceAll('#contract', contract)
        .replaceAll('#unit', titleCase(unit));
}


// Handle Button Clicks
window.addEventListener('click', (event) => {
    if (event.target.hasAttribute('blast')) {
        const blastType = event.target.getAttribute('blast');
        const id = blastType.replace(/primary|secondary/, '');
        const item = DB[id];
        if (item) {
            const phone = blastType.startsWith('primary') ? item.phone1 : item.phone2;
            if (phone) {
                // Here you would send the message to the phone number
                window.open(`https://wa.me/62${phone}?text=${encodeURIComponent(generateMessage(item.name, item.contract, item.unit))}`, '_blank');
                // For demonstration, we will log the message to the console
                console.log(`Sending message to ${phone}: ${generateMessage(item.name, item.contract, item.unit)}`);
                // set number already sent
                alreadySentPhone.push(phone);
                localStorage.setItem('phone', JSON.stringify(alreadySentPhone));
                // Disable the button after sending
                event.target.classList.add('disabled');
            } else {
                console.log('No phone number available for this contact.');
            }
        } else {
            console.log('Contact not found.');
        }
    }
})
