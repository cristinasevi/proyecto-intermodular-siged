# SIGED - Sistema de Gestión Departamental

Aplicación web desarrollada como Proyecto Intermodular del ciclo **DAM (Desarrollo de Aplicaciones Multiplataforma)** en Centro San Valero.

SIGED permite gestionar el presupuesto e inversiones de los departamentos de un centro educativo, con control de órdenes de compra, facturas, proveedores e inventario.

---

## Tecnologías

- **Next.js 14** (App Router)
- **MySQL** + consultas directas con `mysql2`
- **NextAuth.js** con proveedor Google OAuth
- **Tailwind CSS**
- **Lucide React** (iconografía)

---

## Roles

| Rol | Acceso |
|-----|--------|
| Administrador | Acceso completo a todos los módulos y gestión de usuarios |
| Contable | Acceso a facturas, órdenes, proveedores e informes de todos los departamentos |
| Jefe de Departamento | Acceso restringido al resumen y órdenes de su propio departamento |

---

## Módulos

- **Resumen por departamento** — presupuesto, inversiones y gasto real
- **Órdenes de compra e inversión**
- **Facturas** — generación de PDF y gestión de estados
- **Proveedores** — alta, edición y vinculación por departamento
- **Inventario**
- **Presupuestos e inversiones**
- **Informes**
- **Gestión de usuarios** (solo Administrador)

---

## Instalación

### Requisitos
- Node.js 18+
- MySQL 8+

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/cristinasevi/proyecto-intermodular-siged.git
cd proyecto-intermodular-siged

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear .env con:
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=tu_contraseña
MYSQL_DATABASE=Proyecto_Intermodular_SIGED

# Crear .env.local con:
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secret
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret

# 4. Importar la base de datos
Abrir MySQL Workbench → File → Open SQL Script → ejecutar Proyecto_Intermodular_SIGED.sql

# 5. Arrancar el servidor
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---