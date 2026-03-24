# SAC Markdown Spec v1.1 (UNIFICADA)

## 1. Naturaleza del lenguaje

SAC Markdown es un dialecto clínico específico, diseñado para:

- escritura rápida
- estructura clínica clara
- conversión a HTML compacto compatible con SAC

## 2. Estructura jerárquica

### 2.1 Nivel 1 — Secciones (NO renderizan)

```markdown
# Evolucion
# Indicaciones
```

- Dividen el documento
- No generan HTML
- Permiten separar outputs

### 2.2 Nivel 2 — Títulos principales (renderizan como \<h3>)

```markdown
## Ingreso
## Resumen
## Resumen clinico
## Resumen de traslado
```

Salida:

```html
<h3>Ingreso</h3>
```

### 2.3 Nivel 3 — Subtítulos clínicos (renderizan como \<b>)

```markdown
### Diagnosticos
### Examen fisico
### Planes
### Antecedentes
### Evolucion por sistemas
```

Salida:

```html
<b>Diagnosticos</b>
```

## 3. Bloques clínicos

Se consideran bloques:

- `##` títulos
- `###` subtítulos
- `@SISTEMA`
- listas
- tablas
- párrafos
- `---`

## 4. Evolución por sistemas

### 4.1 Sintaxis aceptada

```text
@RESP: texto
@resp texto
@RESP : texto
- Respiratorio: texto
```

### 4.2 Regla

Entrada → normalización → salida canónica

Salida:

```html
<b>- Respiratorio:</b> texto
```

## 5. Sistemas y alias

### 5.1 Sistemas base

```text
FEN
RESP
HEMO
INF
REN
HEMA
NEURO
QX
ENDO
GASTRO
INMUNO
SOCIAL
```

### 5.2 Alias (tolerancia de entrada)

Ejemplo:

```text
RESP → RESPIRATORIO, PULMONAR
HEMO → HEMODINAMICO, CV
INF → INFECCIOSO, ID
REN → NEFRO
GASTRO → GI, DIGESTIVO
```

Regla:

- entrada flexible
- salida siempre canónica

## 6. Macros

Sintaxis:

```text
!macro
```

Ejemplo:

```markdown
!regind
!indprev
```

Salida:

```html
<b>REGISTRO INDICACIONES</b>
```

## 7. Tablas simples (EXTENSIÓN v1.1)

Esto no estaba formalmente permitido en v1.0

Sintaxis:
```text
|A|B|C|
|---|---|---|
|1|2|3|
```

Reglas

- máximo 6 columnas
- máximo 10 filas
- primera fila = encabezado
- estructura uniforme

Salida:

```html
<table><tr><th>A</th>...</tr>...</table>
```

## 8. Separadores

```text
---
```

Salida:
```html
<hr>
```

## 9. Listas simples

```markdown
- item
- item
```

Salida:

```html
- item<br>- item
```

## 10. Formato inline

```markdown
**negrita**
_texto_
__texto__
x^2
x_2
```

Salida:

```html
<b>...</b>
<i>...</i>
<u>...</u>
<sup>...</sup>
<sub>...</sub>
```

## 11. Caracteres conflictivos (ACTUALIZADO)

Problema real identificado:

```text
#  &  ;  "  '  `
```

Permitidos:

```text
°  %  $  !  (  )
```

Reglas:

- no generar entidades HTML (&gt;, etc.)
- evitar caracteres que rompan HTML inline
- preservar semántica clínica

Esto corrige una limitación implícita en v1.0

## 12. Normalización

El compilador debe tolerar:

- mayúsculas/minúsculas
- espacios irregulares
- variaciones de sintaxis

Ejemplo:

```text
@resp : texto
```

→

```text
@RESP: texto
```

## 13. Warnings (nuevo en v1.1)

El compilador puede reportar:

- sistema desconocido
- alias no reconocido
- macro inexistente
- tabla inválida
- columnas > 6
- filas > 10
- heading vacío

No bloquean compilación.

## 14. HTML permitido (ACTUALIZADO)

Se mantiene lo de v1.0 pero se agrega:

```html
<table>
<tr>
<th>
<td>
```

👉 antes estaban explícitamente fuera ahora pasan a estar permitidas

## 15. Filosofía

- entrada tolerante
- salida canónica
- mínimo HTML
- máxima utilidad clínica
- optimizado para escritura real
