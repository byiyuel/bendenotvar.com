import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import AdminLayout from '../../components/Layout/AdminLayout';

interface Category { id: string; name: string; description?: string }

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<{ id?: string; name: string; description?: string }>({ name: '' });

  const load = async () => {
    const { data } = await adminAPI.getCategories();
    setCategories(data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) {
      await adminAPI.updateCategory(form.id, { name: form.name, description: form.description });
    } else {
      await adminAPI.createCategory({ name: form.name, description: form.description });
    }
    setForm({ name: '' });
    await load();
  };

  const edit = (c: Category) => setForm({ id: c.id, name: c.name, description: c.description });
  const remove = async (id: string) => { if (!window.confirm('Kategori silinsin mi?')) return; await adminAPI.deleteCategory(id); await load(); };

  if (loading) return <div className="p-6">Yükleniyor…</div>;

  return (
    <AdminLayout>
      <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kategoriler</h1>

      <form onSubmit={submit} className="flex gap-2 items-end">
        <div>
          <label className="block text-sm mb-1">Ad</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="border rounded px-3 py-2 dark:bg-secondary-800 dark:border-secondary-700" required />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">Açıklama</label>
          <input value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border rounded px-3 py-2 dark:bg-secondary-800 dark:border-secondary-700" />
        </div>
        <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white">{form.id ? 'Güncelle' : 'Ekle'}</button>
        {form.id && (
          <button type="button" onClick={() => setForm({ name: '' })} className="px-3 py-2 rounded border">İptal</button>
        )}
      </form>

      <div className="grid gap-2">
        {categories.map(c => (
          <div key={c.id} className="flex justify-between items-center border rounded p-3 dark:border-secondary-700">
            <div>
              <div className="font-medium">{c.name}</div>
              {c.description && <div className="text-sm text-gray-500">{c.description}</div>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => edit(c)} className="px-3 py-1 border rounded">Düzenle</button>
              <button onClick={() => remove(c.id)} className="px-3 py-1 border rounded text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30">Sil</button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </AdminLayout>
  );
};

export default Categories;


