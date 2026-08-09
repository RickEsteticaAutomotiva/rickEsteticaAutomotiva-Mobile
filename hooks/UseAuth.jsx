// Backward compatibility shim — toda lógica foi movida para AuthContext.
// Todos os componentes devem importar useAuth de '../context/AuthContext'.
export { useAuth as UseAuth, useAuth } from '../context/AuthContext';