<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles:id,name')->latest()->paginate(20);

        return response()->json($users);
    }

    public function roles()
    {
        return response()->json(Role::orderBy('name')->get(['id', 'name']));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['nullable', 'string'],
            'last_name' => ['nullable', 'string'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string'],
            'password' => ['required', 'string', 'min:8'],
            'status' => ['nullable', Rule::in(['active', 'suspended', 'invited'])],
            'roles' => ['array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'name' => trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '')) ?: $data['email'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'status' => $data['status'] ?? 'active',
        ]);

        $user->syncRoles($data['roles'] ?? []);

        return response()->json([
            'message' => 'User created.',
            'user' => $user->load('roles:id,name'),
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'first_name' => ['nullable', 'string'],
            'last_name' => ['nullable', 'string'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string'],
            'password' => ['nullable', 'string', 'min:8'],
            'status' => ['nullable', Rule::in(['active', 'suspended', 'invited'])],
            'roles' => ['array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $user->fill([
            'first_name' => $data['first_name'] ?? $user->first_name,
            'last_name' => $data['last_name'] ?? $user->last_name,
            'name' => trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '')) ?: $user->name,
            'email' => $data['email'],
            'phone' => $data['phone'] ?? $user->phone,
            'status' => $data['status'] ?? $user->status,
        ]);

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        $user->save();

        if (array_key_exists('roles', $data)) {
            $user->syncRoles($data['roles']);
        }

        return response()->json([
            'message' => 'User updated.',
            'user' => $user->fresh('roles:id,name'),
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }
        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}
