namespace Bookup.Api.DTOs
{
    public class GroupResponse
    {
        public string Message { get; set; } = string.Empty;
        public long GroupId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CreatedBy { get; set; }
        
    }
}

