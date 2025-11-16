using System.Data;
using Bookup.Api.DTOs;
using Bookup.Api.DTOs.Groups;
using Bookup.Api.Models;
using Bookup.Api.Services.GroupMembers;
using MySqlConnector;


namespace Bookup.Api.Services.Groups
{
    public class GroupService : IGroupService
    {
        private readonly string? _connectionString;
        private readonly ILogger<GroupService> _logger;
        private readonly IGroupMemberService _groupMemberService;

        public GroupService(IConfiguration configuration, ILogger<GroupService> logger, IGroupMemberService groupMemberService)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _logger = logger;
            _groupMemberService = groupMemberService;
        }

        private async Task<Group?> CreateGroupAsync(CreateGroupRequest createGroupRequest, MySqlConnection connection, MySqlTransaction? transaction = null)
        {
            try
            {
                const string query = "INSERT INTO groups (name, description, created_by, user_id) VALUES (@name, @description, @created_by, @user_id)";
                await using var insertCommand = new MySqlCommand(query, connection, transaction);
                insertCommand.Parameters.AddWithValue("@name", createGroupRequest.Name);
                insertCommand.Parameters.AddWithValue("@description", createGroupRequest.Description);
                insertCommand.Parameters.AddWithValue("@created_by", createGroupRequest.UserId);
                insertCommand.Parameters.AddWithValue("@user_id", createGroupRequest.UserId);

                await insertCommand.ExecuteNonQueryAsync();
                return await GetGroupAsync((int)insertCommand.LastInsertedId, connection, transaction);
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

        public async Task<Group?> CreateGroupAsync(CreateGroupRequest createGroupRequest)
        {
            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();
            return await CreateGroupAsync(createGroupRequest, connection);
        }

        public async Task<Group?> UpdateGroupAsync(UpdateGroupRequest updateGroupRequest)
        {
            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var updates = new List<string>();
            var parameters = new List<MySqlParameter>();

            if (!string.IsNullOrEmpty(updateGroupRequest.Name))
            {
                updates.Add("name = @name");
                parameters.Add(new MySqlParameter("@name", updateGroupRequest.Name));
            }

            if (!string.IsNullOrEmpty(updateGroupRequest.Description))
            {
                updates.Add("description = @description");
                parameters.Add(new MySqlParameter("@description", updateGroupRequest.Description));
            }

            var setClause = string.Join(", ", updates) + ", updated_at = NOW()";

            var updateQuery = $"UPDATE groups SET {setClause} WHERE id = @groupId ";
            await using var updateCmd = new MySqlCommand(updateQuery, connection);
            updateCmd.Parameters.AddRange(parameters.ToArray());
            updateCmd.Parameters.AddWithValue("@groupId", updateGroupRequest.GroupId);
            await updateCmd.ExecuteNonQueryAsync();

            return await GetGroupAsync(updateGroupRequest.GroupId);
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
            return await GetGroupAsync(groupId, connection);
        }

        private async Task<Group?> GetGroupAsync(int groupId, MySqlConnection connection, MySqlTransaction? transaction = null)
        {
            // await using var connection = new MySqlConnection(_connectionString);
            // await connection.OpenAsync();

            const string query = "SELECT id, name, description, created_by, created_at FROM groups WHERE id = @id AND is_deleted = 0 LIMIT 1";

            await using var selectCommand = new MySqlCommand(query, connection, transaction);
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
                Description = reader.GetString("description"),
                CreatedBy = reader.GetInt32("created_by"),
                CreatedAt = reader.GetDateTime("created_at")
            };
        }

        public async Task<GroupWithGroupMember?> CreateGroupWithGroupMemberAsync(CreateGroupWithMemberRequest createGroupWithMemberRequest)
        {
            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();
            await using var transaction = await connection.BeginTransactionAsync();
            try
            {
                //Create group
                var group = await CreateGroupAsync(createGroupWithMemberRequest.Group, connection, transaction);
                if (group == null)
                {
                    return null;
                }

                createGroupWithMemberRequest.GroupMember.GroupId = group.Id;
                //Create groupMember
                var groupMember = await _groupMemberService.CreateGroupMemberAsync(createGroupWithMemberRequest.GroupMember, connection, transaction);
                if (groupMember == null)
                {
                    return null;
                }

                await transaction.CommitAsync();
                return new GroupWithGroupMember
                {
                    Group = group,
                    GroupMember = groupMember
                };
            }
            catch (MySqlException ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "MySQL error while creating group.");
                throw;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Unexpected error while creating group.");
                throw;
            }
        }
    }
}