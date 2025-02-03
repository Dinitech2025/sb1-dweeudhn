import React from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            DINITECH
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Créez votre compte pour commencer
          </p>
        </div>

        <RegisterForm />

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};