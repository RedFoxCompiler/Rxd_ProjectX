
'use server';

import fs from 'fs/promises';
import path from 'path';

export interface RouteStatus {
  routes: {
    chat: boolean;
    websearch: boolean;
    create: boolean;
  };
}

const statusFilePath = path.join(process.cwd(), 'src', 'lib', 'route-status.json');

const defaultStatus: RouteStatus = {
  routes: {
    chat: true,
    websearch: true,
    create: true,
  },
};

// Função para ler o estado atual das rotas
export async function getRouteStatus(): Promise<RouteStatus> {
  try {
    const fileContent = await fs.readFile(statusFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    // Merge para garantir que novas rotas no default sejam adicionadas se o arquivo estiver desatualizado
    return {
      ...defaultStatus,
      ...data,
      routes: {
        ...defaultStatus.routes,
        ...data.routes,
      },
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' || error instanceof SyntaxError) {
      // Se o arquivo não existe ou está corrompido, cria um com os valores padrão
      try {
        await fs.writeFile(statusFilePath, JSON.stringify(defaultStatus, null, 2), 'utf-8');
      } catch (writeError) {
        console.error("Could not write default route status file.", writeError);
      }
      return defaultStatus;
    }
    console.error("Error reading route status file:", error);
    throw error;
  }
}

// Server Action para salvar o novo estado das rotas
export async function saveRouteStatus(newStatus: RouteStatus) {
  try {
    const data = JSON.stringify(newStatus, null, 2);
    await fs.writeFile(statusFilePath, data, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error("Failed to save route status:", error);
    return { success: false, error: (error as Error).message || 'Failed to write to status file' };
  }
}
