<?php
namespace App\Repositories;

use App\Repositories\Mysql as Mysql;
use App\Repositories\Sheets as Sheets;

/**
 * Satu-satunya tempat yang tahu backend mana yang sedang aktif.
 * Controller SELALU minta repository lewat factory ini, tidak pernah
 * `new MysqlXxxRepository()` langsung -> supaya bisa pindah dari Sheets
 * ke MySQL (atau sebaliknya) cukup ganti DATA_BACKEND di config.php.
 */
class RepositoryFactory
{
    public static function users(): Contracts\UserRepositoryInterface
    {
        return DATA_BACKEND === 'mysql' ? new Mysql\MysqlUserRepository() : new Sheets\SheetsUserRepository();
    }

    public static function categories(): Contracts\CategoryRepositoryInterface
    {
        return DATA_BACKEND === 'mysql' ? new Mysql\MysqlCategoryRepository() : new Sheets\SheetsCategoryRepository();
    }

    public static function customers(): Contracts\CustomerRepositoryInterface
    {
        return DATA_BACKEND === 'mysql' ? new Mysql\MysqlCustomerRepository() : new Sheets\SheetsCustomerRepository();
    }

    public static function products(): Contracts\ProductRepositoryInterface
    {
        return DATA_BACKEND === 'mysql' ? new Mysql\MysqlProductRepository() : new Sheets\SheetsProductRepository();
    }

    public static function settings(): Contracts\SettingsRepositoryInterface
    {
        return DATA_BACKEND === 'mysql' ? new Mysql\MysqlSettingsRepository() : new Sheets\SheetsSettingsRepository();
    }

    public static function transactions(): Contracts\TransactionRepositoryInterface
    {
        return DATA_BACKEND === 'mysql' ? new Mysql\MysqlTransactionRepository() : new Sheets\SheetsTransactionRepository();
    }

    public static function stock(): Contracts\StockRepositoryInterface
    {
        return DATA_BACKEND === 'mysql' ? new Mysql\MysqlStockRepository() : new Sheets\SheetsStockRepository();
    }

    public static function returns(): Contracts\ReturnRepositoryInterface
    {
        return DATA_BACKEND === 'mysql' ? new Mysql\MysqlReturnRepository() : new Sheets\SheetsReturnRepository();
    }
}
