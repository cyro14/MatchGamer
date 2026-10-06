const API_KEY = 'ae08037aa9fb40a48b12090819cedb07';
const TAG_AMAZON = 'teublog-20'; // Troque para sua tag real da Amazon

let currentGameList = [];
let savedMatches = JSON.parse(localStorage.getItem('gamerMatches')) || [];

// Navegação de Telas
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// 1. Buscar Jogos na API RAWG
async function fetchGames() {
    const genre = document.getElementById('genre-select').value;
    const url = `https://api.rawg.io/api/games?key=${API_KEY}&genres=${genre}&page_size=15&ordering=-rating`;
    
    showScreen('screen-swipe');
    document.getElementById('card-container').innerHTML = '<h2>Carregando jogos...</h2>';
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        currentGameList = data.results;
        renderCards();
    } catch (error) {
        alert('Erro ao buscar jogos. Tente novamente.');
    }
}

// 2. Renderizar os Cards Empilhados
function renderCards() {
    const container = document.getElementById('card-container');
    container.innerHTML = '';
    
    if (currentGameList.length === 0) {
        container.innerHTML = '<h2>Acabaram os jogos!</h2>';
        return;
    }

    // Renderiza de trás pra frente para que o índice 0 fique no topo da pilha visualmente
    currentGameList.slice().reverse().forEach((game, index) => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.style.backgroundImage = `url('${game.background_image}')`;
        // Ajusta o z-index para empilhar corretamente
        card.style.zIndex = currentGameList.length - index; 
        
        card.innerHTML = `
            <div class="game-info">
                <h3>${game.name}</h3>
                <p>Nota: ${game.rating} / 5</p>
                <p>Lançamento: ${game.released.substring(0, 4)}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// 3. Ação de Swipe (Botões)
function handleAction(action) {
    if (currentGameList.length === 0) return;
    
    const topCard = document.querySelector('.game-card:last-child');
    const currentGame = currentGameList[0];

    if (action === 'match') {
        topCard.classList.add('swipe-right');
        saveMatch(currentGame);
    } else {
        topCard.classList.add('swipe-left');
    }

    // Espera a animação acabar para remover o dado e re-renderizar
    setTimeout(() => {
        currentGameList.shift(); // Remove o primeiro jogo do array
        renderCards();
    }, 400);
}

// 4. Salvar Match e Atualizar LocalStorage
function saveMatch(game) {
    // Evita duplicatas
    if (!savedMatches.some(m => m.id === game.id)) {
        savedMatches.push({ id: game.id, name: game.name });
        localStorage.setItem('gamerMatches', JSON.stringify(savedMatches));
    }
}

// 5. Renderizar Tela de Matches (Monetização)
function renderMatches() {
    const list = document.getElementById('matches-list');
    list.innerHTML = '';
    
    if (savedMatches.length === 0) {
        list.innerHTML = '<p>Você ainda não deu match com nenhum jogo.</p>';
    }

    savedMatches.forEach(game => {
        const encodedName = encodeURIComponent(game.name);
        const amazonUrl = `https://www.amazon.com.br/s?k=${encodedName}&tag=${TAG_AMAZON}`;
        
        list.innerHTML += `
            <div class="match-item">
                <span>${game.name}</span>
                <a href="${amazonUrl}" target="_blank" class="btn-amazon">Ver Oferta</a>
            </div>
        `;
    });
    showScreen('screen-matches');
}

// Event Listeners
document.getElementById('btn-start').addEventListener('click', fetchGames);
document.getElementById('btn-reject').addEventListener('click', () => handleAction('reject'));
document.getElementById('btn-match').addEventListener('click', () => handleAction('match'));
document.getElementById('btn-view-matches').addEventListener('click', renderMatches);
document.getElementById('btn-back').addEventListener('click', () => showScreen('screen-profile'));
