this.inherits(FAMILY);

this.id = "SHADOW_CLAN";
this.name = "暗影族";
this.top_name = "暗影族族长";
this.top_family = "暗影";
this.can_battle = true;
this.season = 5;

this.call = function (player, isbad) {
    if (player.gender == 2) {
        return isbad ? "暗影妖女" : "暗影女刺客";
    } else {
        return isbad ? "暗影狂徒" : "暗影刺客";
    }
}
this.call_me = function (player, isbad) {
    return isbad ? "本座" : "在下";
}

this.set_titles("暗影族长", "暗影长老", "暗影护法", "暗影精英", "暗影弟子", "暗影新秀", "暗影入门");

this.def_npcs = [
    ["shadow_clan/keeper", "shadow_clan/hall"],
    ["shadow_clan/elder", "shadow_clan/entrance"],
    ["pub/dadizi#SHADOW_CLAN", "shadow_clan/yuan"],
    ["pub/mpguanli#SHADOW_CLAN", "shadow_clan/gate"]
];

this.boss_path = "shadow_clan/keeper";

this.on_kill = function (npc, me) {
    if (this.boss) {
        this.boss.do_command("chat", "血月之下无处遁形！" + me.family.name + "门下弟子" + me.name + "击杀我族弟子" + npc.name + "，暗影族众弟子听令，对" + me.family.name + "格杀勿论！");
    }
}

this.on_battle = function (fam) {
    if (this.boss) {
        this.boss.do_command("chat", "暗影降临，血月当空！");
    }
}

this.boss_guard = ["shadow_clan/hall", "shadow_clan/yuan", "shadow_clan/secret"];
this.guard_rooms = ['shadow_clan/entrance', 'shadow_clan/path', 'shadow_clan/gate', 'shadow_clan/yuan'];

this.create_name = function (npc) {
    return ["", "", "", "影", "暗", "夜", "血", "魔"][npc.family_level] + UTIL.name2[this.random(UTIL.name2.length)];
}

this.npc_skills = [
    ["dodge", 800],
    ["parry", 800],
    ["force", 800],
    ["unarmed", 800],
    ["throwing", 800],
    ["literate", 800],
    ["shadow_force", 800, "force"],
    ["shadow_throwing", 800, "throwing"],
    ["shadow_dodge", 800, "dodge"],
    ["shadow_unarmed", 800, "unarmed"]
];

this.boss_skills = [
    ["dodge", 2000],
    ["parry", 2000],
    ["force", 2000],
    ["unarmed", 2000],
    ["throwing", 2000],
    ["literate", 2000],
    ["shadow_force2", 2000, "force"],
    ["shadow_throwing2", 2000, "throwing"],
    ["shadow_dodge", 2000, "dodge"],
    ["shadow_unarmed2", 2000, "unarmed"]
];

this.boss_skills2 = [
    ["dodge", 5000],
    ["parry", 5000],
    ["force", 5000],
    ["unarmed", 5000],
    ["throwing", 5000],
    ["shadow_force2", 5000, "force"],
    ["shadow_throwing2", 5000, ["throwing", "parry"]],
    ["shadow_dodge2", 5000, "dodge"],
    ["shadow_unarmed2", 5000, "unarmed"]
];
