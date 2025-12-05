
/**
 * @fileOverview Conceitos de Layout para o "Layout & Style Engine".
 * A IA usará esses layouts como inspiração para posicionar os elementos.
 * As coordenadas e estilos aqui são guias, e a IA tem a liberdade de ajustá-los
 * para criar uma composição mais harmoniosa e "aesthetic".
 */
export const PRESET_LAYOUTS = [
  {
    "layout_name": "concept_title_center",
    "elements": [
      // A IA pode decidir usar 'background_image' ou 'background_solid' aqui
      {"kind":"background_image", "overlay":{"color":"#000000","opacity":0.3}, "x":0, "y":0, "w":1920, "h":1080},
      {"kind":"title", "text":"{TITLE}", "x":240, "y":400, "w":1440, "h":200, "fontSize":60, "align":"center"},
      {"kind":"subtitle", "text":"{SUBTITLE}", "x":420, "y":550, "w":1080, "h":80, "fontSize":22, "align":"center"}
    ]
  },
  {
    "layout_name": "concept_section_simple",
    "elements": [
      {"kind":"background_solid", "x":0, "y":0, "w":1920, "h":1080},
      {"kind":"title", "text":"{SECTION_TITLE}", "x":120, "y":450, "w":900, "h":120, "fontSize":48, "align":"left"},
      {"kind":"icon", "x":1520, "y":160, "w":240, "h":240}
    ]
  },
  {
    "layout_name": "concept_text_left_image_right",
    "elements": [
      {"kind":"background_solid", "x":0, "y":0, "w":1920, "h":1080},
      {"kind":"title", "text":"{TITLE}", "x":120, "y":120, "w":880, "h":120, "fontSize":40, "align":"left"},
      {"kind":"body", "text":"{BODY}", "x":120, "y":260, "w":800, "h":700, "fontSize":18, "align":"left"},
      {"kind":"image", "x":1040, "y":220, "w":760, "h":620}
    ]
  },
  {
    "layout_name": "concept_text_full_width",
    "elements": [
      {"kind":"background_solid", "x":0, "y":0, "w":1920, "h":1080},
      {"kind":"title", "text":"{TITLE}", "x":120, "y":120, "w":1680, "h":80, "fontSize":40, "align":"left"},
      {"kind":"body", "text":"{BODY}", "x":120, "y":240, "w":1680, "h":720, "fontSize":20, "align":"left"}
    ]
  },
   {
    "layout_name": "concept_image_hero_text_right",
    "elements": [
      {"kind":"image", "x":0, "y":0, "w":1280, "h":1080},
      {"kind":"panel", "x":1280, "y":0, "w":640, "h":1080},
      {"kind":"title", "text":"{TITLE}", "x":1330, "y":200, "w":520, "h":140, "fontSize":36, "align":"left"},
      {"kind":"body", "text":"{BODY}", "x":1330, "y":380, "w":520, "h":540, "fontSize":18, "align":"left"}
    ]
  },
  {
    "layout_name": "concept_quote_center",
    "elements": [
      {"kind":"background_solid", "x":0, "y":0, "w":1920, "h":1080},
      {"kind":"quote","text":"\"{QUOTE_TEXT}\"", "x":240, "y":400, "w":1440, "h":320, "fontSize":44, "align":"center"},
      {"kind":"attribution","text":"— {AUTHOR}", "x":240, "y":600, "w":1440, "h":60, "fontSize":20, "align":"center"}
    ]
  }
];
