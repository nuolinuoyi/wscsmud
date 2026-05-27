// 赛季系统引擎
// 通过 world/extends/ 机制钩入游戏核心

var fs = require('fs');
var path = require('path');

var SEASON = {
    current: null,
    config: null,
    season_dir: path.join(__dirname, '..', 'season')
};

// 加载赛季配置
SEASON.load = function () {
    try {
        var currentPath = path.join(this.season_dir, 'current.json');
        if (!fs.existsSync(currentPath)) {
            console.log('赛季配置文件不存在');
            return;
        }
        var currentData = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
        if (!currentData.season_id || currentData.status !== 'active') {
            console.log('当前无活跃赛季');
            return;
        }
        var seasonFile = path.join(this.season_dir, 'season' + currentData.season_id + '.json');
        if (!fs.existsSync(seasonFile)) {
            console.log('赛季配置文件不存在: ' + seasonFile);
            return;
        }
        this.config = JSON.parse(fs.readFileSync(seasonFile, 'utf8'));
        this.current = currentData;
        console.log('已加载赛季配置: ' + this.config.name + ' (ID:' + this.config.id + ')');
    } catch (e) {
        console.error('加载赛季配置失败:', e);
    }
};

// 获取当前赛季配置
SEASON.getConfig = function () {
    return this.config;
};

// 获取指定赛季配置
SEASON.getSeasonConfig = function (seasonId) {
    try {
        var seasonFile = path.join(this.season_dir, 'season' + seasonId + '.json');
        if (!fs.existsSync(seasonFile)) return null;
        return JSON.parse(fs.readFileSync(seasonFile, 'utf8'));
    } catch (e) {
        return null;
    }
};

// 检查当前赛季是否活跃
SEASON.isActive = function () {
    if (!this.config || !this.current) return false;
    if (this.current.status !== 'active') return false;
    var now = new Date();
    var end = new Date(this.config.end_time);
    return now < end;
};

// 检查赛季是否已过期
SEASON.isExpired = function () {
    if (!this.config) return false;
    var now = new Date();
    var end = new Date(this.config.end_time);
    return now >= end;
};

// 获取赛季剩余时间（毫秒）
SEASON.getRemainingTime = function () {
    if (!this.config) return 0;
    var now = new Date();
    var end = new Date(this.config.end_time);
    return Math.max(0, end - now);
};

// 格式化剩余时间
SEASON.formatRemainingTime = function () {
    var ms = this.getRemainingTime();
    if (ms <= 0) return '已结束';
    var days = Math.floor(ms / 86400000);
    var hours = Math.floor((ms % 86400000) / 3600000);
    var minutes = Math.floor((ms % 3600000) / 60000);
    var parts = [];
    if (days > 0) parts.push(days + '天');
    if (hours > 0) parts.push(hours + '小时');
    if (minutes > 0) parts.push(minutes + '分钟');
    return parts.join('');
};

// 检查角色是否为赛季角色
SEASON.isSeasonPlayer = function (user) {
    return user.query_temp && user.query_temp('season') > 0;
};

// 获取角色的赛季ID
SEASON.getSeasonId = function (user) {
    if (!this.isSeasonPlayer(user)) return 0;
    return user.query_temp('season');
};

// 获取赛季经验倍率
SEASON.getExpRate = function () {
    if (!this.config) return 1;
    return this.config.rules.exp_rate || 1;
};

// 获取赛季潜能倍率
SEASON.getPotRate = function () {
    if (!this.config) return 1;
    return this.config.rules.pot_rate || 1;
};

// 获取赛季掉落倍率
SEASON.getDropRate = function () {
    if (!this.config) return 1;
    return this.config.rules.drop_rate || 1;
};

// 检查门派是否在赛季中启用
SEASON.isFamilyEnabled = function (familyId) {
    if (!this.config) return true;
    if (!this.config.rules.enabled_families) return true;
    return this.config.rules.enabled_families.indexOf(familyId) >= 0;
};

// 结束当前赛季
SEASON.endSeason = function () {
    if (!this.config) return;
    this.current.status = 'ended';
    try {
        var currentPath = path.join(this.season_dir, 'current.json');
        fs.writeFileSync(currentPath, JSON.stringify(this.current, null, 2), 'utf8');
        console.log('赛季 ' + this.config.name + ' 已结束');
    } catch (e) {
        console.error('结束赛季失败:', e);
    }
};

// 切换到新赛季
SEASON.startSeason = function (seasonId) {
    var seasonConfig = this.getSeasonConfig(seasonId);
    if (!seasonConfig) {
        console.log('赛季配置不存在: ' + seasonId);
        return false;
    }
    var newCurrent = {
        season_id: seasonId,
        status: 'active',
        last_updated: new Date().toISOString()
    };
    try {
        var currentPath = path.join(this.season_dir, 'current.json');
        fs.writeFileSync(currentPath, JSON.stringify(newCurrent, null, 2), 'utf8');
        this.current = newCurrent;
        this.config = seasonConfig;
        console.log('已切换到赛季: ' + seasonConfig.name);
        return true;
    } catch (e) {
        console.error('切换赛季失败:', e);
        return false;
    }
};

// 保存赛季配置到文件
SEASON.saveSeasonConfig = function (seasonId, config) {
    try {
        var seasonFile = path.join(this.season_dir, 'season' + seasonId + '.json');
        fs.writeFileSync(seasonFile, JSON.stringify(config, null, 2), 'utf8');
        if (this.config && this.config.id === seasonId) {
            this.config = config;
        }
        return true;
    } catch (e) {
        console.error('保存赛季配置失败:', e);
        return false;
    }
};

// 获取所有赛季列表
SEASON.getAllSeasons = function () {
    var seasons = [];
    try {
        var files = fs.readdirSync(this.season_dir);
        for (var i = 0; i < files.length; i++) {
            var match = files[i].match(/^season(\d+)\.json$/);
            if (match) {
                var config = this.getSeasonConfig(parseInt(match[1]));
                if (config) {
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
        }
    } catch (e) {
        console.error('读取赛季列表失败:', e);
    }
    return seasons;
};

// 初始化赛季里程碑奖励数据
SEASON.getDefaultSeasonData = function () {
    return {
        milestones_claimed: [],
        season_exp: 0,
        season_score: 0,
        achievements: [],
        season_items_received: []
    };
};

// 全局暴露
globalThis.SEASON = SEASON;

// ========== 钩入游戏引擎 ==========

// 在服务器启动时加载赛季配置
var _orig_startup = WORLD.on_startup;
WORLD.on_startup = function () {
    SEASON.load();
    if (_orig_startup) _orig_startup.call(this);
};

// 在心跳中检查赛季结束
var _orig_heartbeat = WORLD.on_heart_beat;
WORLD.on_heart_beat = function (now) {
    if (SEASON.isActive() && SEASON.isExpired()) {
        SEASON.endSeason();
        WORLD.send_all('<hiy>【赛季公告】赛季「' + SEASON.config.name + '」已结束！赛季角色将自动转为普通角色。</hiy>');
    }
    if (_orig_heartbeat) _orig_heartbeat.call(this, now);
};

// 钩入经验获取，应用赛季倍率
var _orig_add_exp = CHARACTER.prototype.add_exp;
CHARACTER.prototype.add_exp = function (exp, pot, money) {
    if (SEASON.isActive() && SEASON.isSeasonPlayer(this)) {
        var rate = SEASON.getExpRate();
        if (exp && rate > 1) {
            exp = parseInt(exp * rate);
        }
        if (pot) {
            var potRate = SEASON.getPotRate();
            if (potRate > 1) {
                pot = parseInt(pot * potRate);
            }
        }
    }
    _orig_add_exp.call(this, exp, pot, money);
};
