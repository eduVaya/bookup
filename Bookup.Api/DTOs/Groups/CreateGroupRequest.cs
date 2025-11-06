using System.ComponentModel.DataAnnotations;

namespace Bookup.Api.DTOs.Groups
{
    public class CreateGroupRequest
    {
        [Required(ErrorMessage = "name is required")]
        public string Name {get; set;} = string.Empty;
        
        public string Description {get; set;} = string.Empty;
        
        [Required(ErrorMessage = "CreatedBy is required")]
        [Range(1, int.MaxValue, ErrorMessage = "CreatedBy must be greater than 0")]
        public int UserId {get; set;}
    }
    
}

