this.inherits(EQUIPMENT);
this.set({
    name: "龙脉战袍",
    desc: "以龙脉灵气编织而成的战袍，穿戴者可感受到体内龙脉之力的涌动。",
    unit: "件",
    grade: 4,
    eq_type: EQUIP_TYPE.CLOTH,
    value: 400000,
    hole_count: 2,
    prop: {
        fy: 50,
        con: 15,
        max_hp: 500
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
