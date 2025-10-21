import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { User } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';

const Users: React.FC = () => {
  const [users, setUsers] = useState<Pick<User, 'id'|'email'|'firstName'|'lastName'|'role'|'isVerified'|'createdAt'>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await adminAPI.getUsers();
    setUsers(data);
  };

  useEffect(() => {
    load().catch((e)=>{
      if (e.response?.status === 403) {
        alert('Admin erişimi için 2FA zorunlu. Lütfen 2FA etkinleştirin.');
      }
    }).finally(() => setLoading(false));
  }, []);

  const updateRole = async (id: string, role: 'USER'|'ADMIN') => {
    await adminAPI.updateUserRole(id, role);
    await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) return;
    await adminAPI.deleteUser(id);
    await load();
  };

  if (loading) return <div className="p-6">Yükleniyor…</div>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Kullanıcılar</h1>
      <div className="overflow-x-auto border rounded-lg dark:border-secondary-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-secondary-700">
          <thead className="bg-gray-50 dark:bg-secondary-800">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase">Ad Soyad</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase">E-posta</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase">Rol</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-secondary-700">
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-4 py-2">{u.firstName} {u.lastName}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">
                  <select value={u.role} onChange={e => updateRole(u.id, e.target.value as 'USER'|'ADMIN')} className="border rounded px-2 py-1 dark:bg-secondary-800 dark:border-secondary-700">
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => remove(u.id)} className="px-3 py-1 border rounded text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default Users;


