<?php
namespace App\Repositories\Contracts;

interface SettingsRepositoryInterface
{
    public function get(): array;
    public function update(array $data): array;
}
