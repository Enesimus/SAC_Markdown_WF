# SAC Markdown Workflow

**SAC Markdown Workflow** es un método para redactar y estructurar documentación clínica utilizando herramientas de desarrollo (VSCode, Markdown y Mermaid) con el objetivo de reducir la fricción al trabajar con sistemas de registro clínico electrónico que poseen interfaces limitadas.

El sistema fue diseñado inicialmente para trabajar con **SAC (Sistema de Atención Clínica)**, pero el concepto es aplicable a cualquier sistema que requiera pegar texto plano o HTML simple en campos de texto.

---

## Problema

Muchos registros clínicos electrónicos presentan limitaciones importantes para el trabajo clínico cotidiano:

- interfaces poco eficientes para redactar evoluciones
- limitaciones de formato
- límites de caracteres
- dificultad para estructurar información clínica compleja
- dificultad para visualizar la evolución longitudinal del paciente

Como resultado, el clínico suele terminar escribiendo texto largo y sin estructura en el propio sistema, o bien usando herramientas intermedias (procesador de texto, bloc de notas) llenando los equipos de archivos intermedios sin una lógica que facilite su uso posterior, como para poder consolidar en un resumen clínico o epicrisis.

---

## Objetivo del proyecto

Separar el proceso de documentación clínica en **tres capas complementarias**:

1. **Redacción clínica estructurada**
2. **Adaptación al sistema de registro**
3. **Visualización temporal del caso clínico**

Esto permite escribir de forma más clara y rápida, manteniendo compatibilidad con el sistema institucional.

---

## Componentes del sistema

### 1. SAC Markdown

Un subconjunto simplificado de Markdown diseñado para escribir evoluciones clínicas de forma estructurada.

Ejemplo:

```text
# EVOLUCION

### Diagnósticos
- Bronquiolitis grave
- SDRA

---

### Planes

@RESP VM invasiva
@HEMO estable sin vasoactivos
@INF completar ceftriaxona

---

# Indicaciones

|FC|PA|FR|SatO_2|FiO_2|Temp|
|---|---|---|---|---|---|
|135 lpm|80/40/55|28 rpm|92%|40%|36°C|
```

Este formato es legible para el clínico y fácil de transformar.

Características clave:

- sintaxis mínima y clínica
- tolerancia en la escritura
- salida HTML consistente
- soporte de evolución por sistemas
- soporte de tablas clínicas simples

### 2. SAC Compiler

Script que transforma SAC Markdown en HTML compacto compatible con SAC.

Funciones principales:

- convertir Markdown a HTML mínimo
- eliminar saltos de línea innecesarios
- contar caracteres
- dividir automáticamente el texto en bloques menores a 4000 caracteres cuando sea necesario

Esto permite adaptar el contenido a las restricciones del sistema de registro clínico.

### 3. Clinical Timeline (Mermaid)

Uso de Mermaid Gantt para representar visualmente el curso longitudinal de un paciente.

Ejemplo de uso:

- duración de tratamientos
- ventilación mecánica
- soporte hemodinámico
- procedimientos
- hitos diagnósticos
- interconsultas

Esto facilita:

- preparación de resúmenes clínicos
- discusión de casos
- reuniones clínicas
- docencia

---

## Sintaxis principal (v1.1)

### Jerarquía

|Nivel|Sintaxis|Salida|
|---|---|---|
|Sección|`#`|No renderiza|
|Título|`##`|`<h3>`|
|Subtítulo|`###`|`<b>`|

---

## Sistemas

```text
@RESP: texto
@resp texto
@RESP : texto
- Respiratorio: texto
```

Salida:

```html
<b>- Respiratorio:</b> texto
```

- entrada flexible
- salida canónica

---

## Tablas

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

Salida:

```html
<table><tr><th>A</th>...</tr>...</table>
```

---

## Formato inline

```markdown
**negrita**
_texto_
__texto__
x^2
x_2
```

---

## Separador

```text
---
```

Salida:

```html
<hr>
```

---

## Macros

```text
!regind
!indprev
```

---

## Flujo de trabajo

``` text
SAC Markdown (VSCode)
        ↓
SAC Compiler
        ↓
HTML compacto
        ↓
pegado en registro clínico
```

Para análisis del caso:

``` text
Mermaid Timeline
        ↓
síntesis del curso clínico
        ↓
resumen narrativo
```

---

## Estructura del proyecto

``` text
SAC_Markdown_WF/

README.md
LICENSE
CHANGELOG.md

docs/
    workflow.md
    sac_markdown_spec.md
    mermaid_timeline_spec.md

templates/
    evolucion.sac.md
    ingreso.sac.md
    indicaciones.sac.md
    resumen.sac.md

scripts/
    sac_compiler.js

examples/
    ejemplo_evolucion.sac.md
    ejemplo_compilado.html
    ejemplo_timeline.mmd
```

---

## Ventajas del método

- escritura clínica más rápida
- menor fricción con sistemas de registro clínico
- estructura consistente de las evoluciones
- posibilidad de reutilizar plantillas
- reducción de errores de formato
- capacidad de representar el curso clínico en forma temporal

Además, al utilizar VSCode con autoguardado, se evita la pérdida de información frecuente cuando se redacta directamente en el sistema clínico.

---

## Estado del proyecto

Versión actual: v1.1

Cambios recientes:

- nueva jerarquía de sintaxis (#, ##, ###)
- soporte de tablas
- normalización de sistemas con alias (en desarrollo)
- mejora en sanitización para SAC

---

## Filosofía

- lenguaje clínico, no técnico
- entrada flexible, salida estricta
- mínimo HTML necesario
- optimizado para uso real en UCI
- Extensible a otras unidades clínicas

---

## Licencia

Este proyecto se distribuye como software libre, bajo licencia GPL v3., para mejorar los flujos de documentación clínica.

Ver archivo [LICENSE](LICENSE) para más detalles.

---

## Autor

Dr. Juan Sepúlveda
Pediatra – Cuidados Intensivos Pediátricos

Desarrollo clínico asistido por herramientas de programación basadas en IA.
