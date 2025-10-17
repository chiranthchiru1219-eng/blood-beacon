const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const NAMES = ["Aarav","Diya","Arjun","Lavanya","Siri","Chiranth","Vikram","Priya","Sneha","Ananya","Karthik","Neha","Sanjay","Isha","Krish","Manoj","Pooja","Aditi","Vishal","Rahul"];
let map, userMarker, userLat, userLon, donors = [], autoRefreshInterval, routeLine = null;
const msgEl = document.getElementById('msg'), resultsEl = document.getElementById('results');

function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = '⏱️ ' + now.toLocaleTimeString();
}
setInterval(updateClock, 60000); updateClock();

function generateDonors(lat, lon) {
  donors = [];
  BLOOD_GROUPS.forEach(g => {
    for (let i = 0; i < 4; i++) {
      const offLat = (Math.random() - 0.5) * 0.001;
      const offLon = (Math.random() - 0.5) * 0.001;
      donors.push({
        name: `${NAMES[Math.floor(Math.random() * NAMES.length)]} (${g})`,
        blood: g,
        lat: lat + offLat,
        lon: lon + offLon,
        contact: "9" + Math.floor(100000000 + Math.random() * 900000000)
      });
    }
  });
}

function calcDistKm(a, b, c, d) {
  const R = 6371, dLat = (c - a) * Math.PI / 180, dLon = (d - b) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function initMap(lat, lon) {
  userLat = lat; userLon = lon;
  generateDonors(lat, lon);
  if (map) map.remove();
  map = L.map('map').setView([lat, lon], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
  userMarker = L.circleMarker([lat, lon], { radius: 8, color: 'blue', fillColor: 'blue', fillOpacity: 0.9 }).addTo(map).bindPopup('You are here').openPopup();
  msgEl.textContent = '📍 Location detected successfully!';
}

function drawRoute(toLat, toLon) {
  if (routeLine) map.removeLayer(routeLine);
  routeLine = L.polyline([[userLat, userLon], [toLat, toLon]], {
    color: 'green', weight: 4, opacity: 0.8, dashArray: '5,10'
  }).addTo(map);
  map.fitBounds(routeLine.getBounds());
}

function clearRoute() {
  if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
}

function showNearest() {
  const g = document.getElementById('bloodGroup').value;
  if (!g) { alert('Select a blood group first'); return; }
  resultsEl.innerHTML = '';
  const near = donors.filter(d => d.blood === g).map(d => ({ ...d, dist: calcDistKm(userLat, userLon, d.lat, d.lon) })).filter(d => d.dist <= 0.1);
  near.sort((a, b) => a.dist - b.dist);
  if (near.length === 0) { resultsEl.innerHTML = '<p>No nearby donors found.</p>'; return; }
  resultsEl.innerHTML = `<h3>Nearest ${g} Donors</h3>`;
  near.forEach(d => {
    const card = document.createElement('div');
    card.className = 'card blink';
    card.innerHTML = `
      <b>${d.name}</b><br>${d.blood}<br>📞 ${d.contact}<br>
      Distance: ${(d.dist * 1000).toFixed(0)} m<br>
      <button onclick="alert('🆘 Blood request sent to ${d.name}!')">🆘 Request Blood</button>
      <button onclick="drawRoute(${d.lat}, ${d.lon})">🧭 Get Directions</button>
    `;
    resultsEl.appendChild(card);
    L.circleMarker([d.lat, d.lon], { radius: 10, color: 'red', fillColor: 'red', fillOpacity: 0.8 })
      .addTo(map).bindPopup(`<b>${d.name}</b><br>${Math.round(d.dist * 1000)} m away`);
  });
}

function showAll() {
  resultsEl.innerHTML = '<h3>All Donors</h3>';
  donors.forEach(d => {
    const dist = calcDistKm(userLat, userLon, d.lat, d.lon);
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <b>${d.name}</b><br>${d.blood}<br>📞 ${d.contact}<br>
      ${Math.round(dist * 1000)} m away
    `;
    resultsEl.appendChild(card);
    L.circleMarker([d.lat, d.lon], {
      radius: 7,
      color: 'gray',
      fillColor: 'gray',
      fillOpacity: 0.7
    }).addTo(map).bindPopup(`<b>${d.name}</b><br>${Math.round(dist * 1000)} m`);
  });
}

document.getElementById('nearestBtn').onclick = () => {
  showNearest();
  clearInterval(autoRefreshInterval);
  autoRefreshInterval = setInterval(showNearest, 60000);
};

document.getElementById('allBtn').onclick = () => {
  showAll();
  clearInterval(autoRefreshInterval);
};

// --- Get live location ---
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      initMap(pos.coords.latitude, pos.coords.longitude);
    },
    err => {
      msgEl.textContent = '⚠️ Location access denied — using fallback (Bengaluru).';
      initMap(12.9716, 77.5946);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
} else {
  msgEl.textContent = 'Geolocation not supported.';
  initMap(12.9716, 77.5946);
}