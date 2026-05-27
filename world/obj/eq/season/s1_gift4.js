this.inherits(OBJ);
this.unit = "个";
this.name = "龙脉大师礼包";
this.desc = "第一赛季里程碑最高奖励，内含传说级道具。";
this.grade = 4;
this.combined = false;
this.on_use = function (me) {
    me.add_exp(100000, 100000);
    me.add_money(50000);
    var stone = OBJ.CREATE('st/red/st_red4', 3);
    if (stone) me.add_obj(stone);
    me.notify('<hig>你打开了龙脉大师礼包，获得了100000经验、100000潜能、50两银子和3颗传说攻击宝石。</hig>');
    return true;
}
