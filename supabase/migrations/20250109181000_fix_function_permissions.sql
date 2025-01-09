-- Ajustar permissões da função
GRANT EXECUTE ON FUNCTION initialize_new_user(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION initialize_new_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_new_user(uuid) TO anon; 