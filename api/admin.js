const APIBASE = require('./base');
const fs = require('fs');
const path = require('path');
const { DB } = __CONFIG;

class AdminAPI extends APIBASE {

    // 检查管理员权限
    checkAdmin() {
        let user = this.getUser();
        if (!user || user.level < 5) {
            return null;
        }
        return user;
    }

    // ========== 赛季管理 ==========

    // 获取当前赛季信息
    async getSeason() {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        try {
            var seasonDir = path.join(__dirname, '..', 'world', 'season');
            var currentPath = path.join(seasonDir, 'current.json');
            var current = JSON.parse(fs.readFileSync(currentPath, 'utf8'));

            var config = null;
            if (current.season_id) {
                var seasonFile = path.join(seasonDir, 'season' + current.season_id + '.json');
                if (fs.existsSync(seasonFile)) {
                    config = JSON.parse(fs.readFileSync(seasonFile, 'utf8'));
                }
            }
            return { code: 1, result: { current, config } };
        } catch (e) {
            return { code: 0, result: "读取赛季配置失败: " + e.message };
        }
    }

    // 获取所有赛季列表
    async getSeasons() {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        try {
            var seasonDir = path.join(__dirname, '..', 'world', 'season');
            var files = fs.readdirSync(seasonDir);
            var seasons = [];
            for (var i = 0; i < files.length; i++) {
                var match = files[i].match(/^season(\d+)\.json$/);
                if (match) {
                    var config = JSON.parse(fs.readFileSync(path.join(seasonDir, files[i]), 'utf8'));
                    seasons.push({
                        id: config.id,
                        name: config.name,
                        theme: config.theme,
                        start_time: config.start_time,
                        end_time: config.end_time,
                        duration_months: config.duration_months
                    });
                }
            }
            return { code: 1, result: seasons };
        } catch (e) {
            return { code: 0, result: "读取赛季列表失败: " + e.message };
        }
    }

    // 更新赛季配置
    async updateSeason(paras) {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        var { season_id, config } = paras;
        if (!season_id || !config) {
            return { code: 0, result: "参数不足" };
        }

        try {
            var seasonDir = path.join(__dirname, '..', 'world', 'season');
            var seasonFile = path.join(seasonDir, 'season' + season_id + '.json');
            fs.writeFileSync(seasonFile, JSON.stringify(config, null, 2), 'utf8');
            return { code: 1, result: "赛季配置已更新" };
        } catch (e) {
            return { code: 0, result: "更新赛季配置失败: " + e.message };
        }
    }

    // 切换当前赛季
    async switchSeason(paras) {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        var { season_id, status } = paras;
        if (!season_id) {
            return { code: 0, result: "参数不足" };
        }

        try {
            var seasonDir = path.join(__dirname, '..', 'world', 'season');
            var currentPath = path.join(seasonDir, 'current.json');
            var newCurrent = {
                season_id: season_id,
                status: status || 'active',
                last_updated: new Date().toISOString()
            };
            fs.writeFileSync(currentPath, JSON.stringify(newCurrent, null, 2), 'utf8');

            // 如果游戏服务器在线，热重载赛季配置
            if (typeof SEASON !== 'undefined' && SEASON.load) {
                SEASON.load();
            }

            return { code: 1, result: "赛季已切换到 " + season_id };
        } catch (e) {
            return { code: 0, result: "切换赛季失败: " + e.message };
        }
    }

    // ========== 玩家管理 ==========

    // 搜索玩家（普通玩家）
    async searchPlayer(paras) {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        var { keyword } = paras;
        if (!keyword) return { code: 0, result: "请输入搜索关键词" };

        try {
            var results = [];
            // 搜索在线玩家
            if (typeof WORLD !== 'undefined' && WORLD.USERS) {
                for (var i = 0; i < WORLD.USERS.length; i++) {
                    var p = WORLD.USERS[i];
                    if (p.name && p.name.indexOf(keyword) >= 0 || p.id === keyword) {
                        results.push({
                            id: p.id,
                            name: p.name,
                            level: p.level,
                            online: true,
                            family: p.family ? p.family.name : '无门无派',
                            hp: p.hp,
                            max_hp: p.max_hp
                        });
                    }
                }
            }
            return { code: 1, result: results };
        } catch (e) {
            return { code: 0, result: "搜索失败: " + e.message };
        }
    }

    // 搜索赛季玩家
    async searchSeasonPlayer(paras) {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        var { season_id, keyword } = paras;
        if (!season_id || !keyword) return { code: 0, result: "参数不足" };

        try {
            var results = await DB.searchSeasonPlayers(season_id, keyword);
            return { code: 1, result: results };
        } catch (e) {
            return { code: 0, result: "搜索失败: " + e.message };
        }
    }

    // 获取赛季玩家列表
    async getSeasonPlayers(paras) {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        var { season_id, offset, limit } = paras;
        if (!season_id) return { code: 0, result: "参数不足" };

        try {
            var players = await DB.getSeasonPlayers(season_id, offset || 0, limit || 50);
            var countResult = await DB.getSeasonPlayerCount(season_id);
            return {
                code: 1,
                result: {
                    players: players,
                    total: countResult ? countResult.count : 0
                }
            };
        } catch (e) {
            return { code: 0, result: "获取玩家列表失败: " + e.message };
        }
    }

    // 获取赛季玩家详细数据
    async getSeasonPlayerData(paras) {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        var { season_id, player_id } = paras;
        if (!season_id || !player_id) return { code: 0, result: "参数不足" };

        try {
            var player = await DB.getSeasonPlayerData(season_id, player_id);
            if (!player) return { code: 0, result: "玩家不存在" };

            // 解析JSON数据
            if (player.data) {
                try { player.data = JSON.parse(player.data); } catch (e) {}
            }
            if (player.season_data) {
                try { player.season_data = JSON.parse(player.season_data); } catch (e) {}
            }

            return { code: 1, result: player };
        } catch (e) {
            return { code: 0, result: "获取玩家数据失败: " + e.message };
        }
    }

    // 获取在线玩家详细数据
    async getPlayerData(paras) {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        var { player_id } = paras;
        if (!player_id) return { code: 0, result: "参数不足" };

        try {
            if (typeof WORLD !== 'undefined' && WORLD.USERS) {
                for (var i = 0; i < WORLD.USERS.length; i++) {
                    var p = WORLD.USERS[i];
                    if (p.id === player_id || p.name === player_id) {
                        return {
                            code: 1,
                            result: {
                                id: p.id,
                                name: p.name,
                                level: p.level,
                                gender: p.gender,
                                str: p.str,
                                con: p.con,
                                dex: p.dex,
                                int: p.int,
                                hp: p.hp,
                                max_hp: p.max_hp,
                                mp: p.mp,
                                max_mp: p.max_mp,
                                exp: p.exp,
                                pot: p.pot,
                                money: p.money,
                                cash_money: p.cash_money,
                                score: p.score,
                                family: p.family ? p.family.name : '无门无派',
                                online: true,
                                items_count: p.items ? p.items.length : 0,
                                equipment_count: p.equipment ? p.equipment.filter(function(e){return e}).length : 0,
                                skills_count: p.skills ? Object.keys(p.skills).length : 0,
                                is_season: typeof SEASON !== 'undefined' ? SEASON.isSeasonPlayer(p) : false
                            }
                        };
                    }
                }
            }
            return { code: 0, result: "玩家不在线" };
        } catch (e) {
            return { code: 0, result: "获取玩家数据失败: " + e.message };
        }
    }

    // 修改在线玩家属性
    async modifyPlayerStats(paras) {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        var { player_id, stats } = paras;
        if (!player_id || !stats) return { code: 0, result: "参数不足" };

        try {
            if (typeof WORLD !== 'undefined' && WORLD.USERS) {
                for (var i = 0; i < WORLD.USERS.length; i++) {
                    var p = WORLD.USERS[i];
                    if (p.id === player_id || p.name === player_id) {
                        var validStats = ['str', 'con', 'dex', 'int', 'exp', 'pot', 'money', 'cash_money', 'score', 'hp', 'mp'];
                        for (var key in stats) {
                            if (validStats.indexOf(key) >= 0) {
                                p[key] = parseInt(stats[key]) || 0;
                            }
                        }
                        p.recount();
                        return { code: 1, result: "属性已修改" };
                    }
                }
            }
            return { code: 0, result: "玩家不在线" };
        } catch (e) {
            return { code: 0, result: "修改属性失败: " + e.message };
        }
    }

    // 给在线玩家发送物品
    async sendItemToPlayer(paras) {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        var { player_id, item_path, count } = paras;
        if (!player_id || !item_path) return { code: 0, result: "参数不足" };

        try {
            if (typeof WORLD !== 'undefined' && WORLD.USERS) {
                for (var i = 0; i < WORLD.USERS.length; i++) {
                    var p = WORLD.USERS[i];
                    if (p.id === player_id || p.name === player_id) {
                        var obj = OBJ.CREATE(item_path, count || 1);
                        if (!obj) return { code: 0, result: "物品不存在: " + item_path };
                        p.add_obj(obj);
                        p.notify('<hiy>【系统】GM给你发送了物品：' + obj.color_name + '</hiy>');
                        return { code: 1, result: "物品已发送" };
                    }
                }
            }
            return { code: 0, result: "玩家不在线" };
        } catch (e) {
            return { code: 0, result: "发送物品失败: " + e.message };
        }
    }

    // 踢出玩家
    async kickPlayer(paras) {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        var { player_id } = paras;
        if (!player_id) return { code: 0, result: "参数不足" };

        try {
            if (typeof WORLD !== 'undefined' && WORLD.USERS) {
                for (var i = 0; i < WORLD.USERS.length; i++) {
                    var p = WORLD.USERS[i];
                    if (p.id === player_id || p.name === player_id) {
                        p.notify('<hir>你被GM踢出了游戏。</hir>');
                        if (p.socket) p.socket.end();
                        return { code: 1, result: "玩家已踢出" };
                    }
                }
            }
            return { code: 0, result: "玩家不在线" };
        } catch (e) {
            return { code: 0, result: "踢出玩家失败: " + e.message };
        }
    }

    // 给在线玩家发送公告
    async sendNotice(paras) {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        var { content } = paras;
        if (!content) return { code: 0, result: "请输入公告内容" };

        try {
            if (typeof WORLD !== 'undefined' && WORLD.send_all) {
                WORLD.send_all('<hir>【GM公告】' + content + '</hir>');
                return { code: 1, result: "公告已发送" };
            }
            return { code: 0, result: "游戏服务器未启动" };
        } catch (e) {
            return { code: 0, result: "发送公告失败: " + e.message };
        }
    }

    // 获取服务器状态
    async getServerStatus() {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        try {
            var status = {
                online: false,
                player_count: 0,
                season_active: false,
                season_name: ''
            };

            if (typeof WORLD !== 'undefined') {
                status.online = true;
                status.player_count = WORLD.USERS ? WORLD.USERS.length : 0;
            }

            if (typeof SEASON !== 'undefined' && SEASON.isActive()) {
                status.season_active = true;
                status.season_name = SEASON.config ? SEASON.config.name : '';
                status.season_remaining = SEASON.formatRemainingTime();
            }

            return { code: 1, result: status };
        } catch (e) {
            return { code: 0, result: "获取状态失败: " + e.message };
        }
    }

    // 获取赛季排行榜
    async getSeasonLeaderboard(paras) {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        var { season_id, type } = paras;
        if (!season_id) return { code: 0, result: "参数不足" };

        try {
            var players = await DB.getSeasonPlayers(season_id, 0, 100);
            // 按等级排序（默认）
            if (type === 'level' || !type) {
                players.sort(function (a, b) { return b.level - a.level; });
            }
            return { code: 1, result: players };
        } catch (e) {
            return { code: 0, result: "获取排行榜失败: " + e.message };
        }
    }

    // 修改赛季玩家数据
    async modifySeasonPlayer(paras) {
        let user = this.checkAdmin();
        if (!user) return { code: 0, result: "权限不足" };

        var { season_id, player_id, data, season_data } = paras;
        if (!season_id || !player_id) return { code: 0, result: "参数不足" };

        try {
            var dataStr = typeof data === 'string' ? data : JSON.stringify(data);
            var seasonDataStr = typeof season_data === 'string' ? season_data : JSON.stringify(season_data);
            await DB.updateSeasonPlayerData(season_id, player_id, dataStr, seasonDataStr);
            return { code: 1, result: "赛季玩家数据已修改" };
        } catch (e) {
            return { code: 0, result: "修改数据失败: " + e.message };
        }
    }
}

module.exports = AdminAPI;
