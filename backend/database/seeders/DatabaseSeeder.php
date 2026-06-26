<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'reports.view', 'reports.upload', 'reports.delete',
            'victims.view', 'victims.update_status',
            'enrichment.run', 'enrichment.edit',
            'notes.manage',
            'users.manage',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $roles = [
            'Admin' => $permissions, // everything
            'Manager' => ['reports.view', 'reports.upload', 'reports.delete', 'victims.view', 'victims.update_status', 'enrichment.run', 'enrichment.edit', 'notes.manage'],
            'Researcher' => ['reports.view', 'victims.view', 'enrichment.run', 'enrichment.edit', 'notes.manage'],
            'Data Entry' => ['reports.view', 'reports.upload', 'victims.view', 'notes.manage'],
            'Sales Agent' => ['victims.view', 'victims.update_status', 'notes.manage'],
            'Attorney' => ['reports.view', 'victims.view', 'notes.manage'],
        ];

        foreach ($roles as $roleName => $rolePerms) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($rolePerms);
        }

        $admin = User::updateOrCreate(
            ['email' => 'admin@crash.local'],
            [
                'first_name' => 'System',
                'last_name' => 'Admin',
                'name' => 'System Admin',
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );
        $admin->syncRoles(['Admin']);
    }
}
