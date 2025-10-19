using System.Data;
using Bookup.Api.Models;
using MySqlConnector;


namespace Bookup.Api.Services
{
    public class GroupService
    {
        private readonly string _connectionString;
        private readonly ILogger<GroupService> _logger;
        public GroupService(string connectionString, ILogger<GroupService> logger)
        {
            _connectionString = connectionString;
            _logger = logger;
        }

        public async Task<Group?> CreateGroupAsync(int createdBy, string name,
            string description)
        {
            try
            {
                await using var connection = new MySqlConnection(_connectionString);
                await connection.OpenAsync();

                const string query =
                    "INSERT INTO groups (name, description, created_by, user_id) VALUES (@name, @description, @created_by, @user_id)";
                await using var insertCommand = new MySqlCommand(query, connection);
                insertCommand.Parameters.AddWithValue("@name", name);
                insertCommand.Parameters.AddWithValue("@description", description);
                insertCommand.Parameters.AddWithValue("@created_by", createdBy);
                insertCommand.Parameters.AddWithValue("@user_id", createdBy);

                await insertCommand.ExecuteNonQueryAsync();
                return await GetGroupAsync((int)insertCommand.LastInsertedId);
            }
            catch (MySqlException ex)
            {
                _logger.LogError(ex, "MySQL error while creating group.");
                throw; 
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating group.");
                throw;
            }
            
        }

        public async Task<Group?> UpdateGroupAsync(int groupId, string name, string description)
        {
            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var updates = new List<string>();
            var parameters = new List<MySqlParameter>();

            if (!string.IsNullOrEmpty(name))
            {
                updates.Add("name = @name");
                parameters.Add(new MySqlParameter("@name", name));
            }

            if (!string.IsNullOrEmpty(description))
            {
                updates.Add("description = @description");
                parameters.Add(new MySqlParameter("@description", description));
            }

            var setClause = string.Join(", ", updates) + ", updated_at = NOW()";

            var updateQuery = $"UPDATE groups SET {setClause} WHERE id = @groupId ";
            await using var updateCmd = new MySqlCommand(updateQuery, connection);
            updateCmd.Parameters.AddRange(parameters.ToArray());
            updateCmd.Parameters.AddWithValue("@groupId", groupId);
            await updateCmd.ExecuteNonQueryAsync();

            return await GetGroupAsync(groupId);
        }

        public async Task<int?> DeleteGroupAsync(int groupId)
        {
            try
            {
                await using var connection = new MySqlConnection(_connectionString);
                await connection.OpenAsync();
                
                const string query = "UPDATE groups SET is_deleted = 1 WHERE id = @groupId";
                await using var deleteCommand = new MySqlCommand(query, connection);
                deleteCommand.Parameters.AddWithValue("@groupId", groupId);
                
                var affectedRows = await deleteCommand.ExecuteNonQueryAsync();

                return affectedRows > 0 ? groupId : null;
            }
            catch (MySqlException ex)
            {
                _logger.LogError(ex, "MySQL error while creating group.");
                throw; 
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating group.");
                throw;
            }
        }
        
        public async Task<Group?> GetGroupAsync(int groupId)
        {
            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            const string query = "SELECT id, name, description, created_by, created_at FROM groups WHERE id = @id AND is_deleted = 0 LIMIT 1";
            
            await using var selectCommand = new MySqlCommand(query, connection);
            selectCommand.Parameters.AddWithValue("@id", groupId);
            
            await using var reader = await selectCommand.ExecuteReaderAsync(CommandBehavior.SingleRow);
            if (!await reader.ReadAsync())
            {
                return null;
            }
            
            return new Group
            {
                Id = reader.GetInt16("id"),
                Name = reader.GetString("name"),
                // Description = reader.IsDBNull("description") ? null : reader.GetString("description"),
                Description = reader.GetString("description"),
                CreatedBy = reader.GetInt32("created_by"),
                CreatedAt = reader.GetDateTime("created_at")
            };
        }
    }
}