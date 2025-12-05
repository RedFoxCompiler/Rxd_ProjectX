
'use client';

import Link from 'next/link';

// A lista de rotas que queremos pré-carregar.
const PRELOAD_ROUTES = [
  '/chat',
  '/create',
  '/login',
  '/adminsettings',
  '/settings',
  '/privacy',
  '/terms',
  '/downloadsecret',
  '/websearch',
];

/**
 * Este componente renderiza uma lista de links invisíveis.
 * O atributo `prefetch={true}` (que é o padrão em `next/link`) instrui o Next.js
 * a baixar o código das páginas em segundo plano quando o link entra na área visível
 * do navegador (neste caso, imediatamente no carregamento da página).
 *
 * Esta é a maneira mais eficiente e estável de pré-carregar rotas no Next.js.
 */
export function Preloader() {
  return (
    <div style={{ display: 'none' }} aria-hidden="true">
      {PRELOAD_ROUTES.map((route) => (
        <Link href={route} key={route} prefetch={true} />
      ))}
    </div>
  );
}
