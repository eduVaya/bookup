using Bookup.Api.Models;
using MySqlConnector;


namespace Bookup.Api.Services
{
    public class GroupService
    {
        private readonly string _connectionString;
        
        public GroupService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<Group?> CreateGroupAsync(int createdBy, string name,
            string description)
        {
            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            const string query = "INSERT INTO groups (name, description, created_by) VALUES (@name, @description, @created_by)";
            await using var insertCommand = new MySqlCommand(query, connection);
            insertCommand.Parameters.AddWithValue("@name", name);
            insertCommand.Parameters.AddWithValue("@description", description);
            insertCommand.Parameters.AddWithValue("@created_by", createdBy);

            await insertCommand.ExecuteNonQueryAsync();
            var group = new Group
            {
                Id = (int)insertCommand.LastInsertedId,
                Name = name,
                Description = description,
                CreatedBy = createdBy,
                CreatedAt = DateTime.Now
            };
            return group;
        }
    }
}