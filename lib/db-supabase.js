import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Query wrapper to match the existing API
const pool = {
  query: async (sql, params = []) => {
    try {
      // Parse the SQL to determine the operation
      const sqlLower = sql.toLowerCase().trim();
      
      // Handle SELECT queries
      if (sqlLower.startsWith('select')) {
        const tableName = extractTableName(sql);
        let query = supabase.from(tableName).select('*');
        
        // Add WHERE conditions if params exist
        if (params.length > 0 && sql.includes('WHERE')) {
          query = applyWhereConditions(query, sql, params);
        }
        
        // Add ORDER BY
        if (sql.includes('ORDER BY')) {
          const orderMatch = sql.match(/ORDER BY\s+(\w+)\s+(ASC|DESC)?/i);
          if (orderMatch) {
            const ascending = !orderMatch[2] || orderMatch[2].toUpperCase() === 'ASC';
            query = query.order(orderMatch[1], { ascending });
          }
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return [data || [], []];
      }
      
      // Handle INSERT queries
      if (sqlLower.startsWith('insert')) {
        const tableName = extractTableName(sql);
        const values = buildInsertObject(sql, params);
        
        const { data, error } = await supabase
          .from(tableName)
          .insert(values)
          .select();
        
        if (error) throw error;
        return [{ insertId: data?.[0]?.id }, []];
      }
      
      // Handle UPDATE queries
      if (sqlLower.startsWith('update')) {
        const tableName = extractTableName(sql);
        const updates = buildUpdateObject(sql, params);
        const whereCondition = extractWhereCondition(sql, params);
        
        let query = supabase.from(tableName).update(updates);
        
        if (whereCondition.column && whereCondition.value !== undefined) {
          query = query.eq(whereCondition.column, whereCondition.value);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return [{ affectedRows: data?.length || 0 }, []];
      }
      
      // Handle DELETE queries
      if (sqlLower.startsWith('delete')) {
        const tableName = extractTableName(sql);
        const whereCondition = extractWhereCondition(sql, params);
        
        let query = supabase.from(tableName).delete();
        
        if (whereCondition.column && whereCondition.value !== undefined) {
          query = query.eq(whereCondition.column, whereCondition.value);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return [{ affectedRows: data?.length || 0 }, []];
      }
      
      throw new Error(`Unsupported SQL operation: ${sql}`);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
};

// Helper functions
function extractTableName(sql) {
  const selectMatch = sql.match(/FROM\s+(\w+)/i);
  const insertMatch = sql.match(/INSERT\s+INTO\s+(\w+)/i);
  const updateMatch = sql.match(/UPDATE\s+(\w+)/i);
  const deleteMatch = sql.match(/DELETE\s+FROM\s+(\w+)/i);
  
  return (selectMatch || insertMatch || updateMatch || deleteMatch)?.[1] || '';
}

function extractWhereCondition(sql, params) {
  const whereMatch = sql.match(/WHERE\s+(\w+)\s*=\s*\?/i);
  if (whereMatch && params.length > 0) {
    // For UPDATE, the last param is typically the WHERE value
    const whereParamIndex = sql.toLowerCase().startsWith('update') ? params.length - 1 : 0;
    return {
      column: whereMatch[1],
      value: params[whereParamIndex]
    };
  }
  return {};
}

function applyWhereConditions(query, sql, params) {
  const conditions = sql.match(/WHERE\s+(.+?)(?:ORDER BY|LIMIT|$)/i);
  if (!conditions) return query;
  
  const whereClause = conditions[1];
  const parts = whereClause.split(/\s+AND\s+/i);
  
  let paramIndex = 0;
  parts.forEach(part => {
    const match = part.match(/(\w+)\s*(=|LIKE|>|<|>=|<=)\s*\?/i);
    if (match && paramIndex < params.length) {
      const [, column, operator] = match;
      const value = params[paramIndex++];
      
      if (operator.toUpperCase() === 'LIKE') {
        query = query.ilike(column, value.replace(/%/g, '*'));
      } else if (operator === '=') {
        query = query.eq(column, value);
      } else if (operator === '>') {
        query = query.gt(column, value);
      } else if (operator === '<') {
        query = query.lt(column, value);
      } else if (operator === '>=') {
        query = query.gte(column, value);
      } else if (operator === '<=') {
        query = query.lte(column, value);
      }
    }
  });
  
  return query;
}

function buildInsertObject(sql, params) {
  const columnsMatch = sql.match(/\(([^)]+)\)\s+VALUES/i);
  if (!columnsMatch) return {};
  
  const columns = columnsMatch[1].split(',').map(c => c.trim());
  const obj = {};
  
  columns.forEach((col, index) => {
    if (index < params.length) {
      obj[col] = params[index];
    }
  });
  
  return obj;
}

function buildUpdateObject(sql, params) {
  const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
  if (!setMatch) return {};
  
  const setParts = setMatch[1].split(',').map(p => p.trim());
  const obj = {};
  
  let paramIndex = 0;
  setParts.forEach(part => {
    const [column] = part.split('=').map(p => p.trim());
    if (paramIndex < params.length - 1) { // Last param is for WHERE
      obj[column] = params[paramIndex++];
    }
  });
  
  return obj;
}

export default pool;
