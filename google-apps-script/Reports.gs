/**
 * ============================================================
 * Reports.gs
 * ============================================================
 */

function aggregateItems_(txs) {
  var agg = {};
  txs.forEach(function (t) {
    t.items.forEach(function (it) {
      var key = it.productId || it.name;
      if (!agg[key]) agg[key] = { name: it.name, qty: 0, revenue: 0 };
      agg[key].qty += it.qty;
      agg[key].revenue += it.subtotal;
    });
  });
  var list = Object.keys(agg).map(function (k) { return agg[k]; });
  list.sort(function (a, b) { return b.revenue - a.revenue; });
  return list;
}

function byCategory_(txs, products) {
  var catByProductId = {};
  products.forEach(function (p) { catByProductId[p.id] = p.category; });
  var agg = {};
  txs.forEach(function (t) {
    t.items.forEach(function (it) {
      var cat = (it.productId && catByProductId[it.productId]) ? catByProductId[it.productId] : 'Umum';
      if (!agg[cat]) agg[cat] = { category: cat, qty: 0, revenue: 0 };
      agg[cat].qty += it.qty;
      agg[cat].revenue += it.subtotal;
    });
  });
  var list = Object.keys(agg).map(function (k) { return agg[k]; });
  list.sort(function (a, b) { return b.revenue - a.revenue; });
  return list;
}

function byPaymentMethod_(txs) {
  var agg = {};
  txs.forEach(function (t) {
    var m = t.paymentMethod;
    if (!agg[m]) agg[m] = { method: m, count: 0, revenue: 0 };
    agg[m].count++;
    agg[m].revenue += t.total;
  });
  var list = Object.keys(agg).map(function (k) { return agg[k]; });
  list.sort(function (a, b) { return b.revenue - a.revenue; });
  return list;
}

function cashierPerformance_(txs) {
  var agg = {};
  txs.forEach(function (t) {
    var name = t.cashierName;
    if (!agg[name]) agg[name] = { name: name, transactions: 0, revenue: 0 };
    agg[name].transactions++;
    agg[name].revenue += t.total;
  });
  var list = Object.keys(agg).map(function (k) { return agg[k]; });
  list.sort(function (a, b) { return b.revenue - a.revenue; });
  return list;
}

function addDays_(dateStr, days) {
  var d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function reportsDashboard_() {
  var today = new Date().toISOString().slice(0, 10);
  var todaySummary = txSummarizePeriod_(today, today);

  var dailySales = [];
  for (var i = 6; i >= 0; i--) {
    var d = addDays_(today, -i);
    var s = txSummarizePeriod_(d, d);
    var label = Utilities.formatDate(new Date(d + 'T00:00:00Z'), 'UTC', 'EEE');
    dailySales.push({ label: label, revenue: s.totalRevenue });
  }

  var weeklySales = [];
  var now = new Date();
  var dayOfWeek = (now.getUTCDay() + 6) % 7; // Senin = 0
  var mondayThisWeek = addDays_(today, -dayOfWeek);
  for (var w = 3; w >= 0; w--) {
    var from = addDays_(mondayThisWeek, -w * 7);
    var to = addDays_(from, 6);
    var sw = txSummarizePeriod_(from, to);
    weeklySales.push({ label: 'Mgg ' + (4 - w), revenue: sw.totalRevenue });
  }

  var topProducts = aggregateItems_(todaySummary.txs).slice(0, 5);
  var cashierActivity = cashierPerformance_(todaySummary.txs).slice(0, 5);

  var products = productsAll_();
  var settings = settingsGet_();
  var lowStock = products.filter(function (p) { return p.stock <= settings.lowStockThreshold; });
  lowStock.sort(function (a, b) { return a.stock - b.stock; });
  lowStock = lowStock.slice(0, 6);

  var recentTxs = todaySummary.txs.slice().sort(function (a, b) { return b.createdAt < a.createdAt ? -1 : 1; });
  var recentActivity = recentTxs.slice(0, 6).map(function (t) {
    return { id: t.id, cashierName: t.cashierName, itemCount: t.items.reduce(function (s, it) { return s + it.qty; }, 0), total: t.total };
  });

  return {
    today: { revenue: todaySummary.totalRevenue, transactions: todaySummary.totalTransactions, itemsSold: todaySummary.totalItemsSold },
    dailySales: dailySales, weeklySales: weeklySales, topProducts: topProducts,
    cashierActivity: cashierActivity, lowStock: lowStock, recentActivity: recentActivity,
  };
}

function reportsRange_(from, to) {
  var current = txSummarizePeriod_(from, to);
  var days = Math.round((new Date(to) - new Date(from)) / 86400000) + 1;
  var prevTo = addDays_(from, -1);
  var prevFrom = addDays_(prevTo, -(days - 1));
  var previous = txSummarizePeriod_(prevFrom, prevTo);
  var products = productsAll_();

  return {
    from: from, to: to,
    summary: { totalRevenue: current.totalRevenue, totalTransactions: current.totalTransactions, totalItemsSold: current.totalItemsSold, avgTransactionValue: current.avgTransactionValue },
    growth: { revenue: pctChange_(current.totalRevenue, previous.totalRevenue), transactions: pctChange_(current.totalTransactions, previous.totalTransactions) },
    byCategory: byCategory_(current.txs, products), byPaymentMethod: byPaymentMethod_(current.txs),
    topProducts: aggregateItems_(current.txs).slice(0, 10), cashierPerformance: cashierPerformance_(current.txs),
  };
}
