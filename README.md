# AMC FIT 

## 🏋️‍♂️ Proyecto de Aplicaciones Web

## 🛠️ Dependencias
Para arrancar este proyecto necesitas tener instalado:
*   **Git**: Para la clonación del repositorio.
*   **Python 3.12.3**: [Descargar aquí](https://www.python.org/downloads/)
*   **Node.js v22.21.1 (LTS)**: [Descargar aquí](https://nodejs.org/)

---

## ⚙️ Configuración Inicial (Windows)
Si tienes problemas para ejecutar scripts de Python, abre **PowerShell** como administrador y ejecuta:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
## 🚀  Instalación
### 1. Clonar el proyecto
```
 git clone https://github.com/alexcloux99/gymshop.git
 cd gymshop
```
### 2. Configurar el Backend
# Crear entorno virtual
```
python -m venv env
```
# Activar entorno (Windows)
```
.\env\Scripts\activate
```
# Activar entorno (Linux/Mac)
```
source env/bin/activate
```
# Instalar dependencias
```
python -m pip install --upgrade pip
pip install -r requirements.txt
```
# Preparar la base de datos
```
python manage.py makemigrations
python manage.py migrate
```
# Arrancar servidor
```
python manage.py runserver
```
El backend estará disponible en: http://127.0.0.1:8000/

### 3. Configurar el Frontend 
Abre otra terminal distinta en la carpeta del proyecto:
```
cd frontend
npm install
npm run dev
```
La web estará disponible en: http://localhost:5173/

## 🔐 Acceso y Administración
Panel de Control (Admin)
Para gestionar stock, tallas, productos y ver pedidos:
```
-URL: http://127.0.0.1:8000/admin
-Usuario: admin@admin.com
-Password: admin123
```

Si la base de datos aparece vacía, crea tu propio superusuario:
```
python manage.py createsuperuser
```

## 💳 Pagos y Pedidos
El proyecto utiliza PayPal Sandbox para simular transacciones reales.
- Las credenciales de prueba se encuentran en el archivo paypal.txt 
- Se soporta también el método de Pago Contra-reembolso.

## 🗄️ Base de Datos
Se utiliza SQLite por su portabilidad. Para visualizar las tablas manualmente:
- DBeaver: Descargar https://dbeaver.io/download/
- SQLite Viewer (VS Code): Instalar extensión
  Una vez instalada, haz clic derecho en el archivo db.sqlite3 -> "Open With..." -> "SQLite Viewer".
