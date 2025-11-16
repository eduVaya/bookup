using Bookup.Api.DTOs;
using Bookup.Api.DTOs.GroupMembers;
using Bookup.Api.DTOs.Groups;
using Bookup.Api.Models;

namespace Bookup.Api.Services.Groups
{
    public interface IGroupService
    {
        Task<Group?> CreateGroupAsync(CreateGroupRequest createGroupRequest);
        Task<Group?> UpdateGroupAsync(UpdateGroupRequest updateGroupRequest);
        Task<int?> DeleteGroupAsync(int groupId);
        Task<Group?> GetGroupAsync(int groupId);
        Task<GroupWithGroupMember?> CreateGroupWithGroupMemberAsync(CreateGroupWithMemberRequest  createGroupWithMemberRequest);
    }
}