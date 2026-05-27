this.inherits(EQUIPMENT);
this.set({
    name: "龙脉冠",
    desc: "龙脉宗掌门传承之冠，镶嵌有龙脉结晶，佩戴者心神清明，修炼事半功倍。",
    unit: "顶",
    grade: 4,
    eq_type: EQUIP_TYPE.HEAD,
    value: 350000,
    hole_count: 2,
    prop: {
        fy: 35,
        int: 15,
        dazuo_per: 15
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
