import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Query wrapper to match the existing SQLite API
const pool = {
  query: async (sql, params = []) => {
    try {
      const sqlLower = sql.toLowerCase().trim();
      
      // Simple table name extraction
      const getTable = () => {
        if (sqlLower.includes('from')) return sql.match(/from\s+(\w+)/i)?.[1];
        if (sqlLower.includes('into')) return sql.match(/into\s+(\w+)/i)?.[1];
        if (sqlLower.includes('update')) return sql.match(/update\s+(\w+)/i)?.[1];
        if (sqlLower.includes('delete')) return sql.match(/delete\s+from\s+(\w+)/i)?.[1];
        return null;
      };
      
      const tableName = getTable();
      
      // Handle SELECT
      if (sqlLower.startsWith('select')) {
        let query = supabase.from(tableName).select('*');
        
        // Handle WHERE with =
        if (sql.includes('WHERE') && params.length > 0) {
          const whereMatch = sql.match(/where\s+(\w+)\s*=\s*\?/i);
          if (whereMatch) {
            query = query.eq(whereMatch[1], params[0]);
            
            // Handle additional AND conditions
            const andMatches = sql.matchAll(/and\s+(\w+)\s*=\s*\?/gi);
            let paramIndex = 1;
            for (const match of andMatches) {
              if (paramIndex < params.length) {
                query = query.eq(match[1], params[paramIndex++]);
              }
            }
          }
        }
        
        // Handle ORDER BY
        if (sql.includes('ORDER BY')) {
          const orderMatch = sql.match(/order\s+by\s+(\w+)\s*(asc|desc)?/i);
          if (orderMatch) {
            query = query.order(orderMatch[1], { ascending: !orderMatch[2] || orderMatch[2].toLowerCase() === 'asc' });
          }
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return [data || [], []];
      }
      
      // Handle INSERT
      if (sqlLower.startsWith('insert')) {
        const columnsMatch = sql.match(/\(([^)]+)\)\s+values/i);
        if (!columnsMatch) throw new Error('Invalid INSERT syntax');
        
        const columns = columnsMatch[1].split(',').map(c => c.trim());
        const insertData = {};
        columns.forEach((col, i) => {
          if (i < params.length) {
            // Convert SQLite integers to PostgreSQL booleans for boolean columns
            if (col.startsWith('is_') || col.startsWith('diagnosis_')) {
              insertData[col] = Boolean(params[i]);
            } else {
              insertData[col] = params[i];
            }
          }
        });
        
        const { data, error} = await supabase.from(tableName).insert(insertData).select();
        if (error) throw error;
        return [{ insertId: data?.[0]?.id, lastID: data?.[0]?.id }, []];
      }
      
      // Handle UPDATE
      if (sqlLower.startsWith('update')) {
        const setMatch = sql.match(/set\s+(.+?)\s+where/i);
        if (!setMatch) throw new Error('Invalid UPDATE syntax');
        
        const setParts = setMatch[1].split(',');
        const updateData = {};
        let paramIndex = 0;
        
        setParts.forEach(part => {
          const colMatch = part.trim().match(/(\w+)\s*=\s*\?/);
          if (colMatch && paramIndex < params.length) {
            const col = colMatch[1];
            // Convert to boolean for boolean columns
            if (col.startsWith('is_') || col.startsWith('diagnosis_')) {
              updateData[col] = Boolean(params[paramIndex]);
            } else {
              updateData[col] = params[paramIndex];
            }
            paramIndex++;
          }
        });
        
        const whereMatch = sql.match(/where\s+(\w+)\s*=\s*\?/i);
        if (!whereMatch) throw new Error('UPDATE requires WHERE clause');
        
        const whereCol = whereMatch[1];
        const whereVal = params[params.length - 1];
        
        const { data, error } = await supabase
          .from(tableName)
          .update(updateData)
          .eq(whereCol, whereVal)
          .select();
        
        if (error) throw error;
        return [{ changes: data?.length || 0 }, []];
      }
      
      // Handle DELETE
      if (sqlLower.startsWith('delete')) {
        const whereMatch = sql.match(/where\s+(\w+)\s*=\s*\?/i);
        if (!whereMatch) throw new Error('DELETE requires WHERE clause');
        
        const { data, error } = await supabase
          .from(tableName)
          .delete()
          .eq(whereMatch[1], params[0]);
        
        if (error) throw error;
        return [{ changes: data?.length || 0 }, []];
      }
      
      throw new Error(`Unsupported SQL: ${sql.substring(0, 50)}`);
    } catch (error) {
      console.error('Database query error:', error, 'SQL:', sql, 'Params:', params);
      throw error;
    }
  }
};

export default pool;

