this.inherits(COMMAND);
this.command = "createseason";
var name_reg = /^[一-龥]{2,5}$/;
this.allow_login = true;
this.enter = function (me, pars) {
    if (me.id) return me.send('{"type":"regist","result":"请刷新页面重新操作"}');

    if (!SEASON || !SEASON.isActive()) {
        return me.send('{"type":"regist","result":"当前没有活跃的赛季"}');
    }

    var config = SEASON.getConfig();
    var rules = config.rules;

    pars = pars.split(' ');
    var name = pars[0], gender = parseInt(pars[1]),
        str = parseInt(pars[2]), con = parseInt(pars[3]), dex = parseInt(pars[4]), int = parseInt(pars[5]);

    if (gender != 1 && gender != 2) {
        return me.send('{"type":"regist","result":"注册信息错误"}');
    }
    if (!name_reg.test(name)) {
        return me.send('{"type":"regist","result":"姓名需要是2-5个汉字"}');
    }
    if (!UTIL.check_word(name)) {
        return me.send('{"type":"regist","result":"你不能用这个名字"}');
    }
    if (WORLD.find_user(name)) {
        return me.send('{"type":"regist","result":"这个名字已经有人用了"}');
    }

    var statMin = rules.stat_min || 15;
    var statMax = rules.stat_max || 30;
    var statSum = rules.stat_sum || 80;

    if (str < statMin || str > statMax) {
        return me.send('{"type":"regist","result":"臂力属性需要在' + statMin + '-' + statMax + '之间。"}');
    }
    if (con < statMin || con > statMax) {
        return me.send('{"type":"regist","result":"根骨属性需要在' + statMin + '-' + statMax + '之间。"}');
    }
    if (dex < statMin || dex > statMax) {
        return me.send('{"type":"regist","result":"身法属性需要在' + statMin + '-' + statMax + '之间。"}');
    }
    if (int < statMin || int > statMax) {
        return me.send('{"type":"regist","result":"悟性属性需要在' + statMin + '-' + statMax + '之间。"}');
    }
    if (str + con + dex + int != statSum) {
        return me.send('{"type":"regist","result":"属性之和必须等于' + statSum + '"}');
    }

    me.ip_address = me.socket.remoteAddress;
    if (!WORLD.USERLOGIN.check_user(me)) return;

    me.name = name;
    me.id = UTIL.create_id();
    me.gender = gender;
    me.level = 0;
    me.exp = 0;
    me.pot = 0;
    me.str = str;
    me.con = con;
    me.dex = dex;
    me.int = int;
    me.per = parseInt(Math.random() * 5) + 20;
    me.kar = 20;
    me.limit_mp = 0;
    me.max_mp = 100;
    me.recount();
    me.hp = me.max_hp;
    me.mp = me.max_mp;
    me.reg_time = parseInt(Date.now() / 60000);

    // 赛季标记
    me.set_temp("season", config.id);

    // 赛季起始装备
    var startEqs = rules.starting_equipment || ["eq/lv0/cloth"];
    for (var i = 0; i < startEqs.length; i++) {
        me.set_objects([startEqs[i], 1, 1]);
    }

    // 赛季起始金钱
    if (rules.starting_money) {
        me.money = rules.starting_money;
    }

    me.set_temp("new", 1);
    me.set_temp("sr", 1);
    me.set_temp("hy_ct", 50);
    me.set_setting("ban_pk", 1);
    me.eq_groups = [];
    me.sk_groups = [];
    me.skills = {};

    this.save2db(me);
}

this.save2db = async function (me) {
    try {
        var roleData = me.getData();
        roleData.server = WORLD.SERVERID;
        var suc = await WORLD.DB.addRole(roleData);
        if (suc) {
            // 同时记录到赛季玩家表
            var seasonData = SEASON.getDefaultSeasonData();
            await WORLD.DB.addSeasonPlayer({
                season_id: SEASON.getConfig().id,
                player_id: me.id,
                player_name: me.name,
                userid: me.userid,
                sid: WORLD.SERVERID,
                level: me.level,
                title: me.title || '普通百姓',
                data: roleData.data,
                season_data: JSON.stringify(seasonData)
            });

            WORLD.USERS.push(me);
            me.wait_input = null;
            me.do_login();

            // 通知赛季创建成功
            me.notify('<hiy>【赛季】你已创建赛季角色「' + me.name + '」，赛季「' + SEASON.getConfig().name + '」祝你武运昌隆！');
        } else {
            return me.send('{"type":"regist","result":"创建角色失败"}');
        }
    } catch (err) {
        if (err.errno == 1062) {
            me.id = null;
            return me.send('{"type":"regist","result":"角色名称重复，请重新输入"}');
        } else {
            console.log("赛季角色创建失败", err);
            return me.send('{"type":"regist","result":"创建角色失败"}');
        }
    }
}
