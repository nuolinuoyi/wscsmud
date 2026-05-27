this.inherits(EQUIPMENT);
this.set({
    name: "龙脉云靴",
    desc: "踏龙脉之气而行，轻若无物，可日行千里而不觉疲惫。",
    unit: "双",
    grade: 4,
    eq_type: EQUIP_TYPE.SHOES,
    value: 350000,
    hole_count: 2,
    prop: {
        fy: 35,
        dex: 15,
        ds_per: 5
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
