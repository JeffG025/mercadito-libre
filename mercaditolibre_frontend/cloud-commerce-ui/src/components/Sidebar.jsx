import './Sidebar.css'

export const Sidebar = ({ activeTab, setActiveTab }) => {
    // Opciones del menú.
    const menuItems = [
        {id: 'dashboard', label: 'Dashboard'},
        {id: 'inventario', label : 'Inventario'},
        {id: 'ventas', label: 'Ventas'},
        {id: 'configuracion', label: 'Configuración'}
    ];
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <h2>Control del Panel</h2>
            </div>
            <nav className="sidebar-menu">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                            // Marca la pestaña activa.
                            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                            >
                                <span className="sidebar-icon">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};
