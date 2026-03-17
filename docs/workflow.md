# SAC Markdown Workflow

## 1. Introducción

El **SAC Markdown Workflow** es un método para redactar, estructurar y sintetizar documentación clínica utilizando herramientas externas al sistema de registro clínico electrónico.

El objetivo es reducir la fricción al documentar evoluciones clínicas en sistemas con limitaciones de interfaz, formato o longitud de texto.

El método separa tres procesos que tradicionalmente ocurren simultáneamente dentro del registro clínico:

1. redacción clínica
2. estructuración del caso
3. registro oficial en la historia clínica

Al separarlos, cada etapa puede optimizarse con herramientas diferentes.

---

## 2. Componentes del workflow

El método se basa en cuatro componentes principales.

### 2.1 Editor externo (VSCode)

Las evoluciones se redactan en un editor de texto moderno, preferentemente **VSCode**, que ofrece:

- autoguardado
- resaltado de sintaxis
- snippets
- plantillas reutilizables
- organización de archivos por paciente
- extensibilidad mediante scripts

Esto evita problemas comunes al redactar directamente en el registro clínico:

- pérdida de texto
- formato inesperado
- edición incómoda
- falta de historial del documento

---

### 2.2 SAC Markdown

El texto clínico se redacta utilizando **SAC Markdown**, un dialecto simplificado de Markdown diseñado para documentación clínica.

Ejemplo:

```markdown
### EVOLUCION

**Diagnósticos**

- Bronquiolitis grave
- SDRA

**Planes**

@RESP VM invasiva
@HEMO estable
@INF completar ceftriaxona
```

Este formato es:

- fácil de leer
- rápido de escribir
- estructurado
- compatible con plantillas

---

### 2.3 SAC Compiler

El texto SAC Markdown se transforma mediante un **compilador** a HTML compacto compatible con el sistema de registro clínico.

Funciones principales del compilador:

- conversión de sintaxis SAC Markdown a HTML
- eliminación de saltos de línea innecesarios
- compactación del texto
- conteo de caracteres
- segmentación automática cuando se supera el límite permitido por el sistema

Ejemplo de salida:

```html
<h3>EVOLUCION</h3><b>Diagnósticos</b><br>- Bronquiolitis grave<br>- SDRA<hr><b>Planes</b><br><b>- Respiratorio:</b> VM invasiva<br><b>- Hemodinamia:</b> estable<br><b>- Infeccioso:</b> completar ceftriaxona
```

El resultado final se pega en el sistema clínico.

### 2.4 Clinical Timeline (Mermaid)

Para casos complejos o estadías prolongadas se puede utilizar Mermaid Gantt para representar el curso clínico del paciente.

Ejemplo de representación:

- duración de ventilación mecánica
- uso de antibióticos
- soporte hemodinámico
- procedimientos
- hitos diagnósticos
- interconsultas

Esto permite:

- visualizar rápidamente la evolución del paciente
- preparar resúmenes clínicos
- discutir casos en reuniones clínicas
- analizar eventos relevantes

---

## 3. Flujo de trabajo clínico

El flujo de trabajo típico es el siguiente:

```text
Redacción clínica
(VSCode + SAC Markdown)
        ↓
Compilación
(SAC Compiler)
        ↓
HTML compacto
        ↓
Pegado en registro clínico
```

Para análisis de casos complejos:

```text
Timeline Mermaid
        ↓
síntesis del curso clínico
        ↓
resumen narrativo
        ↓
documentación final
```

---

## 4. Organización de archivos

Se recomienda organizar los documentos clínicos en carpetas por paciente.

Ejemplo:

``` text
Evoluciones/
    05_Perez_Juan/
        2026-03-16_evolucion.sac.md
        2026-03-17_evolucion.sac.md
        2026-03-18_evolucion.sac.md
        resumen.sac.md
        timeline.mmd
```

Descripción de archivos:

|Archivo|Propósito|
|---|---|
|*_evolucion.sac.md|evoluciones clínicas diarias|
|resumen.sac.md|síntesis narrativa del caso|
|timeline.mmd|línea temporal clínica|

---

## 5. Uso de plantillas

El workflow utiliza plantillas para reducir tiempo de redacción y mantener consistencia.

Ejemplos de plantillas:

- evolución diaria
- ingreso a unidad
- resumen de traslado
- control nocturno
- indicaciones
- resumen de hospitalización prolongada

Las plantillas permiten iniciar rápidamente un documento estructurado.

---

## 6. Manejo de límites de caracteres

Muchos sistemas de registro clínico imponen límites de caracteres por campo.

Por ejemplo:

```text
4000 caracteres por campo
```

El compilador SAC puede:

- contar caracteres del documento final
- dividir automáticamente el texto en bloques menores al límite
- mantener la integridad de los bloques clínicos

Cuando es necesario, un resumen largo puede dividirse entre:

- campo de evolución
- campo de indicaciones

---

## 7. Ventajas del método

El uso de este workflow ofrece varias ventajas prácticas:

**Redacción más rápida**

La estructura y las plantillas reducen el tiempo necesario para documentar.

**Mejor legibilidad**

Las evoluciones mantienen una estructura consistente.

**Mayor seguridad**

El uso de un editor externo con autoguardado reduce el riesgo de pérdida de información.

**Reutilización de información**

El texto puede reutilizarse para:

- evoluciones
- resúmenes clínicos
- presentaciones de caso
- docencia

**Visualización longitudinal**

Los timelines permiten comprender rápidamente la evolución completa de un paciente.

---

## 8. Alcance del proyecto

Este proyecto no busca reemplazar el registro clínico electrónico institucional.

Su objetivo es:

- mejorar la experiencia de redacción clínica
- facilitar la estructuración del pensamiento clínico
- adaptarse a sistemas con limitaciones técnicas

---

## 9. Estado del proyecto

El proyecto se encuentra actualmente en desarrollo.

Próximas etapas previstas:

- implementación del compilador SAC
- automatización de comandos en VSCode
- expansión de plantillas clínicas
- mejoras en segmentación automática
- documentación de timelines clínicos

---

## 10. Filosofía del proyecto

El workflow se basa en herramientas abiertas y reproducibles:

- Markdown
- Mermaid
- VSCode
- scripts simples

Esto permite que el método sea:

- portable
- extensible
- independiente de sistemas propietarios
