this.inherits(FAMILY);

this.id = "FROST_PALACE";
this.name = "冰宫";
this.top_name = "冰宫宫主";
this.top_family = "冰系";
this.can_battle = true;
this.season = 2;

this.call = function (player, isbad) {
    if (player.gender == 2) {
        return isbad ? "冰宫妖女" : "冰宫仙子";
    } else {
        return isbad ? "冰宫狂徒" : "冰宫少侠";
    }
}
this.call_me = function (player, isbad) {
    return isbad ? "本宫" : "在下";
}

this.set_titles("冰宫宫主", "冰宫长老", "冰宫护法", "冰宫精英", "冰宫弟子", "冰宫新秀", "冰宫入门");

this.def_npcs = [
    ["frost_palace/keeper", "frost_palace/hall"],
    ["frost_palace/elder", "frost_palace/entrance"],
    ["pub/dadizi#FROST_PALACE", "frost_palace/yuan"],
    ["pub/mpguanli#FROST_PALACE", "frost_palace/gate"]
];

this.boss_path = "frost_palace/keeper";

this.on_kill = function (npc, me) {
    if (this.boss) {
        this.boss.do_command("chat", "冰帝之威不可冒犯！" + me.family.name + "门下弟子" + me.name + "击杀我宫弟子" + npc.name + "，冰宫众弟子听令，对" + me.family.name + "格杀勿论！");
    }
}

this.on_battle = function (fam) {
    if (this.boss) {
        this.boss.do_command("chat", "冰封万里，战意凛然！");
    }
}

this.boss_guard = ["frost_palace/hall", "frost_palace/yuan", "frost_palace/secret"];
this.guard_rooms = ['frost_palace/entrance', 'frost_palace/path', 'frost_palace/gate', 'frost_palace/yuan'];

this.create_name = function (npc) {
    return ["", "", "", "冰", "霜", "寒", "雪", "冰"][npc.family_level] + UTIL.name2[this.random(UTIL.name2.length)];
}

this.npc_skills = [
    ["dodge", 800],
    ["parry", 800],
    ["force", 800],
    ["unarmed", 800],
    ["blade", 800],
    ["literate", 800],
    ["frost_force", 800, "force"],
    ["frost_blade", 800, "blade"],
    ["frost_dodge", 800, "dodge"],
    ["frost_unarmed", 800, "unarmed"]
];

this.boss_skills = [
    ["dodge", 2000],
    ["parry", 2000],
    ["force", 2000],
    ["unarmed", 2000],
    ["blade", 2000],
    ["literate", 2000],
    ["frost_force2", 2000, "force"],
    ["frost_blade2", 2000, "blade"],
    ["frost_dodge", 2000, "dodge"],
    ["frost_unarmed2", 2000, "unarmed"]
];

this.boss_skills2 = [
    ["dodge", 5000],
    ["parry", 5000],
    ["force", 5000],
    ["unarmed", 5000],
    ["blade", 5000],
    ["frost_force2", 5000, "force"],
    ["frost_blade2", 5000, ["blade", "parry"]],
    ["frost_dodge2", 5000, "dodge"],
    ["frost_unarmed2", 5000, "unarmed"]
];
