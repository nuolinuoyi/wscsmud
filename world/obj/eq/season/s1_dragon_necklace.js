this.inherits(EQUIPMENT);
this.set({
    name: "龙脉灵链",
    desc: "以龙脉精华凝炼的项链，佩戴者气血充盈，恢复力大增。",
    unit: "条",
    grade: 4,
    eq_type: EQUIP_TYPE.NECKLACE,
    value: 300000,
    hole_count: 2,
    prop: {
        max_hp: 300,
        max_mp: 200,
        recover_per: 10
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
