this.inherits(OBJ);
this.unit = "个";
this.name = "龙脉高级礼包";
this.desc = "第一赛季里程碑奖励，内含稀有道具。";
this.grade = 3;
this.combined = false;
this.on_use = function (me) {
    me.add_exp(50000, 50000);
    me.add_money(20000);
    var stone = OBJ.CREATE('st/red/st_red3', 5);
    if (stone) me.add_obj(stone);
    me.notify('<hig>你打开了龙脉高级礼包，获得了50000经验、50000潜能、20两银子和5颗高级攻击宝石。</hig>');
    return true;
}
