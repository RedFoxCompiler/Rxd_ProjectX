
'use server';

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// --- Tipos de Estilos e Conteúdo ---

export interface ElementStyles {
  // Typography
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;

  // Layout
  padding?: string; // e.g., "10px 20px"
  margin?: string;

  // Appearance
  backgroundColor?: string;
  opacity?: number;
  borderRadius?: number;
  border?: string;
  boxShadow?: string;
}

export interface LogoStyles {
    filter?: string; // To hold brightness, saturation, contrast
    dropShadow?: string;
}

export interface DynamicContainer {
  id: string;
  type: 'container';
  text: string;
  styles?: ElementStyles;
  hoverEffect?: boolean;
}

export interface DynamicText {
  id: string;
  type: 'text';
  text: string;
  styles?: ElementStyles;
}

export interface DynamicButton {
  id:string;
  type: 'button';
  text: string;
  href: string;
  styles?: ElementStyles;
}

export type DynamicElement = DynamicContainer | DynamicText | DynamicButton;


// --- Tipo Principal do Conteúdo da Página ---

export interface LandingPageContent {
  // Static content keys
  mainHeading: string;
  subheading: string;
  ctaButton: string;
  featureTag: string;
  featureHeading: string;
  featureSubheading: string;
  featureIcon1: string;
  featureTitle1: string;
  featureDescription1: string;
  featureIcon2: string;
  featureTitle2: string;
  featureDescription2: string;
  featureIcon3: string;
  featureTitle3: string;
  featureDescription3: string;
  
  // Styles for static elements, keyed by their ID (e.g., 'mainHeading')
  styles?: {
    [key: string]: ElementStyles;
  };

  // Logo
  logoDataUrl?: string;
  logoStyles?: LogoStyles;
  
  // Theme properties
  themePrimaryColor: string;
  themeBackgroundColor: string;
  themeAccentColor: string;
  
  // Array unificado para todos os elementos dinâmicos
  dynamicElements?: DynamicElement[];
}


// --- Caminhos dos Arquivos ---
const contentFilePath = path.join(process.cwd(), 'src', 'lib', 'landing-page-content.json');
const cssFilePath = path.join(process.cwd(), 'src', 'app', 'globals.css');


// Helper function to update CSS variables in globals.css
async function updateThemeInCss(colors: { primary: string; background: string; accent: string }) {
    try {
        let cssContent = await fs.readFile(cssFilePath, 'utf-8');
        
        const replaceCssVar = (content: string, varName: string, newHslValue: string | undefined) => {
            if (!newHslValue || !newHslValue.trim()) {
                console.warn(`Skipping CSS update for ${varName} due to empty value.`);
                return content;
            }
            const pattern = new RegExp(`(${varName}:\\s*)[^;]+;`, 'g');
            if (pattern.test(content)) {
                 return content.replace(pattern, `$1${newHslValue};`);
            } else {
                console.warn(`CSS variable ${varName} not found to replace.`);
                return content;
            }
        };
        
        cssContent = replaceCssVar(cssContent, '--primary', colors.primary);
        cssContent = replaceCssVar(cssContent, '--background', colors.background);
        cssContent = replaceCssVar(cssContent, '--accent', colors.accent);

        await fs.writeFile(cssFilePath, cssContent, 'utf-8');
    } catch (error) {
        console.error("Failed to update globals.css:", error);
        throw new Error('Failed to update theme CSS file.');
    }
}


// Function to get the current content, including theme
export async function getLandingPageContent(): Promise<LandingPageContent> {
  const defaults: LandingPageContent = {
        mainHeading: "Converse com o Futuro. Construa o Impossível.",
        subheading: "Nyx AI é seu parceiro de conversação e desenvolvimento, pronto para ajudar a transformar ideias em realidade com poder de raciocínio avançado.",
        ctaButton: "Comece a Conversar",
        featureTag: "Nossos Recursos",
        featureHeading: "Uma IA com Capacidades Únicas",
        featureSubheading: "Desde conversas complexas até a geração de código, nossa IA está equipada com as ferramentas para levar sua criatividade ao próximo nível.",
        featureIcon1: "Bot",
        featureTitle1: "Conversação Natural",
        featureDescription1: "Participe de diálogos fluidos e contextuais. A IA lembra do histórico para conversas mais ricas.",
        featureIcon2: "Code",
        featureTitle2: "Geração de Código",
        featureDescription2: "Precisa de um script ou componente? Peça e a IA gera código limpo e funcional para você.",
        featureIcon3: "BrainCircuit",
        featureTitle3: "Raciocínio Avançado",
        featureDescription3: "Capaz de analisar problemas complexos, seguir instruções de múltiplos passos e analisar imagens.",
        styles: {},
        logoDataUrl: '',
        logoStyles: { filter: 'saturate(1) brightness(1) contrast(1)', dropShadow: '0 0 0 #000000' },
        themePrimaryColor: "346.8 98.6% 45.9%",
        themeBackgroundColor: "0 0% 0%",
        themeAccentColor: "346.8 98.6% 45.9%",
        dynamicElements: [],
    };
  try {
    const fileContent = await fs.readFile(contentFilePath, 'utf-8');
    const data = JSON.parse(fileContent) as Partial<LandingPageContent>;
    
    // Merge defaults with loaded data
    return { ...defaults, ...data };
    
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' || error instanceof SyntaxError) {
      // Attempt to write the default content if the file doesn't exist or is corrupt
      try {
        await fs.writeFile(contentFilePath, JSON.stringify(defaults, null, 2), 'utf-8');
      } catch (writeError) {
        console.error("Could not write default landing page content file.", writeError);
      }
      return defaults;
    }
    console.error("Error reading landing page content:", error);
    throw error;
  }
}

// Server Action to save the new content and update theme
export async function saveLandingPageContent(newContent: LandingPageContent) {
  try {
    const data = JSON.stringify(newContent, null, 2);
    await fs.writeFile(contentFilePath, data, 'utf-8');

    await updateThemeInCss({
        primary: newContent.themePrimaryColor,
        background: newContent.themeBackgroundColor,
        accent: newContent.themeAccentColor,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to save landing page content or update theme:", error);
    return { success: false, error: (error as Error).message || 'Failed to write to files' };
  }
}
