this.inherits(COMMAND);
this.command = "seasoninfo";
this.allow_busy = true;
this.allow_state = true;

this.enter = function (me, arg) {
    if (!SEASON || !SEASON.isActive()) {
        return me.notify('当前没有活跃的赛季。');
    }

    var config = SEASON.getConfig();
    var rules = config.rules;
    var isSeason = SEASON.isSeasonPlayer(me);

    var str = [];
    str.push('\n<hir>══════════════════════════════════</hir>');
    str.push('\n<hiy>  赛季「' + config.name + '」</hiy>');
    str.push('\n<hir>══════════════════════════════════</hir>');
    str.push('\n');
    str.push('\n<hiw>主题：</hiw>' + config.desc);
    str.push('\n<hiw>剩余时间：</hiw>' + SEASON.formatRemainingTime());
    str.push('\n');
    str.push('\n<hic>── 赛季规则 ──</hic>');
    str.push('\n<hiw>经验倍率：</hiw>' + rules.exp_rate + 'x');
    str.push('\n<hiw>潜能倍率：</hiw>' + rules.pot_rate + 'x');
    str.push('\n<hiw>掉落倍率：</hiw>' + rules.drop_rate + 'x');
    str.push('\n<hiw>属性总和：</hiw>' + rules.stat_sum + ' (范围' + rules.stat_min + '-' + rules.stat_max + ')');
    str.push('\n');
    str.push('\n<hic>── 赛季门派 ──</hic>');
    if (config.families && config.families.length > 0) {
        for (var i = 0; i < config.families.length; i++) {
            var famId = config.families[i];
            var fam = FAMILIES[famId];
            if (fam) {
                str.push('\n  <hiy>' + fam.name + '</hiy> - ' + (fam.top_family || ''));
            }
        }
    }
    str.push('\n');
    str.push('\n<hic>── 赛季套装 ──</hic>');
    if (config.sets && config.sets.length > 0) {
        for (var i = 0; i < config.sets.length; i++) {
            str.push('\n  <hiy>' + config.sets[i] + '</hiy>');
        }
    }
    str.push('\n');
    if (isSeason) {
        str.push('\n<hig>你当前是赛季角色，享受赛季加成！</hig>');
    } else {
        str.push('\n<hiw>你不是赛季角色。使用 <hic>createseason</hic> 创建赛季角色。</hiw>');
    }
    str.push('\n<hir>══════════════════════════════════</hir>\n');

    me.notify(str.join(''));
}
