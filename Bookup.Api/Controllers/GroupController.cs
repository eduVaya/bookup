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
        private readonly ILogger<GroupController> _logger;

        public GroupController(GroupService groupService, ILogger<GroupController> logger)
        {
            _groupService = groupService;
            _logger = logger;
        }

        [HttpPost("createGroup")]
        public async Task<IActionResult> CreateGroup(CreateGroupRequest request)
        {
            // if (!ModelState.IsValid)
            // {
            //     var errors = ModelState.Values.SelectMany(value => value.Errors).Select(error => error.ErrorMessage).ToList();
            //     return BadRequest(ApiResponse<object>.Fail("Validation failed", errors));
            // }

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
                Message = "Group created",
                GroupId = group.Id,
                Name = group.Name,
                Description = group.Description,
                CreatedBy = group.CreatedBy
            };

            // return CreatedAtAction(nameof(CreateGroup), response);
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

            return CreatedAtAction(nameof(UpdateGroup), group);
        }
    }
}