this.inherits(EQUIPMENT);
this.set({
    name: "龙脉圣剑",
    desc: "龙脉觉醒后从地脉深处涌出的神兵，剑身刻有远古龙纹，挥动时隐隐有龙吟之声。",
    unit: "把",
    grade: 4,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    value: 500000,
    hole_count: 2,
    prop: {
        gj: 120,
        int: 15,
        add_sh_per: 5
    }
});

this.group_name = "s1_dragon";
this.group_prop = function (count) {
    if (count == 3) {
        return { str: 15, con: 15, dex: 15, int: 15 };
    } else if (count == 5) {
        return { add_sh_per: 10, diff_sh_per: 10, max_hp: 1000 };
    } else if (count >= 6) {
        return { str: 15, con: 15, dex: 15, int: 15, add_sh_per: 10, diff_sh_per: 10, max_hp: 1000 };
    }
}
