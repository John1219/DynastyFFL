// Shared JS for all pages

function loadMenuBar() {
    fetch('menu.html')
        .then(r => r.text())
        .then(html => document.getElementById('menu-bar').outerHTML = html);
}

// --- Index Page Logic ---
if (document.getElementById('table-container')) {
    const csvPath = '../data/81689-rosters-nfl-1.csv';
    let allData = [];
    const headers = ["Team", "Player", "Position", "NFL Team", "Status"];

    function renderTable(data) {
        let html = '<table><thead><tr>';
        headers.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';
        data.forEach(row => {
            html += '<tr>';
            row.forEach(cell => html += `<td>${cell}</td>`);
            html += '</tr>';
        });
        html += '</tbody></table>';
        document.getElementById('table-container').innerHTML = html;
    }

    function populateDropdowns(data) {
        const selects = [
            { id: 'filter-team', col: 0 },
            { id: 'filter-player', col: 1 },
            { id: 'filter-position', col: 2 },
            { id: 'filter-nflteam', col: 3 },
            { id: 'filter-status', col: 4 }
        ];
        selects.forEach(sel => {
            const select = document.getElementById(sel.id);
            const options = Array.from(new Set(data.map(row => row[sel.col]).filter(Boolean))).sort();
            while (select.options.length > 1) select.remove(1);
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                select.appendChild(option);
            });
        });
    }

    function filterData() {
        const team = document.getElementById('filter-team').value;
        const player = document.getElementById('filter-player').value;
        const position = document.getElementById('filter-position').value;
        const nflteam = document.getElementById('filter-nflteam').value;
        const status = document.getElementById('filter-status').value;

        const filtered = allData.filter(row => {
            return (!team || row[0] === team) &&
                   (!player || row[1] === player) &&
                   (!position || row[2] === position) &&
                   (!nflteam || row[3] === nflteam) &&
                   (!status || row[4] === status);
        });
        renderTable(filtered);
    }

    fetch(csvPath)
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: false,
                skipEmptyLines: true,
                complete: function(results) {
                    allData = results.data;
                    populateDropdowns(allData);
                    renderTable(allData);
                }
            });
        })
        .catch(err => {
            document.getElementById('table-container').innerText = 'Failed to load CSV file.';
        });

    document.querySelectorAll('.filters select').forEach(select => {
        select.addEventListener('change', filterData);
    });
    document.getElementById('clear-filters').addEventListener('click', () => {
        document.querySelectorAll('.filters select').forEach(select => select.value = '');
        renderTable(allData);
    });

    // --- Schedule Table Logic ---
    const schedulePath = '../data/2025-schedule-81689.csv';
    function renderScheduleTable(data) {
        if (!data || data.length === 0) {
            document.getElementById('schedule-table').innerText = 'No schedule data available.';
            return;
        }
        let html = '<table><thead><tr>';
        data[0].forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';
        data.slice(1).forEach(row => {
            html += '<tr>';
            row.forEach(cell => html += `<td>${cell}</td>`);
            html += '</tr>';
        });
        html += '</tbody></table>';
        document.getElementById('schedule-table').innerHTML = html;
    }

    fetch(schedulePath)
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: false,
                skipEmptyLines: true,
                complete: function(results) {
                    renderScheduleTable(results.data);
                }
            });
        })
        .catch(err => {
            document.getElementById('schedule-table').innerText = 'Failed to load schedule.';
        });
}