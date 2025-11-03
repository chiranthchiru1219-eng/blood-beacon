const BLOOD_GROUPS = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];
let map, userMarker, userLat, userLon, donors = [], autoRefreshInterval, routeLine = null;
const msgEl = document.getElementById('msg'), resultsEl = document.getElementById('results');

// 🕒 Clock
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = '⏱️ ' + now.toLocaleTimeString();
}
setInterval(updateClock, 60000); updateClock();

// 🩸 Donor Data (replace with your real data)
function generateDonors(lat, lon) {
  donors = [
    
    {
      name: "Lavanya KR",
      blood: "A+",
      lat: 13.004435,
      lon: 77.516617,
      contact: "9663620522",
      address: "IP Nagar, Bengaluru"
    },
    {
      name: "Chiranth Kumar J",
      blood: "O+",
      lat: 12.976512,
      lon: 77.502795,
      contact: "9019284194",
      address: "Srigandhakaval, Bengaluru"
    },
    {
      name: "Manya KR",
      blood: "A+",
      lat: 13.004435,
      lon: 77.516617,
      contact: "9980916322",
      address: "IP Nagar, Bengaluru"
    },
    {
      name: "Rakshitha",
      blood: "B+",
      lat: 12.976778,
      lon: 77.554099,
      contact: "9361351627",
      address: "Rajajinagar, Bengaluru"
    },
    {
      name: "Vishwa D",
      blood: "O+",
      lat: 11.664497,
      lon: 78.145920,
      contact: "8056867809",
      address: "Salem, Tamil Nadu"
    },
    {
      name: "Sirisha S",
      blood: "O+",
      lat: 13.4378914,
      lon: 78.0571127,
      contact: "6360716179",
      address: "Singasandra, Bengaluru"
    },
    {
      name: "Keerthana L G ",
      blood: "O+",
      lat: 12.9618397,
      lon: 77.4822311,
      contact: "9663685984",
      address: "near ullal Lake"
    },
    {
      name: "Basana Gowda  ",
      blood: "B+",
      lat: 12.9618397,
      lon: 77.4822311,
      contact: "6366173328",
      address: "Banglore"
    },
    {
      name: "P vijay surya",
      blood: "Ab-",
      lat: 12.932584,
      lon: 77.495180,
      contact: "9620780655",
      address: "Banglore"
    },
    {
      name: "Vinaya B Shriyan ",
      blood: "B+",
      lat: 12.9618397,
      lon: 77.4822311,
      contact: "7760912448",
      address: "Aavalahalli road, Srinagar "
    },
    {
      name: "Varshini.M ",
      blood: "A-",
      lat: 12.958410,
      lon: 77.551107,
      contact: "8867036307",
      address: "Mysore road kasthuri ba nagar "
    },
    {
      name: "Pooja T S ",
      blood: "B+",
      lat: 13.268813,
      lon: 76.478796,
      contact: "9986257003",
      address: "Tiptur "
    },
    {
      name: "Srushti Irayya Mathapati ",
      blood: "B+",
      lat: 12.9190608,
      lon: 77.5140351,
      contact: "8904021996",
      address: "Durgaparameshwari layout pattnagere,Rajarajeswari nagar"
    },
    {
      name: "Minchu  K S",
      blood: "B+",
      lat: 12.908933,
      lon: 77.5857321,
      contact: "9611083433",
      address: "Banglore"
    },
    {
      name: "Shrujana S Hadagali",
      blood: "B+",
      lat: 12.914344,
      lon: 77.495789,
      contact: "9113673861",
      address: "Krishna county layout, Kengeri Mylasandara "
    },
    {
      name: "Akshay L",
      blood: "O+",
      lat: 13.005423,
      lon: 77.520691,
      contact: "7975737909",
      address: "Laggere "
    }
  ];
}

// 🌍 Distance calculator (Haversine formula)
function calcDistKm(a, b, c, d) {
  const R = 6371, dLat = (c - a) * Math.PI / 180, dLon = (d - b) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// 🗺️ Initialize Map
function initMap(lat, lon) {
  userLat = lat; userLon = lon;
  generateDonors(lat, lon);
  if (map) map.remove();
  map = L.map('map').setView([lat, lon], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
  userMarker = L.circleMarker([lat, lon], { radius: 8, color: 'blue', fillColor: 'blue', fillOpacity: 0.9 }).addTo(map).bindPopup('📍 You are here').openPopup();
  msgEl.textContent = '📍 Location detected successfully!';
}

// ➡️ Draw route line between user & donor
function drawRoute(toLat, toLon) {
  if (routeLine) map.removeLayer(routeLine);
  routeLine = L.polyline([[userLat, userLon], [toLat, toLon]], {
    color: 'green', weight: 4, opacity: 0.8, dashArray: '5,10'
  }).addTo(map);
  map.fitBounds(routeLine.getBounds());
}

// ❌ Clear route
function clearRoute() {
  if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
}

// 🔍 Show nearest donors
function showNearest() {
  const g = document.getElementById('bloodGroup').value;
  if (!g) { alert('Select a blood group first'); return; }
  resultsEl.innerHTML = '';
  const near = donors
    .filter(d => d.blood === g)
    .map(d => ({ ...d, dist: calcDistKm(userLat, userLon, d.lat, d.lon) }))
    .filter(d => d.dist <= 0.1); // 100 meters
  
  near.sort((a, b) => a.dist - b.dist);
  if (near.length === 0) { resultsEl.innerHTML = '<p>No nearby donors found.</p>'; return; }

  resultsEl.innerHTML = `<h3>Nearest ${g} Donors</h3>`;
  near.forEach(d => {
    const card = document.createElement('div');
    card.className = 'card blink';
    card.innerHTML = `
      <b>${d.name}</b><br>${d.blood}<br>📞 ${d.contact}<br>
      📍 ${d.address}<br>
      Distance: ${(d.dist * 1000).toFixed(0)} m<br>
      <button onclick="sendSMS('${d.contact}', '${d.name}', '${d.blood}')">🆘 Request Blood</button>
      <button onclick="drawRoute(${d.lat}, ${d.lon})">🧭 Get Directions</button>
    `;
    resultsEl.appendChild(card);
    L.circleMarker([d.lat, d.lon], { radius: 10, color: 'red', fillColor: 'red', fillOpacity: 0.8 })
      .addTo(map).bindPopup(`<b>${d.name}</b><br>${Math.round(d.dist * 1000)} m away`);
  });
}

// 📤 Send SMS (demo alert only)
function sendSMS(number, name, blood) {
  alert(`🆘 Blood request sent to ${name} (${blood}) at ${number}!`);
  // To send real SMS: connect Twilio, Fast2SMS, or an SMS gateway API here.
}

// 🌍 Show all donors
function showAll() {
  resultsEl.innerHTML = '<h3>All Donors</h3>';
  donors.forEach(d => {
    const dist = calcDistKm(userLat, userLon, d.lat, d.lon);
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <b>${d.name}</b><br>${d.blood}<br>📞 ${d.contact}<br>
      📍 ${d.address}<br>
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

// 🔘 Button Actions
document.getElementById('nearestBtn').onclick = () => {
  showNearest();
  clearInterval(autoRefreshInterval);
  autoRefreshInterval = setInterval(showNearest, 60000);
};
document.getElementById('allBtn').onclick = () => {
  showAll();
  clearInterval(autoRefreshInterval);
};

// 📍 Detect current location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => { initMap(pos.coords.latitude, pos.coords.longitude); },
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
