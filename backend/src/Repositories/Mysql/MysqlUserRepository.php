<?php
namespace App\Repositories\Mysql;

use App\Helpers\Format;
use App\Repositories\Contracts\UserRepositoryInterface;
use PDO;

class MysqlUserRepository implements UserRepositoryInterface
{
    private PDO $db;

    public function __construct() { $this->db = MysqlConnection::get(); }

    private function shape(array $row): array
    {
        return [
            'id' => (int)$row['id'],
            'username' => $row['username'],
            'name' => $row['name'],
            'role' => $row['role'],
            'menuAccessOverride' => Format::decodeMenuAccessOverride($row['menu_access_override'] ?? null),
        ];
    }

    public function all(): array
    {
        $rows = $this->db->query('SELECT * FROM users ORDER BY id')->fetchAll();
        return array_map([$this, 'shape'], $rows);
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? $this->shape($row) : null;
    }

    /** Mengembalikan row MENTAH (termasuk password_hash) — dipakai saat login/ganti password. */
    public function findRawByUsername(string $username): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE username = ?');
        $stmt->execute([$username]);
        return $stmt->fetch() ?: null;
    }

    public function findByUsername(string $username): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $row = $stmt->fetch();
        return $row ? $this->shape($row) : null;
    }

    public function findRawById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)');
        $stmt->execute([$data['username'], password_hash($data['password'], PASSWORD_BCRYPT), $data['name'], $data['role'] ?? 'kasir']);
        return $this->find((int)$this->db->lastInsertId());
    }

    public function update(int $id, array $data): array
    {
        $fields = [];
        $params = [];
        if (array_key_exists('name', $data)) { $fields[] = 'name = ?'; $params[] = $data['name']; }
        if (array_key_exists('role', $data)) { $fields[] = 'role = ?'; $params[] = $data['role']; }
        if (!empty($data['password'])) { $fields[] = 'password_hash = ?'; $params[] = password_hash($data['password'], PASSWORD_BCRYPT); }
        if (array_key_exists('menuAccessOverride', $data)) {
            $fields[] = 'menu_access_override = ?';
            $params[] = Format::encodeMenuAccessOverride($data['menuAccessOverride']);
        }
        if ($fields) {
            $params[] = $id;
            $this->db->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
        }
        return $this->find($id);
    }

    public function delete(int $id): void
    {
        $this->db->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
    }

    public function updatePassword(int $id, string $newPasswordHash): void
    {
        $this->db->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$newPasswordHash, $id]);
    }
}
