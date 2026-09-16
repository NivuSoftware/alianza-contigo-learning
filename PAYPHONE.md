# PayPhone Cajita de Pagos

La aplicación PayPhone debe ser de tipo **WEB**. En PayPhone Developer registra el dominio desde el que se abre el checkout. Para desarrollar en el navegador local, usa:

- **Dominio web:** `http://localhost:5173`
- **URL de respuesta:** `http://localhost:5173/pagar`

Para producción, si el dominio definitivo es el del ejemplo de despliegue, usa:

- **Dominio web:** `https://alianzacontigo.nivusoftware.com`
- **URL de respuesta:** `https://alianzacontigo.nivusoftware.com/pagar`

Si el dominio público es otro, reemplázalo en ambos campos. PayPhone solo permite cargar la Cajita desde los dominios autorizados. Selecciona **Producción** en la aplicación PayPhone para realizar cobros bancarios reales; el ambiente de pruebas no cobra. [Configuración oficial](https://docs.payphone.app/configuracion-de-ambiente-y-credenciales).

Configura `PAYPHONE_TOKEN` y `PAYPHONE_STORE_ID` en el archivo de entorno privado del backend (`.env.production` en el despliegue con Docker Compose). No agregues el token a Git ni a variables `VITE_`. El SDK oficial necesita recibir ese token en el navegador para mostrar la Cajita; por eso el backend lo devuelve únicamente al estudiante autenticado que acaba de crear una orden y marca esa respuesta como `no-store`.

El precio final del curso se envía en centavos como `amount` y `amountWithoutTax`, conforme al ejemplo oficial de cobro sin impuesto. El sistema guarda una orden pendiente. Al terminar la Cajita, la aplicación abre `/pagar` con los identificadores de PayPhone. Esa página llama al backend, que consulta `https://paymentbox.payphonetodoesposible.com/api/confirm`, comprueba `Approved`, el identificador de la orden, la transacción, USD y el monto exacto, y solo entonces habilita el curso y muestra "Compra exitosa". Cualquier error se muestra como error, con una referencia y el contacto de la academia. La [documentación de Cajita](https://docs.payphone.app/cajita-de-pagos) indica que el formulario vence en 10 minutos y que una transacción sin confirmar en 5 minutos se revierte automáticamente.
