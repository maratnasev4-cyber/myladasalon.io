// Инициализация хранилищ
function initDB() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
}

// Получить текущего пользователя
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

// Обновить шапку
function updateHeader() {
    const headerUserDiv = document.getElementById('headerUser');
    if (!headerUserDiv) return;
    
    const currentUser = getCurrentUser();
    if (currentUser) {
        headerUserDiv.innerHTML = `
            <span>Здравствуйте, ${currentUser.fio.split(' ')[0]}</span>
            <button id="logoutBtn" class="login-link">Выйти</button>
        `;
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            });
        }
    } else {
        headerUserDiv.innerHTML = `
            <span class="guest-text">Гость</span>
            <a href="login.html" class="login-link">Войти</a>
        `;
    }
}

// РЕГИСТРАЦИЯ
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const login = document.getElementById('login').value.trim();
        const password = document.getElementById('password').value;
        const fio = document.getElementById('fio').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const msgDiv = document.getElementById('registerMessage');
        
        // Проверка на пустые поля
        if (!login || !password || !fio || !phone || !email) {
            msgDiv.innerHTML = '❌ Заполните все поля!';
            msgDiv.className = 'message-area error';
            return;
        }
        
        // Получаем существующих пользователей
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Проверка на существующего пользователя
        if (users.find(u => u.login === login)) {
            msgDiv.innerHTML = '❌ Пользователь с таким логином уже существует!';
            msgDiv.className = 'message-area error';
            return;
        }
        
        // Добавляем нового пользователя
        const newUser = { login, password, fio, phone, email };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Показываем сообщение об успехе
        msgDiv.innerHTML = '✅ Регистрация успешна! Перенаправление на вход...';
        msgDiv.className = 'message-area success';
        
        // Через 1.5 секунды перенаправляем на страницу входа
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    });
}

// АВТОРИЗАЦИЯ
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const login = document.getElementById('login').value.trim();
        const password = document.getElementById('password').value;
        const msgDiv = document.getElementById('loginMessage');
        
        // Получаем пользователей
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Ищем пользователя
        const user = users.find(u => u.login === login && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            msgDiv.innerHTML = '✅ Вход выполнен! Перенаправление...';
            msgDiv.className = 'message-area success';
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 1000);
        } else {
            msgDiv.innerHTML = '❌ Неверный логин или пароль!';
            msgDiv.className = 'message-area error';
        }
    });
}

// ЗАЯВКИ
function loadOrders() {
    const ordersListDiv = document.getElementById('ordersList');
    if (!ordersListDiv) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        ordersListDiv.innerHTML = '<p class="info-message">⚠️ Для просмотра заявок необходимо <a href="login.html">войти в систему</a>.</p>';
        return;
    }
    
    const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = allOrders.filter(order => order.userLogin === currentUser.login);
    
    if (userOrders.length === 0) {
        ordersListDiv.innerHTML = '<p class="info-message">📭 У вас пока нет заявок. Создайте первую!</p>';
        return;
    }
    
    ordersListDiv.innerHTML = '';
    userOrders.forEach((order) => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <p><strong>Дата:</strong> ${order.date} ${order.time}</p>
            <p><strong>Адрес:</strong> ${order.address}</p>
            <p><strong>Контакты:</strong> ${order.contact}</p>
            <p><strong>Услуга:</strong> ${order.service}</p>
            <p><strong>Оплата:</strong> ${order.payment}</p>
            <p><strong>Создано:</strong> ${order.createdAt}</p>
        `;
        ordersListDiv.appendChild(orderCard);
    });
}

// НОВАЯ ЗАЯВКА
if (document.getElementById('orderForm')) {
    document.getElementById('orderForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Необходимо авторизоваться!');
            window.location.href = 'login.html';
            return;
        }
        
        const address = document.getElementById('address').value.trim();
        const contact = document.getElementById('contact').value.trim();
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const service = document.getElementById('service').value;
        const payment = document.querySelector('input[name="payment"]:checked');
        
        if (!address || !contact || !date || !time || !service || !payment) {
            document.getElementById('orderMessage').innerHTML = '❌ Заполните все поля!';
            document.getElementById('orderMessage').className = 'message-area error';
            return;
        }
        
        const newOrder = {
            id: Date.now(),
            userLogin: currentUser.login,
            address,
            contact,
            date,
            time,
            service,
            payment: payment.value,
            createdAt: new Date().toLocaleString()
        };
        
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        document.getElementById('orderMessage').innerHTML = '✅ Заявка успешно создана!';
        document.getElementById('orderMessage').className = 'message-area success';
        setTimeout(() => {
            window.location.href = 'orders.html';
        }, 1500);
    });
}

// Проверка доступа
function checkAuthForOrders() {
    if (window.location.pathname.includes('orders.html') || window.location.pathname.includes('new-order.html')) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Пожалуйста, авторизуйтесь для доступа к заявкам');
            window.location.href = 'login.html';
        }
    }
}

// Вкладки
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns.length === 0) return;
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const allPanes = document.querySelectorAll('.tab-pane');
            allPanes.forEach(pane => pane.classList.remove('active'));
            const activePane = document.getElementById(`tab-${tabId}`);
            if (activePane) activePane.classList.add('active');
        });
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    initDB();
    updateHeader();
    loadOrders();
    checkAuthForOrders();
    initTabs();
});
// ===== СЛАЙДЕР НА ГЛАВНОЙ СТРАНИЦЕ =====
function initSlider() {
    const slides = document.querySelectorAll('.hero-slider .slide');
    const dots = document.querySelectorAll('.hero-slider .dot');
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    let slideInterval;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (dots[i]) dots[i].classList.remove('active');
        });
        
        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        currentSlide = index;
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function startAutoSlide() {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    // Клик по точкам
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            startAutoSlide(); // перезапускаем таймер
        });
    });
    
    // Запускаем автопереключение
    startAutoSlide();
}

// Запуск после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    initSlider();
    // ... остальные ваши функции
});