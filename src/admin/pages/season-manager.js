// 赛季管理页面
export class SeasonManagerPage {
    constructor(container, api) {
        this.container = container;
        this.api = api;
    }

    async render() {
        this.container.innerHTML = '<div class="loading">加载中...</div>';

        const [seasonsRes, currentRes] = await Promise.all([
            this.api.getSeasons(),
            this.api.getSeason()
        ]);

        const seasons = seasonsRes && seasonsRes.code === 1 ? seasonsRes.result : [];
        const current = currentRes && currentRes.code === 1 ? currentRes.result : {};

        this.container.innerHTML = `
            <h2 style="margin-bottom:24px">赛季管理</h2>

            <div class="card">
                <div class="card-header">当前赛季</div>
                <div class="card-body">
                    ${current.current ? `
                        <p><strong>赛季ID：</strong>${current.current.season_id}</p>
                        <p><strong>状态：</strong><span class="tag ${current.current.status === 'active' ? 'tag-active' : 'tag-ended'}">${current.current.status === 'active' ? '进行中' : '已结束'}</span></p>
                        <p><strong>最后更新：</strong>${current.current.last_updated}</p>
                        ${current.config ? `<p><strong>赛季名称：</strong>${current.config.name}</p>` : ''}
                    ` : '<p>无当前赛季配置</p>'}
                </div>
            </div>

            <div class="card">
                <div class="card-header">赛季列表</div>
                <div class="card-body">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>名称</th>
                                <th>主题</th>
                                <th>开始时间</th>
                                <th>结束时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${seasons.map(s => `
                                <tr>
                                    <td>${s.id}</td>
                                    <td>${s.name}</td>
                                    <td>${s.theme}</td>
                                    <td>${s.start_time}</td>
                                    <td>${s.end_time}</td>
                                    <td>
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-primary" onclick="window.__switchSeason(${s.id})">切换到此赛季</button>
                                            <button class="btn btn-sm btn-success" onclick="window.__editSeason(${s.id})">编辑配置</button>
                                            <button class="btn btn-sm" onclick="window.__viewSeasonPlayers(${s.id})">查看玩家</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // 绑定事件
        window.__switchSeason = (id) => this.switchSeason(id);
        window.__editSeason = (id) => this.editSeason(id);
        window.__viewSeasonPlayers = (id) => this.viewSeasonPlayers(id);
    }

    async switchSeason(seasonId) {
        if (!confirm(`确定要切换到赛季 ${seasonId} 吗？这将更改当前活跃赛季。`)) return;
        const res = await this.api.switchSeason(seasonId, 'active');
        if (res && res.code === 1) {
            alert('赛季已切换');
            this.render();
        } else {
            alert(res ? res.result : '切换失败');
        }
    }

    async editSeason(seasonId) {
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        content.innerHTML = '<div class="loading">加载中...</div>';
        overlay.style.display = 'flex';

        // 加载赛季配置
        const res = await this.api.getSeason();
        let config = null;
        if (res && res.code === 1 && res.result.config && res.result.config.id === seasonId) {
            config = res.result.config;
        }

        if (!config) {
            // 尝试从列表中获取
            const seasonsRes = await this.api.getSeasons();
            if (seasonsRes && seasonsRes.code === 1) {
                const found = seasonsRes.result.find(s => s.id === seasonId);
                if (found) {
                    config = found;
                }
            }
        }

        if (!config) {
            content.innerHTML = '<div class="modal-header">错误</div><p>无法加载赛季配置</p>';
            return;
        }

        content.innerHTML = `
            <div class="modal-header">编辑赛季配置 - ${config.name || '赛季' + seasonId}</div>
            <div class="form-group">
                <label>赛季配置 (JSON)</label>
                <textarea class="form-control json-editor" id="season-config-json">${JSON.stringify(config, null, 2)}</textarea>
            </div>
            <div class="btn-group">
                <button class="btn btn-primary" id="btn-save-season">保存</button>
                <button class="btn" onclick="document.getElementById('modal-overlay').style.display='none'">取消</button>
            </div>
        `;

        document.getElementById('btn-save-season').addEventListener('click', async () => {
            try {
                const json = JSON.parse(document.getElementById('season-config-json').value);
                const saveRes = await this.api.updateSeason(seasonId, json);
                if (saveRes && saveRes.code === 1) {
                    alert('赛季配置已保存');
                    overlay.style.display = 'none';
                    this.render();
                } else {
                    alert(saveRes ? saveRes.result : '保存失败');
                }
            } catch (e) {
                alert('JSON格式错误: ' + e.message);
            }
        });
    }

    async viewSeasonPlayers(seasonId) {
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        content.innerHTML = '<div class="loading">加载中...</div>';
        overlay.style.display = 'flex';

        const res = await this.api.getSeasonPlayers(seasonId, 0, 100);
        if (res && res.code === 1) {
            const { players, total } = res.result;
            content.innerHTML = `
                <div class="modal-header">赛季 ${seasonId} 玩家列表 (共${total}人)</div>
                <div style="max-height:60vh;overflow-y:auto">
                    ${players.length === 0 ? '<p>暂无玩家数据</p>' : `
                    <table class="table">
                        <thead>
                            <tr><th>角色名</th><th>ID</th><th>境界</th><th>状态</th></tr>
                        </thead>
                        <tbody>
                            ${players.map(p => `
                                <tr>
                                    <td>${p.player_name}</td>
                                    <td>${p.player_id}</td>
                                    <td>${p.level}</td>
                                    <td><span class="tag tag-active">${p.status === 1 ? '正常' : '异常'}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    `}
                </div>
                <div class="btn-group" style="margin-top:16px">
                    <button class="btn" onclick="document.getElementById('modal-overlay').style.display='none'">关闭</button>
                </div>
            `;
        } else {
            content.innerHTML = `<div class="modal-header">错误</div><p>${res ? res.result : '加载失败'}</p>`;
        }
    }

    destroy() {}
}
