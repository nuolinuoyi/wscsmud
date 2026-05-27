// GM后台API调用层
const BASE_URL = '/api/admin';

async function request(method, params = {}) {
    try {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        };
        if (params && Object.keys(params).length > 0) {
            options.body = JSON.stringify(params);
        }
        const response = await fetch(`${BASE_URL}/${method}`, options);
        const data = await response.json();
        if (data.code === 0 && data.result === '权限不足') {
            alert('权限不足，请重新登录');
            window.location.href = '/';
            return null;
        }
        return data;
    } catch (e) {
        console.error('API请求失败:', e);
        return { code: 0, result: '网络请求失败' };
    }
}

export default {
    getServerStatus: () => request('getServerStatus'),
    getSeason: () => request('getSeason'),
    getSeasons: () => request('getSeasons'),
    updateSeason: (season_id, config) => request('updateSeason', { season_id, config }),
    switchSeason: (season_id, status) => request('switchSeason', { season_id, status }),
    searchPlayer: (keyword) => request('searchPlayer', { keyword }),
    searchSeasonPlayer: (season_id, keyword) => request('searchSeasonPlayer', { season_id, keyword }),
    getSeasonPlayers: (season_id, offset, limit) => request('getSeasonPlayers', { season_id, offset, limit }),
    getSeasonPlayerData: (season_id, player_id) => request('getSeasonPlayerData', { season_id, player_id }),
    getPlayerData: (player_id) => request('getPlayerData', { player_id }),
    modifyPlayerStats: (player_id, stats) => request('modifyPlayerStats', { player_id, stats }),
    sendItemToPlayer: (player_id, item_path, count) => request('sendItemToPlayer', { player_id, item_path, count }),
    kickPlayer: (player_id) => request('kickPlayer', { player_id }),
    sendNotice: (content) => request('sendNotice', { content }),
    getSeasonLeaderboard: (season_id, type) => request('getSeasonLeaderboard', { season_id, type }),
    modifySeasonPlayer: (season_id, player_id, data, season_data) => request('modifySeasonPlayer', { season_id, player_id, data, season_data })
};
