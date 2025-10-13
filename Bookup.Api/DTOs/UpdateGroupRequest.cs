using System.ComponentModel.DataAnnotations;

namespace Bookup.Api.DTOs
{
    public class UpdateGroupRequest
    {
        [Required(ErrorMessage = "GroupId is required")]
        public int GroupId { get; set; }
        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "CreatedBy is required")]
        public int CreatedBy { get; set; }
    }
}