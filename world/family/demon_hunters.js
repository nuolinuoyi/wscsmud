this.inherits(FAMILY);

this.id = "DEMON_HUNTERS";
this.name = "猎魔门";
this.top_name = "猎魔门门主";
this.top_family = "猎魔";
this.can_battle = true;
this.season = 3;

this.call = function (player, isbad) {
    if (player.gender == 2) {
        return isbad ? "猎魔妖女" : "猎魔女侠";
    } else {
        return isbad ? "猎魔狂徒" : "猎魔侠士";
    }
}
this.call_me = function (player, isbad) {
    return isbad ? "本座" : "在下";
}

this.set_titles("猎魔门主", "猎魔长老", "猎魔护法", "猎魔精英", "猎魔弟子", "猎魔新秀", "猎魔入门");

this.def_npcs = [
    ["demon_hunters/keeper", "demon_hunters/hall"],
    ["demon_hunters/elder", "demon_hunters/entrance"],
    ["pub/dadizi#DEMON_HUNTERS", "demon_hunters/yuan"],
    ["pub/mpguanli#DEMON_HUNTERS", "demon_hunters/gate"]
];

this.boss_path = "demon_hunters/keeper";

this.on_kill = function (npc, me) {
    if (this.boss) {
        this.boss.do_command("chat", "魔渊之敌必诛！" + me.family.name + "门下弟子" + me.name + "击杀我门弟子" + npc.name + "，猎魔门众弟子听令，对" + me.family.name + "格杀勿论！");
    }
}

this.on_battle = function (fam) {
    if (this.boss) {
        this.boss.do_command("chat", "猎魔出征，寸草不生！");
    }
}

this.boss_guard = ["demon_hunters/hall", "demon_hunters/yuan", "demon_hunters/secret"];
this.guard_rooms = ['demon_hunters/entrance', 'demon_hunters/path', 'demon_hunters/gate', 'demon_hunters/yuan'];

this.create_name = function (npc) {
    return ["", "", "", "猎", "魔", "诛", "灭", "天"][npc.family_level] + UTIL.name2[this.random(UTIL.name2.length)];
}

this.npc_skills = [
    ["dodge", 800],
    ["parry", 800],
    ["force", 800],
    ["unarmed", 800],
    ["staff", 800],
    ["literate", 800],
    ["demon_force", 800, "force"],
    ["demon_staff", 800, "staff"],
    ["demon_dodge", 800, "dodge"],
    ["demon_unarmed", 800, "unarmed"]
];

this.boss_skills = [
    ["dodge", 2000],
    ["parry", 2000],
    ["force", 2000],
    ["unarmed", 2000],
    ["staff", 2000],
    ["literate", 2000],
    ["demon_force2", 2000, "force"],
    ["demon_staff2", 2000, "staff"],
    ["demon_dodge", 2000, "dodge"],
    ["demon_unarmed2", 2000, "unarmed"]
];

this.boss_skills2 = [
    ["dodge", 5000],
    ["parry", 5000],
    ["force", 5000],
    ["unarmed", 5000],
    ["staff", 5000],
    ["demon_force2", 5000, "force"],
    ["demon_staff2", 5000, ["staff", "parry"]],
    ["demon_dodge2", 5000, "dodge"],
    ["demon_unarmed2", 5000, "unarmed"]
];
