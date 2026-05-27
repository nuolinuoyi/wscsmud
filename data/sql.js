const db = require('./db');


module.exports = {

    connect: async function (path) {
        await db.init(path);
    },
    close: function () {
        return db.close();
    },
    getUserBy: function (type, value) {
        return this.getUser(type + "=?", [value]);
    },
    getUserByID: function (id) {
        return this.getUser("id=?", [id]);
    },
    getUser: function (cond, paras) {
        let sql = "select id,name,pwd,phone,state,level from users";

        if (cond) {
            sql += " where " + cond;
        }
        return db.get(sql, paras);
    },
    getUsers: function (cond, paras) {
        let sql = "select id,name,pwd,phone,state,create_time from users";

        if (cond) {
            sql += " where " + cond;
        }
        return db.all(sql, paras);
    },
    checkUserName: function (name) {
        let sql = "select name,phone from users where name=?";// or phone=?
        return db.get(sql, [name]);
    },
    updateUser: async function (user) {
        let sql = "update users set name=?,phone=?,pwd=? where id=?";
        let result = await db.query(sql, [user.name, user.phone, user.pwd, user.id]);
        return result.changes === 1;
    },
    createUser: async function (user) {

        let result = await db.query("insert into users(name,pwd,phone) values(?,?,?)",
            [user.name, user.pwd, user.phone]);
        if (!(result.lastID > 0)) return false;
        user.id = result.lastID;
        return true;
    },



    getServers: function () {
        let sql = "select id,name, ip,port,istest,isdef,create_time,start_time from servers";

        return db.all(sql);
    },
    getServer: function (id) {
        let sql = "select id,name, ip,port,istest,isdef from servers where id=?";

        return db.get(sql, [id]);
    },
    saveServer: async function (data) {
        let sql = "update servers set name=?, ip=?,port=?,istest=?,isdef=? where id=?";

        let result = await db.query(sql, [data.name, data.ip, data.port, data.istest, data.isdef, data.id]);

        return result.changes === 1;
    },
    addServer: async function (data) {
        let sql = "insert into servers(name,ip,port,istest,isdef) values(?,?,?,?,?)";
        let result = await db.query(sql,
            [data.name, data.ip, data.port, data.istest, data.isdef]);

        return result.lastID;

    },
    deleteServer: function (id) {
        return db.query("delete from servers where id =?", [id]);
    },

    getRoles: function (uid, server) {
        return db.all("select a.id,a.name,a.title,a.level from players a where a.userid=? and a.sid=?",
            [uid, server]);

    },
    addRole: function (role) {

        return db.query("insert into players(userid,id,name,title,level,sid,data) values(?,?,?,?,?,?,?)",
            [role.userid, role.id, role.name, role.title, role.level, role.server, role.data]);

    },
    deleteRole: async function (userid, roleid) {

        let sql = "insert into players_bak(id,name,userid,title,level,sid,data,create_time,update_time) select id,name,userid,title,level,sid,data,create_time,update_time from players where id=? and userid=?";
        let result = await db.query(sql, [roleid, userid]);
        if (result.changes != 1)
            return false;
        sql = "delete from players where id=? and userid=?";
        result = await db.query(sql, [roleid, userid]);
        if (result.changes != 1)
            return false;
        return true;

    },
    saveRole: function (role) {
        return db.query("update players set name=?,title=?,level=?,data=? where userid=? and id=?",
            [role.name, role.title, role.level, role.data, role.userid, role.id]);
    },
    exitsRoleName: function (name) {
        let sql = "select name from players where name=?";// or phone=?
        return db.get(sql, [name]);
    },

    getData: function (id) {
        return db.get("select a.id,a.name,a.title,a.level,a.data,b.pwd,b.level user_level from players a left join users b on a.userid=b.id  where  a.userid=?",
            [id]);
    },
    updateRoleName: function (id, name) {

        WORLD_DATA.query_db("update players set name=? where id=? ",
            [name, id]);

    },
    updateUserid: function (id, fromuserid, touserid) {
        WORLD_DATA.query_db("update player set userid=? where id=? and userid=?",
            [touserid, id, fromuserid]);
    },

    // ========== 赛季相关查询 ==========

    getSeasonPlayers: function (seasonId, offset, limit) {
        return db.all(
            "select id,season_id,player_id,player_name,userid,sid,level,title,status,create_time from season_players where season_id=? order by level desc, create_time asc limit ? offset ?",
            [seasonId, limit || 50, offset || 0]
        );
    },
    getSeasonPlayerCount: function (seasonId) {
        return db.get("select count(*) as count from season_players where season_id=?", [seasonId]);
    },
    getSeasonPlayerData: function (seasonId, playerId) {
        return db.get(
            "select sp.*, u.name as username from season_players sp left join users u on sp.userid=u.id where sp.season_id=? and sp.player_id=?",
            [seasonId, playerId]
        );
    },
    getSeasonPlayerByUserid: function (seasonId, userid) {
        return db.all(
            "select id,player_id,player_name,level,title,status from season_players where season_id=? and userid=?",
            [seasonId, userid]
        );
    },
    addSeasonPlayer: function (role) {
        return db.query(
            "insert into season_players(season_id,player_id,player_name,userid,sid,level,title,data,season_data) values(?,?,?,?,?,?,?,?,?)",
            [role.season_id, role.player_id, role.player_name, role.userid, role.sid, role.level, role.title, role.data, role.season_data]
        );
    },
    saveSeasonPlayer: function (role) {
        return db.query(
            "update season_players set player_name=?,level=?,title=?,data=?,season_data=?,update_time=CURRENT_TIMESTAMP where season_id=? and player_id=?",
            [role.player_name, role.level, role.title, role.data, role.season_data, role.season_id, role.player_id]
        );
    },
    deleteSeasonPlayer: function (seasonId, playerId) {
        return db.query("delete from season_players where season_id=? and player_id=?", [seasonId, playerId]);
    },
    updateSeasonPlayerData: function (seasonId, playerId, data, seasonData) {
        return db.query(
            "update season_players set data=?,season_data=?,update_time=CURRENT_TIMESTAMP where season_id=? and player_id=?",
            [data, seasonData, seasonId, playerId]
        );
    },
    updateSeasonPlayerLevel: function (seasonId, playerId, level, title) {
        return db.query(
            "update season_players set level=?,title=?,update_time=CURRENT_TIMESTAMP where season_id=? and player_id=?",
            [level, title, seasonId, playerId]
        );
    },

    getSeasonConfig: function (seasonId) {
        return db.get("select * from season_config where season_id=?", [seasonId]);
    },
    getAllSeasonConfigs: function () {
        return db.all("select * from season_config order by season_id");
    },
    saveSeasonConfig: function (seasonId, config, status) {
        let existing = db.get("select id from season_config where season_id=?", [seasonId]);
        if (existing) {
            return db.query(
                "update season_config set config=?,status=?,update_time=CURRENT_TIMESTAMP where season_id=?",
                [config, status, seasonId]
            );
        }
        return db.query(
            "insert into season_config(season_id,config,status) values(?,?,?)",
            [seasonId, config, status]
        );
    },
    updateSeasonStatus: function (seasonId, status) {
        return db.query(
            "update season_config set status=?,update_time=CURRENT_TIMESTAMP where season_id=?",
            [status, seasonId]
        );
    },

    addSeasonReward: function (seasonId, playerId, rewardType, rewardData) {
        return db.query(
            "insert into season_rewards(season_id,player_id,reward_type,reward_data) values(?,?,?,?)",
            [seasonId, playerId, rewardType, rewardData]
        );
    },
    getSeasonRewards: function (seasonId, playerId) {
        return db.all(
            "select * from season_rewards where season_id=? and player_id=?",
            [seasonId, playerId]
        );
    },
    claimSeasonReward: function (rewardId) {
        return db.query("update season_rewards set claimed=1 where id=?", [rewardId]);
    },

    searchSeasonPlayers: function (seasonId, keyword) {
        return db.all(
            "select id,season_id,player_id,player_name,userid,sid,level,title,status from season_players where season_id=? and (player_name like ? or player_id=?) limit 50",
            [seasonId, '%' + keyword + '%', keyword]
        );
    }

};

