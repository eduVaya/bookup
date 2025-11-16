using Bookup.Api.DTOs.GroupMembers;

namespace Bookup.Api.DTOs.Groups
{
    public class CreateGroupWithMemberRequest
    {
        public CreateGroupRequest Group { get; set; }
        public CreateGroupMemberRequest GroupMember { get; set; }
    }
}