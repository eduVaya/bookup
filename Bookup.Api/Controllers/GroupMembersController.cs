using Bookup.Api.DTOs.GroupMembers;
using Bookup.Api.Services.GroupMembers;
using Bookup.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace Bookup.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupMembersController : ControllerBase
    {
        private readonly IGroupMemberService _groupMemberService;

        public GroupMembersController(IGroupMemberService groupMemberService)
        {
            _groupMemberService = groupMemberService;
        }
        [HttpPost("createGroupMember")]
        public async Task<IActionResult> CreateGroupMember(CreateGroupMemberRequest request)
        {
            var response = await _groupMemberService.CreateGroupMemberAsync(request);
            return response == null ? BadRequest("Failed to create group member") : StatusCode(201, ApiResponse<GroupMember>.Ok(response, "Group Member created"));
        }
    }
}