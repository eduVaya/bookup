namespace Bookup.Api.Models
{
    public class Group
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CreatedBy { get; set; }
        public DateTime? CreatedAt { get; set; }
        
        
    }
}