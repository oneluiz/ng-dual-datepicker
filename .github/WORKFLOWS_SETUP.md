# GitHub Actions CI/CD Setup

Este proyecto usa GitHub Actions para automatizar la publicación a npm usando **Trusted Publishers (OIDC)**.

## 📋 Workflows Configurados

### 1. **CI Workflow** (`.github/workflows/ci.yml`)
- **Trigger**: Push a `main` o Pull Requests
- **Propósito**: Verificar que el código compila correctamente
- **Acciones**:
  - Instala dependencias
  - Construye la librería
  - Construye el demo
  - Prueba en Node.js 18.x y 20.x

### 2. **Publish Workflow** (`.github/workflows/publish.yml`)
- **Trigger**: Push de tags que comienzan con `v` (ej: `v3.0.1`)
- **Propósito**: Publicar automáticamente a npm
- **Acciones**:
  - Construye la librería
  - Publica a npm con **provenance** (firma criptográfica)
  - Usa OIDC para autenticación segura (sin tokens expuestos)

---

## 🔐 Configurar Trusted Publisher en npm

Para habilitar publicación automática sin tokens, sigue estos pasos:

### Paso 1: Ir a npm
1. Ve a https://www.npmjs.com/
2. Inicia sesión en tu cuenta
3. Ve a tu paquete: https://www.npmjs.com/package/@oneluiz/dual-datepicker

### Paso 2: Configurar Trusted Publisher
1. En la página del paquete, ve a **Settings** → **Publishing Access**
2. Click en **"Add trusted publisher"**
3. Selecciona **"GitHub Actions"**
4. Completa el formulario:
   - **GitHub repository owner**: `oneluiz`
   - **Repository name**: `ng-dual-datepicker`
   - **Workflow name**: `publish.yml`
   - **Environment** (opcional): déjalo vacío o usa `production`

5. Click en **"Add"**

### Paso 3: Eliminar Token Manual (Opcional pero Recomendado)
Una vez configurado el Trusted Publisher, ya NO necesitas el `NPM_TOKEN` en GitHub Secrets.

---

## 🚀 Cómo Usar

### Publicar una Nueva Versión

```bash
# 1. Actualizar versión en package.json
npm version patch  # o minor, o major

# 2. Hacer commit del cambio de versión (si no lo hizo npm version)
git add package.json
git commit -m "chore: bump version to X.X.X"

# 3. Crear y pushear el tag (npm version lo hace automáticamente)
git push origin main
git push origin --tags

# GitHub Actions detectará el tag y publicará automáticamente
```

### Flujo Completo de Release

```bash
# Para un PATCH (3.0.0 → 3.0.1)
npm version patch -m "chore: bump version to %s"
git push origin main --tags

# Para un MINOR (3.0.0 → 3.1.0)
npm version minor -m "chore: bump version to %s"
git push origin main --tags

# Para un MAJOR (3.0.0 → 4.0.0)
npm version major -m "chore: bump version to %s"
git push origin main --tags
```

El workflow de GitHub Actions:
1. ✅ Detectará el tag `v3.0.1`
2. ✅ Construirá la librería
3. ✅ Publicará a npm con provenance
4. ✅ Firmará criptográficamente el paquete

---

## 🔍 Verificar Publicación

Después de que el workflow termine, verifica:

1. **GitHub Actions**: https://github.com/oneluiz/ng-dual-datepicker/actions
   - Verifica que el workflow "Publish to npm" se ejecutó exitosamente

2. **npm Package**: https://www.npmjs.com/package/@oneluiz/dual-datepicker
   - Verifica la nueva versión
   - Verifica el badge de **"Provenance"** (🔒 indica firma OIDC)

3. **Provenance Check**:
   ```bash
   npm view @oneluiz/dual-datepicker --json | grep provenance
   ```

---

## 🛡️ Ventajas del Trusted Publisher

✅ **Más Seguro**: No hay tokens de npm almacenados en GitHub  
✅ **Provenance**: Firma criptográfica que verifica el origen del paquete  
✅ **Auditable**: npm puede verificar que el paquete fue construido por GitHub Actions  
✅ **Transparencia**: Los usuarios pueden verificar la cadena de suministro  
✅ **Sin Expiración**: No hay tokens que expiren o rotar  

---

## ⚠️ Importante

### Si Usas el Workflow por Primera Vez:

**OPCIÓN A: Con Trusted Publisher (Recomendado)**
- Configura el Trusted Publisher en npm (pasos arriba)
- GitHub Actions usará OIDC automáticamente
- NO necesitas `NPM_TOKEN` en GitHub Secrets

**OPCIÓN B: Con Token Tradicional (Fallback)**
Si prefieres usar token temporalmente:
1. Genera un token en https://www.npmjs.com/settings/[tu-usuario]/tokens
2. Selecciona **"Automation"** token type
3. Guárdalo en GitHub: Settings → Secrets → Actions → New repository secret
4. Nombre: `NPM_TOKEN`
5. El workflow ya está configurado para usarlo

---

## 📝 Notas

- El workflow solo se ejecuta en tags que comienzan con `v`
- Asegúrate de que `package.json` tenga la versión correcta antes de taggear
- El flag `--provenance` requiere npm 9+ (incluido en Node.js 20)
- El flag `--access public` es necesario para paquetes scoped (@oneluiz/...)

---

## 🐛 Troubleshooting

### Error: "403 Forbidden" al publicar
- Verifica que el Trusted Publisher esté configurado correctamente en npm
- Verifica que el nombre del workflow coincida: `publish.yml`
- Verifica que el repositorio owner/name coincidan

### Error: "npm ERR! need auth"
- Asegúrate de haber configurado el Trusted Publisher en npm
- O verifica que `NPM_TOKEN` esté en GitHub Secrets (si usas token)

### El workflow no se ejecuta
- Verifica que el tag comience con `v`: `v3.0.1` ✅, `3.0.1` ❌
- Verifica que el tag esté pusheado: `git push origin --tags`

---

## 📚 Referencias

- [npm Trusted Publishers](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [npm Provenance](https://github.blog/2023-04-19-introducing-npm-package-provenance/)
