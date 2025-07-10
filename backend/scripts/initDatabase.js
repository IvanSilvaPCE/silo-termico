
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const initializeDatabase = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('DATABASE_URL não encontrada. Pulando inicialização do banco.');
    return;
  }

  const poolUrl = databaseUrl.replace('.us-east-2', '-pooler.us-east-2');
  const pool = new Pool({
    connectionString: poolUrl,
    max: 2
  });

  try {
    const client = await pool.connect();
    
    try {
      // Ler schema SQL
      const schemaPath = path.join(process.cwd(), 'backend', 'database', 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Executar schema
      await client.query(schemaSql);
      
      console.log('✅ Banco de dados inicializado com sucesso!');
      
      // Inserir configurações padrão se não existirem
      await insertDefaultConfigurations(client);
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
  } finally {
    await pool.end();
  }
};

const insertDefaultConfigurations = async (client) => {
  try {
    // Configuração padrão para Silo
    const defaultSiloConfig = {
      lb: 200,
      hs: 180,
      hb: 15,
      eb: 5,
      escala_sensores: 16,
      dist_y_sensores: 12,
      pos_x_cabos_uniforme: 1,
      pos_x_cabo: [50, 25],
      pos_y_cabo: [160, 160, 160, 160, 160],
      aeradores_ativo: false,
      na: 4,
      ds: 30,
      dy: 0,
      da: 35,
    };

    // Configuração padrão para Armazém
    const defaultArmazemConfig = {
      pb: 185,
      lb: 350,
      hb: 30,
      hf: 5,
      lf: 250,
      le: 15,
      ht: 50,
      tipo_telhado: 1,
      tipo_fundo: 0,
      intensidade_fundo: 20,
      curvatura_topo: 30,
      escala_sensores: 16,
      dist_y_sensores: 12,
    };

    // Inserir configurações padrão
    const insertQuery = `
      INSERT INTO model_configurations (name, type, description, config_data, user_id, is_default)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (name, type, user_id) DO NOTHING
    `;

    await client.query(insertQuery, [
      'Padrão',
      'silo',
      'Configuração padrão do sistema para Silo',
      JSON.stringify(defaultSiloConfig),
      'system',
      true
    ]);

    await client.query(insertQuery, [
      'Padrão',
      'armazem',
      'Configuração padrão do sistema para Armazém',
      JSON.stringify(defaultArmazemConfig),
      'system',
      true
    ]);

    console.log('✅ Configurações padrão inseridas!');

  } catch (error) {
    console.error('❌ Erro ao inserir configurações padrão:', error);
  }
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export default initializeDatabase;
