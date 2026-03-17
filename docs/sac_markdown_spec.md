# SAC Markdown Specification v1.0

SAC Markdown no pretende ser una implementación completa de Markdown.

Se trata de un **dialecto clínico específico**, diseñado para producir HTML
compacto compatible con sistemas de registro clínico electrónico con
restricciones de formato.

## 1. Propósito

**SAC Markdown** es un subconjunto simplificado de Markdown diseñado para redactar documentación clínica estructurada en un entorno externo al registro clínico electrónico, permitiendo su posterior conversión a HTML compacto compatible con sistemas como SAC.

Su objetivo es:

- mejorar la legibilidad durante la redacción
- reducir la dependencia de HTML escrito manualmente
- permitir reutilización de plantillas clínicas
- facilitar la adaptación a sistemas con límites de caracteres y soporte HTML restringido

---

## 2. Principios de diseño

SAC Markdown se rige por los siguientes principios:

1. **Sintaxis mínima**  
   Debe ser fácil de aprender y escribir por personal clínico no técnico.

2. **Compatibilidad con HTML restringido**  
   La salida debe transformarse a un conjunto pequeño de etiquetas HTML seguras.

3. **Legibilidad en texto fuente**  
   El archivo fuente debe ser comprensible incluso sin compilar.

4. **Compacidad**  
   La salida HTML debe minimizar caracteres innecesarios.

5. **Segmentación clínica coherente**  
   Cuando el texto exceda el límite permitido por el sistema, debe dividirse por bloques clínicos completos y no por fragmentos arbitrarios.

---

## 3. Extensión de archivo

Los archivos SAC Markdown usarán preferentemente una de estas extensiones:

- `.sac.md`
- `.sac.txt`

Extensión recomendada:

```text
.sac.md
```

Ejemplos:

```text
2026-03-16_evolucion.sac.md
2026-03-16_indicaciones.sac.md
2026-03-16_resumen.sac.md
```

## 4. Estructura general del documento

Un documento SAC Markdown está compuesto por una secuencia de bloques clínicos.

Un bloque clínico puede ser:

- un título
- un separador
- un párrafo
- una lista simple
- una línea por sistema
- una macro operativa
- una pseudo-tabla o bloque estructurado especial

### Definición: Bloque clínico

Un **bloque clínico** es la unidad mínima de información que debe mantenerse
íntegra durante la segmentación del documento.

En SAC Markdown v1 se consideran bloques clínicos:

- títulos (`###`)
- separadores (`---`)
- líneas por sistema (`@RESP`, `@HEMO`, etc.)
- listas completas
- párrafos narrativos

## 5. Sintaxis base

### 5.1 Título mayor

Sintaxis:

```text
### TITULO
```

Conversión HTML:

```html
<h3>TITULO</h3>
```

Uso recomendado:

- INGRESO
- RESUMEN
- EVOLUCION
- CONTROL NOCTURNO

Notas:

- `###` es el único nivel de heading permitido en v1.
- `<h4>` y niveles inferiores no forman parte de la especificación.

---

### 5.2 Negrita

Sintaxis:

```text
**texto**
```

Conversión HTML:

```html
<b>texto</b>
```

Uso recomendado:

- encabezados de sección
- énfasis clínico puntual
- marcadores operativos

---

### 5.3 Cursiva

Sintaxis:

```text
*texto*
```

Conversión HTML:

```html
<i>texto</i>
```

Uso recomendado:

- observaciones
- nombres científicos de patógenos
- aclaraciones
- énfasis secundario

---

### 5.4 Subrayado

Sintaxis:

```text
__texto__
```

Conversión HTML:

```html
<u>texto</u>
```

Uso recomendado:

- subtítulos internos
- etiquetas de examen físico
- advertencias puntuales

---

### 5.5 Separador

Sintaxis:

```text
---
```

Conversión HTML:

```html
<hr>
```

Uso recomendado:

- separación entre bloques mayores
- cambio de fase narrativa
- división entre antecedentes, examen, diagnósticos y plan

---

### 5.6 Línea simple

Toda línea que no corresponda a otra sintaxis especial se interpreta como texto libre.

Sintaxis:

```text
Paciente hemodinámicamente estable.
```

Conversión HTML:

```html
Paciente hemodinámicamente estable.
```

Las líneas simples consecutivas se unirán con `<br>` durante la compilación.

---

### 5.7 Lista simple

Sintaxis:

```text
- Bronquiolitis grave
- SDRA
- Hiperglicemia
```

Conversión HTML:

```html
- Bronquiolitis grave<br>- SDRA<br>- Hiperglicemia
```

Notas:

- No se generan listas HTML con `<ul>` o `<li>`.
- Se prioriza economía en uso de caracteres sobre semántica HTML.

---

### 5.8 Otras convenciones

En las indicaciones uso habitualmente los siguientes decoradores

{_25_} --> para señalar el volumen que aporta durante el dia ese fármaco
\[_0.1_\] --> para señalar la concentración de una infusión
(_2/7_) --> para señalar los días completados/duracion considerada de tratamiento antibiotico por ejemplo.

Estas convenciones no implican transformación automática por el compilador; son ayudas semánticas para mantener consistencia en la redacción clínica.

## 6. Líneas por sistema

Las líneas por sistema permiten representar la evolución o plan clínico por dominios.

### 6.1 Sintaxis general

```text
@CODIGO contenido
```

Ejemplo:

```text
@RESP VM invasiva sin cambios
```

Conversión HTML:

```html
<b>- Respiratorio:</b> VM invasiva sin cambios
```

### 6.2 Códigos definidos en v1

|Código|Expansión HTML|
|:---|:---|
|@FEN|- FEN:|
|@RESP|- Respiratorio:|
|@HEMO|- Hemodinamia:|
|@INF|- Infeccioso:|
|@REN|- Renal:|
|@HEMA|- Hematológico:|
|@NEURO|- Neurológico:|
|@QX|- Quirúrgico:|

Ejemplo completo:

```text
@FEN reiniciar aporte enteral
@RESP VM invasiva, sin cambios
@HEMO estable, sin vasoactivos
@INF completar ceftriaxona
```

Salida:

```html
<b>- FEN:</b> reiniciar aporte enteral<br><b>- Respiratorio:</b> VM invasiva, sin cambios<br><b>- Hemodinamia:</b> estable, sin vasoactivos<br><b>- Infeccioso:</b> completar ceftriaxona
```

---

## 7. Macros operativas

Las macros operativas son atajos para frases clínicas recurrentes.

### 7.1 Registro de indicaciones

Sintaxis:

```text
!regind
```

Conversión HTML:

```html
<b>REGISTRO INDICACIONES</b>
```

Uso clínico:
Cuando se registran indicaciones sin haber realizado aún una evolución formal.

### 7.2 Indicaciones mantenidas

Sintaxis:

```text
!indprev
```

Conversión HTML:

```html
<b>INDICACIONES EN ENCUENTRO PREVIO</b>
```

Uso clínico:
Cuando se realiza evolución posterior sin cambios en el texto libre del bloque de indicaciones.

### 7.3 Extensibilidad

La lista de macros podrá ampliarse en futuras versiones.
Toda macro deberá comenzar con `!`.

## 8. Superíndice y subíndice

Sintaxis:

```text
m^2
O_2
```

Conversión HTML:

```html
m<sup>2</sup>
O<sub>2</sub>
```

Uso sugerido:

- superficie corporal
- unidades abreviadas
- notación clínica compacta
- fórmulas químicas

## 9. Reglas de compilación

### 9.1 Etiquetas HTML permitidas en v1

El compilador podrá generar únicamente las siguientes etiquetas:

- `<h3>`
- `<b>`
- `<i>`
- `<u>`
- `<br>`
- `<hr>`
- `<sup>`
- `<sub>`

### 9.2 Etiquetas no permitidas

No forman parte de SAC Markdown v1:

- `<div>`
- `<span>`
- `<p>`
- `<h4>`, `<h5>`, `<h6>`
- `<ul>`, `<ol>`, `<li>`
- `<table>`, `<tr>`, `<td>` (*)
- estilos inline
- clases CSS
- atributos HTML complejos

Estas restricciones responden a la necesidad de compatibilidad con registros clínicos electrónicos limitados.

> Las tablas creadas con sus etiquetas correspondientes logran tener una adecuada visualizacion. Considerar su uso en caso de esquemas de insulina por ejemplo

### 9.3 Compactación

El compilador deberá:

- eliminar líneas vacías redundantes
- convertir bloques de texto en una salida compacta
- evitar secuencias innecesarias como múltiples `<br>`
- evitar saltos de línea redundantes alrededor de `<hr>` y `<h3>`

Ejemplo:

```text
### RESUMEN

**Diagnósticos**

- Neumonía
- SDRA
```

Debe generar una salida compacta como:

```html
<h3>RESUMEN</h3><b>Diagnósticos</b><br>- Neumonía<br>- SDRA
```

## 10. Segmentación por límite de caracteres

Cuando el HTML compilado exceda el límite definido por el sistema de destino, el compilador deberá dividir el contenido en bloques.

### 10.1 Límite por defecto

Límite sugerido por defecto:

```text
3900 caracteres
```

Esto deja margen de seguridad frente a sistemas con límite nominal de 4000.

### 10.2 Jerarquía de corte

El compilador deberá intentar dividir en el siguiente orden:

- separadores mayores (---)
- títulos (###)
- líneas por sistema (@RESP, @HEMO, etc.)
- párrafos completos
- listas simples
- líneas individuales

### 10.3 Regla clínica principal

No cortar un sistema o bloque clínico en la mitad, salvo que el propio bloque exceda el límite configurado.

_Ejemplo correcto:_

Bloque 1 termina antes de:

```text
@NEURO con fenobarbital y levetiracetam, sin crisis
```

y esa línea completa pasa al siguiente bloque.

_Ejemplo incorrecto:_

Bloque 1:

```text
@NEURO con fenobarbital y
```

Bloque 2:

```text
levetiracetam, sin crisis
```

### 10.4 Salida segmentada

Cuando existan varios bloques, el compilador podrá entregarlos como:

- bloque 1 para textarea evolución
- bloque 2 para textarea indicaciones

o numerados de forma explícita:

- bloque 1 de 2
- bloque 2 de 2

La interfaz concreta dependerá de la implementación.

## 11. Ejemplo completo

### 11.1 Fuente SAC Markdown

```text
### RESUMEN

**Diagnósticos**
- Bronquiolitis grave
- SDRA
- Hiperglicemia

---

**Curso clínico**
Paciente ingresó por insuficiencia respiratoria progresiva.

---

**Planes**
@RESP VM invasiva sin cambios
@HEMO estable sin vasoactivos
@INF completar ceftriaxona
@NEURO con levetiracetam, sin nuevas crisis
```

### 11.2 Salida HTML esperada

```html
<h3>RESUMEN</h3><b>Diagnósticos</b><br>- Bronquiolitis grave<br>- SDRA<br>- Hiperglicemia<hr><b>Curso clínico</b><br>Paciente ingresó por insuficiencia respiratoria progresiva.<hr><b>Planes</b><br><b>- Respiratorio:</b> VM invasiva sin cambios<br><b>- Hemodinamia:</b> estable sin vasoactivos<br><b>- Infeccioso:</b> completar ceftriaxona<br><b>- Neurológico:</b> con levetiracetam, sin nuevas crisis
```

## 12. Futuras extensiones

Posibles extensiones para versiones futuras:

- pseudo-tablas clínicas compactas
- bloques especiales para insulinoterapia
- plantillas parametrizadas
- separación explícita evolución / indicaciones
- metadatos clínicos mínimos
- soporte para nuevas macros clínicas
- integración con comandos de VSCode

## 13. Estado de la especificación

Versión actual:

v1.0 draft

Estado:

en desarrollo

Esta especificación podrá modificarse según la experiencia práctica de uso clínico.
