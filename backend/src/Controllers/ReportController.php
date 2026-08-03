<?php
namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Helpers\Format;
use App\Repositories\RepositoryFactory;

class ReportController
{
    private static function aggregateItems(array $txs): array
    {
        // productId => ['name'=>, 'qty'=>, 'revenue'=>]
        $agg = [];
        foreach ($txs as $t) {
            foreach ($t['items'] as $it) {
                $key = $it['productId'] ?? $it['name'];
                if (!isset($agg[$key])) $agg[$key] = ['name' => $it['name'], 'qty' => 0, 'revenue' => 0.0];
                $agg[$key]['qty'] += $it['qty'];
                $agg[$key]['revenue'] += $it['subtotal'];
            }
        }
        usort($agg, fn($a, $b) => $b['revenue'] <=> $a['revenue']);
        return array_values($agg);
    }

    private static function byCategory(array $txs, array $products): array
    {
        $catByProductId = [];
        foreach ($products as $p) $catByProductId[$p['id']] = $p['category'];
        $agg = [];
        foreach ($txs as $t) {
            foreach ($t['items'] as $it) {
                $cat = $it['productId'] && isset($catByProductId[$it['productId']]) ? $catByProductId[$it['productId']] : 'Umum';
                if (!isset($agg[$cat])) $agg[$cat] = ['category' => $cat, 'qty' => 0, 'revenue' => 0.0];
                $agg[$cat]['qty'] += $it['qty'];
                $agg[$cat]['revenue'] += $it['subtotal'];
            }
        }
        usort($agg, fn($a, $b) => $b['revenue'] <=> $a['revenue']);
        return array_values($agg);
    }

    private static function byPaymentMethod(array $txs): array
    {
        $agg = [];
        foreach ($txs as $t) {
            $m = $t['paymentMethod'];
            if (!isset($agg[$m])) $agg[$m] = ['method' => $m, 'count' => 0, 'revenue' => 0.0];
            $agg[$m]['count']++;
            $agg[$m]['revenue'] += $t['total'];
        }
        usort($agg, fn($a, $b) => $b['revenue'] <=> $a['revenue']);
        return array_values($agg);
    }

    private static function cashierPerformance(array $txs): array
    {
        $agg = [];
        foreach ($txs as $t) {
            $name = $t['cashierName'];
            if (!isset($agg[$name])) $agg[$name] = ['name' => $name, 'transactions' => 0, 'revenue' => 0.0];
            $agg[$name]['transactions']++;
            $agg[$name]['revenue'] += $t['total'];
        }
        usort($agg, fn($a, $b) => $b['revenue'] <=> $a['revenue']);
        return array_values($agg);
    }

    public static function dashboard(): void
    {
        Auth::requireLogin();
        $txRepo = RepositoryFactory::transactions();
        $productRepo = RepositoryFactory::products();
        $settings = RepositoryFactory::settings()->get();

        $today = date('Y-m-d');
        $todaySummary = $txRepo->summarizePeriod($today, $today);

        $dailySales = [];
        for ($i = 6; $i >= 0; $i--) {
            $d = date('Y-m-d', strtotime("-$i day"));
            $s = $txRepo->summarizePeriod($d, $d);
            $dailySales[] = ['label' => date('D', strtotime($d)), 'revenue' => $s['totalRevenue']];
        }

        $weeklySales = [];
        for ($w = 3; $w >= 0; $w--) {
            $from = date('Y-m-d', strtotime("monday this week -$w week"));
            $to = date('Y-m-d', strtotime($from . ' +6 day'));
            $s = $txRepo->summarizePeriod($from, $to);
            $weeklySales[] = ['label' => 'Mgg ' . (4 - $w), 'revenue' => $s['totalRevenue']];
        }

        $topProducts = array_slice(self::aggregateItems($todaySummary['txs']), 0, 5);
        $cashierActivity = array_slice(self::cashierPerformance($todaySummary['txs']), 0, 5);

        $products = $productRepo->all();
        $lowStock = array_values(array_filter($products, fn($p) => $p['stock'] <= $settings['lowStockThreshold']));
        usort($lowStock, fn($a, $b) => $a['stock'] <=> $b['stock']);
        $lowStock = array_slice($lowStock, 0, 6);

        $recentTxs = $todaySummary['txs'];
        usort($recentTxs, fn($a, $b) => $b['createdAt'] <=> $a['createdAt']);
        $recentActivity = array_map(fn($t) => [
            'id' => $t['id'], 'cashierName' => $t['cashierName'],
            'itemCount' => array_sum(array_map(fn($it) => $it['qty'], $t['items'])), 'total' => $t['total'],
        ], array_slice($recentTxs, 0, 6));

        Response::json([
            'today' => ['revenue' => $todaySummary['totalRevenue'], 'transactions' => $todaySummary['totalTransactions'], 'itemsSold' => $todaySummary['totalItemsSold']],
            'dailySales' => $dailySales, 'weeklySales' => $weeklySales, 'topProducts' => $topProducts,
            'cashierActivity' => $cashierActivity, 'lowStock' => $lowStock, 'recentActivity' => $recentActivity,
        ]);
    }

    public static function range(): void
    {
        Auth::requireLogin();
        $from = $_GET['from'] ?? date('Y-m-d');
        $to = $_GET['to'] ?? date('Y-m-d');

        $txRepo = RepositoryFactory::transactions();
        $productRepo = RepositoryFactory::products();
        $current = $txRepo->summarizePeriod($from, $to);

        // periode sebelumnya (durasi sama) -> dasar perhitungan growth %
        $days = (strtotime($to) - strtotime($from)) / 86400 + 1;
        $prevTo = date('Y-m-d', strtotime($from . ' -1 day'));
        $prevFrom = date('Y-m-d', strtotime($prevTo . ' -' . ($days - 1) . ' day'));
        $previous = $txRepo->summarizePeriod($prevFrom, $prevTo);

        Response::json([
            'from' => $from, 'to' => $to,
            'summary' => [
                'totalRevenue' => $current['totalRevenue'], 'totalTransactions' => $current['totalTransactions'],
                'totalItemsSold' => $current['totalItemsSold'], 'avgTransactionValue' => $current['avgTransactionValue'],
            ],
            'growth' => [
                'revenue' => Format::pctChange($current['totalRevenue'], $previous['totalRevenue']),
                'transactions' => Format::pctChange($current['totalTransactions'], $previous['totalTransactions']),
            ],
            'byCategory' => self::byCategory($current['txs'], $productRepo->all()),
            'byPaymentMethod' => self::byPaymentMethod($current['txs']),
            'topProducts' => array_slice(self::aggregateItems($current['txs']), 0, 10),
            'cashierPerformance' => self::cashierPerformance($current['txs']),
        ]);
    }
}
