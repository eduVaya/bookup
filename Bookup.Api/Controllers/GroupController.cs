using Bookup.Api.DTOs;
using Bookup.Api.Services;
using Bookup.Api.Models;
using Microsoft.AspNetCore.Mvc;


namespace Bookup.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupController : ControllerBase
    {
        private readonly GroupService _groupService;
        public GroupController(GroupService groupService)
        {
            _groupService = groupService;
        }
        [HttpPost("createGroup")]
        public async Task<IActionResult> CreateGroup(CreateGroupRequest request)
        {
            var group = await _groupService.CreateGroupAsync(
                request.CreatedBy,
                request.Name,
                request.Description
            );
            if (group == null)
            {
                return BadRequest("Failed to create group");
            }

            var response = new GroupResponse
            {
                GroupId = group.Id,
                Name = group.Name,
                Description = group.Description,
                CreatedBy = group.CreatedBy
            };
            return StatusCode(201, ApiResponse<GroupResponse>.Ok(response, "Group created"));
        }
        [HttpPost("updateGroup")]
        public async Task<IActionResult> UpdateGroup(UpdateGroupRequest request)
        {
            var group = await _groupService.UpdateGroupAsync(
                request.GroupId,
                request.Name,
                request.Description
            );
            if (group == null)
            {
                return BadRequest("Failed to update group");
            }
            var response = new GroupResponse
            {
                GroupId = group.Id,
                Name = group.Name,
                Description = group.Description,
                CreatedBy = group.CreatedBy
            };
            return StatusCode(200, ApiResponse<GroupResponse>.Ok(response, "Group updated"));
        }
        [HttpDelete("{groupId:int}")]
        public async Task<IActionResult> DeleteGroup(int groupId)
        {
            var deleted = await _groupService.DeleteGroupAsync(groupId);

            if (deleted == null)
            {
                return NotFound(ApiResponse<object>.Fail("Group not found."));
            }
            return Ok(ApiResponse<object>.Ok(new {groupId= deleted}, "Group deleted successfully."));;
        }
        [HttpGet("{groupId:int}")]
        public async Task<IActionResult> GetGroup(int groupId)
        {
            var group = await _groupService.GetGroupAsync(groupId);
            if (group == null)
            {
                return NotFound(ApiResponse<object>.Fail("Group not found."));
            }
            return Ok(ApiResponse<object>.Ok(group, "Group found"));
        }
    }
}