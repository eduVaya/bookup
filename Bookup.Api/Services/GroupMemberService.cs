using System.Data;
using Bookup.Api.Constants;
using Bookup.Api.DTOs.GroupMembers;
using Bookup.Api.Models;
using MySqlConnector;

namespace Bookup.Api.Services
{
    public class GroupMemberService
    {
        private readonly string _connectionString;
        private readonly ILogger<GroupMemberService> _logger;

        public GroupMemberService(string connectionString, ILogger<GroupMemberService> logger)
        {
            _connectionString = connectionString;
            _logger = logger;
        }

        public async Task<GroupMember?> CreateGroupMemberAsync(CreateGroupMemberRequest createGroupMemberRequest)
        {
            try
            {
                await using var connection = new MySqlConnection(_connectionString);
                await connection.OpenAsync();
                const string query =
                    "INSERT INTO group_members (user_id, group_id, is_admin, status_id) VALUES (@userId, @groupId, @is_admin, @status_id)";
                await using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@userId", createGroupMemberRequest.UserId);
                command.Parameters.AddWithValue("@groupId", createGroupMemberRequest.GroupId);
                command.Parameters.AddWithValue("@is_admin", createGroupMemberRequest.IsAdmin);
                command.Parameters.AddWithValue("@status_id", GroupMemberStatus.Pending);

                await command.ExecuteNonQueryAsync();
                return await GetGroupMemberAsync(connection, createGroupMemberRequest.UserId,
                    createGroupMemberRequest.GroupId);
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

        public async Task<GroupMember?> GetGroupMemberAsync(int userId, int groupId)
        {
            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();
            return await GetGroupMemberAsync(connection, userId, groupId);
        }

        private async Task<GroupMember?> GetGroupMemberAsync(MySqlConnection connection, int userId, int groupId)
        {
            try
            {
                const string query = @"
                    SELECT gm.id, gm.user_id, gm.group_id, gm.is_admin, gm.status_id, gms.description AS status_description, gm.joined_at, gm.leave_at, gm.created_at, gm.updated_at
                    FROM group_members gm
                    INNER JOIN group_member_statuses gms
                        ON gms.id = gm.status_id
                    WHERE gm.user_id = @userId AND gm.group_id = @groupId";

                await using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@userId", userId);
                command.Parameters.AddWithValue("@groupId", groupId);

                await using var reader = await command.ExecuteReaderAsync(CommandBehavior.SingleRow);

                if (!await reader.ReadAsync())
                {
                    return null;
                }

                return new GroupMember
                {
                    Id = reader.GetInt16("id"),
                    UserId = reader.GetInt32("user_id"),
                    GroupId = reader.GetInt32("group_id"),
                    IsAdmin = reader.GetBoolean("is_admin"),
                    StatusId = reader.GetInt32("status_id"),
                    StatusDescription = reader.GetString("status_description"),
                    JoinedAt = reader.IsDBNull("joined_at") ? null : reader.GetDateTime("joined_at"),
                    LeaveAt = reader.IsDBNull("leave_at") ? null : reader.GetDateTime("leave_at")
                };
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
    }
}