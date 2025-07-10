
-- Tabela para configurações de modelos
CREATE TABLE IF NOT EXISTS model_configurations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('silo', 'armazem')),
    description TEXT,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    UNIQUE(name, type, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_model_configurations_type ON model_configurations(type);
CREATE INDEX IF NOT EXISTS idx_model_configurations_user_id ON model_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_model_configurations_name ON model_configurations(name);
CREATE INDEX IF NOT EXISTS idx_model_configurations_tags ON model_configurations USING GIN(tags);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_model_configurations_updated_at BEFORE UPDATE
    ON model_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
