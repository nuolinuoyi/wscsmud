// 玩家搜索页面
export class PlayerSearchPage {
    constructor(container, api) {
        this.container = container;
        this.api = api;
        this.currentSeasonId = 1;
    }

    async render() {
        // 先获取当前赛季
        const seasonRes = await this.api.getSeason();
        if (seasonRes && seasonRes.code === 1 && seasonRes.result.config) {
            this.currentSeasonId = seasonRes.result.config.id;
        }

        this.container.innerHTML = `
            <h2 style="margin-bottom:24px">玩家搜索</h2>
            <div class="card">
                <div class="card-header">搜索赛季玩家</div>
                <div class="card-body">
                    <div class="search-bar">
                        <input type="text" class="form-control" id="search-keyword" placeholder="输入玩家名称或ID..." />
                        <button class="btn btn-primary" id="btn-search">搜索</button>
                    </div>
                    <div id="search-results"></div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">赛季玩家列表</div>
                <div class="card-body">
                    <div id="player-list"><div class="loading">加载中...</div></div>
                    <div class="pagination" id="pagination"></div>
                </div>
            </div>
        `;

        // 搜索事件
        document.getElementById('btn-search').addEventListener('click', () => this.search());
        document.getElementById('search-keyword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.search();
        });

        // 加载玩家列表
        this.offset = 0;
        this.limit = 20;
        await this.loadPlayers();
    }

    async search() {
        const keyword = document.getElementById('search-keyword').value.trim();
        if (!keyword) return;

        const resultsDiv = document.getElementById('search-results');
        resultsDiv.innerHTML = '<div class="loading">搜索中...</div>';

        const res = await this.api.searchSeasonPlayer(this.currentSeasonId, keyword);
        if (res && res.code === 1) {
            const players = res.result;
            if (players.length === 0) {
                resultsDiv.innerHTML = '<p>未找到匹配的玩家</p>';
            } else {
                resultsDiv.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>角色名</th>
                                <th>ID</th>
                                <th>境界</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${players.map(p => `
                                <tr>
                                    <td>${p.player_name}</td>
                                    <td>${p.player_id}</td>
                                    <td>${p.level}</td>
                                    <td><span class="tag tag-active">${p.status === 1 ? '正常' : '异常'}</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" onclick="window.__viewPlayer('${p.player_id}')">查看详情</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        } else {
            resultsDiv.innerHTML = '<p>搜索失败: ' + (res ? res.result : '网络错误') + '</p>';
        }
    }

    async loadPlayers() {
        const listDiv = document.getElementById('player-list');
        const res = await this.api.getSeasonPlayers(this.currentSeasonId, this.offset, this.limit);
        if (res && res.code === 1) {
            const { players, total } = res.result;
            if (players.length === 0) {
                listDiv.innerHTML = '<p>暂无赛季玩家数据</p>';
            } else {
                listDiv.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>角色名</th>
                                <th>ID</th>
                                <th>境界</th>
                                <th>状态</th>
                                <th>创建时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${players.map(p => `
                                <tr>
                                    <td>${p.player_name}</td>
                                    <td>${p.player_id}</td>
                                    <td>${p.level}</td>
                                    <td><span class="tag tag-active">${p.status === 1 ? '正常' : '异常'}</span></td>
                                    <td>${p.create_time || '-'}</td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" onclick="window.__viewPlayer('${p.player_id}')">查看详情</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;

                // 分页
                this.renderPagination(total);
            }
        }

        // 绑定查看详情
        window.__viewPlayer = (playerId) => this.viewPlayer(playerId);
    }

    renderPagination(total) {
        const paginationDiv = document.getElementById('pagination');
        const totalPages = Math.ceil(total / this.limit);
        const currentPage = Math.floor(this.offset / this.limit) + 1;

        let html = '';
        html += `<button ${currentPage <= 1 ? 'disabled' : ''} onclick="window.__prevPage()">上一页</button>`;
        html += `<span style="padding:6px 12px">第${currentPage}页 / 共${totalPages}页 (${total}条)</span>`;
        html += `<button ${currentPage >= totalPages ? 'disabled' : ''} onclick="window.__nextPage()">下一页</button>`;
        paginationDiv.innerHTML = html;

        window.__prevPage = () => {
            this.offset = Math.max(0, this.offset - this.limit);
            this.loadPlayers();
        };
        window.__nextPage = () => {
            this.offset += this.limit;
            this.loadPlayers();
        };
    }

    async viewPlayer(playerId) {
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        content.innerHTML = '<div class="loading">加载中...</div>';
        overlay.style.display = 'flex';

        const res = await this.api.getSeasonPlayerData(this.currentSeasonId, playerId);
        if (res && res.code === 1) {
            const p = res.result;
            const data = p.data || {};
            const seasonData = p.season_data || {};
            const prop = data.prop || [];

            content.innerHTML = `
                <div class="modal-header">玩家详情 - ${p.player_name}</div>
                <div style="max-height:60vh;overflow-y:auto">
                    <h4>基本信息</h4>
                    <table class="table">
                        <tr><td>角色ID</td><td>${p.player_id}</td></tr>
                        <tr><td>角色名</td><td>${p.player_name}</td></tr>
                        <tr><td>境界</td><td>${p.level}</td></tr>
                        <tr><td>称号</td><td>${p.title || '-'}</td></tr>
                        <tr><td>用户ID</td><td>${p.userid}</td></tr>
                        <tr><td>服务器ID</td><td>${p.sid}</td></tr>
                    </table>

                    <h4 style="margin-top:16px">属性</h4>
                    <table class="table">
                        <tr><td>臂力</td><td>${prop[0] || 0}</td><td>根骨</td><td>${prop[1] || 0}</td></tr>
                        <tr><td>身法</td><td>${prop[2] || 0}</td><td>悟性</td><td>${prop[3] || 0}</td></tr>
                        <tr><td>气血</td><td>${prop[11] || 0}</td><td>内力</td><td>${prop[12] || 0}</td></tr>
                        <tr><td>经验</td><td>${prop[7] || 0}</td><td>潜能</td><td>${prop[8] || 0}</td></tr>
                        <tr><td>金钱</td><td>${prop[14] || 0}</td><td>元宝</td><td>${prop[17] || 0}</td></tr>
                    </table>

                    <h4 style="margin-top:16px">赛季数据</h4>
                    <table class="table">
                        <tr><td>赛季经验</td><td>${seasonData.season_exp || 0}</td></tr>
                        <tr><td>赛季积分</td><td>${seasonData.season_score || 0}</td></tr>
                        <tr><td>已领取里程碑</td><td>${(seasonData.milestones_claimed || []).join(', ') || '无'}</td></tr>
                    </table>

                    <h4 style="margin-top:16px">物品栏</h4>
                    <p>物品数量: ${(data.items || []).length}</p>
                    <p>装备数量: ${(data.eq || []).filter(e => e).length}</p>
                    <p>仓库数量: ${(data.stores || []).length}</p>

                    <h4 style="margin-top:16px">技能</h4>
                    <p>技能数量: ${data.skills ? Object.keys(data.skills).length : 0}</p>
                </div>
                <div class="btn-group" style="margin-top:20px">
                    <button class="btn btn-primary" onclick="window.__editPlayer('${p.player_id}')">修改属性</button>
                    <button class="btn btn-success" onclick="window.__sendItem('${p.player_id}')">发送物品</button>
                    <button class="btn btn-danger" onclick="window.__kickPlayer('${p.player_id}')">踢出游戏</button>
                    <button class="btn" onclick="document.getElementById('modal-overlay').style.display='none'">关闭</button>
                </div>
            `;

            // 绑定操作
            window.__editPlayer = (pid) => this.showEditModal(pid);
            window.__sendItem = (pid) => this.showSendItemModal(pid);
            window.__kickPlayer = async (pid) => {
                if (!confirm('确定要踢出该玩家吗？')) return;
                const kickRes = await this.api.kickPlayer(pid);
                alert(kickRes && kickRes.code === 1 ? '已踢出' : (kickRes ? kickRes.result : '操作失败'));
            };
        } else {
            content.innerHTML = `<div class="modal-header">错误</div><p>${res ? res.result : '加载失败'}</p>`;
        }
    }

    showEditModal(playerId) {
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        content.innerHTML = `
            <div class="modal-header">修改玩家属性 - ${playerId}</div>
            <div class="form-group">
                <label>经验</label>
                <input type="number" class="form-control" id="edit-exp" />
            </div>
            <div class="form-group">
                <label>潜能</label>
                <input type="number" class="form-control" id="edit-pot" />
            </div>
            <div class="form-group">
                <label>金钱</label>
                <input type="number" class="form-control" id="edit-money" />
            </div>
            <div class="form-group">
                <label>元宝</label>
                <input type="number" class="form-control" id="edit-cash" />
            </div>
            <div class="btn-group">
                <button class="btn btn-primary" id="btn-save-stats">保存</button>
                <button class="btn" onclick="document.getElementById('modal-overlay').style.display='none'">取消</button>
            </div>
        `;

        document.getElementById('btn-save-stats').addEventListener('click', async () => {
            const stats = {};
            const exp = document.getElementById('edit-exp').value;
            const pot = document.getElementById('edit-pot').value;
            const money = document.getElementById('edit-money').value;
            const cash = document.getElementById('edit-cash').value;
            if (exp) stats.exp = parseInt(exp);
            if (pot) stats.pot = parseInt(pot);
            if (money) stats.money = parseInt(money);
            if (cash) stats.cash_money = parseInt(cash);

            const res = await this.api.modifyPlayerStats(playerId, stats);
            if (res && res.code === 1) {
                alert('属性已修改');
                overlay.style.display = 'none';
            } else {
                alert(res ? res.result : '修改失败');
            }
        });
    }

    showSendItemModal(playerId) {
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        content.innerHTML = `
            <div class="modal-header">发送物品 - ${playerId}</div>
            <div class="form-group">
                <label>物品路径</label>
                <input type="text" class="form-control" id="send-item-path" placeholder="例如: eq/season/s1_dragon_sword" />
            </div>
            <div class="form-group">
                <label>数量</label>
                <input type="number" class="form-control" id="send-item-count" value="1" />
            </div>
            <div class="btn-group">
                <button class="btn btn-primary" id="btn-send-item">发送</button>
                <button class="btn" onclick="document.getElementById('modal-overlay').style.display='none'">取消</button>
            </div>
        `;

        document.getElementById('btn-send-item').addEventListener('click', async () => {
            const path = document.getElementById('send-item-path').value.trim();
            const count = parseInt(document.getElementById('send-item-count').value) || 1;
            if (!path) return alert('请输入物品路径');
            const res = await this.api.sendItemToPlayer(playerId, path, count);
            if (res && res.code === 1) {
                alert('物品已发送');
                overlay.style.display = 'none';
            } else {
                alert(res ? res.result : '发送失败');
            }
        });
    }

    destroy() {}
}
