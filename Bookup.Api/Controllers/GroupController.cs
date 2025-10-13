

using System.Text.RegularExpressions;
using Bookup.Api.DTOs;
using Bookup.Api.Services;
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
            
            var response = new CreateGroupResponse {Message = "Group created", GroupId = group.Id};
            
            return CreatedAtAction(nameof(CreateGroup), new { id = group.Id }, response);
        }
        
        [HttpPost("updateGroup")]
        public async Task<IActionResult> UpdateGroup(UpdateGroupRequest request)
        {
            var group = await _groupService.UpdateGroupAsync(
                request.GroupId,
                request.Name,
                request.Description
            );
            
            return CreatedAtAction(nameof(UpdateGroup), group);
        }
    }
}