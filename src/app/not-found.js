'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const redirigir = async () => {
      try {
        const res = await fetch('/api/getSessionUser');
        if (res.ok) {
          const data = await res.json();
          const usuario = data.usuario;

          if (usuario?.rol === 'Jefe de Departamento' && usuario?.departamento) {
            router.replace(`/pages/resumen/${usuario.departamento}`);
          } else {
            router.replace('/pages/home');
          }
        } else {
          // Sin sesión → login
          router.replace('/');
        }
      } catch (error) {
        router.replace('/');
      }
    };

    redirigir();
  }, []);

  return null;
}
