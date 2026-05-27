// 赛季总览仪表盘
export class DashboardPage {
    constructor(container, api) {
        this.container = container;
        this.api = api;
    }

    async render() {
        this.container.innerHTML = '<div class="loading">加载中...</div>';

        const [statusRes, seasonRes] = await Promise.all([
            this.api.getServerStatus(),
            this.api.getSeason()
        ]);

        const status = statusRes && statusRes.code === 1 ? statusRes.result : {};
        const season = seasonRes && seasonRes.code === 1 ? seasonRes.result : {};

        this.container.innerHTML = `
            <h2 style="margin-bottom:24px">赛季总览</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="label">服务器状态</div>
                    <div class="value ${status.online ? 'success' : ''}">${status.online ? '在线' : '离线'}</div>
                </div>
                <div class="stat-card">
                    <div class="label">在线玩家</div>
                    <div class="value">${status.player_count || 0}</div>
                </div>
                <div class="stat-card">
                    <div class="label">当前赛季</div>
                    <div class="value warning">${season.config ? season.config.name : '无'}</div>
                </div>
                <div class="stat-card">
                    <div class="label">赛季状态</div>
                    <div class="value ${status.season_active ? 'success' : ''}">${status.season_active ? '进行中' : '未开启'}</div>
                </div>
            </div>

            ${season.config ? `
            <div class="card">
                <div class="card-header">赛季详情 - ${season.config.name}</div>
                <div class="card-body">
                    <p><strong>主题：</strong>${season.config.theme}</p>
                    <p><strong>描述：</strong>${season.config.desc}</p>
                    <p><strong>开始时间：</strong>${season.config.start_time}</p>
                    <p><strong>结束时间：</strong>${season.config.end_time}</p>
                    <p><strong>剩余时间：</strong>${status.season_remaining || '未知'}</p>
                    <p><strong>经验倍率：</strong>${season.config.rules.exp_rate}x</p>
                    <p><strong>潜能倍率：</strong>${season.config.rules.pot_rate}x</p>
                    <p><strong>掉落倍率：</strong>${season.config.rules.drop_rate}x</p>
                    <p><strong>属性总和：</strong>${season.config.rules.stat_sum}</p>
                    <h4 style="margin-top:16px">赛季门派</h4>
                    <p>${(season.config.families || []).join(', ')}</p>
                    <h4 style="margin-top:16px">赛季套装</h4>
                    <p>${(season.config.sets || []).join(', ')}</p>
                    <h4 style="margin-top:16px">里程碑</h4>
                    <table class="table">
                        <thead><tr><th>境界</th><th>奖励</th></tr></thead>
                        <tbody>
                            ${(season.config.milestones || []).map(ms => `
                                <tr>
                                    <td>${ms.level}级</td>
                                    <td>${ms.reward.title ? '称号: ' + ms.reward.title + ' ' : ''}${ms.reward.items ? '物品: ' + ms.reward.items.join(', ') : ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ` : `
            <div class="card">
                <div class="card-body">
                    <p>当前无活跃赛季。请前往「赛季管理」创建或切换赛季。</p>
                </div>
            </div>
            `}

            <div class="card">
                <div class="card-header">快速操作</div>
                <div class="card-body">
                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="document.querySelector('[data-page=season-manager]').click()">赛季管理</button>
                        <button class="btn btn-primary" onclick="document.querySelector('[data-page=player-search]').click()">玩家搜索</button>
                        <button class="btn btn-success" id="btn-send-notice">发送全服公告</button>
                    </div>
                </div>
            </div>
        `;

        // 公告按钮事件
        const noticeBtn = document.getElementById('btn-send-notice');
        if (noticeBtn) {
            noticeBtn.addEventListener('click', () => {
                this.showNoticeModal();
            });
        }
    }

    showNoticeModal() {
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        content.innerHTML = `
            <div class="modal-header">发送全服公告</div>
            <div class="form-group">
                <label>公告内容</label>
                <textarea class="form-control" id="notice-content" placeholder="输入公告内容..."></textarea>
            </div>
            <div class="btn-group">
                <button class="btn btn-primary" id="btn-confirm-notice">发送</button>
                <button class="btn" onclick="document.getElementById('modal-overlay').style.display='none'">取消</button>
            </div>
        `;
        overlay.style.display = 'flex';

        document.getElementById('btn-confirm-notice').addEventListener('click', async () => {
            const text = document.getElementById('notice-content').value;
            if (!text) return alert('请输入公告内容');
            const res = await this.api.sendNotice(text);
            if (res && res.code === 1) {
                alert('公告已发送');
                overlay.style.display = 'none';
            } else {
                alert(res ? res.result : '发送失败');
            }
        });
    }

    destroy() {}
}
