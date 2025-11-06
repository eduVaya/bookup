using System.ComponentModel.DataAnnotations;
using Bookup.Api.DTOs.Groups;

namespace Bookup.Api.DTOs
{
    public class CreateGroupWithMemberRequest
    {
        public CreateGroupRequest Group { get; set; }
    }
}