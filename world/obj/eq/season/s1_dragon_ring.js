this.inherits(EQUIPMENT);
this.set({
    name: "龙脉指环",
    desc: "凝聚龙脉精华而成的指环，佩戴者攻击时有概率触发龙脉之力。",
    unit: "枚",
    grade: 4,
    eq_type: EQUIP_TYPE.RING,
    value: 300000,
    hole_count: 2,
    prop: {
        gj: 30,
        str: 15,
        bj_per: 5
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
