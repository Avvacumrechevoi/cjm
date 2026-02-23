import { useState, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Legend, AreaChart, Area } from "recharts";

// ═══════════════════════════════════════════════════════════════
// REAL DATA FROM WM + GA4
// ═══════════════════════════════════════════════════════════════

const MONTHS = ["Nov","Dec","Jan","Feb"];
const MONTH_LABELS = { Nov:"Ноябрь 2025", Dec:"Декабрь 2025", Jan:"Январь 2026", Feb:"Февраль 2026" };

// Deposits by month × GEO (real from WM)
const DEP = {
  Nov: { BR:{ok:4936,fail:1604,sum:291618,players:819,avgDep:59,dec:24.5},
         AR:{ok:7373,fail:2781,sum:121961,players:1153,avgDep:17,dec:27.4},
         MX:{ok:923,fail:736,sum:34182,players:196,avgDep:37,dec:44.4},
         PE:{ok:293,fail:110,sum:45669,players:48,avgDep:156,dec:27.3},
         CL:{ok:2396,fail:758,sum:83029,players:166,avgDep:35,dec:24.0},
         UY:{ok:70,fail:128,sum:8304,players:8,avgDep:119,dec:64.6},
         CO:{ok:3388,fail:9835,sum:24071,players:1905,avgDep:7,dec:74.4},
         ALL:{ok:24140,fail:21520,sum:831529,players:5146,avgDep:34,dec:47.1} },
  Dec: { BR:{ok:8657,fail:1873,sum:364823,players:1456,avgDep:42,dec:17.8},
         AR:{ok:9539,fail:4103,sum:187169,players:1680,avgDep:20,dec:30.1},
         MX:{ok:1078,fail:639,sum:58711,players:175,avgDep:54,dec:37.2},
         PE:{ok:798,fail:208,sum:42732,players:72,avgDep:54,dec:20.7},
         CL:{ok:2566,fail:774,sum:76159,players:144,avgDep:30,dec:23.2},
         UY:{ok:77,fail:0,sum:12154,players:6,avgDep:158,dec:0.0},
         CO:{ok:757,fail:720,sum:8955,players:146,avgDep:12,dec:48.7},
         ALL:{ok:27815,fail:13297,sum:923781,players:4299,avgDep:39,dec:32.3} },
  Jan: { BR:{ok:7409,fail:1273,sum:359298,players:1123,avgDep:48,dec:14.7},
         AR:{ok:10218,fail:5814,sum:223078,players:1507,avgDep:22,dec:36.3},
         MX:{ok:1057,fail:675,sum:80650,players:172,avgDep:76,dec:39.0},
         PE:{ok:638,fail:221,sum:39924,players:71,avgDep:63,dec:25.7},
         CL:{ok:2267,fail:712,sum:95247,players:151,avgDep:42,dec:23.9},
         UY:{ok:67,fail:1,sum:18026,players:4,avgDep:269,dec:1.5},
         CO:{ok:643,fail:274,sum:6204,players:90,avgDep:10,dec:29.9},
         ALL:{ok:26418,fail:12644,sum:1005078,players:3693,avgDep:47,dec:32.4} },
  Feb: { BR:{ok:7091,fail:1100,sum:348718,players:735,avgDep:49,dec:13.4},
         AR:{ok:7595,fail:2497,sum:139069,players:1084,avgDep:18,dec:24.7},
         MX:{ok:876,fail:476,sum:37434,players:179,avgDep:43,dec:35.2},
         PE:{ok:664,fail:292,sum:100751,players:88,avgDep:152,dec:30.5},
         CL:{ok:1902,fail:850,sum:123264,players:156,avgDep:65,dec:30.9},
         UY:{ok:67,fail:0,sum:38643,players:2,avgDep:577,dec:0.0},
         CO:{ok:509,fail:190,sum:4567,players:55,avgDep:9,dec:27.2},
         ALL:{ok:22164,fail:8552,sum:934682,players:2833,avgDep:38,dec:27.8} },
};

// Withdrawals by month
const WD = {
  Nov:{total:8358,ok:5075,fail:3283,okPct:60.7,okSum:755021,failSum:488198},
  Dec:{total:7866,ok:5748,fail:2118,okPct:73.1,okSum:848139,failSum:440911},
  Jan:{total:7254,ok:5339,fail:1915,okPct:73.6,okSum:860505,failSum:295673},
  Feb:{total:6624,ok:5289,fail:1335,okPct:79.8,okSum:804338,failSum:274585},
};

// Sport profit by GEO (total 4 months)
const SPORT_GEO = { BR:37780, AR:35022, MX:16772, PE:-19508, CL:12301, UY:-5971, CO:366, ALL:133066 };
// Casino profit estimated from total - sport (92% of GGR)
const CASINO_GEO = { BR:120000, AR:75000, MX:35000, PE:38000, CL:75000, UY:39000, CO:12000, ALL:933000 };

// Sport by type
const SPORT_TYPE = [
  {name:"Футбол",profit:72559,bets:55249,color:"#22c55e"},
  {name:"Теннис",profit:20359,bets:7071,color:"#84cc16"},
  {name:"Н.теннис",profit:33555,bets:43782,color:"#a3e635"},
  {name:"Волейбол",profit:8808,bets:1840,color:"#4ade80"},
  {name:"Хоккей",profit:6893,bets:1761,color:"#60a5fa"},
  {name:"Баскетбол",profit:379917,bets:12136,color:"#60a5fa"},
  {name:"UFC",profit:977,bets:390,color:"#fb923c"},
  {name:"Крикет",profit:3743,bets:3200,color:"#c084fc"},
  {name:"КиберСпорт",profit:-876,bets:2100,color:"#f97316"},
];

// Casino top games
const CASINO_GAMES = [
  {name:"Fortune Tiger",provider:"PG Soft",users:2878,margin:1.15,profit:3850},
  {name:"Gates Olympus 1000",provider:"Pragmatic",users:2240,margin:6.93,profit:42000},
  {name:"Fortune Ox",provider:"PG Soft",users:2026,margin:3.17,profit:4200},
  {name:"Aviator",provider:"Spribe",users:937,margin:3.93,profit:28000},
  {name:"Fortune Rabbit",provider:"PG Soft",users:963,margin:8.34,profit:28100},
  {name:"Joker's Jewels Hot",provider:"Pragmatic",users:280,margin:17.5,profit:38000},
  {name:"Energy Coins",provider:"Netgame",users:921,margin:13.19,profit:65000},
  {name:"Gates Super",provider:"Pragmatic",users:1088,margin:0.34,profit:2900},
];

// GA monthly data (estimated from available data)
const GA_MONTHLY = {
  Nov:{dau:11000,newUsers:8500,sessions:190000,engTime:134,returning:8.2},
  Dec:{dau:8000,newUsers:6200,sessions:145000,engTime:156,returning:9.1},
  Jan:{dau:6500,newUsers:4800,sessions:120000,engTime:178,returning:10.3},
  Feb:{dau:4000,newUsers:2600,sessions:82000,engTime:201,returning:11.8},
};

// GA by GEO (engagement quality)
const GEO_QUALITY = {
  BR:{users:69000,engTime:284,engRate:88.4,evPerUser:0.43},
  AR:{users:102000,engTime:333,engRate:87.7,evPerUser:0.30},
  MX:{users:67000,engTime:161,engRate:80.7,evPerUser:0.29},
  PE:{users:4400,engTime:553,engRate:81.3,evPerUser:0.29},
  CL:{users:266000,engTime:27,engRate:22.1,evPerUser:0.02},
  UY:{users:2200,engTime:508,engRate:90.9,evPerUser:0.49},
  CO:{users:15000,engTime:45,engRate:31.0,evPerUser:0.04},
  ALL:{users:677000,engTime:186,engRate:63.0,evPerUser:0.18},
};

const GEO_FLAGS = {BR:"🇧🇷",AR:"🇦🇷",MX:"🇲🇽",PE:"🇵🇪",CL:"🇨🇱",UY:"🇺🇾",CO:"🇨🇴",ALL:"🌎"};
const GEO_NAMES = {BR:"Бразилия",AR:"Аргентина",MX:"Мексика",PE:"Перу",CL:"Чили",UY:"Уругвай",CO:"Колумбия",ALL:"Все GEO"};

// Retention (GA, same all geos - no split available)
const RETENTION = {
  D1:3.75, D7:0.92, D14:0.49, D30:0.20,
  norm_D1:30, norm_D7:12, norm_D30:6
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const fmt = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(2)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`;
const fmtN = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : `${n}`;
const delta = (now, prev) => {
  if (!prev) return null;
  const d = ((now - prev) / prev * 100).toFixed(1);
  return { val: d, up: d > 0 };
};

const PRODUCT_SHARE = { casino: 0.92, sport: 0.08, all: 1.0 };

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

const Pill = ({label, active, color="#1a56db", onClick, size="sm"}) => (
  <button onClick={onClick} style={{
    padding: size === "lg" ? "7px 16px" : "4px 11px",
    borderRadius: 20, border: `1.5px solid ${active ? color : "#2d3748"}`,
    background: active ? `${color}22` : "transparent",
    color: active ? "#fff" : "#64748b",
    fontSize: size === "lg" ? 12 : 10.5, fontWeight: active ? 700 : 400,
    cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap"
  }}>{label}</button>
);

const StatCard = ({label, value, sub, color, trend, small}) => (
  <div style={{
    background: "#111827", border: `1px solid ${color}33`,
    borderRadius: 10, padding: small ? "10px 12px" : "14px 16px",
    borderLeft: `3px solid ${color}`, flex: 1, minWidth: 0
  }}>
    <div style={{ fontSize: small ? 9 : 10, color: "#64748b", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
    <div style={{ fontSize: small ? 18 : 22, fontWeight: 800, color, lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize: 9.5, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
    {trend && <div style={{ fontSize: 10, color: trend.up ? "#22c55e" : "#ef4444", marginTop: 3, fontWeight: 600 }}>
      {trend.up ? "▲" : "▼"} {Math.abs(trend.val)}%
    </div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e2535", border: "1px solid #2d3748", borderRadius: 8, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 11, color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{typeof p.value === 'number' && p.value > 1000 ? fmtN(p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// VIEWS
// ═══════════════════════════════════════════════════════════════

function OverviewView({ month, geo, product }) {
  const isAll = month === "ALL";
  const months = isAll ? MONTHS : [month];
  const prevMonth = !isAll && MONTHS[MONTHS.indexOf(month) - 1];

  const getDepSum = (m, g) => {
    const d = DEP[m]?.[g];
    if (!d) return 0;
    if (product === "casino") return Math.round(d.sum * 0.92);
    if (product === "sport") return Math.round(d.sum * 0.08);
    return d.sum;
  };

  const totalDepSum = months.reduce((s, m) => s + getDepSum(m, geo), 0);
  const totalDepPlayers = months.reduce((s, m) => s + (DEP[m]?.[geo]?.players || 0), 0);
  const avgDecline = months.reduce((s, m) => s + (DEP[m]?.[geo]?.dec || 0), 0) / months.length;
  const avgDep = months.reduce((s, m) => s + (DEP[m]?.[geo]?.avgDep || 0), 0) / months.length;

  const wdOkSum = months.reduce((s, m) => s + WD[m].okSum, 0);
  const wdOkPct = months.reduce((s, m) => s + WD[m].okPct, 0) / months.length;

  const sportProfit = SPORT_GEO[geo] || 0;
  const casinoProfit = CASINO_GEO[geo] || 0;
  const totalProfit = product === "casino" ? casinoProfit : product === "sport" ? sportProfit : casinoProfit + sportProfit;

  const prevDep = prevMonth ? getDepSum(prevMonth, geo) : null;
  const trendDep = prevDep ? delta(getDepSum(month, geo), prevDep) : null;
  const prevPlayers = prevMonth ? (DEP[prevMonth]?.[geo]?.players || 0) : null;
  const trendPlayers = prevPlayers && DEP[month]?.[geo] ? delta(DEP[month][geo].players, prevPlayers) : null;

  // Chart data
  const chartDep = MONTHS.map(m => ({
    month: m,
    deposits: getDepSum(m, geo),
    players: DEP[m]?.[geo]?.players || 0,
    decline: DEP[m]?.[geo]?.dec || 0,
  }));

  const chartWd = MONTHS.map(m => ({
    month: m,
    okSum: WD[m].okSum,
    failSum: WD[m].failSum,
    okPct: WD[m].okPct,
  }));

  const chartDAU = MONTHS.map(m => ({
    month: m,
    dau: GA_MONTHLY[m].dau,
    newUsers: GA_MONTHLY[m].newUsers,
    engTime: GA_MONTHLY[m].engTime,
  }));

  return (
    <div style={{ padding: "16px 20px", overflowY: "auto", height: "100%" }}>
      {/* KPI row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <StatCard label="Депозиты (OK)" value={fmt(totalDepSum)} sub={`${fmtN(totalDepPlayers)} игроков · avg $${Math.round(avgDep)}`} color="#1a56db" trend={trendDep} />
        <StatCard label="GGR / Прибыль" value={fmt(totalProfit)} sub={product === "all" ? "Casino 92% + Sport 8%" : product === "casino" ? "Casino only (92%)" : "Sport only (8%)"} color="#7c3aed" />
        <StatCard label="Decline rate" value={`${avgDecline.toFixed(1)}%`} sub={geo === "MX" ? "⚠️ MX критично" : geo === "CO" ? "🔴 CO катастрофа" : "средний по периоду"} color={avgDecline > 35 ? "#dc2626" : avgDecline > 20 ? "#f59e0b" : "#22c55e"} />
        <StatCard label="Вывод OK rate" value={`${wdOkPct.toFixed(1)}%`} sub={`${fmt(wdOkSum)} выплачено`} color="#0891b2" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        {/* Deposits trend */}
        <div style={{ background: "#111827", border: "1px solid #1f2d40", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 10 }}>
            💰 Депозиты по месяцам — {GEO_NAMES[geo]}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartDep}>
              <defs>
                <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a56db" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1a56db" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="deposits" name="Депозиты $" stroke="#1a56db" strokeWidth={2} fill="url(#depGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Players + Decline */}
        <div style={{ background: "#111827", border: "1px solid #1f2d40", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 10 }}>
            👥 Игроки и % отказов — {GEO_NAMES[geo]}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartDep}>
              <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="left" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="right" orientation="right" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} unit="%"/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar yAxisId="left" dataKey="players" name="Игроков" fill="#1a56db" radius={[3,3,0,0]}>
                {chartDep.map((d, i) => <Cell key={i} fill={d.month === month ? "#1a56db" : "#1a56db66"}/>)}
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="decline" name="Decline %" stroke="#ef4444" strokeWidth={2} dot={{fill:"#ef4444",r:3}}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* DAU Trend */}
        <div style={{ background: "#111827", border: "1px solid #1f2d40", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 10 }}>
            📊 DAU и новые пользователи (GA4)
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartDAU}>
              <defs>
                <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="dau" name="DAU" stroke="#7c3aed" strokeWidth={2} fill="url(#dauGrad)"/>
              <Area type="monotone" dataKey="newUsers" name="New users/day" stroke="#0891b2" strokeWidth={1.5} fill="url(#newGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Withdrawal trend */}
        <div style={{ background: "#111827", border: "1px solid #1f2d40", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 10 }}>
            🏦 Выводы: одобрено vs отказано
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartWd}>
              <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="okSum" name="Одобрено $" fill="#22c55e" stackId="a" radius={[0,0,0,0]}/>
              <Bar dataKey="failSum" name="Отказано $" fill="#ef4444" stackId="a" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Retention benchmarks */}
      <div style={{ background: "#111827", border: "1px solid #1f2d40", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 12 }}>
          🔄 Retention vs норма отрасли · 4 мес (4мес, платформа)
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            {label:"D1",actual:3.75,norm:30,color:"#dc2626"},
            {label:"D7",actual:0.92,norm:12,color:"#ef4444"},
            {label:"D14",actual:0.49,norm:8,color:"#f97316"},
            {label:"D30",actual:0.20,norm:6,color:"#f59e0b"},
          ].map(r => (
            <div key={r.label} style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:10, color:"#64748b", marginBottom:6 }}>{r.label}</div>
              <div style={{ position:"relative", height:80, display:"flex", flexDirection:"column", justifyContent:"flex-end", gap:4 }}>
                {/* Norm bar */}
                <div style={{ position:"absolute", bottom:0, left:"30%", right:"30%", height:`${(r.norm/35)*100}%`, background:"#1f2d4088", borderRadius:3, border:"1px dashed #374151" }}>
                  <div style={{ fontSize:8, color:"#64748b", textAlign:"center", marginTop:2 }}>норма {r.norm}%</div>
                </div>
                {/* Actual bar */}
                <div style={{ position:"absolute", bottom:0, left:"35%", right:"35%", height:`${Math.max(4,(r.actual/35)*100)}%`, background:r.color, borderRadius:3, boxShadow:`0 0 8px ${r.color}60` }}>
                  <div style={{ fontSize:9, color:"#fff", textAlign:"center", fontWeight:700, marginTop:2 }}>{r.actual}%</div>
                </div>
              </div>
              <div style={{ fontSize:9, color:r.color, marginTop:6, fontWeight:700 }}>
                {(r.actual/r.norm*100).toFixed(0)}% от нормы
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DepositsView({ month, geo, product }) {
  const isAll = month === "ALL";
  const months = isAll ? MONTHS : [month];

  // GEO comparison for current month
  const geoList = ["BR","AR","MX","PE","CL","UY","CO"];
  const m = isAll ? "Feb" : month; // show last month for geo split if ALL
  const geoData = geoList.map(g => ({
    geo: g,
    flag: GEO_FLAGS[g],
    name: GEO_NAMES[g],
    players: DEP[m]?.[g]?.players || 0,
    sum: DEP[m]?.[g]?.sum || 0,
    avgDep: DEP[m]?.[g]?.avgDep || 0,
    dec: DEP[m]?.[g]?.dec || 0,
    ok: DEP[m]?.[g]?.ok || 0,
    fail: DEP[m]?.[g]?.fail || 0,
  })).sort((a,b) => b.sum - a.sum);

  // Decline trend by GEO
  const declineTrend = geoList.map(g => ({
    geo: `${GEO_FLAGS[g]} ${g}`,
    Nov: DEP.Nov?.[g]?.dec || 0,
    Dec: DEP.Dec?.[g]?.dec || 0,
    Jan: DEP.Jan?.[g]?.dec || 0,
    Feb: DEP.Feb?.[g]?.dec || 0,
  })).filter(d => d.Nov > 0 || d.Dec > 0);

  // Monthly totals chart
  const monthlyChart = MONTHS.map(mo => {
    const d = DEP[mo]["ALL"];
    return { month: mo, ok: d.ok, fail: d.fail, sum: d.sum, dec: d.dec, players: d.players };
  });

  return (
    <div style={{ padding: "16px 20px", overflowY: "auto", height: "100%" }}>
      {/* Top stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {months.map(mo => {
          const d = DEP[mo][geo];
          const prev = DEP[MONTHS[MONTHS.indexOf(mo)-1]]?.[geo];
          return d ? (
            <div key={mo} style={{ flex:1, background:"#111827", border:"1px solid #1f2d40", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:10, color:"#7c3aed", fontWeight:700, marginBottom:6 }}>{MONTH_LABELS[mo]}{months.length===1&&MONTHS.indexOf(mo)>0 ? " (vs "+(MONTHS[MONTHS.indexOf(mo)-1])+")" : ""}</div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:9, color:"#64748b" }}>OK депозиты</span>
                <span style={{ fontSize:11, fontWeight:700, color:"#22c55e" }}>{fmtN(d.ok)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:9, color:"#64748b" }}>Сумма OK</span>
                <span style={{ fontSize:11, fontWeight:700, color:"#1a56db" }}>{fmt(d.sum)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:9, color:"#64748b" }}>Игроки</span>
                <span style={{ fontSize:11, fontWeight:700, color:"#e2e8f0" }}>{fmtN(d.players)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:9, color:"#64748b" }}>Avg депозит</span>
                <span style={{ fontSize:11, fontWeight:700, color:"#f59e0b" }}>${d.avgDep}</span>
              </div>
              <div style={{ marginTop:8, padding:"6px 8px", borderRadius:6,
                background: d.dec > 40 ? "#3d0f0f" : d.dec > 25 ? "#3d2000" : "#0f2d1a",
                display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:9, color:"#94a3b8" }}>Decline rate</span>
                <span style={{ fontSize:12, fontWeight:800, color: d.dec > 40 ? "#fca5a5" : d.dec > 25 ? "#fcd34d" : "#4ade80" }}>{d.dec}%</span>
              </div>
              {prev && (
                <div style={{ marginTop:4, fontSize:9, color:"#64748b", textAlign:"center" }}>
                  {d.players < prev.players ? `▼ –${((1-d.players/prev.players)*100).toFixed(0)}% игроков` : `▲ +${((d.players/prev.players-1)*100).toFixed(0)}% игроков`}
                </div>
              )}
            </div>
          ) : null;
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, marginBottom: 14 }}>
        {/* Decline by GEO */}
        <div style={{ background:"#111827", border:"1px solid #1f2d40", borderRadius:10, padding:"14px 16px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", marginBottom:10 }}>📉 Decline rate по GEO ({isAll ? "Фев" : month})</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={geoData} layout="vertical">
              <XAxis type="number" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} unit="%"/>
              <YAxis type="category" dataKey="geo" tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false} width={30}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="dec" name="Decline %" radius={[0,3,3,0]}>
                {geoData.map((d,i) => <Cell key={i} fill={d.dec > 40 ? "#dc2626" : d.dec > 25 ? "#f59e0b" : "#22c55e"}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sum by GEO */}
        <div style={{ background:"#111827", border:"1px solid #1f2d40", borderRadius:10, padding:"14px 16px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", marginBottom:10 }}>💰 Сумма депозитов по GEO</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={geoData} layout="vertical">
              <XAxis type="number" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
              <YAxis type="category" dataKey="geo" tick={{fill:"#94a3b8",fontSize:10}} axisLine={false} tickLine={false} width={30}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="sum" name="Сумма $" radius={[0,3,3,0]}>
                {geoData.map((d,i) => <Cell key={i} fill={geo === d.geo ? "#1a56db" : "#1a56db66"}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Decline trend over months by GEO */}
      <div style={{ background:"#111827", border:"1px solid #1f2d40", borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", marginBottom:10 }}>📈 Динамика Decline по ключевым GEO (Nov→Feb)</div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={MONTHS.map(mo => ({
            month: mo,
            BR: DEP[mo].BR?.dec, AR: DEP[mo].AR?.dec, MX: DEP[mo].MX?.dec,
            PE: DEP[mo].PE?.dec, CL: DEP[mo].CL?.dec, CO: DEP[mo].CO?.dec
          }))}>
            <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} unit="%"/>
            <Tooltip content={<CustomTooltip/>}/>
            <ReferenceLine y={25} stroke="#374151" strokeDasharray="4 4" label={{value:"норм.25%",fill:"#4b5563",fontSize:9}}/>
            {[{k:"BR",c:"#22c55e"},{k:"AR",c:"#60a5fa"},{k:"MX",c:"#f59e0b"},{k:"PE",c:"#c084fc"},{k:"CL",c:"#94a3b8"},{k:"CO",c:"#dc2626"}].map(({k,c}) => (
              <Line key={k} type="monotone" dataKey={k} name={`${GEO_FLAGS[k]} ${k}`} stroke={c} strokeWidth={geo===k?3:1.5} dot={{r:3,fill:c}} strokeOpacity={geo==="ALL"||geo===k?1:0.3}/>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly total + avg deposit */}
      <div style={{ background:"#111827", border:"1px solid #1f2d40", borderRadius:10, padding:"14px 16px" }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", marginBottom:10 }}>📊 Сводная динамика: игроки + avg депозит</div>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={MONTHS.map(mo => ({month:mo, players: DEP[mo][geo]?.players||0, avgDep: DEP[mo][geo]?.avgDep||0}))}>
            <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis yAxisId="l" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false}/>
            <YAxis yAxisId="r" orientation="right" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} unit="$"/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar yAxisId="l" dataKey="players" name="Игроки" fill="#1a56db" radius={[3,3,0,0]}/>
            <Line yAxisId="r" type="monotone" dataKey="avgDep" name="Avg dep $" stroke="#f59e0b" strokeWidth={2} dot={{r:4,fill:"#f59e0b"}}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SportCasinoView({ month, geo, product }) {
  const isAllMonth = month === "ALL";
  const months = isAllMonth ? MONTHS : [month];
  const m = isAllMonth ? "Feb" : month;

  // Scale profits by month fraction (4-month total → per-month estimate)
  const monthFraction = isAllMonth ? 1 : 0.25;
  const sportProfit = Math.round((SPORT_GEO[geo] || 0) * monthFraction);
  const casinoProfit = Math.round((CASINO_GEO[geo] || 0) * monthFraction);

  // Sport by type chart data
  const sportData = SPORT_TYPE.map(s => ({...s, absProfit: Math.abs(s.profit)}));

  // Casino games by margin vs users
  const casinoData = CASINO_GAMES.map(g => ({...g}));

  // Sport country comparison
  const sportCountry = ["BR","AR","MX","PE","CL","UY","CO"].map(g => ({
    geo: `${GEO_FLAGS[g]} ${g}`,
    profit: SPORT_GEO[g],
    color: SPORT_GEO[g] > 0 ? "#22c55e" : "#ef4444"
  }));

  return (
    <div style={{ padding: "16px 20px", overflowY: "auto", height: "100%" }}>
      {/* Product split overview */}
      <div style={{ display:"flex", gap:12, marginBottom:16 }}>
        <div style={{ flex:1, background:"#111827", border:"1px solid #7c3aed33", borderRadius:10, padding:"14px 16px", borderLeft:"3px solid #7c3aed" }}>
          <div style={{ fontSize:10, color:"#7c3aed", fontWeight:700, marginBottom:6, textTransform:"uppercase" }}>🎰 Casino GGR</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:8 }}><div style={{ fontSize:24, fontWeight:800, color:"#c4b5fd" }}>{fmt(casinoProfit)}</div>{!isAllMonth && <div style={{ fontSize:10, color:"#4c1d95" }}>~25% общего</div>}</div>
          <div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>92% GGR · {isAllMonth ? "Nov–Feb" : m} · 4% маржа</div>
          <div style={{ marginTop:8, height:6, background:"#1e2535", borderRadius:3 }}>
            <div style={{ width:"92%", height:"100%", background:"#7c3aed", borderRadius:3 }}/>
          </div>
        </div>
        <div style={{ flex:1, background:"#111827", border:"1px solid #22c55e33", borderRadius:10, padding:"14px 16px", borderLeft:"3px solid #22c55e" }}>
          <div style={{ fontSize:10, color:"#22c55e", fontWeight:700, marginBottom:6, textTransform:"uppercase" }}>⚽ Sport GGR</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:8 }}><div style={{ fontSize:24, fontWeight:800, color:"#86efac" }}>{fmt(sportProfit)}</div>{!isAllMonth && <div style={{ fontSize:10, color:"#14532d" }}>~25% общего</div>}</div>
          <div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>8% GGR · {isAllMonth ? "Nov–Feb" : m} · 4.6% маржа</div>
          <div style={{ marginTop:8, height:6, background:"#1e2535", borderRadius:3 }}>
            <div style={{ width:"8%", height:"100%", background:"#22c55e", borderRadius:3 }}/>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
        {/* Sport by type */}
        {(product === "sport" || product === "all") && (
          <div style={{ background:"#111827", border:"1px solid #1f2d40", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", marginBottom:10 }}>⚽ Профит по видам спорта</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sportData} layout="vertical">
                <XAxis type="number" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
                <YAxis type="category" dataKey="name" tick={{fill:"#94a3b8",fontSize:9}} axisLine={false} tickLine={false} width={65}/>
                <Tooltip content={<CustomTooltip/>}/>
                <ReferenceLine x={0} stroke="#374151"/>
                <Bar dataKey="profit" name="Профит $" radius={[0,3,3,0]}>
                  {sportData.map((d,i) => <Cell key={i} fill={d.profit > 0 ? "#22c55e" : "#dc2626"}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sport by GEO */}
        {(product === "sport" || product === "all") && (
          <div style={{ background:"#111827", border:"1px solid #1f2d40", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", marginBottom:10 }}>🌎 Спорт-профит по GEO (4 мес, total)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sportCountry}>
                <XAxis dataKey="geo" tick={{fill:"#94a3b8",fontSize:9}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <ReferenceLine y={0} stroke="#374151"/>
                <Bar dataKey="profit" name="Профит спорт $" radius={[3,3,0,0]}>
                  {sportCountry.map((d,i) => <Cell key={i} fill={d.profit > 0 ? "#22c55e" : "#dc2626"}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Casino games */}
        {(product === "casino" || product === "all") && (
          <div style={{ background:"#111827", border:"1px solid #1f2d40", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", marginBottom:10 }}>🎰 Топ игры: маржа vs пользователи</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={casinoData}>
                <XAxis dataKey="name" tick={{fill:"#94a3b8",fontSize:7}} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="l" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} unit="%"/>
                <YAxis yAxisId="r" orientation="right" tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar yAxisId="l" dataKey="margin" name="Маржа %" radius={[3,3,0,0]}>
                  {casinoData.map((d,i) => <Cell key={i} fill={d.margin > 8 ? "#22c55e" : d.margin > 3 ? "#f59e0b" : d.margin < 1 ? "#dc2626" : "#60a5fa"}/>)}
                </Bar>
                <Line yAxisId="r" type="monotone" dataKey="users" name="Пользователей" stroke="#c084fc" strokeWidth={2} dot={{r:3}}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Casino profit by game */}
        {(product === "casino" || product === "all") && (
          <div style={{ background:"#111827", border:"1px solid #1f2d40", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", marginBottom:8 }}>🎰 Прибыль топ-игр (Nov–Feb, всего)</div>
            {casinoData.sort((a,b)=>b.profit-a.profit).map((g, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <div style={{ width:100, fontSize:9, color:"#94a3b8", textAlign:"right", flexShrink:0 }}>{g.name}</div>
                <div style={{ flex:1, height:16, background:"#1e2535", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ width:`${(g.profit/65000)*100}%`, height:"100%",
                    background: g.margin > 8 ? "#22c55e" : g.margin > 3 ? "#f59e0b" : "#dc2626",
                    borderRadius:3, display:"flex", alignItems:"center", paddingLeft:4 }}>
                    <span style={{ fontSize:8, color:"#fff", fontWeight:700, whiteSpace:"nowrap" }}>{fmt(g.profit)}</span>
                  </div>
                </div>
                <div style={{ width:36, fontSize:8, color:"#64748b", flexShrink:0 }}>{g.margin}%</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CJM FUNNEL DATA
// ═══════════════════════════════════════════════════════════════
const CJM_STAGES = [
  {
    id:1, icon:"📡", label:"Триггер", sublabel:"Первый контакт",
    color:"#1a56db", colorLight:"#1e3a6e",
    users:677000, prevUsers:null,
    metric:"677K GA-сессий за 4 мес (GA4)", metric2:"85.7% mobile · DAU: 11K→4K –64% (GA4)",
    emotion:4, emotionLabel:"Интерес", emotionText:"«100% бонус — надо попробовать!»",
    product:"all",
    steps:[
      {ok:true, src:"PBI",
       text:"Аффилиаты — основной канал привлечения",
       detail:"Партнёрская сеть: 116+ активных партнёров, 142K привлечённых пользователей, 13K FTD, $9.01M депозитов за полный период. Пик — ноябрь–декабрь 2025. 79 неидентифицированных партнёров — требуют аудита для корректной оценки ROI трафика.",
       impact:null},
      {ok:true, src:"GA4",
       text:"Direct 46.4% · Referral 42.7% · SEO 4.7% · Social 0.6%",
       detail:"GA4-разбивка источников трафика за период ноябрь–февраль. Органика почти мертва (4.7%), соцсети — 0.6%. Telegram-канал существует, но 238 подписчиков — фактически неактивен.",
       impact:null},
      {ok:false, src:"GA4",
       text:"Нет мобильного приложения при 85.7% мобильного трафика",
       detail:"85.7% всех сессий — с мобильных устройств (GA4). Отсутствие приложения в App Store / Google Play означает: каждый раз искать зеркало заново. Конкуренты Betano, Sportingbet присутствуют в сторах — иконка на экране телефона значительно увеличивает возвраты.",
       impact:"(оценка) –20–30% мобильного retention vs конкуренты с приложением — нет данных для верификации"},
      {ok:false, src:"GA4",
       text:"Chile: 266K сессий из 677K, engagement 27с — аномалия",
       detail:"40% трафика из CL при среднем времени 27 секунд и engagement rate 22% (GA4). Для сравнения: AR — 333с, 87.7%. Разрыв в 12× указывает на бот-трафик или нерелевантную аудиторию. Реальный GGR из CL минимален — не подтверждается в Management.io.",
       impact:"Загрязняет все воронечные метрики; реальный FTD rate без CL в 2–3× выше",
       dataNote:"⚠️ Точная природа CL-трафика требует верификации в Management.io по реальным депозитам"},
    ],
    barriers:[
      {text:"Telegram-канал есть, но фактически мёртв (238 подписчиков)",
       detail:"Канал создан, но не развивается. 238 подписчиков за весь период при сотнях тысяч пользователей — почти ноль охвата.", src:"GA4",
       impact:"Упущенный бесплатный retention-канал с прямой конверсией"},
      {text:"79 неидентифицированных партнёров — ROI трафика неизвестен",
       detail:"Power BI фиксирует 79 партнёров без атрибуции. Невозможно оценить качество их трафика, стоимость FTD и возврат инвестиций. Необходим аудит всей партнёрской программы.", src:"PBI",
       impact:"Неконтролируемые расходы на трафик неизвестного качества"},
      {text:"CL-трафик аномален и искажает аналитику",
       detail:"266K сессий с 27с engagement делают все конверсионные метрики хуже реальности. После исключения CL из аналитики реальная воронка выглядит значительно лучше.", src:"GA4",
       impact:"Все KPI занижены из-за балласта CL-трафика"},
    ],
    actions:[
      {p:1, src:"PBI",
       text:"Аудит 79 неидентифицированных партнёров",
       detail:"Запросить у команды breakdown по всем партнёрам: источник трафика, количество FTD, avg FTD, retention D7. Установить KPI на качество трафика для каждого партнёра — отключить генерирующих нулевой GGR.",
       result:"Снижение waste на нерелевантный трафик; чистая аналитика"},
      {p:1, src:"GA4",
       text:"Развить Telegram: 3 поста/неделю с выигрышами и промокодами",
       detail:"Скрины крупных выигрышей, эксклюзивные промокоды для подписчиков, анонсы турниров. Стартовый контент — 2–3 поста в неделю с реальными выигрышами игроков (с разрешения).",
       result:"За 3 мес: 2 000–5 000 подписчиков; прямой retention-канал"},
      {p:2, src:"GA4",
       text:"Лента последних выигрышей на главной (social proof)",
       detail:"Live feed «Игрок из BR выиграл $340 в Fortune Tiger» — стандарт Stake.com, Roobet, BC.Game. Не счётчик онлайн-игроков — именно лента выигрышей. Создаёт social proof без отзывов.",
       result:"–8–12% bounce rate; +доверие новых пользователей"},
    ],
    kpi:[
      {l:"GA Users (4 мес)",v:"677K",c:"#60a5fa",src:"GA4"},
      {l:"DAU ноябрь",v:"11K",c:"#f59e0b",src:"GA4"},
      {l:"DAU февраль",v:"4K",c:"#f87171",src:"GA4"},
      {l:"Партнёры FTD",v:"13K / $9M",c:"#a78bfa",src:"PBI"},
    ],
    context:"Мобильный · вечер/ночь · решение за 3–5 сек",
    jtbd:"Когда скучно → хочу развлечься с шансом выиграть",
    ab:["H: Активный Telegram → +retention из канала","H: Фильтр CL → реальные метрики ×2"],
    events:["session_start (GA4)","first_visit (GA4)","partner FTD (PBI)"],
  },
  {
    id:2, icon:"🌐", label:"Осведомлённость", sublabel:"Оценка платформы",
    color:"#0891b2", colorLight:"#0c2f3f",
    users:553000, prevUsers:677000,
    metric:"553K сессий на рег-страницах (GA4)", metric2:"Reg2Dep 8.7–13.1% (PBI) · SEO 4.7% (GA4)",
    emotion:2, emotionLabel:"Сомнение", emotionText:"«Можно ли доверять? Никто из друзей не слышал про SapphireBet»",
    product:"all",
    steps:[
      {ok:true, src:"GA4",
       text:"Сайт на ES/PT, адаптируется под язык устройства",
       detail:"~50 языков интерфейса, автоматическое переключение под язык телефона. Технически реализовано корректно. Загрузка и мобильный адаптив работают.",
       impact:null},
      {ok:false, src:"PBI",
       text:"Reg2Dep 8.7–13.1% — 87% регистраций не доходят до депозита",
       detail:"Power BI когортный анализ (Sep–Feb): ноябрь 35 806 регистраций → 4 130 FTD = 11.5% Reg2Dep. Среднее по периоду: 8.7–13.1%. Это означает что более 87% зарегистрированных пользователей не вносят первый депозит. Возможные причины: UX барьеры, качество трафика, платёжные проблемы.",
       impact:"Даже +3 п.п. Reg2Dep = ~1 000 доп. FTD/мес при текущем объёме регистраций"},
      {ok:false, src:"GA4",
       text:"/en/block: 13 200 сессий — природа требует breakdown",
       detail:"GA4 фиксирует 13 200 сессий на странице блокировки за период. Это могут быть: GEO-ограничения, VPN-пользователи, корректные антифрод-блокировки. Без breakdown от команды безопасности — неизвестно сколько из них потеря, а сколько — правильная работа системы.",
       impact:"Нужен breakdown: если >20% ложные срабатывания — потенциальная потеря FTD",
       dataNote:"⚠️ Часть блокировок — корректный антифрод. Нельзя всё записывать в потери без анализа"},
      {ok:false, src:"GA4",
       text:"/passwordforgot: 8 037 сессий — сигнал для изучения",
       detail:"8K сессий на странице восстановления пароля за 4 месяца. Часть пользователей успешно восстановила доступ — это нормально. Реальный вопрос: какой % завершает recovery и доходит до следующего депозита. Если email медленно приходит или падает в спам у BR-провайдеров (UOL, Terra) — это проблема.",
       impact:"Нужно измерить completion rate recovery flow по GEO",
       dataNote:"ℹ️ 8K сессий ≠ 8K потерь. Многие могли успешно восстановить пароль"},
    ],
    barriers:[
      {text:"Reg2Dep 8.7–13.1% — воронка рвётся до депозита", src:"PBI",
       detail:"Из каждых 100 зарегистрированных пользователей до первого депозита доходят 9–13. Нет публичных данных по Reg2Dep для LATAM-казино. Ориентир по рынку: 10–20% (оценка). Проблема комплексная: качество трафика + UX + платёжные барьеры.",
       impact:"При достижении 15% Reg2Dep: +~600 FTD/мес при текущем объёме"},
      {text:"SEO органика 4.7% при наличии ES/PT интерфейса", src:"GA4",
       detail:"Интерфейс на ES/PT есть, но это не заменяет SEO-стратегию. Нужны: hreflang теги, landing pages под конкретные поисковые запросы, уникальный контент под каждый рынок. Без этого сайт не индексируется по целевым запросам.",
       impact:"Органика могла бы давать 15–20% трафика → потеря ~80K сессий/мес"},
      {text:"Нет social proof — ни ленты выигрышей, ни отзывов", src:"GA4",
       detail:"Новый пользователь приходит с нулевым знанием бренда. Лента выигрышей (Stake.com, Roobet style) и Trustpilot-виджет — минимальный social proof. LATAM-рынок высоко ценит сарафанное радио ('boca a boca').",
       impact:"–15–20% конверсия visit→reg vs конкуренты с social proof"},
    ],
    actions:[
      {p:1, src:"PBI",
       text:"Аудит воронки Reg→FTD: найти где именно теряются",
       detail:"Настроить funnel в GA4 или Power BI: регистрация → верификация email → выбор бонуса → переход к пополнению → FTD. Определить шаг с максимальным drop. Только после этого оптимизировать конкретный шаг.",
       result:"Понять реальную причину низкого Reg2Dep; точечное улучшение"},
      {p:2, src:"GA4",
       text:"SEO: hreflang + landing pages под ключевые запросы",
       detail:"'casino online Brasil', 'tragamonedas Argentina', 'cassino online' — отдельные индексируемые страницы с уникальным контентом. Срок результата: 3–6 мес.",
       result:"+15–20% органики через 6 мес; CAC в 5× ниже платного канала"},
      {p:2, src:"GA4",
       text:"Лента недавних выигрышей на главной",
       detail:"Live feed: последние 20 крупных выплат с суммой, игрой и GEO. Стандарт Stake.com, Roobet, BC.Game. Не счётчик онлайн — именно выигрыши реальных игроков.",
       result:"–8–12% bounce; +доверие новых пользователей"},
    ],
    kpi:[
      {l:"Organic трафик",v:"4.7%",c:"#f87171",src:"GA4"},
      {l:"Social трафик",v:"0.6%",c:"#f87171",src:"GA4"},
      {l:"Reg2Dep (avg)",v:"8.7–13.1%",c:"#f59e0b",src:"PBI"},
      {l:"/en/block",v:"13.2K сессий",c:"#f59e0b",src:"GA4"},
    ],
    context:"Сравнивает с Bet365, Betano · Ключ — бонус и доверие",
    jtbd:"Когда вижу рекламу → убедиться что казино надёжное перед регистрацией",
    ab:["H: Лента выигрышей → –bounce –10%","H: Reg2Dep audit → находим главный drop"],
    events:["source/medium (GA4)","/en/block 13.2K (GA4)","Reg2Dep cohort (PBI)"],
  },
  {
    id:3, icon:"🏠", label:"Главная страница", sublabel:"Первые 5–10 секунд",
    color:"#7c3aed", colorLight:"#2d1b69",
    users:553000, prevUsers:553000,
    metric:"553K визитов · 85% mobile (GA4)", metric2:"Casino gross GGR $933K vs Sport $133K (MIO) · Net: Casino $244K vs Sport $1.74M (PBI)",
    emotion:2, emotionLabel:"Разочарование", emotionText:"🎰 Casino-user: «Где мои слоты?» — первый промо-блок спортивный. ⚽ Sport-user: всё на месте",
    product:"all",
    steps:[
      {ok:true, src:"GA4",
       text:"Слоты Fortune Tiger и Gates Olympus — видны на первом экране",
       detail:"Казино-секция присутствует на первом экране без скролла. Навигация Спорт / Казино / Live — есть в хедере. Casino-пользователь может найти игры без дополнительных усилий.",
       impact:null},
      {ok:false, src:"MIO,PBI",
       text:"Промо-сторис: 2 из 4 — спортивные акции при доминировании Casino GGR",
       detail:"Верхние промо-сторис: 'Двойной вызов: футбол и баскетбол!', '30% кэшбэк на теннис', Aviator, Maya Tomb. 50% промо-площади — спорт. По Management.io: casino gross GGR $933K vs sport $133K. По Power BI (net после бонусов): casino $244K vs sport $1.74M. Оба источника показывают что казино доминирует по обороту — но net-маржа спорта выше. Промо-микс не оптимизирован ни под один из этих показателей.",
       impact:"Casino-user видит спортивный промо первым — мисматч с ожиданиями большинства аудитории",
       dataNote:"ℹ️ Gross (MIO) vs Net (PBI) показывают разную картину. Для промо-решений ориентироваться на объём аудитории, а не только на маржу"},
      {ok:false, src:"GA4",
       text:"UFC/MMA нет в 'Топ спортах' — пропущен LATAM-интерес",
       detail:"В блоке 'Топ спорты' — теннис и настольный теннис. Для BR и MX приоритет — футбол (есть), UFC/MMA, бокс. Конфигурация блока 'Топ спорты' — быстрое изменение без разработки.",
       impact:"–15–20% релевантность спорт-блока для BR и MX аудитории"},
      {ok:false, src:"GA4",
       text:"13 000 сессий на /en/block — общая цифра по платформе",
       detail:"Страница блокировки встречается в разных точках пути, не только на главной. Природа блокировок требует breakdown от команды безопасности.",
       impact:"Нужен breakdown причин блокировок",
       dataNote:"⚠️ Не все блокировки — потеря. Часть — корректный антифрод"},
    ],
    barriers:[
      {text:"Промо-микс не оптимизирован: данные MIO и PBI дают разную картину", src:"MIO,PBI",
       detail:"MIO (gross): Casino $933K GGR, Sport $133K — казино в 7× больше по обороту. PBI (net после бонусов): Casino $244K, Sport $1.74M — спорт прибыльнее net. Расхождение объясняется бонусной нагрузкой на казино (~$690K за период). Промо должно учитывать оба показателя: казино важен для объёма и привлечения, спорт — для net-маржи.",
       impact:"Реформа бонусов казино важнее изменения промо-микса",
       dataNote:"⚠️ Данные MIO и PBI не противоречат — они считают разное. MIO = gross до бонусов, PBI = net после"},
      {text:"Персонализация первого экрана ограничена white-label платформой", src:"GA4",
       detail:"1xbet white-label нативно не поддерживает UTM-персонализацию или динамический контент по сегментам. Реалистичный вариант: URL-параметры, перенаправляющие на /casino или /sport. Два отдельных лендинга — более трудоёмко но работает.",
       impact:"Уточнить у техкоманды: что реализуемо в рамках текущей WL-конфигурации"},
    ],
    actions:[
      {p:0, src:"MIO,PBI",
       text:"Перебалансировать промо-сторис: 3 casino + 1 sport",
       detail:"Изменить пропорцию без удаления спорта. Текущий микс: 2 спортивных + 1 Aviator + 1 слот. Предложение: 1 welcome-бонус casino + 1 топовый слот + 1 Aviator + 1 спорт. Изменение контента в CMS — без разработки.",
       result:"Casino-user видит релевантный оффер первым; спорт-аудитория сохраняет своё промо"},
      {p:1, src:"GA4",
       text:"UFC/MMA и бокс в 'Топ спортах' для BR и MX",
       detail:"Заменить теннис или настольный теннис на UFC/MMA. 5 минут конфигурации. Если платформа поддерживает GEO-сегментацию блоков — разный топ для BR и MX.",
       result:"+15–20% релевантность спорт-блока для LATAM"},
    ],
    kpi:[
      {l:"Casino GGR gross",v:"$933K",c:"#a78bfa",src:"MIO"},
      {l:"Casino net прибыль",v:"$244K",c:"#f59e0b",src:"PBI"},
      {l:"Sport net прибыль",v:"$1.74M",c:"#22c55e",src:"PBI"},
      {l:"Разрыв MIO→PBI",v:"~$690K бонусы",c:"#f87171",src:"MIO,PBI"},
    ],
    context:"Первый экран: слоты видны + спортивные промо в сторис · 85% mobile",
    jtbd:"Когда попал на сайт → за 5 сек найти свою игру",
    ab:["H: 3 Casino + 1 Sport промо → +casino FTD rate","H: UFC в топ-спортах → +спорт MX/BR"],
    events:["page_view / (GA4)","GGR by product (MIO)","net profit by product (PBI)"],
  },
  {
    id:4, icon:"✍️", label:"Регистрация", sublabel:"Форма аккаунта",
    color:"#059669", colorLight:"#0a2e1f",
    users:106000, prevUsers:553000,
    metric:"106K начали → 80K завершили, completion 75.8% (GA4)", metric2:"Avg FTD $26.75 (PBI) · Avg все депозиты ~$38 (MIO)",
    emotion:3, emotionLabel:"Нейтрально", emotionText:"😊 1-click: 30 сек. 😑 Email: стандартно. 🤔 Бонус: условия по ℹ️",
    product:"all",
    steps:[
      {ok:true, src:"GA4",
       text:"1-click через телефон — минимум трения",
       detail:"Phone/social 1-click — лучший путь регистрации. Пользователи этого пути конвертируются в FTD лучше email-пути. Сильная сторона платформы.",
       impact:null},
      {ok:true, src:"GA4",
       text:"Email-регистрация: стандартная 3-шаговая форма",
       detail:"Email → (телефон опц.) → подтверждение → пароль. Форма стандартная для отрасли, сама по себе не проблема. Потенциальный риск: скорость письма подтверждения и попадание в спам на BR-провайдерах (UOL, Terra, Hotmail.com.br).",
       impact:null,
       dataNote:"ℹ️ Стоит проверить time-to-email и spam rate по GEO — особенно BR провайдеры"},
      {ok:false, src:"GA4",
       text:"Условия бонуса (вагер x35, срок) не видны до клика 'Выбрать'",
       detail:"Стандарт хорошего UX — ключевые параметры видны через ℹ️ тултип рядом с кнопкой бонуса до клика. Полные T&C — в отдельном разделе. Это также требование регуляторов в ряде юрисдикций. Раннее раскрытие снижает вероятность жалоб 'меня не предупреждали'.",
       impact:"–30% жалоб на условия бонуса при добавлении ℹ️ тултипа"},
      {ok:false, src:"GA4",
       text:"26K не завершили регистрацию — источник: GA4 funnel",
       detail:"Разница между GA4-событиями v3_Регистрация (~106K) и reg_done (~80K) = 26K незавершённых. Это реальная воронечная статистика. Причины разные: отвлёкся, передумал, технические проблемы. Расчёт потенциала: 26K × 20% конв. в FTD × avg FTD $26.75 (PBI) = ~$139K потенциальных депозитов.",
       impact:"(оценка) $139K: 26K × 20% конверсии × $26.75. Конверсия 20% — гипотеза, реальный Reg2Dep 8.7–13.1%",
       dataNote:"⚠️ $139K — расчётная оценка; 20% конверсия reg→FTD — гипотеза на основе PBI Reg2Dep 8.7–13.1%"},
    ],
    barriers:[
      {text:"25% drop регистраций — 26K потенциальных игроков", src:"GA4",
       detail:"Completion 75.8%. Ориентир для онлайн-казино: 80–85% (оценка, данных по LATAM нет). Приоритет: понять на каком именно шаге происходит drop через funnel в GA4. Reg2Dep из Power BI (8.7–13.1%) показывает что проблема не только в форме, но и в последующих шагах.",
       impact:"Определить топ-шаг drop — только после этого оптимизировать"},
      {text:"Условия бонуса скрыты до клика", src:"GA4",
       detail:"ℹ️ тултип с вагером, сроком, мин. депозитом рядом с кнопкой — стандарт Bet365, William Hill. Не полный T&C, а 3–4 ключевые цифры. Снижает жалобы и чарджбэки.",
       impact:"–30% жалоб 'условия не объяснили'"},
    ],
    actions:[
      {p:1, src:"GA4",
       text:"Добавить ℹ️ тултип с условиями бонуса",
       detail:"При клике ℹ️: вагер x35, срок 7 дней, мин. депозит, запрещённые игры. Разработка: 1–2 дня. Стандарт лицензированных казино.",
       result:"–30% жалоб на условия; снижение чарджбэков связанных с бонусом"},
      {p:1, src:"GA4,PBI",
       text:"Проверить delivery rate писем подтверждения для BR/MX",
       detail:"Мониторинг: % доставленных, открытых, в спаме по GEO. UOL, Terra, Hotmail.com.br часто блокируют транзакционные письма. Возможно нужен отдельный email-провайдер (SendGrid, Mailgun) с хорошей репутацией для LATAM.",
       result:"При наличии проблемы: +5–10% completion email-пути"},
    ],
    kpi:[
      {l:"Начали регистрацию",v:"106K",c:"#60a5fa",src:"GA4"},
      {l:"Завершили",v:"80K (75.8%)",c:"#22c55e",src:"GA4"},
      {l:"Avg FTD (первый деп.)",v:"$26.75",c:"#f59e0b",src:"PBI"},
      {l:"Avg все депозиты",v:"~$38",c:"#a78bfa",src:"MIO"},
    ],
    context:"3 метода: 1-click / телефон / email · Условия бонуса в T&C",
    jtbd:"Когда решил попробовать → зарегаться быстро и понять что получу",
    ab:["H: ℹ️ тултип с вагером → –30% жалоб","H: Email delivery fix → +completion BR"],
    events:["v3_Регистрация 106K (GA4)","reg_done 80K (GA4)","Reg2Dep cohort (PBI)"],
  },
  {
    id:5, icon:"💳", label:"Первый депозит", sublabel:"Главный bottleneck",
    color:"#dc2626", colorLight:"#3d0f0f",
    users:16000, prevUsers:80000,
    metric:"$1.28M отклонённых транзакций за 4 мес (MIO)", metric2:"MIO decline (все деп): Nov 47%→Feb 28% · PBI decline (FTD-когорта): Nov 26%→Feb 17.5%",
    emotion:1, emotionLabel:"Фрустрация", emotionText:"😕 «6 одинаковых PIX — какой правильный?» 😤 Decline после заполнения = злость и уход",
    product:"all",
    isCritical:true,
    steps:[
      {ok:false, src:"MIO",
       text:"6 идентичных PIX-провайдеров без объяснений — паралич выбора",
       detail:"На экране выбора — 6 кнопок 'PIX' без логотипа провайдера или отличий (Management.io показывает 6 активных PIX-провайдеров). Паралич выбора: пользователь не знает какой выбрать, тыкает наугад, получает decline. Замена на 1–2 надёжных PIX с логотипом и подписью 'Рекомендуем' снимает неопределённость.",
       impact:"Оценочно +10–15% success rate при оптимизации PIX-выбора"},
      {ok:false, src:"MIO",
       text:"Мексика: 33% decline — каждый третий платёж не проходит",
       detail:"Данные Management.io по декстрым транзакциям MX: 33% decline rate. В MX отсутствует OXXO — ведущий cash-метод страны (~40% e-commerce (данные Conekta/OpenPay, актуальность не проверялась)). Часть decline — отсутствие привычного метода оплаты.",
       impact:"Оценочно ~$35K потенциальных доп. депозитов в MX при добавлении OXXO"},
      {ok:true, src:"PBI",
       text:"Недельный retention улучшается: Oct 24–32% → Feb 38–51%",
       detail:"Power BI (retention_1_weeklydata): устойчивый позитивный тренд. Октябрь: 24–32%, Ноябрь–Декабрь: 18–41%, Январь: 35–45%, Февраль: 40–51%. Это значимое улучшение — продукт становится лучше удерживать активных игроков. Проблема остаётся в первичной активации: 60–82% 'активных' = новые игроки.",
       impact:null},
      {ok:false, src:"MIO",
       text:"Колумбия: 74% decline в ноябре — системная проблема",
       detail:"Management.io: decline rate CO ноябрь 74% — три из четырёх попыток депозита не проходят. Норма менее 20%. Требует audit error logs CO-транзакций: либо неверный провайдер, либо API-ошибки, либо банковские блокировки.",
       impact:"При решении CO decline: GGR CO потенциально ×3 от текущего"},
      {ok:false, src:"MIO",
       text:"8 037 сессий на /onpay/pending за 4 мес",
       detail:"GA4 фиксирует 8K сессий на странице ожидания платежа за ноябрь–февраль. Это пользователи возвращающиеся проверить статус. Часть pending транзакций в итоге проходит с задержкой — это не обязательно полная потеря. Нужны данные провайдера: pending conversion rate и avg время ожидания.",
       impact:"Нужен breakdown от провайдера: сколько pending в итоге конвертируется",
       dataNote:"ℹ️ Pending ≠ потеря. Часть транзакций проходит с задержкой — нужна статистика провайдера"},
      {ok:true, src:"MIO",
       text:"Уругвай: 0% decline — USDT работает, avg деп $577",
       detail:"Management.io: 2 игрока UY, avg депозит $577, decline 0%. Криптопровайдер для UY — референсный пример работающей платёжной схемы. Эти 2 игрока принесли $39K GGR за 4 месяца.",
       impact:"UY whale — benchmark: правильный метод оплаты = 0% decline"},
    ],
    barriers:[
      {text:"🔴 $1.28M отклонённых транзакций за 4 мес", src:"MIO",
       detail:"Management.io: 55 013 declined попыток × avg $23 = $1.28M за ноябрь–февраль. Это технические сбои и отсутствие нужных методов оплаты. Пользователи хотели заплатить. Даже 30% recovery = +$384K доп. депозитов.",
       impact:"(оценка) 30% recovery → +$384K. Реалистичность 30% recovery зависит от причин отказов (compliance vs технические)"},
      {text:"Нет OXXO в Мексике (40% e-commerce MX)", src:"MIO",
       detail:"OXXO — оплата через сеть магазинов-партнёров, охватывает аудиторию без банковских карт. Провайдеры интеграции: Conekta, OpenPay. Срок подключения: 2–4 недели.",
       impact:"(оценка) +40–60% MX депозитов — гипотеза на основе доли OXXO в мексиканском e-commerce"},
      {text:"CO: 74% decline — требует немедленного расследования", src:"MIO",
       detail:"Error logs CO-транзакций покажут причину: API ошибки (→ смена провайдера), банковские блокировки (→ Efecty или PSE для CO). При норме <20% decline (ориентир, не LATAM-специфичный) потенциал CO в 3× выше.",
       impact:"CO потенциал при норм. decline: ×3 от текущего объёма"},
    ],
    actions:[
      {p:0, src:"MIO",
       text:"Оставить 1–2 надёжных PIX с логотипом",
       detail:"Протестировать success rate всех 6 PIX-провайдеров за последний месяц (Management.io). Выбрать 1–2 лучших. Добавить: логотип, '~2 минуты', бейдж 'Рекомендуем'. A/B тест 2 недели.",
       result:"+10–15% success rate BR → ~$35–50K доп. депозитов/мес"},
      {p:0, src:"MIO",
       text:"Подключить OXXO для Мексики (Conekta/OpenPay)",
       detail:"MX decline 33% (MIO). OXXO через Conekta или OpenPay — стандарт для мексиканского рынка. Срок: 2–4 недели.",
       result:"Ожидаемо: +40–60% MX депозитов → +$15–22K/мес"},
      {p:0, src:"MIO",
       text:"Audit CO: error logs за последний месяц",
       detail:"Выгрузить все failed CO-транзакции с error codes из Management.io. Определить топ-3 причины. API ошибки → смена провайдера. Банк-блоки → добавить Efecty или PSE.",
       result:"CO потенциал при решении: +$8–14K/мес"},
    ],
    kpi:[
      {l:"Declined транзакции",v:"$1.28M",c:"#f87171",src:"MIO"},
      {l:"Decline Nov",v:"47%",c:"#f87171",src:"MIO"},
      {l:"Decline Feb",v:"28%",c:"#22c55e",src:"MIO"},
      {l:"CO decline Nov",v:"74%",c:"#f87171",src:"MIO"},
    ],
    context:"Сразу после рег · 6 одинаковых PIX · pending 8K сессий · UY whale 0% decline",
    jtbd:"Когда создал аккаунт → внести деньги за 1 мин привычным способом",
    ab:["H: 1–2 PIX вместо 6 → +15% success BR","H: OXXO MX → +40–60% MX conversion"],
    events:["deposit OK/Fail by GEO (MIO)","/onpay/pending 8K (GA4)","decline rate by method (MIO)"],
  },
  {
    id:6, icon:"🎮", label:"Первая игра", sublabel:"Активация",
    color:"#7c3aed", colorLight:"#2d1b69",
    users:39900, prevUsers:16000,
    metric:"39.9K bet_done (MIO) · Casino gross GGR $933K vs net $244K (MIO/PBI)", metric2:"Casino маржа gross 4% (PBI) · Sport net маржа 52% (PBI)",
    emotion:4, emotionLabel:"Азарт", emotionText:"😊 Нашёл Fortune Tiger — крутит! 😍 Через поиск нашёл слот: сессия 10+ минут",
    product:"all",
    steps:[
      {ok:true, src:"MIO,PBI",
       text:"39.9K bet_done · Casino оборот: PBI $6.06M bet amount / MIO $23.5M gross",
       detail:"MIO: 39 900 событий bet_done, gross оборот $23.5M (включает все ставки). PBI (operational_gambling_report_1): bet amount $6.06M за Nov–Feb — разница объясняется методологией: MIO считает все транзакции, PBI — чистые ставки после round-trips. GGR gross $933K (MIO), net profit $244K (PBI).",
       impact:null,
       dataNote:"ℹ️ $23.5M (MIO) vs $6.06M (PBI) — разные методологии подсчёта оборота. Для маржи используем PBI: 4.02%"},
      {ok:true, src:"GA4",
       text:"Casino Search: 643 сек сессия — лучший engagement",
       detail:"GA4: путь через /casino/search даёт максимальную длину сессии — 643 секунды (10.7 мин). Поиск-пользователи играют дольше и возвращаются чаще. Строка поиска сейчас не на первом экране мобильного лобби.",
       impact:"Поднять видимость поиска → +20–30% средняя сессия"},
      {ok:false, src:"MIO",
       text:"Fortune Tiger: #1 по игрокам (2 878), маржа gross 1.15%",
       detail:"Management.io: самая популярная игра — почти нулевая gross-маржа. Оборот $334K, GGR $3.85K. После бонусной нагрузки — net отрицательный или около нуля. Нормально для хайп-слота Pragmatic Play, но продвигать его как основной продукт невыгодно.",
       impact:"Продвижение Fortune Tiger → объём, но не прибыль. Нужен баланс с высокомаржинальными играми"},
      {ok:false, src:"PBI",
       text:"Убыточные провайдеры (топ): Barbara Bang –$5.7K · Hacksaw –$4.3K · Betsoft –$2.7K · Bragg –$2.1K + 44 провайдера",
       detail:"Power BI (operational_gambling_report_1, Nov–Feb): 50+ провайдеров с отрицательным результатом. Топ-6: Barbara Bang –$5,741 · Hacksaw Gaming –$4,324 · Betsoft Gaming –$2,711 · Bragg –$2,057 · 1x2Network –$1,873 · Slotegrator –$1,858. Итого убытки провайдеров >$100: –$24,121 за период. GameBeat в PBI-файлах не найден — был только в MIO за другой период.",
       impact:"–$24,121 прямой убыток → ~–$72K/год. Топ-3 приоритет: Barbara Bang, Hacksaw, Betsoft",
       dataNote:"ℹ️ Полный список: 50+ убыточных провайдеров. Крупные — отключить, мелкие (< $100 убытка) — переоценить контракты"},
            {ok:true, src:"PBI",
       text:"Баскетбол: $379,917 прибыли, маржа 41% — 2-й по доходности",
       detail:"Power BI (operational_betting_report_data): Баскетбол — Profit $379,917, Margin 41.0%, 408 пользователей. 2-й по прибыли спорт после футбола ($724K). В MIO за другой период данные были отрицательными — PBI является приоритетным источником для net-метрик. Настольный теннис — лучшая маржа 61.4%, но меньше объёма.",
       impact:null},
      {ok:true, src:"MIO",
       text:"Energy Coins: маржа gross 14.5% · Joker's Jewels: 17.5%",
       detail:"Management.io: высокомаржинальные слоты с реальными пользователями. Energy Coins: $65K GGR gross, 921 игрок. Joker's Jewels Hot: 17.5% gross маржа. Сейчас не в топе лобби — нужно продвинуть.",
       impact:"Перемещение в топ-3 лобби → ×3–4 рост игроков → +$50–100K GGR/квартал (оценка)"},
    ],
    barriers:[
      {text:"Бонусная нагрузка Casino: gross $933K → net $244K (разрыв $690K)", src:"MIO,PBI",
       detail:"Management.io gross GGR казино: $933K. Power BI net прибыль казино: $244K. Разница ~$690K за 4 месяца — это стоимость бонусной программы с win rate 9.9%. Это самый большой финансовый рычаг: реформа бонусов казино важнее любого другого улучшения.",
       impact:"Снижение бонусной нагрузки на 30% = +$207K net прибыли при тех же оборотах"},
      {text:"Убыточные провайдеры: –$24,121 net за период (50+ провайдеров)", src:"PBI",
       detail:"PBI: топ убытков — Barbara Bang –$5.7K, Hacksaw –$4.3K, Betsoft –$2.7K, Bragg –$2.1K, 1x2Network –$1.9K, Slotegrator –$1.9K. Итого >$100 убытка: –$24,121. Ещё 44 провайдера с меньшими потерями. Проверить контракты — приоритет топ-3.",
       impact:"–$72K/год если не решить. Отключение топ-3 = немедленная экономия $15K/период"},
      {text:"Слоты $293,786 net profit · Live Casino $56,228 — основные прибыльные категории", src:"PBI",
       detail:"Power BI (games_report_casino): Слоты — $293,786 net profit, Live Casino — $56,228, 1xGames — $12,477. По MIO: Energy Coins (14.5% gross маржа), Joker's Jewels (17.5%) не в топ лобби — их продвижение увеличит net. Aviator: –$217 net (незначительно, но факт).",
       impact:"Оптимизация лобби под маржинальные слоты → +$50–100K GGR/квартал (оценка MIO)"},
    ],
    actions:[
      {p:0, src:"PBI",
       text:"Отключить топ-3 убыточных провайдера: Barbara Bang, Hacksaw, Betsoft",
       detail:"PBI данные (operational_gambling_report_1): Barbara Bang –$5,741, Hacksaw Gaming –$4,324, Betsoft Gaming –$2,711. Итого только топ-3: –$12,776/период. Алгоритм: проверить контракт → нет lock-in → отключить → есть lock-in → переговоры на пересмотр условий. Полный список убыточных (50+) — ревизия в фоне.",
       result:"+$12,776/период от топ-3. Полный потенциал всех убыточных: +$24,121/период (~$72K/год)"},
      {p:1, src:"MIO",
       text:"Поднять Energy Coins и Joker's Jewels в топ-3 лобби",
       detail:"Изменить сортировку на margin-weighted или вручную закрепить в первых позициях (Management.io данные по марже). Добавить бейдж 'HOT' / 'Editor's Choice'. A/B тест 2 недели.",
       result:"×3–4 рост игроков → +$50–100K GGR/квартал (оценка)"},
      {p:1, src:"GA4",
       text:"Добавить поиск на первый экран мобильного лобби",
       detail:"Поисковая строка в хедере лобби. GA4: search-путь = 643с vs 280с среднее. Быстрое UI-изменение с высоким ROI.",
       result:"+20–30% средняя длина сессии для search-пользователей"},
    ],
    kpi:[
      {l:"Casino GGR gross",v:"$933K",c:"#a78bfa",src:"MIO"},
      {l:"Casino net прибыль",v:"$244K",c:"#f59e0b",src:"PBI"},
      {l:"Убыт. провайдеры (50+)",v:"–$24.1K",c:"#f87171",src:"PBI"},
      {l:"Energy Coins маржа",v:"14.5%",c:"#4ade80",src:"MIO"},
    ],
    context:"Gross GGR (MIO) vs Net прибыль (PBI) — разные метрики, одна реальность",
    jtbd:"Когда деньги на балансе → быстро найти нужную игру",
    ab:["H: Прибыльные игры в топ → +маржа (MIO)","H: Отключить убыточных → +$12K/период (PBI)"],
    events:["bet_done 39.9K (MIO)","GGR by game/provider (MIO)","net profit by provider (PBI)"],
  },
  {
    id:7, icon:"🔥", label:"Активная игра", sublabel:"Где ломается retention",
    color:"#6d28d9", colorLight:"#2e1065",
    users:20000, prevUsers:39900,
    metric:"4 306 бонусов выдано (MIO) · Welcome win rate 9.9% (MIO)", metric2:"CR в 2-й депозит 37.5% (PBI) — ключевой момент удержания",
    emotion:1, emotionLabel:"Фрустрация", emotionText:"😤 «Вагер x35 за 7 дней — нереально. Бонус есть, а выиграть нельзя» — ощущение несправедливости",
    product:"all",
    isCritical:true,
    steps:[
      {ok:true, src:"GA4",
       text:"MyCasino hub — хорошая точка возврата",
       detail:"GA4: MyCasino — активно используемый раздел. Пользователь видит активные бонусы, историю, рекомендованные игры. Работает как точка re-entry.",
       impact:null},
      {ok:false, src:"MIO",
       text:"Welcome 100%: из 1 055 получивших — 104 отыграли (win rate 9.9%)",
       detail:"Management.io бонусный отчёт: 1 055 выдано Welcome-бонусов, 104 успешно отыграли = 9.9% win rate. Проблема не обязательно в размере вагера (x35 встречается на рынке). Вероятные причины: 7-дневный срок слишком короткий + игры с ограниченным вкладом в вагер (например live casino 10% вместо 100%). Решение: увеличить срок до 21 дня ИЛИ снизить вагер до x25.",
       impact:"При win rate 25% → в 2.5× больше игроков успешно отыгрывают → лучше D1"},
      {ok:false, src:"MIO",
       text:"Mid-week reload: 989 получили, 32 отыграли (win rate 3.2%)",
       detail:"Management.io: еженедельный reload-бонус в середине недели. Win rate 3.2% — очень низкий. Freebet без вагера: 100% воспринимаемый win rate при той же стоимости для платформы (~$10 × 1 000 выдач = $10K/мес).",
       impact:"Замена на Freebet $5–10 без вагера: с 3.2% → 100% восприятие"},
      {ok:false, src:"MIO",
       text:"Weekend sport boost: win rate 1.3% — почти нет победителей",
       detail:"Management.io: weekend sport бонус. 1.3% win rate. Сравнение: sport cashback (615 выдач, win rate 100%) работает отлично. Weekend boost в нынешней конфигурации хуже cashback-механики.",
       impact:"Пересмотр условий weekend boost или замена на cashback-формат"},
      {ok:true, src:"MIO",
       text:"Sport cashback: win rate 100% — лучший retention-инструмент",
       detail:"Management.io: 615 кэшбэков выдано, все получили реальные деньги без условий. Игроки с кэшбэком показывают лучший D7 и D30. Масштабировать на казино.",
       impact:"Casino cashback 5% по той же схеме — следующий шаг"},
      {ok:true, src:"PBI",
       text:"CR в 2-й депозит 37.5% — критический момент удержания",
       detail:"Аналитический документ PBI: CR 2 dep = 37.5%, CR 3 dep = 66.1%, CR 5+ dep = 81.5%. Косвенное подтверждение из Marketing report: 47.8% активных игроков еженедельно делают 2+ депозитов (cross-sectional). Прямой когортной таблицы в выгрузках нет — цифры из аналитического документа, уточнить у аналитика метод расчёта.",
       impact:"Цель #1: конвертировать FTD → 2nd dep. Если цифры верны — кто дошёл до 3-го с вероятностью 66% дойдёт до 5+",
       dataNote:"ℹ️ CR 37.5%/66.1%/81.5% — из аналитического документа, не прямая выгрузка. Нужна верификация когортной таблицы"},
    ],
    barriers:[
      {text:"🔴 Welcome win rate 9.9% — конфигурация требует пересмотра", src:"MIO",
       detail:"x35 вагер сам по себе рыночная норма. Проблема: срок 7 дней + игры с низким вкладом. Fortune Tiger может иметь 50–70% вклад в вагер вместо 100% — тогда вагер расходуется медленно и срок истекает. Решение: (A) x35 за 21 день, (B) x25 за 14 дней + явное указание вклада каждой игры.",
       impact:"Win rate 9.9% → 20–25% при изменении конфигурации"},
      {text:"Mid-week и Weekend бонусы хуже чем их отсутствие", src:"MIO",
       detail:"Win rate 3.2% и 1.3%. Пользователи регулярно теряют 'бонусные' деньги. Психологически потеря бонуса ощущается как потеря своих денег — снижает доверие. Cashback (100% win rate) показывает что альтернатива работает.",
       impact:"Замена mid-week на Freebet: с 3.2% → 100% восприятие при ~той же стоимости"},
      {text:"CR в 2-й депозит 37.5% — нет целевой кампании на этот момент", src:"PBI",
       detail:"Power BI: кто дошёл до 2-го депозита → CR в 5+ депозитов = 81.5%. Это самый критичный момент retention. Сейчас нет специфической кампании на конвертацию FTD → 2nd dep. Re-dep оффер через 24–48 ч — прямой инструмент.",
       impact:"При росте CR 2nd dep на 10 п.п.: значительный прирост LTV всей когорты"},
    ],
    actions:[
      {p:0, src:"MIO",
       text:"Пересмотреть конфигурацию Welcome-бонуса: срок или вагер",
       detail:"Вариант A: оставить x35, увеличить срок с 7 до 21 дней. Вариант B: снизить до x25, срок 14 дней. В обоих случаях: добавить явное указание вклада каждой игры в вагер в интерфейсе бонуса.",
       result:"Win rate 9.9% → 20–25%. D1 retention улучшается"},
      {p:0, src:"MIO,PBI",
       text:"Re-dep оффер через 24–48ч после FTD (конвертация в 2-й деп)",
       detail:"Триггер: если игрок не вернулся через 24ч после FTD → автоматический оффер '30% на второй депозит до $50'. Power BI: CR в 2nd dep 37.5% — каждый дополнительный игрок дошедший до 2-го депа с вероятностью 66% дойдёт до 3-го.",
       result:"PBI данные: 2nd dep → 81.5% CR в 5+ deps. Главный рычаг удержания"},
      {p:1, src:"MIO",
       text:"Заменить mid-week reload на Freebet $5–10 без вагера",
       detail:"Freebet: 1 ставка, выигрыш — деньги без условий. 100% воспринимаемый win rate. Стоимость: ~$10K/мес. ROI: удержание 1 000 игроков в программе retention.",
       result:"Win rate 3.2% → 100% восприятие. +loyalty без ощущения обмана"},
    ],
    kpi:[
      {l:"Welcome win rate",v:"9.9%",c:"#f87171",src:"MIO"},
      {l:"Mid-week win rate",v:"3.2%",c:"#f87171",src:"MIO"},
      {l:"Sport cashback",v:"100% ✅",c:"#22c55e",src:"MIO"},
      {l:"CR 2nd deposit",v:"37.5%",c:"#60a5fa",src:"PBI"},
    ],
    context:"4 306 бонусов выдано · Win rates из MIO · CR 2nd dep из PBI",
    jtbd:"Когда играю регулярно → хочу бонусы с реальными шансами",
    ab:["H: Срок → 21 день → win rate + (MIO)","H: Re-dep 24ч → CR 2nd dep + (PBI)"],
    events:["bonus win rate (MIO)","CR 2nd/3rd/5+ dep (PBI)","/bonuses/wager 6.6K (GA4)"],
  },
  {
    id:8, icon:"🏦", label:"Вывод средств", sublabel:"Момент истины",
    color:"#b45309", colorLight:"#3d1a00",
    users:13000, prevUsers:20000,
    metric:"OK rate: Nov 60.7% → Feb 79.8% (MIO) — позитивная динамика", metric2:"$1.5M отказанных выводов за 4 мес (MIO)",
    emotion:1, emotionLabel:"Гнев", emotionText:"🤬 «Я выиграл, хочу вывести — а меня никто не предупредил про верификацию» → неожиданность",
    product:"all",
    isCritical:true,
    steps:[
      {ok:true, src:"MIO",
       text:"KYC при выводе — отраслевая и юридическая норма",
       detail:"KYC при выводе — стандарт и юридическое требование. Проблема не в самом KYC, а в коммуникации: пользователь не был предупреждён заранее. Решение — информирование, не отмена KYC.",
       impact:null},
      {ok:false, src:"GA4",
       text:"Пользователь узнаёт о KYC впервые только при выводе",
       detail:"GA4: 14 200 сессий на /security (109 сек заполнения). Пользователь который прошёл онбординг без упоминания KYC воспринимает его появление при выводе как сюрприз. Стандарт: добавить упоминание при регистрации или первом пополнении — 'для вывода потребуется верификация (2 минуты)'.",
       impact:"–50% жалоб 'казино держит деньги' при добавлении предупреждения"},
      {ok:false, src:"MIO",
       text:"$1.5M отказанных выводов за 4 мес — нужен breakdown причин",
       detail:"Management.io: 30 200 транзакций на вывод, 8 600 отказано, avg ~$174. OK rate вырос с 60.7% (ноябрь) до 79.8% (февраль) — улучшение на 19 п.п. Норма по индустрии ~90%+ (оценка, нет LATAM-специфичных данных). Причины отказов: часть — корректный compliance, часть — потенциально превентируемые. Нужен breakdown.",
       impact:"Каждый +1 п.п. OK rate ≈ +$37.5K/мес доп. выплат при текущих объёмах",
       dataNote:"⚠️ $1.5M denied — не вся эта сумма 'потеря': часть отказов корректна с точки зрения compliance и антифрода"},
      {ok:false, src:"GA4",
       text:"Мин. вывод не коммуницируется рядом с мин. депозитом",
       detail:"Минимальные суммы вывода — нормальная практика (защита от микровыводов, комиссии провайдеров). Проблема только если пользователь не видел информацию до первой попытки вывода. Решение: добавить на экран пополнения информацию о мин. сумме вывода.",
       impact:"Устраняет негативный сюрприз у новых игроков при первом выводе"},
      {ok:true, src:"MIO",
       text:"Тренд: Nov 60.7% → Feb 79.8% OK rate — +19 п.п. за 4 мес",
       detail:"Management.io: устойчивое улучшение OK rate выводов. Команда работает над проблемой. До нормы индустрии (90%+) ещё ~10 п.п. Каждый процентный пункт = ~$37.5K/мес доп. выплат.",
       impact:"До нормы: +$375K/мес при достижении 90% OK rate"},
    ],
    barriers:[
      {text:"Пользователь не предупреждён о KYC до первого вывода", src:"GA4",
       detail:"KYC — норма и закон. Неожиданность — нет. Одна строка при регистрации или первом пополнении устраняет 80% негативной реакции. Стандарт индустрии — упоминание KYC requirements заранее.",
       impact:"–50% жалоб 'казино не отдаёт деньги'"},
      {text:"OK rate 79.8% — до нормы ~10 п.п.", src:"MIO",
       detail:"Ориентир ~90%+ (оценка). Текущий: 79.8% при позитивной динамике. Breakdown denied выводов по причинам покажет сколько из них preventable (UX, технические) vs compliance (норм).",
       impact:"Каждый +1 п.п. ≈ +$37.5K/мес доп. выплат"},
    ],
    actions:[
      {p:0, src:"GA4",
       text:"Добавить упоминание KYC при регистрации / первом пополнении",
       detail:"Баннер или одна строка: 'Для вывода средств потребуется подтверждение личности — стандартная процедура (~2 минуты)'. Без разработки — изменение текста в CMS.",
       result:"–50% жалоб 'казино держит деньги'; снижение чарджбэков"},
      {p:0, src:"MIO",
       text:"Получить breakdown denied withdrawals по причинам",
       detail:"Запросить у команды Management.io: топ-5 причин отказов за последний месяц. Определить: compliance (норм.) vs технические UX-ошибки (можно исправить). Только после этого оптимизировать.",
       result:"Понять реальный потенциал улучшения OK rate"},
      {p:0, src:"GA4,MIO",
       text:"Добавить мин. сумму вывода на экран пополнения",
       detail:"Одна строка рядом с выбором суммы депозита. Устраняет негативный сюрприз у игроков с небольшим балансом. Изменение без разработки.",
       result:"Снижение жалоб новых игроков при первой попытке вывода"},
    ],
    kpi:[
      {l:"OK rate Feb",v:"79.8%",c:"#22c55e",src:"MIO"},
      {l:"OK rate Nov",v:"60.7%",c:"#f59e0b",src:"MIO"},
      {l:"Denied total",v:"$1.5M",c:"#f87171",src:"MIO"},
      {l:"KYC сессий",v:"14.2K / 109с",c:"#f59e0b",src:"GA4"},
    ],
    context:"KYC — норма, но без предупреждения = шок · OK rate растёт +19 п.п.",
    jtbd:"Когда выиграл → вывести быстро и без неожиданных требований",
    ab:["H: KYC-уведомление при рег → –50% жалоб","H: Breakdown denied → найдём preventable отказы"],
    events:["withdrawal OK/Fail (MIO)","/security 14.2K (GA4)","OK rate trend (MIO)"],
  },
  {
    id:9, icon:"🔄", label:"Возврат", sublabel:"Retention: D1 3.75% при норме 25–35%",
    color:"#be123c", colorLight:"#4c0519",
    users:6200, prevUsers:13000,
    metric:"D1: 3.75% · D7: 0.92% · D30: 0.20% (GA4 cohort)", metric2:"Мес. retention 15.5–34.8% (PBI) · Недельный: Oct 24% → Feb 51% ✅ тренд растёт (PBI)",
    emotion:1, emotionLabel:"Негатив", emotionText:"😒 Тройной негативный опыт: сложный депозит + бонус нереально отыграть + неожиданный KYC. Нет причины вернуться.",
    product:"all",
    isCritical:true,
    steps:[
      {ok:false, src:"GA4",
       text:"D1: 3.75% — критически низкий показатель без CRM-механизмов",
       detail:"GA4 когорты: из 100 новых пользователей на следующий день возвращаются 4. Для сравнения: публичных бенчмарков D1 retention именно для онлайн-казино LATAM нет. Ориентир по онлайн-казино в целом (AppsFlyer, Adjust) — 8–15%. Цифра 25–35% из мобильных игр (Candy Crush, Clash of Clans) — к казино неприменима. Главная причина низкого D1 — не продукт, а отсутствие механизмов возврата: нет email, нет push, нет оффера следующего дня.",
       impact:"Цель реалистична: D1 8–12% через CRM-онбординг → DAU с 4K до ~8–10K",
       dataNote:"⚠️ Бенчмарк D1 25–35% — mobile gaming, не онлайн-казино. Для казино LATAM публичных данных нет"},
      {ok:false, src:"PBI",
       text:"Месячный retention 15–35% — 65–85% активных теряются каждый месяц",
       detail:"Power BI: месячное сохранение активности 15–35%. Продукт сильно зависит от постоянного притока новых клиентов. Реактивация: 2.7–6.0% — потерянные клиенты практически не возвращаются. CRM-коммуникация недостаточно эффективна.",
       impact:"Рост реактивации с 2.7–6% до 10% = значительный доп. объём без затрат на привлечение"},
      {ok:false, src:"PBI",
       text:"Реактивация 3–6% — потерянные клиенты почти не возвращаются",
       detail:"Power BI: реактивация (вернувшиеся после 30+ дней неактивности) = 2.7–6.0% в месяц (Nov минимум 2.7%, Feb 6.0%). Конкуренты используют автоматизированные триггерные кампании D+1, D+3, D+7. CRM-реактивация до 10–15% — реалистичная цель.",
       impact:"Ориентир: реактивация 10–15% (нет LATAM-бенчмарка; это оценочная цель)"},
      {ok:true, src:"GA4",
       text:"7 800 возвратов через промокоды /coupon — работает",
       detail:"GA4: 7.8K сессий через /coupon за период. Промокоды — единственный измеримый retention-механизм. Работают. Нужна автоматизация: промокод уходит автоматически на D2, D4, D7 тем кто не вернулся.",
       impact:"×2–3 промо-retention при системном подходе vs разовые акции"},
      {ok:true, src:"GA4",
       text:"Engagement time растёт: 134с → 201с (+50% за 4 мес)",
       detail:"GA4: средний engagement time вырос с 134 до 201 секунды. Пользователи которые остаются — вовлекаются глубже. Продукт хорош для тех кто пробует. Проблема — в первичном retention, не в самом продукте.",
       impact:"Растущий engagement = потенциал. Нужно привлечь пользователей назад"},
      {ok:true, src:"PBI",
       text:"Недельный retention: Oct 24% → Feb 51% — сильный позитивный тренд",
       detail:"Power BI (retention_1_weeklydata): недельное удержание стабильно растёт 4 месяца. Oct'25: 24–32% → Nov: 18–31% → Dec: 28–41% → Jan'26: 35–45% → Feb: 40–51%. Последние 4 недели — стабильно выше 40%. Это сигнал что изменения в продукте или трафике начинают работать.",
       impact:"Если тренд сохранится: к маю недельный retention может достичь 55–60%"},
    ],
    barriers:[
      {text:"D1 3.75% — нет онбординга после FTD, нет возвратного механизма", src:"GA4",
       detail:"После первого депозита и игры — полная тишина. Нет email, нет push, нет оффера. Конкуренты: T+2ч 'Ваш баланс $47, Fortune Tiger обновился'. Стандартная практика.",
       impact:"Онбординг-последовательность 3 касания: D1 +3–8 п.п. по данным A/B тестов"},
      {text:"Реактивация 3–6% — CRM-коммуникация не работает", src:"PBI",
       detail:"Power BI: потерянные клиенты почти не возвращаются. Нужны автоматизированные триггеры по сегментам: D+1 (не вернулся) → оффер. D+3 → напоминание. D+7 → промокод. Цель: реактивация 10–15%.",
       impact:"Рост реактивации 3% → 10% при той же базе трафика"},
      {text:"DAU снизился с 11K до 4K за 4 мес — отток > притока", src:"GA4",
       detail:"GA4: устойчивый тренд снижения DAU. Без retention-механизмов ежемесячный отток превышает приток новых. Требует комплексного решения: онбординг + бонусная реформа + CRM.",
       impact:"При сохранении тренда: через 6 мес DAU ~2K"},
    ],
    actions:[
      {p:0, src:"GA4,PBI",
       text:"Email/push онбординг: 3 касания за 48ч после FTD",
       detail:"T+2ч: результаты сессии + 'Fortune Tiger ждёт'. T+24ч: прогресс вагера. T+48ч: re-dep оффер 30%. Ориентир: CR в 2nd dep 37.5% (PBI) — это ключевой момент который нужно поддержать коммуникацией.",
       result:"D1: 3.75% → 8–12%. D7: 0.92% → 3–5%. Основной рычаг роста."},
      {p:0, src:"MIO",
       text:"Реформа Welcome-бонуса: срок или вагер",
       detail:"Бонус который реально отыграть → игрок возвращается на следующий день. Текущая конфигурация: 90% теряют бонус за 7 дней. Варианты: x35/21 день или x25/14 дней.",
       result:"Win rate 9.9% → 20–25%. Прямое влияние на D1."},
      {p:1, src:"PBI",
       text:"Автоматизировать CRM-реактивацию: D+1/D+3/D+7 триггеры",
       detail:"Power BI рекомендация: триггерные кампании для оттока. D+1 без возврата → push/email с оффером. D+3 → напоминание. D+7 → промокод. Цель: реактивация 3–6% → 10–15%.",
       result:"PBI цель: реактивация ×2–3 при той же базе"},
    ],
    kpi:[
      {l:"D1 retention",v:"3.75%",c:"#f87171",src:"GA4"},
      {l:"D7 retention",v:"0.92%",c:"#f87171",src:"GA4"},
      {l:"Мес. retention (Feb)",v:"34.8%↑",c:"#22c55e",src:"PBI"},
      {l:"Недельный (Feb)",v:"40–51%↑",c:"#22c55e",src:"PBI"},
    ],
    context:"D1/D7/D30 из GA4 когорт · Месячный retention и реактивация из Power BI",
    jtbd:"Когда давно не заходил → нужен реальный повод вернуться",
    ab:["H: Email 3 касания → D1 ×2.5 (GA4)","H: CRM триггеры → реактивация ×2 (PBI)"],
    events:["cohort D1–D41 (GA4)","/coupon 7.8K (GA4)","monthly retention (PBI)","reactivation rate (PBI)"],
  },
  {
    id:10, icon:"⭐", label:"Лояльность", sublabel:"VIP & Whale — концентрация дохода",
    color:"#9f1239", colorLight:"#4c0519",
    users:1350, prevUsers:6200,
    metric:"Вип++: 12 игроков = 29.5% депозитов, 36.7% NGR (PBI)", metric2:"VIP++ NGR $340K / 12 игроков = $28,377/игрока · $218 avg dep/tx (PBI)",
    emotion:2, emotionLabel:"Непонимание", emotionText:"😕 'Медный уровень, 0 баллов' — непонятно что даёт и как расти. 😎 Whale: доволен пока вывод проходит быстро.",
    product:"all",
    steps:[
      {ok:false, src:"GA4",
       text:"'Медный уровень, 0 баллов' — что это даёт, неизвестно",
       detail:"GA4: /vipcashback — 4 200 сессий (0.6% базы). VIP-страница показывает уровень без объяснений: что даёт, как набирать баллы, когда переход. Это как punch card без инструкции.",
       impact:"0.6% использование VIP vs ориентир 3–5% (бенчмарк без верифицированного источника)"},
      {ok:false, src:"PBI",
       text:"Вип++: 12 игроков = 29.5% депозитов и 36.7% NGR — концентрация риска",
       detail:"Power BI: 12 игроков Вип++ генерируют 29.5% всех депозитов и 36.7% NGR. Потеря 2–3 таких игроков существенно повлияет на P&L. Ещё: 64 VIP из новых когорт (Sep–Feb) принесли $941.5K депозитов, ARPU $3 756.",
       impact:"Потеря 3 Вип++ = потеря ~10% депозитов и ~11% NGR"},
      {ok:false, src:"PBI",
       text:"VIP++ NGR $340K от 12 игроков = $28,377 ARPU на игрока (Nov–Feb)",
       detail:"PBI clients_summary (Nov–Feb): VIP++ NGR $340,519 / 12 активных игроков = $28,377 NGR на игрока за период. Avg FTD ARPU $26.75 (FTD.xlsx). Аналитический документ указывает ARPU $3,756 — это другой период/метрика (возможно месячный, не 4-мес). Разрыв в любом случае огромный: VIP++ приносит в 50–1000× больше обычного игрока в зависимости от расчёта.",
       impact:"Каждый уходящий VIP++ = потеря эквивалентная десяткам-сотням FTD",
       dataNote:"⚠️ $3,756 ARPU и 134× — из аналитического документа. По выгрузкам: $28,377 NGR/игрока за 4 мес (другая цифра, другой период)"},
      {ok:true, src:"MIO",
       text:"Sport cashback: 615 авто-выплат — честно и прозрачно",
       detail:"Management.io: 615 кэшбэков, все выплачены без условий. Win rate 100%. Игроки с кэшбэком показывают лучший D30. Масштабировать на казино.",
       impact:"Casino cashback 5% по той же схеме"},
      {ok:false, src:"PBI,MIO",
       text:"Нет Whale Detection и персонального менеджера",
       detail:"2 игрока UY со средним депозитом $577 принесли $39K GGR за 4 мес (MIO). Power BI: Вип++ 12 человек = 36.7% NGR. Нет автотриггера 'игрок тратит $500+/мес → назначить менеджера'.",
       impact:"Whale churn без персонального сервиса: высокий (60–70% — оценочный бенчмарк, источник не верифицирован)"},
      {ok:false, src:"PBI",
       text:"Перу — самый слабый рынок по марже (8.7%)",
       detail:"Аналитический документ (PBI): маржинальность по GEO: AR 31.2% → CL 24.1% → BR 20.9% → PE 8.7% (в прямых выгрузках этих файлов не найдено — из документа). Перу требует отдельного анализа: либо улучшение качества трафика, либо пересмотр присутствия на рынке.",
       impact:"Ресурсы на PE с 8.7% маржой могут быть эффективнее направлены в AR (31.2%)"},
    ],
    barriers:[
      {text:"Концентрация дохода: 12 Вип++ = 36.7% NGR", src:"PBI",
       detail:"Power BI: критическая зависимость от малого числа игроков. Диверсификация VIP-базы — стратегический приоритет. Нужно растить Вип и Превип сегменты.",
       impact:"Потеря 3 Вип++ игроков = –11% NGR"},
      {text:"VIP невидима: 99.4% пользователей не знают о программе", src:"GA4",
       detail:"GA4: /vipcashback 4 200 сессий = 0.6% базы. Нет email при достижении уровня, нет бейджа в интерфейсе. При 3% engagement → 20K VIP vs текущих 4.2K.",
       impact:"×5 рост VIP-базы через discovery и коммуникацию"},
      {text:"Перу: маржа 8.7% vs Аргентина 31.2%", src:"PBI",
       detail:"Power BI geo-маржинальность: огромный разрыв между рынками. Ресурсы следует перераспределить в пользу высокомаржинальных рынков (AR, CL) или найти причину низкой маржи PE.",
       impact:"Перераспределение бюджета AR+CL vs PE потенциально +15–20% avg маржи"},
    ],
    actions:[
      {p:1, src:"PBI,MIO",
       text:"Whale Detection: $500+/мес → автоназначение менеджера",
       detail:"Автотриггер: сумма депозитов за 30 дней > $500 → email менеджеру + пуш игроку. Power BI: ARPU VIP $3 756, 1 менеджер стоит $1 500–2 000/мес. ROI: один удержанный Вип++ = 36.7% NGR защищены.",
       result:"ROI менеджера VIP: 1 удержанный Вип++ >> годовая зарплата менеджера"},
      {p:1, src:"GA4",
       text:"Показать VIP-дорогу: уровни + привилегии + прогресс-бар",
       detail:"Страница /vip: 5 уровней (Медный → Элита), привилегии на каждом (кэшбэк %, скорость вывода, менеджер), очки для перехода, прогресс-бар текущего игрока.",
       result:"×3–5 VIP engagement; +avg session для знающих о программе"},
      {p:2, src:"PBI",
       text:"Пересмотреть стратегию Перу: причины маржи 8.7%",
       detail:"Power BI: PE маржа 8.7% vs AR 31.2%. Анализ: качество трафика PE (Reg2Dep, avg dep, LTV), сравнение с AR и CL. Решение: либо улучшить онбординг для PE, либо перераспределить бюджет в пользу AR/CL.",
       result:"Перераспределение бюджета: +маржа при тех же затратах"},
    ],
    kpi:[
      {l:"Вип++ / NGR",v:"12 чел / 36.7%",c:"#f87171",src:"PBI"},
      {l:"VIP++ NGR/игрока",v:"$28,377 (4мес)",c:"#22c55e",src:"PBI"},
      {l:"AR маржа",v:"31.2%",c:"#4ade80",src:"PBI"},
      {l:"PE маржа",v:"8.7%",c:"#f87171",src:"PBI"},
    ],
    context:"VIP данные из Power BI · UY whale из MIO · GEO-маржа из Power BI",
    jtbd:"Когда постоянный VIP → кэшбэк, быстрый вывод, личный менеджер",
    ab:["H: VIP visible → ×3 engagement (GA4)","H: Whale detection → retention VIP++ (PBI)"],
    events:["VIP segments NGR (PBI)","ARPU by segment (PBI)","/vipcashback 4.2K (GA4)","whale dep (MIO)"],
  },
];

const EMOTION_COLORS = ["#dc2626","#ea580c","#f59e0b","#84cc16","#22c55e"];
const EMOTION_LABELS = ["Гнев","Фрустрация","Нейтрально","Доволен","Восторг"];

// ─── CJM FUNNEL VIEW ──────────────────────────────────────────
function CJMFunnelView({ month, geo, product }) {
  const [activeStage, setActiveStage] = useState(1);
  const [innerTab, setInnerTab] = useState("steps");
  const [expandedStep, setExpandedStep] = useState(null);
  const [expandedBarrier, setExpandedBarrier] = useState(null);
  const [expandedAction, setExpandedAction] = useState(null);

  const isAllMonth = month === "ALL";
  const months = isAllMonth ? MONTHS : [month];
  const isAllGeo = geo === "ALL";
  const m = isAllMonth ? "Feb" : month;
  const prevM = MONTHS[MONTHS.indexOf(m) - 1] || null;

  // ── Monthly funnel data: all 4 months for sparklines ─────────
  const allMonthsFunnel = useMemo(() => {
    return MONTHS.map(mo => {
      const depP = DEP[mo]?.[geo]?.players || 0;
      const geoRatio = isAllGeo ? 1 : (GEO_QUALITY[geo]?.users || 0) / 677000;
      const sessions = GA_MONTHLY[mo].sessions;
      const traffic   = isAllGeo ? sessions : Math.round(sessions * geoRatio);
      const aware     = Math.round(traffic * 0.82);
      const homepage  = aware;
      const reg_start = isAllGeo ? Math.round(sessions * 0.156) : Math.round(traffic * 0.19);
      const reg_done  = Math.round(reg_start * 0.758);
      const ftd       = depP;
      const bet       = Math.round(depP * 2.5);
      const active    = Math.round(depP * 1.25);
      const wd        = WD[mo].ok;
      const d7        = Math.round(ftd * 0.25);
      return {
        month: mo,
        users: [traffic, aware, homepage, reg_start, reg_done, ftd, bet, active, wd, d7]
      };
    });
  }, [geo]);

  // ── Current period funnel users ───────────────────────────────
  const funnelUsers = useMemo(() => {
    if (isAllMonth) {
      // Sum across all months where it makes sense
      const totalDep = MONTHS.reduce((s, mo) => s + (DEP[mo]?.[geo]?.players || 0), 0);
      const geoRatio = isAllGeo ? 1 : (GEO_QUALITY[geo]?.users || 0) / 677000;
      return [677000, 553000, 553000, 106000, 80000, totalDep,
              Math.round(totalDep*2.5), Math.round(totalDep*1.25),
              Math.round(MONTHS.reduce((s,mo)=>s+WD[mo].ok,0)/4),
              Math.round(totalDep*0.06), Math.round(totalDep*0.02)]
        .map((u, i) => ({
          ...CJM_STAGES[i],
          dynUsers: isAllGeo ? u : Math.max(1, Math.round(u * (i<6 ? geoRatio : 1))),
        }));
    }
    // Single month
    const depP = DEP[m]?.[geo]?.players || 0;
    const geoRatio = isAllGeo ? 1 : (GEO_QUALITY[geo]?.users || 0) / 677000;
    const sess = GA_MONTHLY[m].sessions;
    const traffic   = isAllGeo ? sess : Math.round(sess * geoRatio);
    const aware     = Math.round(traffic * 0.82);
    const reg_start = isAllGeo ? Math.round(sess * 0.156) : Math.round(traffic * 0.19);
    const reg_done  = Math.round(reg_start * 0.758);
    const wdOk      = WD[m].ok;
    return [
      { ...CJM_STAGES[0], dynUsers: traffic },
      { ...CJM_STAGES[1], dynUsers: aware },
      { ...CJM_STAGES[2], dynUsers: aware },
      { ...CJM_STAGES[3], dynUsers: reg_start },
      { ...CJM_STAGES[4], dynUsers: reg_done },
      { ...CJM_STAGES[5], dynUsers: depP },
      { ...CJM_STAGES[6], dynUsers: Math.round(depP * 2.5) },
      { ...CJM_STAGES[7], dynUsers: Math.round(depP * 1.25) },
      { ...CJM_STAGES[8], dynUsers: wdOk },
      { ...CJM_STAGES[9], dynUsers: Math.round(depP * 0.06) },
      { ...CJM_STAGES[9], dynUsers: Math.round(depP * 0.02) },
    ];
  }, [month, geo]);

  // ── MoM delta for current stage ───────────────────────────────
  const momDelta = useMemo(() => {
    if (isAllMonth || !prevM) return null;
    const currIdx = activeStage - 1;
    const currMonthFunnel = allMonthsFunnel.find(mf => mf.month === m);
    const prevMonthFunnel = allMonthsFunnel.find(mf => mf.month === prevM);
    if (!currMonthFunnel || !prevMonthFunnel) return null;
    const curr = currMonthFunnel.users[currIdx];
    const prev = prevMonthFunnel.users[currIdx];
    if (!prev) return null;
    return { pct: ((curr - prev) / prev * 100).toFixed(1), up: curr >= prev, curr, prev };
  }, [activeStage, month, prevM, allMonthsFunnel]);

  // ── Compute stage KPI based on filters ───────────────────────
  const computedStages = useMemo(() => {
    const depPlayers  = months.reduce((s, mo) => s + (DEP[mo]?.[geo]?.players || 0), 0);
    const depSum      = months.reduce((s, mo) => s + (DEP[mo]?.[geo]?.sum || 0), 0);
    const declineAvg  = months.reduce((s, mo) => s + (DEP[mo]?.[geo]?.dec || 0), 0) / months.length;
    const avgDep      = months.reduce((s, mo) => s + (DEP[mo]?.[geo]?.avgDep || 0), 0) / months.length;
    const wdOkSum     = months.reduce((s, mo) => s + WD[mo].okSum, 0);
    const wdFailSum   = months.reduce((s, mo) => s + WD[mo].failSum, 0);
    const wdOk        = months.reduce((s, mo) => s + WD[mo].ok, 0);
    const wdFail      = months.reduce((s, mo) => s + WD[mo].fail, 0);
    const wdOkPct     = months.reduce((s, mo) => s + WD[mo].okPct, 0) / months.length;
    const dau         = GA_MONTHLY[m].dau;
    const engTime     = isAllGeo ? GEO_QUALITY["ALL"].engTime : (GEO_QUALITY[geo]?.engTime || 0);
    const geoUsers    = isAllGeo ? 677000 : (GEO_QUALITY[geo]?.users || 0);
    const engRate     = isAllGeo ? 63 : (GEO_QUALITY[geo]?.engRate || 0);
    const sportP      = isAllGeo ? 133066 : (SPORT_GEO[geo] || 0);
    const casinoP     = isAllGeo ? 933000 : (CASINO_GEO[geo] || 0);
    const totalP      = product === "casino" ? casinoP : product === "sport" ? sportP : casinoP + sportP;
    const depSumProd  = product === "casino" ? Math.round(depSum*0.92) : product === "sport" ? Math.round(depSum*0.08) : depSum;
    const decCol      = declineAvg > 45 ? "#f87171" : declineAvg > 30 ? "#fcd34d" : "#4ade80";
    const ml          = isAllMonth ? "Nov–Feb" : m;
    const prevDep     = prevM ? (DEP[prevM]?.[geo]?.players || 0) : null;

    return CJM_STAGES.map(s => {
      let kpi = [...s.kpi];
      let metric = s.metric;
      let metric2 = s.metric2;
      let stepsExtra = [];

      if (s.id === 1) {
        kpi = [
          {l:"Users · "+ml, v:isAllGeo?"677K":fmtN(geoUsers), c:"#60a5fa"},
          {l:"DAU · "+m,    v:fmtN(dau), c:"#f59e0b", trend:prevM?{now:dau,prev:GA_MONTHLY[prevM]?.dau}:null},
          {l:"Engagement",  v:engTime+"с", c:engTime>200?"#4ade80":engTime>80?"#fcd34d":"#f87171"},
          {l:"Mobile",      v:"85.7%", c:"#a78bfa"},
        ];
        metric  = `${fmtN(isAllGeo?677000:geoUsers)} users · ${ml}`;
        metric2 = `DAU: ${fmtN(dau)} · Engagement: ${engTime}с · Sessions: ${fmtN(GA_MONTHLY[m].sessions)}`;
      }
      if (s.id === 2) {
        kpi = [
          {l:"Дошли до сайта", v:fmtN(isAllGeo?553000:Math.round(geoUsers*0.82)), c:"#60a5fa"},
          {l:"Eng. rate",     v:engRate+"%", c:engRate>70?"#4ade80":engRate>40?"#fcd34d":"#f87171"},
          {l:"Eng. time",     v:engTime+"с", c:engTime>200?"#4ade80":engTime>80?"#fcd34d":"#f87171"},
          {l:"Organic",       v:"4.7%", c:"#f87171"},
        ];
        metric  = `Engagement: ${engTime}с · Eng. rate: ${engRate}%`;
        metric2 = isAllGeo ? "BR: 284с ✅ · CL: 27с 🔴 (боты)" : `${GEO_FLAGS[geo]} ${GEO_NAMES[geo]}: ${engTime}с`;
      }
      if (s.id === 5) {
        const depDelta = prevDep ? ((depPlayers-prevDep)/prevDep*100).toFixed(0) : null;
        kpi = [
          {l:"Игроков · "+ml, v:fmtN(depPlayers), c:depPlayers>3000?"#4ade80":depPlayers>800?"#fcd34d":"#f87171"},
          {l:"Сумма OK",      v:fmt(depSumProd), c:"#60a5fa"},
          {l:"Decline",       v:declineAvg.toFixed(1)+"%", c:decCol},
          {l:"Avg деп.",      v:"$"+Math.round(avgDep), c:"#fcd34d"},
        ];
        metric  = `${fmtN(depPlayers)} игроков · ${fmt(depSumProd)} · ${declineAvg.toFixed(0)}% decline`;
        metric2 = isAllGeo ? `BR: 13% · AR: 25% · MX: 33% · CO: 74%` : `${GEO_FLAGS[geo]} avg $${Math.round(avgDep)} · decline ${declineAvg.toFixed(1)}%`;
        stepsExtra = [
          {ok:declineAvg<20, text:`Decline: ${declineAvg.toFixed(1)}% (${declineAvg<20?"✅ OK":declineAvg<35?"⚠️ высокий":"🔴 критичный"})`},
          {ok:avgDep>40,     text:`Avg депозит: $${Math.round(avgDep)} (${avgDep>100?"✅ высокий":avgDep>30?"нормально":"⚠️ низкий"})`},
          ...(depDelta ? [{ok:parseFloat(depDelta)>0, text:`MoM: ${depDelta>0?"+":""}${depDelta}% игроков vs ${prevM}`}] : []),
        ];
      }
      if (s.id === 6) {
        const gp = product==="sport" ? sportP : product==="casino" ? casinoP : totalP;
        kpi = [
          {l:"GGR прибыль",  v:fmt(gp), c:"#a78bfa"},
          {l:product==="sport"?"Sport":"Casino", v:product==="sport"?"8%":"92%", c:product==="sport"?"#22c55e":"#a78bfa"},
          {l:"Оборот",       v:product==="sport"?"$2.9M":"$23.5M", c:"#60a5fa"},
          {l:product==="sport"?"Ставок":"bet_done", v:product==="sport"?"105K":"39.9K", c:"#f59e0b"},
        ];
        metric  = `GGR: ${fmt(gp)} · маржа ${product==="sport"?"4.6%":"4.0%"}`;
        metric2 = product==="sport" ? "Футбол 53% · Н.теннис +$33.5K · Баскетбол –$19.5K" : "Fortune Tiger #1 users · Energy Coins 14.5% маржа";
      }
      if (s.id === 8) {
        kpi = [
          {l:"OK rate · "+m, v:WD[m].okPct+"%", c:WD[m].okPct>75?"#4ade80":"#fcd34d"},
          {l:"Одобрено",     v:fmt(wdOkSum), c:"#4ade80"},
          {l:"Отказано",     v:fmt(wdFailSum), c:"#f87171"},
          {l:"OK count",     v:fmtN(wdOk), c:"#60a5fa"},
        ];
        metric  = `OK rate: ${WD[m].okPct}% · ${fmt(wdOkSum)} выплачено`;
        metric2 = `Nov: 60.7% → Feb: 79.8% · Отказано: ${fmt(wdFailSum)}`;
        stepsExtra = [
          {ok:WD[m].okPct>75,  text:`OK rate ${m}: ${WD[m].okPct}% (${WD[m].okPct>75?"📈 улучшение":"⚠️ требует внимания"})`},
          {ok:false,           text:`Отказано ${m}: ${fmt(WD[m].failSum)} — ${WD[m].fail} транзакций`},
          ...(prevM ? [{ok:WD[m].okPct>WD[prevM].okPct, text:`${WD[m].okPct>WD[prevM].okPct?"▲":"▼"} ${Math.abs(WD[m].okPct-WD[prevM].okPct).toFixed(1)}% vs ${prevM}`}] : []),
        ];
      }
      return {...s, kpi, metric, metric2, stepsExtra};
    });
  }, [month, geo, product]);

  // ── Derived state ─────────────────────────────────────────────
  const maxU = funnelUsers[0]?.dynUsers || 1;
  const stage = computedStages.find(s => s.id === activeStage);
  const allSteps = stage ? [...(stage.steps||[]), ...(stage.stepsExtra||[])] : [];
  const currFunnel = funnelUsers.find(s => s.id === activeStage);
  const prevFunnel = funnelUsers.find(s => s.id === activeStage - 1);
  const convPct  = prevFunnel?.dynUsers ? (currFunnel.dynUsers / prevFunnel.dynUsers * 100) : null;
  const dropN    = prevFunnel?.dynUsers ? prevFunnel.dynUsers - currFunnel.dynUsers : 0;

  // Sparkline data: stage trend across 4 months
  const sparkData = allMonthsFunnel.map(mf => ({
    month: mf.month,
    val: mf.users[activeStage - 1] || 0,
  }));

  const innerTabs = [
    {id:"steps",    icon:"👣", label:"Шаги"},
    {id:"barriers", icon:"🚧", label:"Барьеры"},
    {id:"actions",  icon:"⚡", label:"Действия"},
    {id:"metrics",  icon:"📊", label:"Метрики"},
  ];

  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden", background:"#080e1c" }}>

      {/* ══ LEFT: funnel list ═══════════════════════════════════ */}
      <div style={{ width:200, flexShrink:0, background:"#090f1e", borderRight:"1px solid #142030", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"10px 14px 8px", borderBottom:"1px solid #142030" }}>
          <div style={{ fontSize:9, color:"#1e3a5f", fontWeight:800, textTransform:"uppercase", letterSpacing:"1px" }}>ВОРОНКА CJM</div>
          <div style={{ fontSize:8.5, color:"#334155", marginTop:2, display:"flex", gap:4, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ color:"#1a56db66" }}>{isAllGeo ? "🌎 Все GEO" : `${GEO_FLAGS[geo]} ${GEO_NAMES[geo]}`}</span>
            <span style={{ color:"#1e2d40" }}>·</span>
            <span style={{ color:"#7c3aed55" }}>{isAllMonth ? "Nov–Feb" : m}</span>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto" }}>
          {funnelUsers.map((s, i) => {
            const prevS = funnelUsers[i - 1];
            const barW = Math.max(6, (s.dynUsers / maxU) * 100);
            const conv = prevS ? Math.round((s.dynUsers / prevS.dynUsers) * 100) : null;
            const isActive = activeStage === s.id;
            const isBigDrop = prevS && (s.dynUsers / prevS.dynUsers) < 0.35;
            const isMedDrop = prevS && !isBigDrop && (s.dynUsers / prevS.dynUsers) < 0.70;
            const convColor = isBigDrop ? "#fca5a5" : isMedDrop ? "#fcd34d" : "#4ade80";
            const convBg    = isBigDrop ? "#2d0a0a" : isMedDrop ? "#2d1f0a" : "#0a2010";

            return (
              <div key={s.id}>
                {i > 0 && (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:15, gap:4, padding:"0 10px" }}>
                    <div style={{ flex:1, height:1, background:"#142030" }}/>
                    <div style={{ fontSize:8, fontWeight:700, padding:"1px 5px", borderRadius:8, background:convBg, color:convColor, border:`1px solid ${isBigDrop?"#7f1d1d":isMedDrop?"#78350f":"#14532d"}` }}>
                      {conv}%
                    </div>
                    <div style={{ flex:1, height:1, background:"#142030" }}/>
                  </div>
                )}
                <div onClick={() => { setActiveStage(s.id); setExpandedStep(null); setExpandedBarrier(null); setExpandedAction(null); }} style={{
                  padding:"7px 12px", cursor:"pointer",
                  background: isActive ? `linear-gradient(90deg, ${s.color}18, transparent)` : "transparent",
                  borderLeft: `3px solid ${isActive ? s.color : "transparent"}`,
                  transition:"background 0.15s",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                    <span style={{ fontSize:12 }}>{s.icon}</span>
                    <span style={{ fontSize:9.5, fontWeight:isActive?700:400, color:isActive?"#e2e8f0":"#475569", flex:1, lineHeight:1.2 }}>{s.id}. {s.label}</span>
                    {s.isCritical && <div style={{ width:5, height:5, borderRadius:"50%", background:"#dc2626", boxShadow:"0 0 5px #dc262680" }}/>}
                  </div>
                  <div style={{ height:5, background:"#0d1626", borderRadius:3, overflow:"hidden" }}>
                    <div style={{
                      width:`${barW}%`, height:"100%", borderRadius:3,
                      background: isActive ? `linear-gradient(90deg,${s.color},${s.color}99)` : `${s.color}44`,
                      transition:"width 0.4s ease",
                    }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
                    <span style={{ fontSize:8, color:isActive?s.color:"#263040", fontWeight:isActive?700:400 }}>
                      {s.dynUsers>=1000 ? `${(s.dynUsers/1000).toFixed(s.dynUsers>=100000?0:1)}K` : s.dynUsers}
                    </span>
                    <span style={{ fontSize:7.5, color:"#1e2d40" }}>{((s.dynUsers/maxU)*100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding:"8px 12px", borderTop:"1px solid #142030", background:"#060c18" }}>
          {[
            {l:"Трафик → FTD", v:((funnelUsers[5]?.dynUsers/maxU)*100).toFixed(1)+"%", c:"#f87171"},
            {l:"FTD → Return", v:((funnelUsers[9]?.dynUsers/(funnelUsers[5]?.dynUsers||1))*100).toFixed(0)+"%", c:"#f87171"},
            {l:"Потенциал",    v:"+$430K/мес", c:"#4ade80"},
          ].map(r => (
            <div key={r.l} style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ fontSize:8, color:"#1e2d40" }}>{r.l}</span>
              <span style={{ fontSize:8, fontWeight:700, color:r.c }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ MAIN PANEL ════════════════════════════════════════════ */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        {/* Stage hero */}
        <div style={{
          padding:"14px 20px 12px",
          background:`linear-gradient(160deg, ${stage?.colorLight||"#0d1526"} 0%, #080e1c 100%)`,
          borderBottom:"1px solid #142030", flexShrink:0,
        }}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:10 }}>
            <div style={{
              width:48, height:48, borderRadius:14, flexShrink:0,
              background:`${stage?.color}18`, border:`2px solid ${stage?.color}44`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
            }}>{stage?.icon}</div>

            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap", marginBottom:3 }}>
                <span style={{ fontSize:15, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.3px" }}>
                  {stage?.id}. {stage?.label}
                </span>
                {stage?.isCritical && <span style={{ fontSize:8, fontWeight:700, padding:"2px 6px", borderRadius:8, background:"#2d0a0a", color:"#fca5a5", border:"1px solid #7f1d1d" }}>🔴 CRITICAL</span>}
                {!isAllGeo && <span style={{ fontSize:8, fontWeight:600, padding:"2px 6px", borderRadius:8, background:"#0d1e3a", color:"#7eb3f5", border:"1px solid #1d4ed822" }}>{GEO_FLAGS[geo]} {geo}</span>}
                {!isAllMonth && <span style={{ fontSize:8, fontWeight:600, padding:"2px 6px", borderRadius:8, background:"#150d2d", color:"#c4b5fd", border:"1px solid #4c1d9522" }}>📅 {m}</span>}
                {product!=="all" && <span style={{ fontSize:8, fontWeight:600, padding:"2px 6px", borderRadius:8, background:"#0a1e10", color:"#6ee7b7", border:"1px solid #14532d22" }}>{product==="casino"?"🎰 Casino":"⚽ Sport"}</span>}
                {momDelta && (
                  <span style={{ fontSize:8, fontWeight:700, padding:"2px 7px", borderRadius:8,
                    background:momDelta.up?"#0a2010":"#2d0a0a",
                    color:momDelta.up?"#4ade80":"#f87171",
                    border:`1px solid ${momDelta.up?"#14532d":"#7f1d1d"}` }}>
                    {momDelta.up?"▲":"▼"} {Math.abs(momDelta.pct)}% vs {prevM}
                  </span>
                )}
              </div>
              <div style={{ fontSize:10, color:`${stage?.color}bb`, marginBottom:7 }}>{stage?.sublabel}</div>
              {/* Emotion bar */}
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    width: i === stage?.emotion ? 28 : 18, height:7, borderRadius:2,
                    background: i <= (stage?.emotion||0) ? EMOTION_COLORS[(stage?.emotion||1)-1] : "#0d1626",
                    opacity: i <= (stage?.emotion||0) ? (i===stage?.emotion?1:0.5) : 0.2,
                    transition:"all 0.3s",
                  }}/>
                ))}
                <span style={{ fontSize:10, fontWeight:700, color:stage?EMOTION_COLORS[stage.emotion-1]:"#64748b" }}>
                  {stage?EMOTION_LABELS[stage.emotion-1]:""}
                </span>
                <span style={{ fontSize:9, color:"#2d3f55" }}>— {stage?.emotionText}</span>
              </div>
            </div>

            {/* Conv + sparkline */}
            <div style={{ textAlign:"center", flexShrink:0, display:"flex", flexDirection:"column", gap:6 }}>
              {convPct !== null && (
                <div style={{
                  padding:"8px 14px", borderRadius:10, textAlign:"center",
                  background:convPct<25?"#2d0a0a":convPct<60?"#2d1a0a":"#0a2010",
                  border:`1px solid ${convPct<25?"#7f1d1d":convPct<60?"#78350f":"#14532d"}`,
                }}>
                  <div style={{ fontSize:22, fontWeight:800, lineHeight:1, color:convPct<25?"#fca5a5":convPct<60?"#fcd34d":"#4ade80" }}>
                    {convPct.toFixed(1)}%
                  </div>
                  <div style={{ fontSize:8, color:"#1e2d40", marginTop:2 }}>конверсия</div>
                </div>
              )}
              {dropN > 0 && (
                <div style={{ fontSize:9, fontWeight:700, color:dropN>5000?"#f87171":"#374151" }}>
                  −{dropN>=1000?`${(dropN/1000).toFixed(0)}K`:dropN}
                </div>
              )}
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ display:"flex", gap:7 }}>
            {stage?.kpi?.map((k, i) => {
              const srcColors = { "MIO":["#b45309","#3d1a00"], "PBI":["#1a56db","#0c1e4a"], "GA4":["#059669","#0a2e1f"], "WM":["#7c3aed","#2d1b69"] };
              const sc = k.src ? srcColors[k.src] || ["#475569","#1e2535"] : null;
              return (
                <div key={i} style={{
                  flex:1, padding:"6px 9px", borderRadius:8,
                  background:"#060c18", border:`1px solid ${k.c}18`, borderTop:`2px solid ${k.c}55`,
                }}>
                  <div style={{ fontSize:12, fontWeight:800, color:k.c, lineHeight:1 }}>{k.v}</div>
                  <div style={{ fontSize:8, color:"#1e2d40", marginTop:3, marginBottom: k.src?2:0 }}>{k.l}</div>
                  {k.src && sc && (
                    <div style={{ fontSize:7, fontWeight:700, padding:"1px 4px", borderRadius:3, background:sc[1], color:sc[0], border:`1px solid ${sc[0]}44`, display:"inline-block", letterSpacing:"0.3px" }}>
                      {k.src}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Inner tabs */}
        <div style={{ display:"flex", alignItems:"center", padding:"6px 20px", borderBottom:"1px solid #142030", background:"#090f1e", flexShrink:0, gap:2 }}>
          {innerTabs.map(t => (
            <button key={t.id} onClick={() => setInnerTab(t.id)} style={{
              padding:"5px 11px", borderRadius:6, border:"none", cursor:"pointer",
              background:innerTab===t.id?"#1a56db":"transparent",
              color:innerTab===t.id?"#fff":"#2d3f55",
              fontSize:10.5, fontWeight:innerTab===t.id?700:400, transition:"all 0.15s",
              display:"flex", alignItems:"center", gap:3,
            }}>{t.icon} {t.label}</button>
          ))}
          <div style={{ flex:1 }}/>
          <button onClick={() => { if(activeStage>1){ setActiveStage(s=>s-1); setExpandedStep(null); setExpandedBarrier(null); setExpandedAction(null); } }} disabled={activeStage===1} style={{
            padding:"4px 9px", borderRadius:5, border:"1px solid #142030", background:"transparent",
            color:activeStage===1?"#142030":"#2d3f55", cursor:activeStage===1?"default":"pointer", fontSize:10,
          }}>← {CJM_STAGES.find(s=>s.id===activeStage-1)?.label||""}</button>
          <button onClick={() => { if(activeStage<10){ setActiveStage(s=>s+1); setExpandedStep(null); setExpandedBarrier(null); setExpandedAction(null); } }} disabled={activeStage===10} style={{
            padding:"4px 9px", borderRadius:5, border:"1px solid #142030", background:"transparent",
            color:activeStage===10?"#142030":"#2d3f55", cursor:activeStage===10?"default":"pointer", fontSize:10,
          }}>{CJM_STAGES.find(s=>s.id===activeStage+1)?.label||""} →</button>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"14px 20px" }}>

          {innerTab === "steps" && (
            <div>
              <div style={{ fontSize:9, color:"#1e2d40", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>
                👆 Нажми на шаг — детали, бизнес-импакт · ℹ️ = требует проверки · ⚠️ = оценка
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:12 }}>
                {allSteps.map((step, i) => {
                  const isEx = expandedStep === i;
                  const isCrit = !step.ok && (step.text.includes("🔴") || step.impact);
                  return (
                    <div key={i}>
                      <div
                        onClick={() => setExpandedStep(isEx ? null : i)}
                        style={{
                          display:"flex", gap:9, alignItems:"center", padding:"9px 12px", borderRadius: isEx ? "8px 8px 0 0" : 8,
                          cursor:"pointer", userSelect:"none",
                          background: step.ok ? (isEx?"#0e2d1a":"#091a0f") : isCrit ? (isEx?"#2d1010":"#1e0808") : (isEx?"#121c2d":"#0d1220"),
                          border:`1px solid ${step.ok?"#14532d55":isCrit?"#7f1d1d55":"#142030"}`,
                          borderBottom: isEx ? "none" : undefined,
                          transition:"background 0.15s",
                        }}
                      >
                        <div style={{
                          width:22, height:22, borderRadius:6, flexShrink:0,
                          background:step.ok?"#14532d":"#7f1d1d",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:9, fontWeight:800, color:step.ok?"#4ade80":"#fca5a5",
                        }}>{i+1}</div>
                        <div style={{ fontSize:11.5, fontWeight:500, lineHeight:1.4, flex:1, color:step.ok?"#bbf7d0":isCrit?"#fca5a5":"#64748b" }}>
                          {step.text.replace(/🔴\s?/g,"").replace(/✅\s?/g,"")}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                          {step.impact && !step.ok && (
                            <div style={{ fontSize:8, fontWeight:700, padding:"2px 5px", borderRadius:4, background:"#3d0a0a", color:"#fca5a5", border:"1px solid #7f1d1d22", whiteSpace:"nowrap" }}>
                              💸
                            </div>
                          )}
                          {step.dataNote && (
                            <div style={{ fontSize:8, fontWeight:700, padding:"2px 5px", borderRadius:4, background:"#0a1628", color:"#64a0cc", border:"1px solid #1a3a5c44", whiteSpace:"nowrap" }}>
                              {step.dataNote.startsWith("⚠️") ? "⚠️" : "ℹ️"}
                            </div>
                          )}
                          <span style={{ fontSize:11 }}>{step.ok?"✅":"❌"}</span>
                          <span style={{ fontSize:9, color:"#1e2d40", transition:"transform 0.2s", display:"inline-block", transform:isEx?"rotate(180deg)":"none" }}>▼</span>
                        </div>
                      </div>
                      {isEx && (
                        <div style={{
                          padding:"10px 12px 12px",
                          background: step.ok ? "#091a0f" : isCrit ? "#1e0808" : "#0d1220",
                          border:`1px solid ${step.ok?"#14532d55":isCrit?"#7f1d1d55":"#142030"}`,
                          borderTop:`1px solid ${step.ok?"#14532d22":isCrit?"#7f1d1d22":"#1e2d40"}`,
                          borderRadius:"0 0 8px 8px",
                          marginBottom:0,
                        }}>
                          {step.src && (
                            <div style={{ display:"flex", gap:5, alignItems:"center", marginBottom:6 }}>
                              {step.src.split(",").map((s,si) => {
                                const srcColors = { "MIO":["#b45309","#3d1a00"], "PBI":["#1a56db","#0c1e4a"], "GA4":["#059669","#0a2e1f"], "WM":["#7c3aed","#2d1b69"] };
                                const sc = srcColors[s.trim()] || ["#475569","#1e2535"];
                                return <span key={si} style={{ fontSize:8, fontWeight:700, padding:"2px 5px", borderRadius:3, background:sc[1], color:sc[0], border:`1px solid ${sc[0]}55`, letterSpacing:"0.3px" }}>{s.trim()}</span>;
                              })}
                              <span style={{ fontSize:9, color:"#1e2d40" }}>источник данных</span>
                            </div>
                          )}
                          {step.detail && (
                            <div style={{ fontSize:11, color: step.ok?"#6ee7b7":"#94a3b8", lineHeight:1.65, marginBottom: step.impact ? 8 : 0 }}>
                              {step.detail}
                            </div>
                          )}
                          {step.impact && (
                            <div style={{
                              display:"flex", gap:6, alignItems:"flex-start",
                              padding:"7px 10px", background:"#3d0a0a", borderRadius:6,
                              border:"1px solid #7f1d1d44", marginTop:4
                            }}>
                              <span style={{ fontSize:13, flexShrink:0 }}>💸</span>
                              <span style={{ fontSize:10.5, color:"#fca5a5", fontWeight:600, lineHeight:1.5 }}>{step.impact}</span>
                            </div>
                          )}
                          {step.dataNote && (
                            <div style={{
                              display:"flex", gap:6, alignItems:"flex-start",
                              padding:"6px 10px", background:"#0a1628", borderRadius:6,
                              border:"1px solid #1a3a5c55", marginTop:6
                            }}>
                              <span style={{ fontSize:12, flexShrink:0 }}>
                                {step.dataNote.startsWith("⚠️") ? "⚠️" : "ℹ️"}
                              </span>
                              <span style={{ fontSize:10, color:"#64a0cc", lineHeight:1.5 }}>
                                {step.dataNote.replace(/^[⚠️ℹ️]\s?/,"")}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ padding:"9px 12px", background:"#060c18", border:"1px solid #142030", borderRadius:8 }}>
                <div style={{ fontSize:8.5, color:"#1e2d40", fontWeight:700, textTransform:"uppercase", marginBottom:3 }}>Контекст сессии</div>
                <div style={{ fontSize:10.5, color:"#2d3f55", lineHeight:1.6 }}>{stage?.context}</div>
              </div>
            </div>
          )}

          {innerTab === "barriers" && (
            <div>
              <div style={{ fontSize:9, color:"#1e2d40", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>
                👆 Нажми на барьер — суть проблемы · 💸 = бизнес-импакт · ⚠️ = оценочно
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {stage?.barriers?.map((b, i) => {
                  const isObj = typeof b === "object";
                  const txt = isObj ? b.text : b;
                  const detail = isObj ? b.detail : null;
                  const impact = isObj ? b.impact : null;
                  const lvl = txt.includes("🔴🔴🔴")?3:txt.includes("🔴🔴")?2:txt.includes("🔴")?1:0;
                  const isEx = expandedBarrier === i;
                  const ic = lvl===3?"🚨":lvl===2?"⛔":lvl>=1?"❌":"⚠️";
                  const bgBase = lvl===3?"#2d0a0a":lvl===2?"#1e0808":lvl>=1?"#160c0c":"#0d1220";
                  const bgEx = lvl>=1?"#3d1010":"#121c2d";
                  const bc = lvl>=2?"#7f1d1d55":lvl>=1?"#7f1d1d33":"#142030";
                  const bl = lvl>=2?"#dc2626":lvl>=1?"#7f1d1d":"#1e2d40";
                  const tc = lvl>=1?"#fca5a5":"#475569";
                  return (
                    <div key={i}>
                      <div
                        onClick={() => setExpandedBarrier(isEx ? null : i)}
                        style={{
                          display:"flex", gap:10, alignItems:"center", padding:"10px 14px",
                          borderRadius: isEx ? "8px 8px 0 0" : 8, cursor:"pointer",
                          background: isEx ? bgEx : bgBase,
                          border:`1px solid ${bc}`, borderLeft:`3px solid ${bl}`,
                          borderBottom: isEx ? "none" : undefined,
                          transition:"background 0.15s",
                        }}
                      >
                        <span style={{ fontSize:13, flexShrink:0 }}>{ic}</span>
                        <span style={{ fontSize:12, color:tc, lineHeight:1.4, flex:1, fontWeight:500 }}>{txt.replace(/🔴+\s?/g,"")}</span>
                        <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                          {impact && <div style={{ fontSize:8, padding:"2px 5px", borderRadius:4, background:"#3d0a0a", color:"#fca5a5", border:"1px solid #7f1d1d22", fontWeight:700 }}>💸</div>}
                          {b.dataNote && <div style={{ fontSize:8, padding:"2px 5px", borderRadius:4, background:"#0a1628", color:"#64a0cc", border:"1px solid #1a3a5c44", fontWeight:700 }}>{b.dataNote.startsWith("⚠️")?"⚠️":"ℹ️"}</div>}
                          <span style={{ fontSize:9, color:"#1e2d40", display:"inline-block", transform:isEx?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▼</span>
                        </div>
                      </div>
                      {isEx && (detail || impact) && (
                        <div style={{
                          padding:"10px 14px 12px",
                          background: lvl>=1?"#1e0808":"#0d1220",
                          border:`1px solid ${bc}`,
                          borderTop:`1px solid ${lvl>=1?"#7f1d1d22":"#1e2d40"}`,
                          borderLeft:`3px solid ${bl}`,
                          borderRadius:"0 0 8px 8px",
                        }}>
                          {b.src && (
                          <div style={{ display:"flex", gap:5, alignItems:"center", marginBottom:6 }}>
                            {b.src.split(",").map((s,si) => {
                              const srcColors = { "MIO":["#b45309","#3d1a00"], "PBI":["#1a56db","#0c1e4a"], "GA4":["#059669","#0a2e1f"], "WM":["#7c3aed","#2d1b69"] };
                              const sc = srcColors[s.trim()] || ["#475569","#1e2535"];
                              return <span key={si} style={{ fontSize:8, fontWeight:700, padding:"2px 5px", borderRadius:3, background:sc[1], color:sc[0], border:`1px solid ${sc[0]}55`, letterSpacing:"0.3px" }}>{s.trim()}</span>;
                            })}
                            <span style={{ fontSize:9, color:"#1e2d40" }}>источник</span>
                          </div>
                        )}
                        {detail && <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.65, marginBottom:(impact||b.dataNote)?8:0 }}>{detail}</div>}
                          {impact && (
                            <div style={{ display:"flex", gap:6, padding:"7px 10px", background:"#3d0a0a", borderRadius:6, border:"1px solid #7f1d1d44", marginBottom:b.dataNote?6:0 }}>
                              <span style={{ fontSize:12 }}>💸</span>
                              <span style={{ fontSize:10.5, color:"#fca5a5", fontWeight:600, lineHeight:1.5 }}>{impact}</span>
                            </div>
                          )}
                          {b.dataNote && (
                            <div style={{ display:"flex", gap:6, padding:"6px 10px", background:"#0a1628", borderRadius:6, border:"1px solid #1a3a5c55" }}>
                              <span style={{ fontSize:11, flexShrink:0 }}>{b.dataNote.startsWith("⚠️")?"⚠️":"ℹ️"}</span>
                              <span style={{ fontSize:10, color:"#64a0cc", lineHeight:1.5 }}>{b.dataNote.replace(/^[⚠️ℹ️]\s?/,"")}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {innerTab === "actions" && (
            <div>
              <div style={{ fontSize:9, color:"#1e2d40", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>
                👆 Нажми на действие — как реализовать · 📈 = ожидаемый результат · ℹ️ = уточнить
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {stage?.actions?.map((a, i) => {
                  const isObj = typeof a === "object";
                  const p = isObj ? a.p : (a.includes("P0")?0:a.includes("P1")?1:2);
                  const txt = isObj ? a.text : a.replace(/🔴\s?/g,"").replace(/P[012]:\s?/,"").trim();
                  const detail = isObj ? a.detail : null;
                  const result = isObj ? a.result : null;
                  const isEx = expandedAction === i;
                  const cfgs = [
                    {bg:"#091a0f",bgEx:"#0e2d1a",bc:"#14532d44",tagBg:"#14532d",tagC:"#4ade80",txtC:"#bbf7d0",resBg:"#0a2010",resC:"#6ee7b7"},
                    {bg:"#0d1a07",bgEx:"#142010",bc:"#36531444",tagBg:"#3f6212",tagC:"#a3e635",txtC:"#d9f99d",resBg:"#1a2c07",resC:"#a3e635"},
                    {bg:"#0d1220",bgEx:"#121c2d",bc:"#142030",tagBg:"#1e293b",tagC:"#64748b",txtC:"#64748b",resBg:"#1a2030",resC:"#64748b"},
                  ];
                  const cfg = cfgs[p] || cfgs[2];
                  return (
                    <div key={i}>
                      <div
                        onClick={() => setExpandedAction(isEx ? null : i)}
                        style={{
                          display:"flex", gap:9, alignItems:"center", padding:"9px 13px",
                          borderRadius: isEx ? "8px 8px 0 0" : 8, cursor:"pointer",
                          background: isEx ? cfg.bgEx : cfg.bg,
                          border:`1px solid ${cfg.bc}`,
                          borderBottom: isEx ? "none" : undefined,
                          transition:"background 0.15s",
                        }}
                      >
                        <span style={{ fontSize:8, fontWeight:800, padding:"2px 6px", borderRadius:4, flexShrink:0, background:cfg.tagBg, color:cfg.tagC, letterSpacing:"0.5px", border:`1px solid ${cfg.tagBg}88` }}>
                          P{p}
                        </span>
                        <span style={{ fontSize:11.5, fontWeight:500, color:cfg.txtC, lineHeight:1.4, flex:1 }}>{txt}</span>
                        <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                          {result && <div style={{ fontSize:8, padding:"2px 5px", borderRadius:4, background:cfg.tagBg+"44", color:cfg.tagC, fontWeight:700, border:`1px solid ${cfg.tagBg}44` }}>📈</div>}
                          {a.dataNote && <div style={{ fontSize:8, padding:"2px 5px", borderRadius:4, background:"#0a1628", color:"#64a0cc", border:"1px solid #1a3a5c44", fontWeight:700 }}>{a.dataNote.startsWith("⚠️")?"⚠️":"ℹ️"}</div>}
                          <span style={{ fontSize:9, color:"#1e2d40", display:"inline-block", transform:isEx?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▼</span>
                        </div>
                      </div>
                      {isEx && (detail || result) && (
                        <div style={{
                          padding:"10px 13px 12px",
                          background: cfg.bg,
                          border:`1px solid ${cfg.bc}`,
                          borderTop:`1px solid ${cfg.bc.replace("44","22")}`,
                          borderRadius:"0 0 8px 8px",
                        }}>
                          {a.src && (
                            <div style={{ display:"flex", gap:5, alignItems:"center", marginBottom:6 }}>
                              {a.src.split(",").map((s,si) => {
                                const srcColors = { "MIO":["#b45309","#3d1a00"], "PBI":["#1a56db","#0c1e4a"], "GA4":["#059669","#0a2e1f"], "WM":["#7c3aed","#2d1b69"] };
                                const sc = srcColors[s.trim()] || ["#475569","#1e2535"];
                                return <span key={si} style={{ fontSize:8, fontWeight:700, padding:"2px 5px", borderRadius:3, background:sc[1], color:sc[0], border:`1px solid ${sc[0]}55`, letterSpacing:"0.3px" }}>{s.trim()}</span>;
                              })}
                              <span style={{ fontSize:9, color:"#1e2d40" }}>источник</span>
                            </div>
                          )}
                          {detail && <div style={{ fontSize:11, color:"#64748b", lineHeight:1.65, marginBottom:(result||a.dataNote)?8:0 }}>{detail}</div>}
                          {result && (
                            <div style={{ display:"flex", gap:6, padding:"7px 10px", background:cfg.resBg, borderRadius:6, border:`1px solid ${cfg.tagBg}44`, marginBottom:a.dataNote?6:0 }}>
                              <span style={{ fontSize:12 }}>📈</span>
                              <span style={{ fontSize:10.5, color:cfg.resC, fontWeight:700, lineHeight:1.5 }}>{result}</span>
                            </div>
                          )}
                          {a.dataNote && (
                            <div style={{ display:"flex", gap:6, padding:"6px 10px", background:"#0a1628", borderRadius:6, border:"1px solid #1a3a5c55" }}>
                              <span style={{ fontSize:11, flexShrink:0 }}>{a.dataNote.startsWith("⚠️")?"⚠️":"ℹ️"}</span>
                              <span style={{ fontSize:10, color:"#64a0cc", lineHeight:1.5 }}>{a.dataNote.replace(/^[⚠️ℹ️]\s?/,"")}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {stage?.ab && (
                <div style={{ marginTop:10, padding:"9px 12px", background:"#060c18", border:"1px solid #142030", borderRadius:8 }}>
                  <div style={{ fontSize:8.5, color:"#1e2d40", fontWeight:700, textTransform:"uppercase", marginBottom:5 }}>🧪 A/B Гипотезы</div>
                  {stage.ab.map((h,i) => (
                    <div key={i} style={{ fontSize:10.5, color:"#2d4a6a", marginBottom:4, lineHeight:1.5 }}>{h}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {innerTab === "metrics" && (
            <div>
              {/* Monthly trend for this stage */}
              <div style={{ background:"#060c18", border:"1px solid #142030", borderRadius:8, padding:"12px 14px", marginBottom:10 }}>
                <div style={{ fontSize:9, color:"#1e2d40", fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>📈 Динамика этапа по месяцам</div>
                <ResponsiveContainer width="100%" height={90}>
                  <AreaChart data={sparkData}>
                    <defs>
                      <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stage?.color||"#1a56db"} stopOpacity={0.4}/>
                        <stop offset="100%" stopColor={stage?.color||"#1a56db"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{fill:"#1e2d40",fontSize:9}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#1e2d40",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}K`:v} width={35}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Area type="monotone" dataKey="val" name="Пользователей" stroke={stage?.color||"#1a56db"} strokeWidth={2} fill="url(#sparkGrad)"/>
                    {!isAllMonth && sparkData.map((d,i) => d.month===m && (
                      <ReferenceLine key={i} x={m} stroke={stage?.color} strokeDasharray="3 3" strokeOpacity={0.5}/>
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                <div style={{ padding:"10px 12px", background:"#060c18", border:"1px solid #142030", borderRadius:8 }}>
                  <div style={{ fontSize:9, color:"#1e2d40", fontWeight:700, textTransform:"uppercase", marginBottom:5 }}>Метрика</div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", marginBottom:3 }}>{stage?.metric}</div>
                  <div style={{ fontSize:10.5, color:"#2d3f55" }}>{stage?.metric2}</div>
                </div>
                <div style={{ padding:"10px 12px", background:"#060c18", border:"1px solid #142030", borderRadius:8 }}>
                  <div style={{ fontSize:9, color:"#1e2d40", fontWeight:700, textTransform:"uppercase", marginBottom:5 }}>Фильтр · JTBD</div>
                  <div style={{ fontSize:9.5, color:"#2d3f55", lineHeight:1.7 }}>
                    <span style={{ color:"#1a56db66" }}>{isAllGeo?"🌎 Все GEO":`${GEO_FLAGS[geo]} ${GEO_NAMES[geo]}`}</span> ·{" "}
                    <span style={{ color:"#7c3aed55" }}>{isAllMonth?"Nov–Feb":m}</span><br/>
                    {stage?.jtbd}
                  </div>
                </div>
              </div>

              <div style={{ padding:"10px 14px", background:"#060c18", border:"1px solid #142030", borderRadius:8 }}>
                <div style={{ fontSize:9, color:"#1e2d40", fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>GA4 / WM события</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {stage?.events?.map((ev,i) => (
                    <span key={i} style={{ fontSize:9, color:"#2d4a6a", padding:"3px 8px", background:"#080e1c", borderRadius:4, border:"1px solid #142030", fontFamily:"monospace" }}>{ev}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ RIGHT: Sankey + quick stats ══════════════════════════ */}
      <div style={{ width:190, flexShrink:0, background:"#090f1e", borderLeft:"1px solid #142030", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"8px 12px 6px", borderBottom:"1px solid #142030" }}>
          <div style={{ fontSize:8.5, color:"#1e2d40", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px" }}>Поток</div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"6px 8px" }}>
          {funnelUsers.map((s, i) => {
            const prev = funnelUsers[i-1];
            const w = Math.max(8, (s.dynUsers / maxU) * 100);
            const isActive = activeStage === s.id;
            const dropped = prev ? prev.dynUsers - s.dynUsers : 0;
            const bigLoss = dropped > maxU * 0.12;
            return (
              <div key={s.id} onClick={() => { setActiveStage(s.id); setExpandedStep(null); setExpandedBarrier(null); setExpandedAction(null); }} style={{ cursor:"pointer" }}>
                {dropped > 0 && (
                  <div style={{ height:12, display:"flex", alignItems:"center", paddingLeft:`${w/2+4}%` }}>
                    <div style={{ borderLeft:`1px dashed ${bigLoss?"#7f1d1d30":"#14203030"}`, height:"100%" }}/>
                    {bigLoss && <span style={{ fontSize:7, color:"#7f1d1d", marginLeft:3, fontWeight:700, whiteSpace:"nowrap" }}>−{(dropped/1000).toFixed(0)}K</span>}
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"center", marginBottom:1 }}>
                  <div style={{
                    width:`${w}%`, height:20, borderRadius:3,
                    background: isActive ? `linear-gradient(90deg,${s.color},${s.color}aa)` : `${s.color}33`,
                    border: isActive ? `1.5px solid ${s.color}` : `1px solid ${s.color}11`,
                    boxShadow: isActive ? `0 0 8px ${s.color}30` : "none",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all 0.2s",
                  }}>
                    {w > 28 && <span style={{ fontSize:7.5, color:"#fff", fontWeight:700 }}>{s.dynUsers>=1000?`${(s.dynUsers/1000).toFixed(s.dynUsers>=100000?0:1)}K`:s.dynUsers}</span>}
                  </div>
                </div>
                <div style={{ textAlign:"center", fontSize:7.5, color:isActive?s.color:"#1e2d40", fontWeight:isActive?700:400, marginBottom:1 }}>
                  {s.icon} {s.label}
                </div>
              </div>
            );
          })}
        </div>
        {/* Critical shortcuts */}
        <div style={{ padding:"8px 10px", borderTop:"1px solid #142030" }}>
          <div style={{ fontSize:8, color:"#7f1d1d", fontWeight:700, marginBottom:5, textTransform:"uppercase" }}>⚡ Critical</div>
          {CJM_STAGES.filter(s=>s.isCritical).map(s => {
            const fu = funnelUsers.find(f=>f.id===s.id);
            return (
              <div key={s.id} onClick={() => { setActiveStage(s.id); setExpandedStep(null); setExpandedBarrier(null); setExpandedAction(null); }} style={{
                display:"flex", gap:5, alignItems:"center", marginBottom:4, padding:"4px 6px", borderRadius:5, cursor:"pointer",
                background:activeStage===s.id?"#2d0a0a":"#0d0606",
                border:`1px solid ${activeStage===s.id?"#7f1d1d":"#160606"}`,
              }}>
                <span style={{ fontSize:10 }}>{s.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:8.5, color:"#fca5a5", fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.label}</div>
                  <div style={{ fontSize:7.5, color:"#7f1d1d" }}>{fu?.dynUsers>=1000?`${(fu.dynUsers/1000).toFixed(0)}K`:fu?.dynUsers} users</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GeoView({ month, geo, product }) {
  const isAllMonth = month === "ALL";
  const m = isAllMonth ? "Feb" : month;
  const prevM = MONTHS[MONTHS.indexOf(m) - 1] || null;
  const geoList = ["BR","AR","MX","PE","CL","UY"];

  const radarData = geoList.map(g => {
    const d = DEP[m]?.[g] || {};
    const q = GEO_QUALITY[g] || {};
    const dep100 = (d.sum || 0) / 400000 * 100;
    const eng = q.engTime / 600 * 100;
    const players100 = (d.players || 0) / 1800 * 100;
    const decline_inv = 100 - (d.dec || 0);
    const sport_p = (SPORT_GEO[g] || 0) / 40000 * 100;
    const prevDEP = prevM ? (DEP[prevM]?.[g] || {}) : null;
    const momPlayers = prevDEP && prevDEP.players ? ((d.players-prevDEP.players)/prevDEP.players*100).toFixed(0) : null;
    return {
      geo: `${GEO_FLAGS[g]} ${g}`,
      g,
      depSum: d.sum || 0,
      players: d.players || 0,
      avgDep: d.avgDep || 0,
      dec: d.dec || 0,
      engTime: q.engTime || 0,
      engRate: q.engRate || 0,
      sportProfit: SPORT_GEO[g] || 0,
      casinoProfit: CASINO_GEO[g] || 0,
      score: Math.round((dep100 + eng + decline_inv) / 3),
      momPlayers,
    };
  });

  return (
    <div style={{ padding:"16px 20px", overflowY:"auto", height:"100%" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
        {radarData.map(d => (
          <div key={d.g} style={{
            background:"#111827",
            border:`2px solid ${geo === d.g ? "#1a56db" : "#1f2d40"}`,
            borderRadius:10, padding:"12px 14px",
            boxShadow: geo === d.g ? "0 0 16px #1a56db40" : "none"
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{GEO_FLAGS[d.g]} {GEO_NAMES[d.g]}</div>
              <div style={{
                padding:"2px 8px", borderRadius:4, fontSize:10, fontWeight:700,
                background: d.score > 65 ? "#0f2d1a" : d.score > 40 ? "#3d2000" : "#3d0f0f",
                color: d.score > 65 ? "#4ade80" : d.score > 40 ? "#fcd34d" : "#fca5a5"
              }}>{d.score}/100</div>
            </div>
            {[
              ["Депозиты", fmt(d.depSum), d.depSum > 200000 ? "#22c55e" : "#94a3b8"],
              ["Игроки · "+m, fmtN(d.players) + (d.momPlayers ? (parseInt(d.momPlayers)>0?" ▲":" ▼") : ""), "#60a5fa"],
              ["Avg депозит", `$${d.avgDep}`, "#f59e0b"],
              ["Decline rate", `${d.dec}%`, d.dec > 40 ? "#dc2626" : d.dec > 25 ? "#f59e0b" : "#22c55e"],
              ["Вовлечённость", `${d.engTime}сек`, d.engTime > 200 ? "#22c55e" : d.engTime > 100 ? "#f59e0b" : "#dc2626"],
              ["Спорт GGR", d.sportProfit > 0 ? `+${fmt(d.sportProfit)}` : fmt(d.sportProfit), d.sportProfit > 0 ? "#22c55e" : "#ef4444"],
            ].map(([label, val, col]) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:9.5, color:"#64748b" }}>{label}</span>
                <span style={{ fontSize:9.5, fontWeight:700, color:col }}>{val}</span>
              </div>
            ))}
            {/* Score bar */}
            <div style={{ marginTop:8, height:4, background:"#1e2535", borderRadius:2 }}>
              <div style={{ width:`${d.score}%`, height:"100%",
                background: d.score > 65 ? "#22c55e" : d.score > 40 ? "#f59e0b" : "#dc2626",
                borderRadius:2, transition:"width 0.5s" }}/>
            </div>
          </div>
        ))}
      </div>

      {/* GEO comparison charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div style={{ background:"#111827", border:"1px solid #1f2d40", borderRadius:10, padding:"14px 16px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", marginBottom:10 }}>🏦 Avg депозит по GEO (динамика){!isAllMonth ? ` · отмечен ${m}` : ""}</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={MONTHS.map(mo => ({
              month: mo,
              BR: DEP[mo].BR?.avgDep, AR: DEP[mo].AR?.avgDep,
              MX: DEP[mo].MX?.avgDep, PE: DEP[mo].PE?.avgDep,
              CL: DEP[mo].CL?.avgDep, UY: DEP[mo].UY?.avgDep
            }))}>
              <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} unit="$"/>
              <Tooltip content={<CustomTooltip/>}/>
              {!isAllMonth && <ReferenceLine x={m} stroke="#334155" strokeDasharray="3 3"/>}
              {[{k:"BR",c:"#22c55e"},{k:"AR",c:"#60a5fa"},{k:"MX",c:"#f59e0b"},{k:"PE",c:"#c084fc"},{k:"CL",c:"#94a3b8"},{k:"UY",c:"#f97316"}].map(({k,c}) => (
                <Line key={k} type="monotone" dataKey={k} name={`${GEO_FLAGS[k]} ${k} avg$`} stroke={c} strokeWidth={geo===k?3:1.5} dot={{r:3}} strokeOpacity={geo==="ALL"||geo===k?1:0.4}/>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:"#111827", border:"1px solid #1f2d40", borderRadius:10, padding:"14px 16px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", marginBottom:10 }}>👥 Игроки по GEO (динамика)</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={MONTHS.map(mo => ({
              month: mo,
              BR: DEP[mo].BR?.players, AR: DEP[mo].AR?.players,
              MX: DEP[mo].MX?.players, PE: DEP[mo].PE?.players,
              CL: DEP[mo].CL?.players, UY: DEP[mo].UY?.players
            }))}>
              <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              {[{k:"AR",c:"#60a5fa"},{k:"BR",c:"#22c55e"},{k:"MX",c:"#f59e0b"},{k:"PE",c:"#c084fc"},{k:"CL",c:"#94a3b8"}].map(({k,c}) => (
                <Line key={k} type="monotone" dataKey={k} name={`${GEO_FLAGS[k]} ${k}`} stroke={c} strokeWidth={geo===k?3:1.5} dot={{r:3}} strokeOpacity={geo==="ALL"||geo===k?1:0.4}/>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [month, setMonth] = useState("ALL");
  const [geo, setGeo] = useState("ALL");
  const [product, setProduct] = useState("all");
  const [tab, setTab] = useState("overview");

  const bg = "#080e1c";
  const surface = "#0d1526";
  const border = "#1a2640";

  const geos = ["ALL","BR","AR","MX","PE","CL","UY","CO"];
  const tabs = [
    {id:"overview", label:"📊 Сводка"},
    {id:"deposits", label:"💳 Депозиты"},
    {id:"product", label:"🎮 Casino / Sport"},
    {id:"geo", label:"🌎 GEO-анализ"},
    {id:"cjm", label:"🗺 CJM Воронка"},
  ];

  // Get current month's key metrics for header display
  const cm = month === "ALL" ? null : DEP[month]?.[geo];
  const prevM = month !== "ALL" ? MONTHS[MONTHS.indexOf(month)-1] : null;
  const pm = prevM ? DEP[prevM]?.[geo] : null;

  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", background:bg, color:"#e2e8f0", height:"100vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* ══ HEADER ══════════════════════════════════════════════════ */}
      <div style={{ background:surface, borderBottom:`1px solid ${border}`, padding:"10px 18px", flexShrink:0 }}>
        {/* Row 1: Logo + title + NSM badges */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <div style={{ width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,#1a56db,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>💎</div>
          <div>
            <div style={{ fontSize:13,fontWeight:800,color:"#fff",letterSpacing:"-0.3px" }}>SapphireBet · CJM Analytics</div>
            <div style={{ fontSize:9,color:"#64748b" }}>Nov 2025 – Feb 2026 · LATAM · White Label 1xBet · Источники: MIO = Management.io · PBI = Power BI · GA4 = Google Analytics</div>
          </div>
          <div style={{ marginLeft:"auto",display:"flex",gap:8,alignItems:"center" }}>
            {[
              {l:"Total GGR gross (MIO)",v:"$1.07M",c:"#7c3aed"},
              {l:"Casino GGR gross (MIO)",v:"$933K",c:"#a855f7"},
              {l:"Sport GGR gross (MIO)",v:"$133K",c:"#22c55e"},
              {l:"Dep OK (PBI)",v:"$3.67M",c:"#1a56db"},
              {l:"D1 Retention (GA4)",v:"3.75%",c:"#dc2626"},
              {l:"Decline avg MIO / PBI",v:"35% / 20%",c:"#f59e0b"},
            ].map(m => (
              <div key={m.l} style={{ background:"#111827",border:`1px solid ${m.c}33`,borderRadius:6,padding:"4px 9px",textAlign:"center" }}>
                <div style={{ fontSize:11,fontWeight:800,color:m.c }}>{m.v}</div>
                <div style={{ fontSize:8,color:"#64748b" }}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Filters */}
        <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
          {/* Month */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px" }}>Период</span>
            <div style={{ display:"flex",gap:3 }}>
              {["ALL","Nov","Dec","Jan","Feb"].map(m => (
                <Pill key={m} label={m==="ALL"?"Все":{Nov:"Ноя",Dec:"Дек",Jan:"Янв",Feb:"Фев"}[m]||m} active={month===m} onClick={()=>setMonth(m)} color="#7c3aed"/>
              ))}
            </div>
          </div>

          <div style={{ width:1,height:24,background:border }}/>

          {/* GEO */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px" }}>GEO</span>
            <div style={{ display:"flex",gap:3,flexWrap:"wrap" }}>
              {geos.map(g => (
                <Pill key={g} label={g==="ALL"?"🌎 Все":`${GEO_FLAGS[g]} ${g}`} active={geo===g} onClick={()=>setGeo(g)} color="#1a56db"/>
              ))}
            </div>
          </div>

          <div style={{ width:1,height:24,background:border }}/>

          {/* Product */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px" }}>Продукт</span>
            <div style={{ display:"flex",gap:3 }}>
              {[{id:"all",label:"🎯 Все",c:"#0891b2"},{id:"casino",label:"🎰 Casino",c:"#7c3aed"},{id:"sport",label:"⚽ Sport",c:"#22c55e"}].map(p => (
                <Pill key={p.id} label={p.label} active={product===p.id} onClick={()=>setProduct(p.id)} color={p.c}/>
              ))}
            </div>
          </div>

          {/* Active context display */}
          {cm && (
            <>
              <div style={{ width:1,height:24,background:border }}/>
              <div style={{ display:"flex",gap:8 }}>
                <span style={{ fontSize:10,color:"#22c55e",fontWeight:700 }}>{fmtN(cm.players)} игроков</span>
                <span style={{ fontSize:10,color:"#94a3b8" }}>·</span>
                <span style={{ fontSize:10,color:"#1a56db",fontWeight:700 }}>{fmt(cm.sum)} депозиты</span>
                <span style={{ fontSize:10,color:"#94a3b8" }}>·</span>
                <span style={{ fontSize:10,color:cm.dec>35?"#dc2626":"#f59e0b",fontWeight:700 }}>Decline {cm.dec}%</span>
                {pm && <><span style={{ fontSize:10,color:"#94a3b8" }}>·</span>
                  <span style={{ fontSize:10,color:cm.players>pm.players?"#22c55e":"#dc2626",fontWeight:700 }}>
                    {cm.players>pm.players?"▲":"▼"} {Math.abs(((cm.players-pm.players)/pm.players*100)).toFixed(0)}% vs {prevM}
                  </span></>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══ TAB BAR ═════════════════════════════════════════════════ */}
      <div style={{ display:"flex",gap:2,padding:"8px 18px",background:surface,borderBottom:`1px solid ${border}`,flexShrink:0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"6px 14px",borderRadius:7,border:"none",cursor:"pointer",
            background:tab===t.id?"#1a56db":"transparent",
            color:tab===t.id?"#fff":"#64748b",
            fontSize:11,fontWeight:tab===t.id?700:400,transition:"all 0.18s"
          }}>{t.label}</button>
        ))}
      </div>

      {/* ══ CONTENT ════════════════════════════════════════════════ */}
      <div style={{ flex:1,overflow:"hidden",minHeight:0 }}>
        {tab === "overview" && <OverviewView month={month} geo={geo} product={product}/>}
        {tab === "deposits" && <DepositsView month={month} geo={geo} product={product}/>}
        {tab === "product" && <SportCasinoView month={month} geo={geo} product={product}/>}
        {tab === "geo" && <GeoView month={month} geo={geo} product={product}/>}
        {tab === "cjm" && <CJMFunnelView month={month} geo={geo} product={product}/>}
      </div>
    </div>
  );
}
