"use client"

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export function ClosePreventionProvider({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isLoginPage = pathname === '/';
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Solo prevenir el cierre si hay una sesión activa y no estamos en la página de login
    if ((session || status === 'loading') && !isLoginPage) {
      const handleBeforeUnload = (e) => {
        // Verificar si se hizo un logout explícito
        const wasExplicitLogout = localStorage.getItem('siged_explicit_logout') === 'true';
        
        // Si fue logout explícito, no mostrar advertencia
        if (wasExplicitLogout) {
          return;
        }
        
        // Solo mostrar advertencia si NO fue logout explícito
        const message = '¿Desea salir del sitio? Por favor, haga logout antes de cerrar para evitar problemas con su sesión.';
        e.preventDefault();
        e.returnValue = message;
        setIsClosing(true);
        return message;
      };

      // También detectar cuando se intenta cerrar la pestaña o navegar fuera
      const handleUnload = () => {
        if (!localStorage.getItem('siged_explicit_logout') === 'true' && !isClosing) {
          // Registrar el cierre del navegador sin logout explícito
          try {
            localStorage.setItem('siged_session_aborted', 'true');
          } catch (e) {
            // Ignorar errores de localStorage en el evento unload
          }
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('unload', handleUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('unload', handleUnload);
      };
    }
  }, [session, status, isLoginPage, isClosing]);

  return <>{children}</>;
}
