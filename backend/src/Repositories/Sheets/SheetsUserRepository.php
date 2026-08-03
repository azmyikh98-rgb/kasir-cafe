<?php
namespace App\Repositories\Sheets;

use App\Helpers\Format;
use App\Repositories\Contracts\UserRepositoryInterface;

class SheetsUserRepository implements UserRepositoryInterface
{
    private SheetsTable $table;

    public function __construct()
    {
        $this->table = new SheetsTable(GOOGLE_SHEET_ID_USERS, ['id', 'username', 'password_hash', 'name', 'role', 'menu_access_override', 'created_at']);
    }

    private function shape(array $row): array
    {
        return [
            'id' => (int)$row['id'], 'username' => $row['username'], 'name' => $row['name'], 'role' => $row['role'],
            'menuAccessOverride' => Format::decodeMenuAccessOverride($row['menu_access_override'] ?: null),
        ];
    }

    public function all(): array { return array_map([$this, 'shape'], $this->table->readAll()); }

    public function find(int $id): ?array
    {
        $row = $this->table->findById($id);
        return $row ? $this->shape($row) : null;
    }

    public function findByUsername(string $username): ?array
    {
        $row = $this->findRawByUsername($username);
        return $row ? $this->shape($row) : null;
    }

    /** Row mentah termasuk password_hash — dipakai saat login/ganti password. */
    public function findRawByUsername(string $username): ?array
    {
        foreach ($this->table->readAll() as $row) {
            if ($row['username'] === $username) return $row;
        }
        return null;
    }

    public function findRawById(int $id): ?array
    {
        return $this->table->findById($id);
    }

    public function create(array $data): array
    {
        $row = $this->table->insert([
            'username' => $data['username'],
            'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
            'name' => $data['name'], 'role' => $data['role'] ?? 'kasir',
            'menu_access_override' => '', 'created_at' => Format::nowIso(),
        ]);
        return $this->shape($row);
    }

    public function update(int $id, array $data): array
    {
        $changes = [];
        if (array_key_exists('name', $data)) $changes['name'] = $data['name'];
        if (array_key_exists('role', $data)) $changes['role'] = $data['role'];
        if (!empty($data['password'])) $changes['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        if (array_key_exists('menuAccessOverride', $data)) $changes['menu_access_override'] = Format::encodeMenuAccessOverride($data['menuAccessOverride']) ?: '';
        $row = $this->table->update($id, $changes);
        return $this->shape($row);
    }

    public function delete(int $id): void { $this->table->softDelete($id); }

    public function updatePassword(int $id, string $newPasswordHash): void
    {
        $this->table->update($id, ['password_hash' => $newPasswordHash]);
    }
}
