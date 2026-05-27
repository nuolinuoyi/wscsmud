this.inherits(FAMILY);

this.id = "DRAGON_VEIN";
this.name = "龙脉宗";
this.top_name = "龙脉宗掌门";
this.top_family = "龙脉";
this.can_battle = true;
this.season = 1;

this.call = function (player, isbad) {
    if (player.gender == 2) {
        return isbad ? "龙脉妖女" : "龙脉仙子";
    } else {
        return isbad ? "龙脉狂徒" : "龙脉少侠";
    }
}
this.call_me = function (player, isbad) {
    return isbad ? "本座" : "在下";
}

this.set_titles("龙脉掌门", "龙脉长老", "龙脉护法", "龙脉精英", "龙脉弟子", "龙脉新秀", "龙脉入门");

this.def_npcs = [
    ["dragon_vein/keeper", "dragon_vein/hall"],
    ["dragon_vein/elder", "dragon_vein/entrance"],
    ["pub/dadizi#DRAGON_VEIN", "dragon_vein/yuan"],
    ["pub/mpguanli#DRAGON_VEIN", "dragon_vein/gate"]
];

this.boss_path = "dragon_vein/keeper";

this.on_kill = function (npc, me) {
    if (this.boss) {
        this.boss.do_command("chat", "龙脉之力不可侵犯！" + me.family.name + "门下弟子" + me.name + "击杀我宗弟子" + npc.name + "，龙脉宗众弟子听令，对" + me.family.name + "格杀勿论！");
    }
}

this.on_battle = function (fam) {
    if (this.boss) {
        this.boss.do_command("chat", "龙脉觉醒，战意冲天！");
    }
}

this.boss_guard = ["dragon_vein/hall", "dragon_vein/yuan", "dragon_vein/secret"];
this.guard_rooms = ['dragon_vein/entrance', 'dragon_vein/path', 'dragon_vein/gate', 'dragon_vein/yuan'];

this.create_name = function (npc) {
    return ["", "", "", "龙", "脉", "玄", "天", "圣"][npc.family_level] + UTIL.name2[this.random(UTIL.name2.length)];
}

this.npc_skills = [
    ["dodge", 800],
    ["parry", 800],
    ["force", 800],
    ["unarmed", 800],
    ["sword", 800],
    ["literate", 800],
    ["dragon_vein_force", 800, "force"],
    ["dragon_vein_sword", 800, "sword"],
    ["dragon_vein_dodge", 800, "dodge"],
    ["dragon_vein_unarmed", 800, "unarmed"]
];

this.boss_skills = [
    ["dodge", 2000],
    ["parry", 2000],
    ["force", 2000],
    ["unarmed", 2000],
    ["sword", 2000],
    ["literate", 2000],
    ["dragon_vein_force2", 2000, "force"],
    ["dragon_vein_sword2", 2000, "sword"],
    ["dragon_vein_dodge", 2000, "dodge"],
    ["dragon_vein_unarmed2", 2000, "unarmed"]
];

this.boss_skills2 = [
    ["dodge", 5000],
    ["parry", 5000],
    ["force", 5000],
    ["unarmed", 5000],
    ["sword", 5000],
    ["dragon_vein_force2", 5000, "force"],
    ["dragon_vein_sword2", 5000, ["sword", "parry"]],
    ["dragon_vein_dodge2", 5000, "dodge"],
    ["dragon_vein_unarmed2", 5000, "unarmed"]
];
