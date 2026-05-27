this.inherits(OBJ);
this.unit = "个";
this.name = "龙脉初级礼包";
this.desc = "第一赛季里程碑奖励，内含实用道具。";
this.grade = 1;
this.combined = false;
this.on_use = function (me) {
    me.add_exp(5000, 5000);
    me.add_money(1000);
    me.notify('<hig>你打开了龙脉初级礼包，获得了5000经验、5000潜能和1两银子。</hig>');
    return true;
}
