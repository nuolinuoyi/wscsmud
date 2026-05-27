this.inherits(OBJ);
this.unit = "个";
this.name = "龙脉中级礼包";
this.desc = "第一赛季里程碑奖励，内含珍贵道具。";
this.grade = 2;
this.combined = false;
this.on_use = function (me) {
    me.add_exp(20000, 20000);
    me.add_money(5000);
    me.notify('<hig>你打开了龙脉中级礼包，获得了20000经验、20000潜能和5两银子。</hig>');
    return true;
}
