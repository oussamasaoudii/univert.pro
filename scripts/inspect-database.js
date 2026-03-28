import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: '72.60.90.147',
  port: 3306,
  user: 'univert_v0_temp',
  password: 'd6169b5170ab281e618168a1cb056a63c7f48dc57e7b450b',
  database: 'ovmon_db'
});

console.log('Connected to MySQL database successfully!\n');

// Get all tables
const [tables] = await connection.query('SHOW TABLES');
const tableKey = Object.keys(tables[0])[0];

console.log('='.repeat(70));
console.log('LIVE DATABASE SCHEMA: ovmon_db');
console.log('='.repeat(70));
console.log(`\nTotal Tables: ${tables.length}\n`);

const liveSchema = {};

for (const table of tables) {
  const tableName = table[tableKey];
  
  // Get columns for each table
  const [columns] = await connection.query(`DESCRIBE \`${tableName}\``);
  
  // Get indexes
  const [indexes] = await connection.query(`SHOW INDEX FROM \`${tableName}\``);
  
  liveSchema[tableName] = {
    columns: columns.map(col => ({
      name: col.Field,
      type: col.Type,
      nullable: col.Null === 'YES',
      key: col.Key,
      default: col.Default,
      extra: col.Extra
    })),
    indexes: indexes.map(idx => ({
      name: idx.Key_name,
      column: idx.Column_name,
      unique: idx.Non_unique === 0
    }))
  };
}

// Print live schema summary
console.log('EXISTING TABLES:');
console.log('-'.repeat(70));
for (const tableName of Object.keys(liveSchema).sort()) {
  const info = liveSchema[tableName];
  console.log(`\n[${tableName}] - ${info.columns.length} columns`);
  for (const col of info.columns) {
    const nullable = col.nullable ? 'NULL' : 'NOT NULL';
    const key = col.key ? ` [${col.key}]` : '';
    console.log(`  - ${col.name}: ${col.type} ${nullable}${key}`);
  }
}

// Define expected schema based on codebase requirements
const expectedSchema = {
  // Core auth tables
  users: {
    columns: ['id', 'email', 'password_hash', 'full_name', 'avatar_url', 'company_name', 'role', 'status', 'email_verified', 'plan', 'total_revenue', 'websites_count', 'last_login_at', 'password_changed_at', 'session_version', 'admin_mfa_enabled', 'admin_mfa_secret_ciphertext', 'admin_mfa_pending_secret_ciphertext', 'admin_mfa_pending_created_at', 'admin_mfa_enrolled_at', 'activated_at', 'activated_by', 'created_at', 'updated_at'],
    indexes: ['PRIMARY', 'email', 'idx_users_role', 'idx_users_status']
  },
  platform_settings: {
    columns: ['id', 'platform_name', 'support_email', 'maintenance_mode', 'allow_new_signups', 'require_email_verification', 'maintenance_message', 'addon_s3_enabled', 's3_endpoint', 's3_region', 's3_bucket', 's3_access_key', 's3_secret_key', 's3_public_url', 's3_use_path_style', 'addon_turnstile_enabled', 'turnstile_site_key', 'turnstile_secret_key', 'updated_by', 'created_at', 'updated_at'],
    indexes: ['PRIMARY']
  },
  user_sessions: {
    columns: ['id', 'user_id', 'session_type', 'expires_at', 'revoked_at', 'revoke_reason', 'mfa_verified_at', 'step_up_verified_at', 'ip_address', 'user_agent', 'created_at', 'last_seen_at'],
    indexes: ['PRIMARY', 'idx_user_sessions_user', 'idx_user_sessions_expires']
  },
  auth_rate_limits: {
    columns: ['key_hash', 'scope', 'attempts', 'window_started_at', 'blocked_until', 'created_at', 'updated_at'],
    indexes: ['PRIMARY', 'idx_auth_rate_limits_scope', 'idx_auth_rate_limits_blocked_until']
  },
  password_reset_tokens: {
    columns: ['id', 'user_id', 'token_hash', 'expires_at', 'used_at', 'requested_ip', 'requested_user_agent', 'created_at'],
    indexes: ['PRIMARY', 'idx_password_reset_tokens_user', 'idx_password_reset_tokens_expires', 'token_hash']
  },
  admin_mfa_recovery_codes: {
    columns: ['id', 'user_id', 'code_hash', 'created_at', 'used_at'],
    indexes: ['PRIMARY', 'idx_admin_mfa_recovery_codes_user', 'idx_admin_mfa_recovery_codes_code_hash']
  },
  // Platform tables
  templates: {
    columns: ['id', 'name', 'slug', 'description', 'category', 'stack', 'preview_image_url', 'live_demo_url', 'starting_price', 'performance_score', 'featured', 'is_active', 'template_source_path', 'deployment_profile', 'created_at', 'updated_at'],
    indexes: ['PRIMARY', 'slug', 'idx_templates_category', 'idx_templates_stack', 'idx_templates_featured', 'idx_templates_active']
  },
  websites: {
    columns: ['id', 'user_id', 'template_id', 'project_name', 'status', 'subdomain', 'custom_domain', 'live_url', 'dashboard_url', 'provisioning_job_id', 'provisioning_error', 'renewal_date', 'page_views', 'visits', 'avg_session_duration', 'created_at', 'updated_at'],
    indexes: ['PRIMARY', 'subdomain', 'idx_websites_user_id', 'idx_websites_status', 'idx_websites_template_id']
  },
  user_subscriptions: {
    columns: ['id', 'user_id', 'plan_name', 'status', 'billing_cycle', 'renewal_date', 'created_at', 'updated_at'],
    indexes: ['PRIMARY', 'user_id']
  },
  user_activities: {
    columns: ['id', 'user_id', 'activity_type', 'message', 'created_at'],
    indexes: ['PRIMARY', 'idx_activities_user', 'idx_activities_created']
  },
  user_notifications: {
    columns: ['id', 'user_id', 'title', 'message', 'is_read', 'created_at'],
    indexes: ['PRIMARY', 'idx_notifications_user', 'idx_notifications_read']
  },
  admin_notifications: {
    columns: ['id', 'user_id', 'title', 'message', 'category', 'is_read', 'created_at'],
    indexes: ['PRIMARY', 'idx_admin_notifications_user', 'idx_admin_notifications_read', 'idx_admin_notifications_category']
  },
  // Content tables
  site_content: {
    columns: ['id', 'page_key', 'section_key', 'content_type', 'content_value', 'is_visible', 'display_order', 'metadata', 'updated_by', 'created_at', 'updated_at'],
    indexes: ['PRIMARY', 'idx_site_content_page_section', 'idx_site_content_page', 'idx_site_content_visible']
  },
  faqs: {
    columns: ['id', 'question', 'answer', 'category', 'page_assignments', 'is_published', 'display_order', 'view_count', 'helpful_count', 'updated_by', 'created_at', 'updated_at'],
    indexes: ['PRIMARY', 'idx_faqs_category', 'idx_faqs_published', 'idx_faqs_order']
  },
  testimonials: {
    columns: ['id', 'quote', 'author_name', 'author_title', 'author_company', 'author_avatar_url', 'rating', 'page_assignments', 'is_featured', 'is_published', 'display_order', 'updated_by', 'created_at', 'updated_at'],
    indexes: ['PRIMARY', 'idx_testimonials_featured', 'idx_testimonials_published', 'idx_testimonials_order']
  },
  page_sections: {
    columns: ['id', 'page_key', 'section_key', 'section_name', 'section_type', 'is_visible', 'display_order', 'config', 'created_at', 'updated_at'],
    indexes: ['PRIMARY', 'idx_page_sections_unique', 'idx_page_sections_page', 'idx_page_sections_order']
  },
  content_revisions: {
    columns: ['id', 'content_table', 'content_id', 'revision_data', 'changed_by', 'change_summary', 'created_at'],
    indexes: ['PRIMARY', 'idx_content_revisions_content', 'idx_content_revisions_changed_by', 'idx_content_revisions_created']
  }
};

// Compare and find missing items
console.log('\n');
console.log('='.repeat(70));
console.log('SCHEMA COMPARISON: MISSING ITEMS');
console.log('='.repeat(70));

const missingTables = [];
const missingColumns = {};
const missingIndexes = {};

for (const [tableName, expected] of Object.entries(expectedSchema)) {
  if (!liveSchema[tableName]) {
    missingTables.push(tableName);
  } else {
    const liveColumns = liveSchema[tableName].columns.map(c => c.name);
    const missingCols = expected.columns.filter(c => !liveColumns.includes(c));
    if (missingCols.length > 0) {
      missingColumns[tableName] = missingCols;
    }
    
    const liveIndexNames = liveSchema[tableName].indexes.map(i => i.name);
    const missingIdx = expected.indexes.filter(i => !liveIndexNames.includes(i));
    if (missingIdx.length > 0) {
      missingIndexes[tableName] = missingIdx;
    }
  }
}

console.log('\n[1] MISSING TABLES:');
if (missingTables.length === 0) {
  console.log('  (none)');
} else {
  missingTables.forEach(t => console.log(`  - ${t}`));
}

console.log('\n[2] MISSING COLUMNS:');
if (Object.keys(missingColumns).length === 0) {
  console.log('  (none)');
} else {
  for (const [table, cols] of Object.entries(missingColumns)) {
    console.log(`  ${table}:`);
    cols.forEach(c => console.log(`    - ${c}`));
  }
}

console.log('\n[3] MISSING INDEXES:');
if (Object.keys(missingIndexes).length === 0) {
  console.log('  (none)');
} else {
  for (const [table, idxs] of Object.entries(missingIndexes)) {
    console.log(`  ${table}:`);
    idxs.forEach(i => console.log(`    - ${i}`));
  }
}

await connection.end();
console.log('\n\nDatabase inspection complete!');
