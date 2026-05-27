import API from './api.js';
import { DashboardPage } from './pages/dashboard.js';
import { PlayerSearchPage } from './pages/player-search.js';
import { SeasonManagerPage } from './pages/season-manager.js';

const pages = {
    'dashboard': DashboardPage,
    'player-search': PlayerSearchPage,
    'season-manager': SeasonManagerPage
};

let currentPage = null;

function navigateTo(pageName) {
    // 更新菜单高亮
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageName);
    });

    // 渲染页面
    const container = document.getElementById('page-content');
    if (currentPage && currentPage.destroy) {
        currentPage.destroy();
    }

    const PageClass = pages[pageName];
    if (PageClass) {
        currentPage = new PageClass(container, API);
        currentPage.render();
    }
}

// 菜单点击事件
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(item.dataset.page);
    });
});

// 初始化
navigateTo('dashboard');
