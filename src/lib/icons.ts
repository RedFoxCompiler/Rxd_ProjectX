
'use client';

/**
 * @fileoverview Este arquivo serve como um catálogo central para todos os ícones da biblioteca 'lucide-react'.
 * Em vez de importar ícones individualmente em cada componente, nós os reexportamos a partir daqui.
 * Isso nos dá um ponto único de gerenciamento e nos prepara para futuras otimizações,
 * como a pré-seleção de ícones para a IA.
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';

// Reexporta todos os ícones para que possam ser importados dinamicamente.
export const icons = LucideIcons;

// Componente wrapper para renderizar um ícone dinamicamente pelo nome.
export function Icon({ name, ...props }: { name: string | undefined;[key: string]: any }) {
    if (!name) return null;
    const IconComponent = (icons as any)[name];

    // Fallback para um ícone padrão se o nome for inválido.
    if (!IconComponent) {
        console.warn(`[Icon] Ícone não encontrado: ${name}`);
        return React.createElement(icons.HelpCircle, props);
    }
    
    return React.createElement(IconComponent, props);
}
