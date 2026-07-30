
function Footer(){
const anio = new Date().getFullYear();
return <footer className="border-t border-gray-800 bg-gray-900 px-4 py-4 text-sm text-gray-400">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-1 text-center sm:flex-row sm:justify-between sm:text-left">
                <p>&copy; {anio} MercaditoLibre. Todos los derechos reservados.</p>
                {/* Hereda el gray-400 del footer: sobre fondo gray-900 los tonos mas oscuros no llegan al 4.5:1. */}
                <p>Desarrollado por IJGR</p>
            </div>
        </footer>;
}
export default Footer;
