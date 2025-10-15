import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();

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
            <button onClick={() => signOut()} className="bg-red-600 text-white px-4 py-2 rounded-md">Sign out</button>
          </div>
        </div>
      ) : (
        <p>Please sign in to view your profile.</p>
      )}
    </div>
  );
};

export default Profile;
