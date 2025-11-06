using System.ComponentModel.DataAnnotations;

namespace Bookup.Api.DTOs.GroupMembers
{
    public class CreateGroupMemberRequest
    {
        [Required(ErrorMessage = "userId is required")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "groupId is required")]
        public int GroupId { get; set; }

        public int IsAdmin { get; set; } = 0;
    }
}