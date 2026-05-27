this.inherits(COMMAND);
this.command = "seasonprogress";
this.allow_busy = true;
this.allow_state = true;

this.enter = function (me, arg) {
    if (!SEASON || !SEASON.isActive()) {
        return me.notify('当前没有活跃的赛季。');
    }

    if (!SEASON.isSeasonPlayer(me)) {
        return me.notify('你不是赛季角色，无法查看赛季进度。');
    }

    var config = SEASON.getConfig();
    var seasonId = SEASON.getSeasonId(me);
    var seasonData = me.query_temp('season_data');
    if (typeof seasonData === 'string') {
        try { seasonData = JSON.parse(seasonData); } catch (e) { seasonData = {}; }
    }
    if (!seasonData) seasonData = SEASON.getDefaultSeasonData();

    var claimed = seasonData.milestones_claimed || [];

    var str = [];
    str.push('\n<hir>══════════════════════════════════</hir>');
    str.push('\n<hiy>  赛季进度 - ' + config.name + '</hiy>');
    str.push('\n<hir>══════════════════════════════════</hir>');
    str.push('\n');
    str.push('\n<hiw>当前境界：</hiw>' + (me.get_level_desc ? me.get_level_desc() : '普通百姓'));
    str.push('\n<hiw>当前等级：</hiw>' + me.level);
    str.push('\n<hiw>赛季经验：</hiw>' + (seasonData.season_exp || 0));
    str.push('\n<hiw>赛季积分：</hiw>' + (seasonData.season_score || 0));
    str.push('\n');
    str.push('\n<hic>── 里程碑奖励 ──</hic>');

    if (config.milestones && config.milestones.length > 0) {
        for (var i = 0; i < config.milestones.length; i++) {
            var ms = config.milestones[i];
            var isClaimed = claimed.indexOf(ms.level) >= 0;
            var isReached = me.level >= ms.level;
            var status = '';
            if (isClaimed) {
                status = '<hig>[已领取]</hig>';
            } else if (isReached) {
                status = '<hiy>[可领取]</hiy>';
            } else {
                status = '<hiz>[未达成]</hiz>';
            }
            str.push('\n  ' + status + ' 境界 ' + ms.level + ' 级');
            if (ms.reward) {
                if (ms.reward.title) str.push(' - 称号:「' + ms.reward.title + '」');
                if (ms.reward.items) str.push(' - 奖励物品');
            }
        }
    }

    str.push('\n');
    str.push('\n<hic>── 赛季结束奖励 ──</hic>');
    if (config.rewards) {
        if (config.rewards.title) {
            str.push('\n  称号:「' + config.rewards.title + '」');
        }
        if (config.rewards.items) {
            str.push('\n  专属物品');
        }
    }
    str.push('\n');
    str.push('\n<hiw>赛季剩余时间：</hiw>' + SEASON.formatRemainingTime());
    str.push('\n<hir>══════════════════════════════════</hir>\n');

    me.notify(str.join(''));
}

// 领取里程碑奖励
this.claim = function (me, level) {
    if (!SEASON || !SEASON.isActive()) return;
    if (!SEASON.isSeasonPlayer(me)) return;

    var config = SEASON.getConfig();
    var seasonData = me.query_temp('season_data');
    if (typeof seasonData === 'string') {
        try { seasonData = JSON.parse(seasonData); } catch (e) { seasonData = {}; }
    }
    if (!seasonData) seasonData = SEASON.getDefaultSeasonData();

    var claimed = seasonData.milestones_claimed || [];
    if (claimed.indexOf(level) >= 0) {
        return me.notify('你已经领取过该里程碑奖励了。');
    }

    if (me.level < level) {
        return me.notify('你尚未达到该里程碑要求的境界。');
    }

    var milestone = null;
    if (config.milestones) {
        for (var i = 0; i < config.milestones.length; i++) {
            if (config.milestones[i].level === level) {
                milestone = config.milestones[i];
                break;
            }
        }
    }
    if (!milestone) return me.notify('无效的里程碑。');

    claimed.push(level);
    seasonData.milestones_claimed = claimed;
    me.set_temp('season_data', seasonData);

    if (milestone.reward) {
        if (milestone.reward.title) {
            me.add_title(milestone.reward.title, 'season');
        }
        if (milestone.reward.items) {
            for (var i = 0; i < milestone.reward.items.length; i++) {
                var obj = OBJ.CREATE(milestone.reward.items[i]);
                if (obj) me.add_obj(obj);
            }
        }
    }

    me.notify('<hiy>【赛季】你已领取里程碑奖励（境界' + level + '级）！');
}
