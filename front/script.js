let historyStack = [];
let currentIndex = -1;

function updateClock() {
  const now = new Date();
  const clock = document.getElementById('clock');
  if (clock) {
    clock.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
setInterval(updateClock, 1000);
updateClock();

const searchBox = document.getElementById('searchBox');
const suggestionsList = document.getElementById('suggestions');

searchBox?.addEventListener('input', async () => {
  const input = searchBox.value.trim();
  suggestionsList.innerHTML = '';

  if (input === '') return;

  try {
    const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(input)}`);
    const suggestions = await res.json();

    suggestions.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.word;
      li.onclick = () => {
        searchBox.value = item.word;
        suggestionsList.innerHTML = '';
        navigateTo(`/search?q=${encodeURIComponent(item.word)}`, item.word);
      };
      suggestionsList.appendChild(li);
    });
  } catch (err) {
    console.error('Suggestion fetch error:', err);
  }
});

const addressBar = document.querySelector('.address-bar');

addressBar?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = addressBar.value.trim();
    if (query === '') return;
    navigateTo(`/search?q=${encodeURIComponent(query)}`, query);
  }
});

function l(tar) {
  const val = tar.innerText.trim();
  navigateTo(`/search?q=${encodeURIComponent(val)}`, val);
}

function navigateTo(url, query = '') {
  if (currentIndex < historyStack.length - 1) {
    historyStack = historyStack.slice(0, currentIndex + 1);
  }
  historyStack.push({ url, query });
  currentIndex++;

  renderPage(url, query);
}

function renderPage(url, queryValue = '') {
  const browserWindow = document.querySelector('.browser-window');

  if (url.includes('/search')) {
    fetch(`http://localhost:5000${url}`)
      .then(res => res.json())
      .then(results => {
        browserWindow.innerHTML = `
          <div class="top-bar">
            <button class="nav-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button>
            <button class="nav-btn" onclick="goForward()"><i class="fas fa-arrow-right"></i></button>
            <button class="nav-btn" onclick="location.reload()"><i class="fas fa-redo"></i></button>
            <input type="text" class="address-bar" value="${queryValue}" />
          </div>
          <div class="search-results">
            ${results.map(r => `
              <div class="result">
                <a href="${r.url}" target="_blank"><h3>${r.title}</h3></a>
                <p>${r.description}</p>
              </div>
            `).join('')}
          </div>
        `;
        bindAddressBar();
      });
    return;
  }

  browserWindow.innerHTML = `
    <div class="top-bar">
      <button class="nav-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button>
      <button class="nav-btn" onclick="goForward()"><i class="fas fa-arrow-right"></i></button>
      <button class="nav-btn" onclick="location.reload()"><i class="fas fa-redo"></i></button>
      <input type="text" class="address-bar" value="${queryValue}" />
    </div>
    <iframe id="browser-frame" class="browser-frame" src="${url}"></iframe>
  `;
  bindAddressBar();
}

function bindAddressBar() {
  const newAddressBar = document.querySelector('.address-bar');
  newAddressBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = newAddressBar.value.trim();
      if (query === '') return;
      navigateTo(`/search?q=${encodeURIComponent(query)}`, query);
    }
  });
}

function goBack() {
  if (currentIndex > 0) {
    currentIndex--;
    const { url, query } = historyStack[currentIndex];
    renderPage(url, query);
  }
}

function goForward() {
  if (currentIndex < historyStack.length - 1) {
    currentIndex++;
    const { url, query } = historyStack[currentIndex];
    renderPage(url, query);
  }
}
