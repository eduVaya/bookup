using Bookup.Api.DTOs;
using Bookup.Api.Models;
using Bookup.Api.DTOs.GroupMembers;
using MySqlConnector;

namespace Bookup.Api.Services.GroupMembers
{
    public interface IGroupMemberService
    {
        Task<GroupMember?> CreateGroupMemberAsync(CreateGroupMemberRequest createGroupMemberRequest);
        Task<GroupMember?> CreateGroupMemberAsync(CreateGroupMemberRequest createGroupMemberRequest, MySqlConnection connection, MySqlTransaction? transaction = null);
        Task<GroupMember?> GetGroupMemberAsync(int userId, int groupId, MySqlTransaction? transaction = null);
    }
}