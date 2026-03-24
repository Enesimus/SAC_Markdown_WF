# Changelog

---

## [1.1.0] - 2026-03-23

### Added

- Nueva jerarquía de encabezados SAC Markdown:
  - `#` como divisor de sección lógica (no renderiza en HTML)
  - `##` como título clínico principal (renderiza como \<h3>)
  - `###` como subtítulo clínico (renderiza como \<b>)
- Soporte de tablas simples:
  - Hasta 6 columnas
  - Hasta 10 filas
  - Primera fila como encabezado (`<th>`)
  - Validación estructural básica
0- Normalización tolerante de entrada:
  - soporte de mayúsculas/minúsculas
  - tolerancia a espacios variables (`@RESP:`, `@resp :`, etc.)
- Definición de caracteres conflictivos en SAC y sanitización adaptada
- Base para normalización tolerante de sistemas clínicos
- Soporte experimental para `@PROB`

### Changed

- Rediseño completo de la gramática SAC Markdown:
  - `###` deja de ser el único nivel de heading
  - separación explícita entre estructura lógica y renderización HTML
- Evolución por sistemas:
  - mayor tolerancia de sintaxis (`@SISTEMA`, `@sistema`, `- Sistema:`)
  - salida canónica unificada
- Inline parsing:
  - ajuste para evitar conflictos entre cursiva y subíndice
  - mejora en manejo de superíndice/subíndice clínico (`x^2`, `x_2`)
- Sanitización de texto:
  - eliminación de entidades HTML (`&gt;`, `&amp;`, etc.)
  - manejo específico de caracteres problemáticos en SAC (`#`, `&`, `;`, `"`, `'`, `\``)
- HTML permitido:
  - incorporación de `<table>`, `<tr>`, `<th>`, `<td>`

### Fixed

- Problemas de interpretación de `@SISTEMA:` con dos puntos
- Inconsistencias en renderizado de tablas (duplicación de funciones)
- Errores de parsing en presencia de espacios variables
- Conversión incorrecta de caracteres especiales en SAC

### Notes

- Esta versión introduce cambios estructurales importantes en la sintaxis (breaking changes respecto a v1.0)
- Se recomienda utilizar la nueva jerarquía (`#`, `##`, `###`) para todas las plantillas futuras
- La especificación v1.1 formaliza el lenguaje como un DSL clínico con entrada flexible y salida canónica
- Warnings e IntelliSense quedan planificados para desarrollo futuro

---

## v0.1 – Initial concept

- Definition of SAC Markdown
- Workflow documentation
- Initial compiler prototype
