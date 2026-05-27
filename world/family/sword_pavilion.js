this.inherits(FAMILY);

this.id = "SWORD_PAVILION";
this.name = "剑阁";
this.top_name = "剑阁阁主";
this.top_family = "剑道";
this.can_battle = true;
this.season = 4;

this.call = function (player, isbad) {
    if (player.gender == 2) {
        return isbad ? "剑阁妖女" : "剑阁仙子";
    } else {
        return isbad ? "剑阁狂徒" : "剑阁剑客";
    }
}
this.call_me = function (player, isbad) {
    return isbad ? "本座" : "在下";
}

this.set_titles("剑阁阁主", "剑阁长老", "剑阁护法", "剑阁精英", "剑阁弟子", "剑阁新秀", "剑阁入门");

this.def_npcs = [
    ["sword_pavilion/keeper", "sword_pavilion/hall"],
    ["sword_pavilion/elder", "sword_pavilion/entrance"],
    ["pub/dadizi#SWORD_PAVILION", "sword_pavilion/yuan"],
    ["pub/mpguanli#SWORD_PAVILION", "sword_pavilion/gate"]
];

this.boss_path = "sword_pavilion/keeper";

this.on_kill = function (npc, me) {
    if (this.boss) {
        this.boss.do_command("chat", "天剑之威不容亵渎！" + me.family.name + "门下弟子" + me.name + "击杀我阁弟子" + npc.name + "，剑阁众弟子听令，对" + me.family.name + "格杀勿论！");
    }
}

this.on_battle = function (fam) {
    if (this.boss) {
        this.boss.do_command("chat", "剑意冲天，一战定乾坤！");
    }
}

this.boss_guard = ["sword_pavilion/hall", "sword_pavilion/yuan", "sword_pavilion/secret"];
this.guard_rooms = ['sword_pavilion/entrance', 'sword_pavilion/path', 'sword_pavilion/gate', 'sword_pavilion/yuan'];

this.create_name = function (npc) {
    return ["", "", "", "剑", "锋", "凌", "绝", "天"][npc.family_level] + UTIL.name2[this.random(UTIL.name2.length)];
}

this.npc_skills = [
    ["dodge", 800],
    ["parry", 800],
    ["force", 800],
    ["unarmed", 800],
    ["sword", 800],
    ["literate", 800],
    ["celestial_force", 800, "force"],
    ["celestial_sword", 800, "sword"],
    ["celestial_dodge", 800, "dodge"],
    ["celestial_unarmed", 800, "unarmed"]
];

this.boss_skills = [
    ["dodge", 2000],
    ["parry", 2000],
    ["force", 2000],
    ["unarmed", 2000],
    ["sword", 2000],
    ["literate", 2000],
    ["celestial_force2", 2000, "force"],
    ["celestial_sword2", 2000, "sword"],
    ["celestial_dodge", 2000, "dodge"],
    ["celestial_unarmed2", 2000, "unarmed"]
];

this.boss_skills2 = [
    ["dodge", 5000],
    ["parry", 5000],
    ["force", 5000],
    ["unarmed", 5000],
    ["sword", 5000],
    ["celestial_force2", 5000, "force"],
    ["celestial_sword2", 5000, ["sword", "parry"]],
    ["celestial_dodge2", 5000, "dodge"],
    ["celestial_unarmed2", 5000, "unarmed"]
];
