import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user, signOut, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdate = async () => {
    setMessage(null);
    setLoading(true);
    try {
      await updateProfile({ full_name: fullName, phone });
      setMessage('Profile updated');
    } catch (err: any) {
      setMessage(err.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">My Account</h1>
      {user ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Email</h2>
            <p>{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
          </div>

          {message && <div className="text-sm text-green-600">{message}</div>}

          <div className="flex items-center gap-3">
            <button onClick={handleUpdate} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded-md">{loading ? 'Saving…' : 'Save'}</button>
            <Link to="/reset-password" className="text-sm text-gray-600">Change password</Link>
            <button onClick={() => signOut()} className="ml-auto bg-red-600 text-white px-3 py-2 rounded-md">Sign out</button>
          </div>
        </div>
      ) : (
        <p>Please sign in to view your profile.</p>
      )}
    </div>
  );
};

export default Profile;
