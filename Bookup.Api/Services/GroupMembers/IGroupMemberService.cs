using Bookup.Api.Models;
using Bookup.Api.DTOs.GroupMembers;

namespace Bookup.Api.Services.GroupMembers
{
    public interface IGroupMemberService
    {
        Task<GroupMember?> CreateGroupMemberAsync(CreateGroupMemberRequest createGroupMemberRequest);
        Task<GroupMember?> GetGroupMemberAsync(int userId, int groupId);
    }
}